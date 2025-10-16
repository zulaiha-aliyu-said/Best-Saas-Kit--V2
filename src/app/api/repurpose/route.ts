import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId, getUserCredits, deductCredits, createContent, insertGeneration, insertPost } from "@/lib/database";
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';

// Helper function to fetch and extract text from URL
async function fetchUrlContent(url: string): Promise<string> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs are supported');
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    
    // Check if it's HTML
    if (!contentType.includes('text/html')) {
      throw new Error('URL must return HTML content');
    }

    const html = await response.text();
    
    // Parse HTML and extract text
    const $ = cheerio.load(html);
    
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, iframe, noscript, img, svg').remove();
    
    // Try to find main content area
    let content = '';
    
    // Look for common article/content selectors (expanded list)
    const contentSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.content',
      '#content',
      '.post-body',
      '.article-body',
      '.post',
      '.blog-post',
      '[itemprop="articleBody"]',
      '.story-body',
      '.article',
      'h1 ~ p', // Paragraphs after main heading
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const text = element.text().trim();
        if (text.length > 100) { // More lenient than 50
          content = text;
          break;
        }
      }
    }
    
    // Fallback: Get all paragraph text
    if (!content || content.length < 100) {
      const paragraphs = $('p')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 20)
        .join('\n\n');
      
      if (paragraphs.length > 100) {
        content = paragraphs;
      }
    }
    
    // Ultimate fallback to body
    if (!content || content.length < 100) {
      content = $('body').text();
    }
    
    // Clean up the text
    content = content
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines
      .trim();
    
    // More lenient check
    if (!content || content.length < 50) {
      console.log('Content length:', content.length);
      console.log('First 200 chars:', content.slice(0, 200));
      throw new Error(`Could not extract meaningful content from URL. Only found ${content.length} characters.`);
    }
    
    // Limit content length (max 10000 characters)
    if (content.length > 10000) {
      content = content.slice(0, 10000) + '...';
    }
    
    console.log('Successfully extracted', content.length, 'characters from URL');
    return content;
  } catch (error: any) {
    console.error('URL fetch error:', error);
    throw new Error(`Failed to fetch URL content: ${error.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sourceType = 'text', text = '', url = '', tone = 'professional', platforms = ['x','linkedin','instagram','email'], numPosts = 3, contentLength = 'medium', options = {} } = body || {};
    
    // Define length guidelines based on setting
    const lengthGuides = {
      short: { tweet: '100-150 chars', linkedin: '500-800 chars', instagram: '300-600 chars', email: '400-800 chars' },
      medium: { tweet: '150-200 chars', linkedin: '800-1200 chars', instagram: '600-1200 chars', email: '800-1500 chars' },
      long: { tweet: '200-260 chars', linkedin: '1200-1800 chars', instagram: '1200-1800 chars', email: '1500-2500 chars' },
      detailed: { tweet: '230-280 chars', linkedin: '1800-2500 chars', instagram: '1800-2200 chars', email: '2500-4000 chars' }
    };
    
    const currentLength = lengthGuides[contentLength as keyof typeof lengthGuides] || lengthGuides.medium;

    // Resolve DB user id
    const user = await getUserByGoogleId(session.user.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });

    // Check credits (1 per generation request)
    const credits = await getUserCredits(session.user.id);
    if (credits <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // Fetch content from URL if sourceType is 'url'
    let sourceText = String(text || '');
    if (sourceType === 'url' && url) {
      try {
        sourceText = await fetchUrlContent(url);
      } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch URL content' }, { status: 400 });
      }
    }
    
    // Validate we have content
    if (!sourceText && !url) {
      return NextResponse.json({ error: 'Please provide either text content or a URL' }, { status: 400 });
    }
    const includeHashtags = options.includeHashtags !== false;
    const includeEmojis = options.includeEmojis === true;
    const includeCTA = options.includeCTA === true;
    
    const lengthDescriptions = {
      short: 'VERY BRIEF and to the point. Each tweet 100-150 characters. Focus on the core message only.',
      medium: 'BALANCED length. Each tweet 150-200 characters. Include key points with some context.',
      long: 'COMPREHENSIVE. Each tweet 200-260 characters. Provide detailed information and examples.',
      detailed: 'VERY DETAILED. Each tweet 230-280 characters. Include examples, statistics, and thorough explanations.'
    };
    
    const system = {
      role: 'system',
      content: `You are RepurposeAI. Convert long-form content into platform-specific social media posts.

🚨 CRITICAL REQUIREMENTS - READ CAREFULLY:

1. CONTENT LENGTH SETTING: ${contentLength.toUpperCase()}
   ${lengthDescriptions[contentLength as keyof typeof lengthDescriptions]}

2. EXACT SPECIFICATIONS:
   - x_thread: EXACTLY ${numPosts} tweets, each ${currentLength.tweet}
   - linkedin_post: ${currentLength.linkedin}
   - instagram_caption: ${currentLength.instagram}  
   - email_newsletter body: ${currentLength.email}

3. ${contentLength === 'short' ? '⚡ SHORT MODE: Be extremely concise. Cut unnecessary words. No fluff.' : contentLength === 'detailed' ? '📚 DETAILED MODE: Elaborate fully. Add examples, data, and explanations. Be thorough.' : contentLength === 'long' ? '📝 LONG MODE: Provide comprehensive information with context and details.' : '⚖️ MEDIUM MODE: Balance brevity with informativeness.'}

4. FORMAT: Return ONLY valid JSON (no markdown blocks):
   {"x_thread": ["tweet1", "tweet2", ...], "linkedin_post": "...", "instagram_caption": "...", "email_newsletter": {"subject": "...", "body": "..."}}

5. TONE: ${tone} throughout all content

6. HASHTAGS: ${includeHashtags ? '✅ Include 3-5 relevant hashtags at the end' : '❌ DO NOT include any hashtags'}
7. EMOJIS: ${includeEmojis ? '😊 Use 1-3 relevant emojis per post to add personality and engagement' : '❌ DO NOT include any emojis'}
8. CALL-TO-ACTION: ${includeCTA ? '📢 End each post with a clear call-to-action (e.g., "Comment below", "Share your thoughts", "Learn more at...", "Try it today")' : '❌ DO NOT include any call-to-action'}`
    } as const;

    const userMsg = {
      role: 'user',
      content: `Content length requirement: ${contentLength.toUpperCase()}

${contentLength === 'short' ? '⚡ Make it VERY SHORT and concise!' : contentLength === 'detailed' ? '📚 Make it VERY DETAILED with examples and explanations!' : contentLength === 'long' ? '📝 Make it LONG and comprehensive!' : 'Make it medium length.'}

Generate EXACTLY ${numPosts} tweets (each ${currentLength.tweet}).
Tone: ${tone}

Content:
${sourceText.slice(0, 3000)}

Return ONLY the JSON.`
    } as const;

    // Decide AI path: OpenRouter if configured, otherwise deterministic fallback
    let parsed: any = null;
    let tokenUsage = 0;

    let lastError: any = null;

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const { createChatCompletion } = await import("@/lib/openrouter");
        const completion = await createChatCompletion([system as any, userMsg as any], { max_tokens: 2000, temperature: 0.7 });
        let raw = completion.choices?.[0]?.message?.content || '{}';
        // Remove markdown code blocks if present
        if (raw.includes('```')) {
          raw = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        }
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
            { role: 'system', content: system.content },
            { role: 'user', content: userMsg.content }
          ]
        });
        let raw = comp.choices?.[0]?.message?.content || '{}';
        if (raw.includes('```')) {
          raw = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        }
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
    
    // Strictly enforce numPosts for x_thread
    if (Array.isArray(parsed?.x_thread)) {
      const targetNum = Math.max(1, Math.min(10, Number(numPosts)));
      
      // Trim to exact number requested
      if (parsed.x_thread.length > targetNum) {
        parsed.x_thread = parsed.x_thread.slice(0, targetNum);
      }
      
      // Pad if too few (split longest tweet or duplicate)
      while (parsed.x_thread.length < targetNum) {
        const longest = parsed.x_thread.reduce((a, b) => a.length > b.length ? a : b, '');
        if (longest.length > 140) {
          const mid = Math.floor(longest.length / 2);
          const splitAt = longest.lastIndexOf('. ', mid) || longest.lastIndexOf(' ', mid) || mid;
          const idx = parsed.x_thread.indexOf(longest);
          parsed.x_thread[idx] = longest.slice(0, splitAt).trim();
          parsed.x_thread.splice(idx + 1, 0, longest.slice(splitAt).trim());
        } else {
          break; // Can't split further
        }
      }
      
      // Enforce length based on contentLength setting
      const targetLengths = {
        short: { min: 80, target: 125, max: 150 },
        medium: { min: 140, target: 175, max: 210 },
        long: { min: 190, target: 230, max: 270 },
        detailed: { min: 220, target: 255, max: 280 }
      };
      
      const lengthTarget = targetLengths[contentLength as keyof typeof targetLengths] || targetLengths.medium;
      
      parsed.x_thread = parsed.x_thread.map((t: string, idx: number) => {
        t = String(t).trim();
        
        // If too long, trim
        if (t.length > lengthTarget.max) {
          t = t.slice(0, lengthTarget.max - 3) + '...';
        }
        
        // If way too short for the setting (and not last tweet), flag it
        if (contentLength !== 'short' && t.length < lengthTarget.min && idx < parsed.x_thread.length - 1) {
          console.log(`Warning: Tweet ${idx + 1} is ${t.length} chars (expected ${lengthTarget.min}-${lengthTarget.max})`);
        }
        
        return t;
      });
      
      // Validate LinkedIn post length
      if (parsed.linkedin_post) {
        const linkedinLength = String(parsed.linkedin_post).length;
        const linkedinTargets = {
          short: { min: 400, max: 900 },
          medium: { min: 700, max: 1300 },
          long: { min: 1100, max: 1900 },
          detailed: { min: 1700, max: 2600 }
        };
        const linkedinTarget = linkedinTargets[contentLength as keyof typeof linkedinTargets] || linkedinTargets.medium;
        
        if (linkedinLength < linkedinTarget.min) {
          console.log(`Warning: LinkedIn post is too short: ${linkedinLength} chars (expected ${linkedinTarget.min}+)`);
        }
      }
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