import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId, getUserCredits, deductCredits, createContent, insertGeneration, insertPost } from "@/lib/database";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sourceType = 'text', text = '', url = '', tone = 'professional', platforms = ['x','linkedin','instagram','email'], numPosts = 3, options = {} } = body || {};

    // Resolve DB user id
    const user = await getUserByGoogleId(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });

    // Check credits (1 per generation request)
    const credits = await getUserCredits(session.user.id);
    if (credits <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // Basic prompt to return JSON for all 4 platforms
    const sourceText = String(text || '');
    const system = {
      role: 'system',
      content: 'You are RepurposeAI. Convert long-form text into social posts. Always return strict JSON with keys: x_thread (array of tweets), linkedin_post (string), instagram_caption (string), email_newsletter (object with subject and body). Keep it concise and on-brand. No additional commentary.'
    } as const;

    const userMsg = {
      role: 'user',
      content: `Tone: ${tone}. Input: ${sourceText || `Fetch and summarize from URL: ${url}`}. Include relevant, concise hashtags at the end when appropriate.`
    } as const;

    // Decide AI path: OpenRouter if configured, otherwise deterministic fallback
    let parsed: any = null;
    let tokenUsage = 0;

    let lastError: any = null;

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const { createChatCompletion } = await import("@/lib/openrouter");
        const completion = await createChatCompletion([system as any, userMsg as any], { max_tokens: 1200 });
        const raw = completion.choices?.[0]?.message?.content || '{}';
        try { parsed = JSON.parse(raw); } catch { parsed = { x_thread: [raw], linkedin_post: raw, instagram_caption: raw, email_newsletter: { subject: 'Your Content', body: raw } }; }
        tokenUsage = completion.usage?.total_tokens || 0;
      } catch (err) {
        lastError = err;
      }
    }

    if (!parsed && process.env.GROQ_API_KEY) {
      try {
        // Groq fallback using OpenAI SDK compatible API
        const { default: OpenAI } = await import("openai");
        const client = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
        // Use chat.completions to maximize SDK compatibility
        const comp = await client.chat.completions.create({
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          messages: [
            { role: 'system', content: "You are RepurposeAI. Return STRICT JSON only with keys: x_thread (array of tweets), linkedin_post (string), instagram_caption (string), email_newsletter (object with subject and body). No prose outside JSON." },
            { role: 'user', content: `Tone: ${tone}. Input: ${sourceText || `Fetch and summarize from URL: ${url}`}. Include concise relevant hashtags.` }
          ]
        });
        const raw = comp.choices?.[0]?.message?.content || '{}';
        try { parsed = JSON.parse(raw); } catch { parsed = { x_thread: [raw], linkedin_post: raw, instagram_caption: raw, email_newsletter: { subject: 'Your Content', body: raw } }; }
        tokenUsage = 0;
      } catch (err) {
        lastError = err;
      }
    }

    if (!parsed) {
      // Local deterministic fallback for dev without keys or on provider errors
      const src = sourceText || `See: ${url}`;
      const clean = src.replace(/\s+/g,' ').trim();
      const tweetChunks: string[] = [];
      let i = 0;
      while (i < clean.length && tweetChunks.length < 8) {
        const slice = clean.slice(i, i + 260);
        tweetChunks.push(`${tweetChunks.length+1}/ ${slice}`);
        i += 260;
      }
      parsed = {
        x_thread: tweetChunks.length ? tweetChunks : [clean.slice(0, 260)],
        linkedin_post: clean.slice(0, 1100) + (clean.length > 1100 ? '…' : ''),
        instagram_caption: clean.slice(0, 1800) + (clean.length > 1800 ? '…' : ''),
        email_newsletter: { subject: 'Repurposed Content', body: clean.slice(0, 4000) },
        _fallback_note: lastError ? `Used local fallback due to: ${String(lastError?.message || lastError)}` : undefined
      } as any;
      tokenUsage = 0;
    }

    // Post-process according to client options
    const include = new Set<string>(platforms as string[]);
    if (Array.isArray(parsed?.x_thread) && numPosts) {
      parsed.x_thread = parsed.x_thread.slice(0, Math.max(1, Math.min(20, Number(numPosts))))
    }
    if (!include.has('x') && parsed?.x_thread) delete parsed.x_thread;
    if (!include.has('linkedin') && parsed?.linkedin_post) delete parsed.linkedin_post;
    if (!include.has('instagram') && parsed?.instagram_caption) delete parsed.instagram_caption;
    if (!include.has('email') && parsed?.email_newsletter) delete parsed.email_newsletter;

    // Deduct credit now that we have a result
    await deductCredits(session.user.id, 1);

    // Persist
    const content = await createContent({
      userId: user.id,
      source_type: sourceType,
      source_url: url || null,
      raw_text: text || null,
    });

    const generation = await insertGeneration({
      userId: user.id,
      contentId: content.id,
      platform: (platforms?.[0] || 'x') as any,
      tone,
      options,
      output: parsed,
      tokenUsage,
    });

    // Save posts for each platform
    const postsToCreate: Array<{platform: 'x'|'linkedin'|'instagram'|'email'; body: string; hashtags?: string[]}> = [];
    if (include.has('x') && Array.isArray(parsed.x_thread)) {
      postsToCreate.push({ platform: 'x', body: parsed.x_thread.join('\n\n') });
    }
    if (include.has('linkedin') && parsed.linkedin_post) {
      postsToCreate.push({ platform: 'linkedin', body: String(parsed.linkedin_post) });
    }
    if (include.has('instagram') && parsed.instagram_caption) {
      postsToCreate.push({ platform: 'instagram', body: String(parsed.instagram_caption) });
    }
    if (include.has('email') && parsed.email_newsletter) {
      const subj = parsed.email_newsletter.subject || 'Newsletter';
      const bodyStr = parsed.email_newsletter.body || '';
      postsToCreate.push({ platform: 'email', body: `Subject: ${subj}\n\n${bodyStr}` });
    }

    const createdPosts = [] as any[];
    for (const p of postsToCreate) {
      const pr = await insertPost({ userId: user.id, generationId: generation.id, platform: p.platform, body: p.body, hashtags: p.hashtags || null });
      createdPosts.push(pr);
    }

    return NextResponse.json({ success: true, output: parsed, generation, posts: createdPosts });
  } catch (e:any) {
    console.error('repurpose error', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}