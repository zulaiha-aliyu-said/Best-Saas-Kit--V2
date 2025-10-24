import { NextRequest, NextResponse } from "next/server";
import { createContent, insertGeneration, insertPost, getUserPreferences, insertOptimizationAnalytics } from "@/lib/database";
import { deductCredits as deductLTDCredits, getUserPlan } from '@/lib/feature-gate';
import { calculateCreditCost } from '@/lib/ltd-tiers';
import * as cheerio from 'cheerio';
import { optimizeForPlatform, Platform, countCharacters, countWords } from "@/lib/platform-optimizer";

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
    // Import the helper function
    const { ensureUserExists } = await import('@/lib/ensure-user');
    
    // Ensure user exists (auto-creates if needed)
    const userResult = await ensureUserExists();
    if (!userResult.success) {
      return NextResponse.json(
        { error: userResult.error },
        { status: userResult.status || 500 }
      );
    }
    
    const { user, session } = userResult;
    const userId = typeof user?.id === 'string' ? parseInt(user.id) : user?.id;

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

    // Get user's writing style if enabled
    let userStyleProfile = null;
    let styleEnabled = false;
    try {
      const { getUserWritingStyle } = await import("@/lib/database");
      const styleData = await getUserWritingStyle(userId!);
      if (styleData.style_enabled && styleData.profile && styleData.confidence_score >= 60) {
        userStyleProfile = styleData.profile;
        styleEnabled = true;
      }
    } catch (error) {
      console.error('Error fetching user writing style:', error);
      // Continue without style if there's an error
    }

    // Get user's platform optimization setting
    let platformOptimizationEnabled = false;
    try {
      const userPrefs = await getUserPreferences(userId!);
      platformOptimizationEnabled = userPrefs.platform_optimization_enabled || false;
      console.log('🎯 Platform Optimization Enabled:', platformOptimizationEnabled);
      console.log('📋 Full User Preferences:', JSON.stringify(userPrefs, null, 2));
    } catch (error) {
      console.error('❌ Error fetching platform optimization setting:', error);
      // Continue without optimization if there's an error
    }

    // Calculate credit cost based on number of platforms (1 credit per platform)
    const numPlatforms = platforms.length;
    const plan = await getUserPlan(userId!);
    const creditCostPerPlatform = calculateCreditCost('content_repurposing', plan?.ltd_tier ?? undefined);
    const totalCreditCost = creditCostPerPlatform * numPlatforms;
    
    console.log(`💳 Credit calculation: ${numPlatforms} platforms × ${creditCostPerPlatform} credits = ${totalCreditCost} total credits`);

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
    const customHook = options.customHook || '';
    const customCTA = options.customCTA || '';
    
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
8. CALL-TO-ACTION: ${includeCTA ? (customCTA ? `📢 Use this specific CTA: "${customCTA}"` : '📢 End each post with a clear call-to-action (e.g., "Comment below", "Share your thoughts", "Learn more at...", "Try it today")') : '❌ DO NOT include any call-to-action'}
9. OPENING HOOK: ${customHook ? `🎣 Start the first tweet/post with this hook: "${customHook}"` : 'Create an engaging opening hook'}

${styleEnabled && userStyleProfile ? `
🎨 WRITING STYLE REQUIREMENTS (Talk Like Me Feature):
You MUST match the user's unique writing style and voice. Follow these specific characteristics:

- TONE: ${userStyleProfile.tone}
- PERSONALITY TRAITS: ${userStyleProfile.personality_traits.join(', ')}
- VOCABULARY: Use these common words/phrases: ${userStyleProfile.vocabulary_patterns.common_words.slice(0, 5).join(', ')}
- SENTENCE STARTERS: ${userStyleProfile.vocabulary_patterns.sentence_starters.slice(0, 3).join(', ')}
- SENTENCE STRUCTURE: ${userStyleProfile.sentence_structure.complexity_level} complexity, avg ${userStyleProfile.sentence_structure.avg_sentence_length} words
- EMOJI USAGE: ${userStyleProfile.emoji_usage.frequency} frequency, preferred: ${userStyleProfile.emoji_usage.preferred_emojis.slice(0, 3).join(', ')}
- OPENING STYLES: ${userStyleProfile.brand_elements.opening_styles.slice(0, 2).join(', ')}
- CLOSING STYLES: ${userStyleProfile.brand_elements.closing_styles.slice(0, 2).join(', ')}
- SIGNATURE PHRASES: ${userStyleProfile.brand_elements.signature_phrases.slice(0, 2).join(', ')}

CRITICAL: Maintain the user's authentic voice and writing patterns while adapting to each platform's requirements. The content should sound like it was written by the user, not a generic AI.
` : ''}`
    } as const;

    const userMsg = {
      role: 'user',
      content: `Content length requirement: ${contentLength.toUpperCase()}

${contentLength === 'short' ? '⚡ Make it VERY SHORT and concise!' : contentLength === 'detailed' ? '📚 Make it VERY DETAILED with examples and explanations!' : contentLength === 'long' ? '📝 Make it LONG and comprehensive!' : 'Make it medium length.'}

Generate EXACTLY ${numPosts} tweets (each ${currentLength.tweet}).
Tone: ${tone}
${customHook ? `\n🎣 IMPORTANT: Start with this hook: "${customHook}"` : ''}
${customCTA ? `\n📢 IMPORTANT: Use this CTA: "${customCTA}"` : ''}

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
      // Enhanced local fallback for dev without keys or on provider errors
      const src = sourceText || `See: ${url}`;
      const clean = src.replace(/\s+/g,' ').trim();
      
      // Create better formatted tweets
      const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const tweetChunks: string[] = [];
      
      // First tweet with custom hook if provided
      if (customHook && sentences.length > 0) {
        tweetChunks.push(customHook + '\n\n' + sentences[0].trim() + '.');
      } else if (sentences.length > 0) {
        tweetChunks.push(sentences[0].trim() + '.');
      }
      
      // Add more tweets from content
      for (let i = 1; i < Math.min(sentences.length, numPosts); i++) {
        let tweet = sentences[i].trim();
        if (tweet.length > 250) {
          tweet = tweet.slice(0, 247) + '...';
        }
        if (!tweet.endsWith('.') && !tweet.endsWith('!') && !tweet.endsWith('?')) {
          tweet += '.';
        }
        tweetChunks.push(tweet);
      }
      
      // Add CTA to last tweet if provided
      if (customCTA && tweetChunks.length > 0 && includeCTA) {
        const lastIdx = tweetChunks.length - 1;
        tweetChunks[lastIdx] = tweetChunks[lastIdx] + '\n\n' + customCTA;
      }
      
      // Ensure we have the right number of tweets
      while (tweetChunks.length < Math.min(numPosts, 3)) {
        if (sentences.length > tweetChunks.length) {
          tweetChunks.push(sentences[tweetChunks.length].trim() + '.');
        } else {
          break;
        }
      }
      
      // Create LinkedIn post
      let linkedinPost = '';
      if (customHook) {
        linkedinPost = customHook + '\n\n';
      }
      linkedinPost += sentences.slice(0, 5).join('. ').trim();
      if (includeCTA && customCTA) {
        linkedinPost += '\n\n' + customCTA;
      }
      if (includeHashtags) {
        linkedinPost += '\n\n#content #marketing #business';
      }
      
      // Create Instagram caption
      let instagramCaption = '';
      if (customHook) {
        instagramCaption = customHook + '\n\n';
      }
      instagramCaption += sentences.slice(0, 3).join('. ').trim();
      if (includeCTA && customCTA) {
        instagramCaption += '\n\n' + customCTA;
      }
      if (includeHashtags) {
        instagramCaption += '\n\n#content #marketing #business #socialmedia';
      }
      if (includeEmojis) {
        instagramCaption = '✨ ' + instagramCaption + ' 🚀';
      }
      
      // Create email
      const emailSubject = customHook || sentences[0]?.trim().slice(0, 60) || 'Your Content';
      let emailBody = sentences.slice(0, 8).join('. ').trim();
      if (includeCTA && customCTA) {
        emailBody += '\n\n' + customCTA;
      }
      
      parsed = {
        x_thread: tweetChunks.length ? tweetChunks : [clean.slice(0, 260)],
        linkedin_post: linkedinPost,
        instagram_caption: instagramCaption,
        email_newsletter: { 
          subject: emailSubject, 
          body: emailBody 
        },
        _fallback_note: 'Using basic mode. Configure GROQ_API_KEY or OPENROUTER_API_KEY for AI-powered generation.'
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
        const longest = parsed.x_thread.reduce((a: string, b: string) => a.length > b.length ? a : b, '');
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

    // Apply platform-specific optimization if enabled
    const optimizationResults: any = {};
    if (platformOptimizationEnabled) {
      console.log('✨ Applying platform optimization...');
      console.log('📌 Platforms to optimize:', Array.from(include));
      const startTime = Date.now();
      
      // Optimize for each platform
      if (include.has('x') && parsed?.x_thread) {
        console.log('🐦 Processing Twitter/X optimization...');
        console.log('  📝 Original x_thread type:', Array.isArray(parsed.x_thread) ? 'array' : 'string');
        console.log('  📝 Original x_thread content:', JSON.stringify(parsed.x_thread).substring(0, 200));
        
        const originalContent = Array.isArray(parsed.x_thread) ? parsed.x_thread.join(' ') : parsed.x_thread;
        console.log('  📝 Joined content length:', originalContent.length);
        console.log('  📝 First 200 chars of joined content:', originalContent.substring(0, 200));
        
        const xOptimization = optimizeForPlatform(originalContent, 'x');
        console.log('  ✅ Optimization result - isThread:', xOptimization.isThread);
        console.log('  ✅ Thread posts count:', xOptimization.threadPosts?.length || 0);
        if (xOptimization.threadPosts) {
          console.log('  ✅ Thread posts preview:');
          xOptimization.threadPosts.forEach((post, i) => {
            console.log(`      Tweet ${i + 1}: "${post.substring(0, 80)}..."`);
          });
        }
        
        // Update parsed content with optimized version
        if (xOptimization.isThread && xOptimization.threadPosts) {
          parsed.x_thread = xOptimization.threadPosts;
          console.log('  🔄 Updated parsed.x_thread with optimized thread');
        } else {
          console.log('  ⚠️  No thread created, keeping original');
        }
        
        optimizationResults.x = xOptimization;
      } else {
        if (!include.has('x')) {
          console.log('  ⏭️  Twitter/X not in selected platforms');
        } else if (!parsed?.x_thread) {
          console.log('  ⚠️  parsed.x_thread is missing or undefined');
        }
      }
      
      if (include.has('linkedin') && parsed?.linkedin_post) {
        const linkedinOptimization = optimizeForPlatform(String(parsed.linkedin_post), 'linkedin');
        parsed.linkedin_post = linkedinOptimization.content;
        optimizationResults.linkedin = linkedinOptimization;
      }
      
      if (include.has('instagram') && parsed?.instagram_caption) {
        const instagramOptimization = optimizeForPlatform(String(parsed.instagram_caption), 'instagram');
        parsed.instagram_caption = instagramOptimization.content;
        optimizationResults.instagram = instagramOptimization;
      }
      
      if (include.has('email') && parsed?.email_newsletter) {
        const emailSubject = parsed.email_newsletter.subject || '';
        const emailBody = parsed.email_newsletter.body || '';
        const emailOptimization = optimizeForPlatform(emailBody, 'email', { subject: emailSubject });
        parsed.email_newsletter.body = emailOptimization.content;
        optimizationResults.email = emailOptimization;
      }
      
      const processingTime = Date.now() - startTime;
      
      // Store optimization results for later analytics tracking
      parsed._optimization_results = optimizationResults;
      parsed._optimization_processing_time = processingTime;
      console.log('✅ Platform optimization applied. Processing time:', processingTime, 'ms');
      console.log('📊 Optimizations:', Object.keys(optimizationResults));
    } else {
      console.log('⏭️  Platform optimization is disabled');
    }

    // Deduct credits now that we have a result (1 credit per platform)
    const creditResult = await deductLTDCredits(
      session.user.id,
      totalCreditCost,
      'content_repurposing',
      {
        platforms: platforms,
        numPlatforms: numPlatforms,
        sourceType: sourceType,
        tone: tone,
        contentLength: contentLength
      }
    );
    
    if (!creditResult.success) {
      return NextResponse.json({
        error: creditResult.error || 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        remaining: creditResult.remaining,
        required: totalCreditCost
      }, { status: 402 });
    }
    
    console.log(`✅ Deducted ${totalCreditCost} credits. Remaining: ${creditResult.remaining}`);

    // Persist
    const content = await createContent({
      userId: userId!,
      source_type: sourceType,
      source_url: url || null,
      raw_text: text || null,
    });

    // Only use platforms supported by the database
    const supportedPlatforms = ['x', 'linkedin', 'instagram', 'email'];
    const validPlatform = platforms?.find((p: string) => supportedPlatforms.includes(p)) || 'x';

    const generation = await insertGeneration({
      userId: userId!,
      contentId: content.id,
      platform: validPlatform as any,
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
      const pr = await insertPost({ userId: userId!, generationId: generation.id, platform: p.platform, body: p.body, hashtags: p.hashtags || null });
      createdPosts.push(pr);
    }

    // Track platform optimization analytics if enabled
    if (platformOptimizationEnabled && Object.keys(optimizationResults).length > 0) {
      try {
        for (const [platform, optResult] of Object.entries(optimizationResults)) {
          if (optResult && typeof optResult === 'object') {
            await insertOptimizationAnalytics({
              user_id: userId!,
              generation_id: generation.id,
              platform: platform as any,
              optimization_applied: true,
              original_content_length: sourceText.length,
              optimized_content_length: countCharacters(optResult.content || ''),
              character_count: optResult.metrics?.characterCount || 0,
              word_count: optResult.metrics?.wordCount || 0,
              thread_created: optResult.isThread || false,
              thread_count: optResult.threadPosts?.length || 0,
              hashtag_count: optResult.metrics?.hashtagCount || 0,
              emoji_count: optResult.metrics?.emojiCount || 0,
              line_breaks_added: optResult.metrics?.lineBreaksAdded || 0,
              optimizations_applied: optResult.optimizations || [],
              rules_applied: {
                platform: platform,
                maxChars: optResult.preview?.platform ? 280 : 0,
              },
              warnings: optResult.warnings || [],
              processing_time_ms: parsed._optimization_processing_time || 0,
              model_used: 'platform-optimizer-v1',
            });
          }
        }
      } catch (analyticsError) {
        console.error('Error tracking optimization analytics:', analyticsError);
        // Don't fail the request if analytics tracking fails
      }
    }

    console.log('📤 Returning to frontend - x_thread:', Array.isArray(parsed?.x_thread) ? `array[${parsed.x_thread.length}]` : typeof parsed?.x_thread);
    if (parsed?.x_thread && Array.isArray(parsed.x_thread)) {
      console.log('📤 First thread item preview:', parsed.x_thread[0]?.substring(0, 100));
    }
    
    return NextResponse.json({ 
      success: true, 
      output: parsed, 
      generation, 
      posts: createdPosts,
      credits: creditResult.remaining,
      creditsUsed: totalCreditCost
    });
  } catch (e:any) {
    console.error('repurpose error', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}