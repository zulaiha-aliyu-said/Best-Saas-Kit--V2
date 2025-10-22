/**
 * Platform-Specific Content Optimization
 * 
 * This module provides platform-specific optimization for social media content
 * including character limits, hashtag optimization, thread creation, and formatting
 */

// Platform configuration and limits
export const PLATFORM_LIMITS = {
  x: {
    maxChars: 280,
    optimalChars: { min: 100, max: 250 },
    hashtagLimit: { min: 1, max: 3 },
    threadIndicator: '🧵',
    lineBreakFrequency: 2, // Add line break every N sentences
  },
  linkedin: {
    maxChars: 3000,
    optimalChars: { min: 150, max: 300 }, // Before "see more"
    firstLineChars: 140, // Hook before "see more"
    hashtagLimit: { min: 3, max: 5 },
    emojiLimit: { min: 1, max: 2 },
    lineBreakFrequency: 3,
  },
  instagram: {
    maxChars: 2200,
    firstLineChars: 125, // Before "...more"
    hashtagLimit: { min: 10, max: 15 },
    emojiLimit: { min: 5, max: 10 },
    lineBreakFrequency: 2,
  },
  email: {
    subjectMaxChars: 60,
    previewTextMaxChars: 90,
    optimalBodyChars: { min: 200, max: 500 },
    paragraphMaxSentences: 3,
  },
  facebook: {
    maxChars: 63206,
    optimalChars: { min: 100, max: 250 },
    hashtagLimit: { min: 1, max: 3 },
    lineBreakFrequency: 2,
  },
  tiktok: {
    maxChars: 2200,
    optimalChars: { min: 100, max: 150 },
    hashtagLimit: { min: 3, max: 5 },
    emojiLimit: { min: 2, max: 5 },
  },
} as const;

export type Platform = keyof typeof PLATFORM_LIMITS;

export interface OptimizationResult {
  content: string;
  platform: Platform;
  metrics: {
    characterCount: number;
    wordCount: number;
    hashtagCount: number;
    emojiCount: number;
    lineBreaksAdded: number;
  };
  optimizations: string[];
  warnings: string[];
  isThread?: boolean;
  threadPosts?: string[];
  preview?: {
    platform: Platform;
    displayContent: string;
    hiddenContent?: string;
  };
}

export interface ThreadOptions {
  content: string;
  maxCharsPerTweet?: number;
  addNumbering?: boolean;
  addThreadIndicator?: boolean;
}

/**
 * Count characters in a string (handling emojis properly)
 */
export function countCharacters(text: string): number {
  return [...text].length;
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count hashtags in text
 */
export function countHashtags(text: string): number {
  const hashtagRegex = /#\w+/g;
  return (text.match(hashtagRegex) || []).length;
}

/**
 * Count emojis in text
 */
export function countEmojis(text: string): number {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return (text.match(emojiRegex) || []).length;
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#\w+/g;
  return text.match(hashtagRegex) || [];
}

/**
 * Create Twitter/X thread from long content
 */
export function createThread(options: ThreadOptions): {
  posts: string[];
  warnings: string[];
} {
  const { content, maxCharsPerTweet = 280, addNumbering = true, addThreadIndicator = true } = options;
  const warnings: string[] = [];
  const posts: string[] = [];
  
  // Split content into sentences
  const sentences = content.split(/(?<=[.!?])\s+/);
  
  let currentPost = '';
  let postIndex = 0;
  
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    if (!cleanSentence) continue;
    
    // Calculate space needed for numbering (e.g., "1/5 ")
    const numberingSpace = addNumbering ? 8 : 0; // "XX/XX " format
    const threadIndicatorSpace = (addThreadIndicator && postIndex === 0) ? 3 : 0; // "🧵 "
    const availableSpace = maxCharsPerTweet - numberingSpace - threadIndicatorSpace;
    
    // Check if adding this sentence would exceed limit
    const potentialPost = currentPost ? `${currentPost} ${cleanSentence}` : cleanSentence;
    
    if (countCharacters(potentialPost) <= availableSpace) {
      currentPost = potentialPost;
    } else {
      // Save current post and start new one
      if (currentPost) {
        posts.push(currentPost);
        postIndex++;
      }
      
      // Check if single sentence is too long
      if (countCharacters(cleanSentence) > availableSpace) {
        // Split long sentence at punctuation or spaces
        const words = cleanSentence.split(' ');
        let chunk = '';
        
        for (const word of words) {
          const potentialChunk = chunk ? `${chunk} ${word}` : word;
          if (countCharacters(potentialChunk) <= availableSpace) {
            chunk = potentialChunk;
          } else {
            if (chunk) {
              posts.push(chunk);
              postIndex++;
            }
            chunk = word;
          }
        }
        
        if (chunk) {
          currentPost = chunk;
        }
      } else {
        currentPost = cleanSentence;
      }
    }
  }
  
  // Add remaining content
  if (currentPost) {
    posts.push(currentPost);
  }
  
  // Add numbering and thread indicator
  const totalPosts = posts.length;
  const finalPosts = posts.map((post, index) => {
    let finalPost = post;
    
    if (addNumbering && totalPosts > 1) {
      finalPost = `${index + 1}/${totalPosts} ${finalPost}`;
    }
    
    if (addThreadIndicator && index === 0) {
      finalPost = `🧵 ${finalPost}`;
    }
    
    return finalPost;
  });
  
  // Generate warnings
  if (totalPosts > 25) {
    warnings.push(`⚠️ Thread is very long (${totalPosts} tweets). Consider shortening.`);
  }
  
  return { posts: finalPosts, warnings };
}

/**
 * Optimize hashtags for platform
 */
export function optimizeHashtags(
  text: string,
  platform: Platform,
  existingHashtags: string[] = []
): {
  optimizedText: string;
  hashtags: string[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const limits = PLATFORM_LIMITS[platform];
  const currentHashtags = extractHashtags(text);
  const hashtagCount = currentHashtags.length;
  
  let optimizedText = text;
  let finalHashtags = [...currentHashtags];
  
  // Check hashtag limits
  if ('hashtagLimit' in limits) {
    const { min, max } = limits.hashtagLimit;
    
    if (hashtagCount > max) {
      warnings.push(`⚠️ Too many hashtags for ${platform} (${hashtagCount}/${max}). Reducing to ${max}.`);
      finalHashtags = currentHashtags.slice(0, max);
      
      // Remove excess hashtags from text
      currentHashtags.slice(max).forEach(tag => {
        optimizedText = optimizedText.replace(tag, '').trim();
      });
    } else if (hashtagCount < min && existingHashtags.length === 0) {
      warnings.push(`💡 Consider adding ${min - hashtagCount} more hashtag${min - hashtagCount > 1 ? 's' : ''} for better reach.`);
    }
  }
  
  return { optimizedText, hashtags: finalHashtags, warnings };
}

/**
 * Add line breaks for readability
 */
export function addLineBreaks(text: string, frequency: number = 2): {
  text: string;
  lineBreaksAdded: number;
} {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let result = '';
  let lineBreaksAdded = 0;
  
  sentences.forEach((sentence, index) => {
    result += sentence;
    
    // Add line break after every N sentences (but not at the end)
    if ((index + 1) % frequency === 0 && index < sentences.length - 1) {
      result += '\n\n';
      lineBreaksAdded++;
    } else if (index < sentences.length - 1) {
      result += ' ';
    }
  });
  
  return { text: result, lineBreaksAdded };
}

/**
 * Optimize content for Twitter/X
 */
export function optimizeForX(content: string): OptimizationResult {
  const optimizations: string[] = [];
  const warnings: string[] = [];
  const limits = PLATFORM_LIMITS.x;
  
  let optimizedContent = content.trim();
  const charCount = countCharacters(optimizedContent);
  
  // Check if thread is needed
  let isThread = false;
  let threadPosts: string[] = [];
  
  if (charCount > limits.maxChars) {
    optimizations.push('Created thread (content exceeded 280 characters)');
    const threadResult = createThread({ content: optimizedContent });
    threadPosts = threadResult.posts;
    isThread = true;
    warnings.push(...threadResult.warnings);
    optimizedContent = threadPosts[0]; // Use first tweet for single view
  }
  
  // Optimize hashtags
  const hashtagResult = optimizeHashtags(optimizedContent, 'x');
  optimizedContent = hashtagResult.optimizedText;
  warnings.push(...hashtagResult.warnings);
  if (hashtagResult.warnings.length > 0) {
    optimizations.push('Optimized hashtags for Twitter');
  }
  
  // Add line breaks
  const lineBreakResult = addLineBreaks(optimizedContent, limits.lineBreakFrequency);
  if (lineBreakResult.lineBreaksAdded > 0) {
    optimizedContent = lineBreakResult.text;
    optimizations.push(`Added ${lineBreakResult.lineBreaksAdded} line breaks for readability`);
  }
  
  // Character count warning
  const finalCharCount = countCharacters(optimizedContent);
  if (finalCharCount > limits.optimalChars.max && !isThread) {
    warnings.push(`💡 Tweet is ${finalCharCount} chars. Consider shortening for better engagement.`);
  }
  
  return {
    content: isThread ? threadPosts.join('\n\n---\n\n') : optimizedContent,
    platform: 'x',
    metrics: {
      characterCount: finalCharCount,
      wordCount: countWords(optimizedContent),
      hashtagCount: countHashtags(optimizedContent),
      emojiCount: countEmojis(optimizedContent),
      lineBreaksAdded: lineBreakResult.lineBreaksAdded,
    },
    optimizations,
    warnings,
    isThread,
    threadPosts: isThread ? threadPosts : undefined,
    preview: {
      platform: 'x',
      displayContent: optimizedContent,
    },
  };
}

/**
 * Optimize content for LinkedIn
 */
export function optimizeForLinkedIn(content: string): OptimizationResult {
  const optimizations: string[] = [];
  const warnings: string[] = [];
  const limits = PLATFORM_LIMITS.linkedin;
  
  let optimizedContent = content.trim();
  const charCount = countCharacters(optimizedContent);
  
  // Check hook (first 140 characters)
  const firstLine = optimizedContent.split('\n')[0];
  const hookCharCount = countCharacters(firstLine);
  
  if (hookCharCount > limits.firstLineChars) {
    warnings.push(`⚠️ Hook is ${hookCharCount} chars. First ${limits.firstLineChars} chars should grab attention.`);
    optimizations.push('Optimized opening hook placement');
  }
  
  // Optimize hashtags
  const hashtagResult = optimizeHashtags(optimizedContent, 'linkedin');
  optimizedContent = hashtagResult.optimizedText;
  warnings.push(...hashtagResult.warnings);
  if (hashtagResult.warnings.length > 0) {
    optimizations.push('Optimized hashtags for LinkedIn');
  }
  
  // Check emoji usage
  const emojiCount = countEmojis(optimizedContent);
  if (emojiCount > limits.emojiLimit.max) {
    warnings.push(`⚠️ Too many emojis (${emojiCount}). LinkedIn prefers ${limits.emojiLimit.min}-${limits.emojiLimit.max}.`);
  } else if (emojiCount === 0) {
    warnings.push(`💡 Consider adding 1-2 emojis for better engagement.`);
  }
  
  // Add line breaks
  const lineBreakResult = addLineBreaks(optimizedContent, limits.lineBreakFrequency);
  if (lineBreakResult.lineBreaksAdded > 0) {
    optimizedContent = lineBreakResult.text;
    optimizations.push(`Added ${lineBreakResult.lineBreaksAdded} line breaks for readability`);
  }
  
  // Length check
  if (charCount > limits.maxChars) {
    warnings.push(`⚠️ Content exceeds LinkedIn limit (${charCount}/${limits.maxChars})`);
    optimizedContent = optimizedContent.slice(0, limits.maxChars - 3) + '...';
    optimizations.push('Truncated to fit LinkedIn limit');
  } else if (charCount < limits.optimalChars.min) {
    warnings.push(`💡 Post is short (${charCount} chars). LinkedIn performs better with ${limits.optimalChars.min}-${limits.optimalChars.max} chars.`);
  }
  
  // Split content for preview (before "see more")
  const displayContent = optimizedContent.slice(0, limits.firstLineChars);
  const hiddenContent = optimizedContent.slice(limits.firstLineChars);
  
  return {
    content: optimizedContent,
    platform: 'linkedin',
    metrics: {
      characterCount: countCharacters(optimizedContent),
      wordCount: countWords(optimizedContent),
      hashtagCount: countHashtags(optimizedContent),
      emojiCount,
      lineBreaksAdded: lineBreakResult.lineBreaksAdded,
    },
    optimizations,
    warnings,
    preview: {
      platform: 'linkedin',
      displayContent,
      hiddenContent: hiddenContent || undefined,
    },
  };
}

/**
 * Optimize content for Instagram
 */
export function optimizeForInstagram(content: string): OptimizationResult {
  const optimizations: string[] = [];
  const warnings: string[] = [];
  const limits = PLATFORM_LIMITS.instagram;
  
  let optimizedContent = content.trim();
  const charCount = countCharacters(optimizedContent);
  
  // Check hook (first line before "...more")
  const firstLine = optimizedContent.split('\n')[0];
  const hookCharCount = countCharacters(firstLine);
  
  if (hookCharCount > limits.firstLineChars) {
    warnings.push(`⚠️ Hook is ${hookCharCount} chars. First ${limits.firstLineChars} should be engaging.`);
    optimizations.push('Optimized opening hook for Instagram preview');
  }
  
  // Optimize hashtags
  const hashtagResult = optimizeHashtags(optimizedContent, 'instagram');
  optimizedContent = hashtagResult.optimizedText;
  warnings.push(...hashtagResult.warnings);
  if (hashtagResult.warnings.length > 0) {
    optimizations.push('Optimized hashtags for Instagram');
  }
  
  // Check emoji usage
  const emojiCount = countEmojis(optimizedContent);
  if (emojiCount > limits.emojiLimit.max) {
    warnings.push(`⚠️ Too many emojis (${emojiCount}). Instagram works best with ${limits.emojiLimit.min}-${limits.emojiLimit.max}.`);
  } else if (emojiCount < limits.emojiLimit.min) {
    warnings.push(`💡 Consider adding more emojis (current: ${emojiCount}, recommended: ${limits.emojiLimit.min}-${limits.emojiLimit.max}).`);
  }
  
  // Add line breaks
  const lineBreakResult = addLineBreaks(optimizedContent, limits.lineBreakFrequency);
  if (lineBreakResult.lineBreaksAdded > 0) {
    optimizedContent = lineBreakResult.text;
    optimizations.push(`Added ${lineBreakResult.lineBreaksAdded} line breaks for readability`);
  }
  
  // Length check
  if (charCount > limits.maxChars) {
    warnings.push(`⚠️ Caption exceeds Instagram limit (${charCount}/${limits.maxChars})`);
    optimizedContent = optimizedContent.slice(0, limits.maxChars - 3) + '...';
    optimizations.push('Truncated to fit Instagram limit');
  }
  
  // Split content for preview
  const displayContent = optimizedContent.slice(0, limits.firstLineChars);
  const hiddenContent = optimizedContent.slice(limits.firstLineChars);
  
  return {
    content: optimizedContent,
    platform: 'instagram',
    metrics: {
      characterCount: countCharacters(optimizedContent),
      wordCount: countWords(optimizedContent),
      hashtagCount: countHashtags(optimizedContent),
      emojiCount,
      lineBreaksAdded: lineBreakResult.lineBreaksAdded,
    },
    optimizations,
    warnings,
    preview: {
      platform: 'instagram',
      displayContent,
      hiddenContent: hiddenContent || undefined,
    },
  };
}

/**
 * Optimize content for Email
 */
export function optimizeForEmail(content: string, subject?: string): OptimizationResult {
  const optimizations: string[] = [];
  const warnings: string[] = [];
  const limits = PLATFORM_LIMITS.email;
  
  let optimizedContent = content.trim();
  let optimizedSubject = subject?.trim() || '';
  
  // Optimize subject line
  if (optimizedSubject) {
    const subjectCharCount = countCharacters(optimizedSubject);
    if (subjectCharCount > limits.subjectMaxChars) {
      warnings.push(`⚠️ Subject line too long (${subjectCharCount}/${limits.subjectMaxChars})`);
      optimizedSubject = optimizedSubject.slice(0, limits.subjectMaxChars - 3) + '...';
      optimizations.push('Truncated subject line');
    } else if (subjectCharCount < 20) {
      warnings.push(`💡 Subject line is short. Aim for 30-${limits.subjectMaxChars} characters.`);
    }
  }
  
  // Add preview text (first 90 characters)
  const previewText = optimizedContent.slice(0, limits.previewTextMaxChars);
  if (countCharacters(previewText) < limits.previewTextMaxChars) {
    warnings.push(`💡 Preview text is only ${countCharacters(previewText)} chars. Use full ${limits.previewTextMaxChars} for better open rates.`);
  }
  
  // Break into shorter paragraphs
  const paragraphs = optimizedContent.split('\n\n');
  const reformattedParagraphs: string[] = [];
  
  paragraphs.forEach(para => {
    const sentences = para.split(/(?<=[.!?])\s+/);
    if (sentences.length > limits.paragraphMaxSentences) {
      // Split long paragraphs
      for (let i = 0; i < sentences.length; i += limits.paragraphMaxSentences) {
        reformattedParagraphs.push(
          sentences.slice(i, i + limits.paragraphMaxSentences).join(' ')
        );
      }
      optimizations.push('Split long paragraphs for better readability');
    } else {
      reformattedParagraphs.push(para);
    }
  });
  
  optimizedContent = reformattedParagraphs.join('\n\n');
  
  return {
    content: optimizedContent,
    platform: 'email',
    metrics: {
      characterCount: countCharacters(optimizedContent),
      wordCount: countWords(optimizedContent),
      hashtagCount: 0, // Emails don't use hashtags
      emojiCount: countEmojis(optimizedContent),
      lineBreaksAdded: reformattedParagraphs.length - paragraphs.length,
    },
    optimizations,
    warnings,
    preview: {
      platform: 'email',
      displayContent: previewText,
    },
  };
}

/**
 * Main optimization function - routes to platform-specific optimizer
 */
export function optimizeForPlatform(
  content: string,
  platform: Platform,
  options?: { subject?: string }
): OptimizationResult {
  switch (platform) {
    case 'x':
      return optimizeForX(content);
    case 'linkedin':
      return optimizeForLinkedIn(content);
    case 'instagram':
      return optimizeForInstagram(content);
    case 'email':
      return optimizeForEmail(content, options?.subject);
    case 'facebook':
      // Facebook is similar to Twitter but with higher limits
      return optimizeForX(content);
    case 'tiktok':
      // TikTok is similar to Instagram
      return optimizeForInstagram(content);
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

/**
 * Get color for character count indicator
 */
export function getCharacterCountColor(count: number, platform: Platform): 'green' | 'yellow' | 'red' {
  const limits = PLATFORM_LIMITS[platform];
  const maxChars = limits.maxChars;
  const percentage = (count / maxChars) * 100;
  
  if (percentage >= 100) return 'red';
  if (percentage >= 90) return 'yellow';
  return 'green';
}

/**
 * Format character count display
 */
export function formatCharacterCount(count: number, platform: Platform): string {
  const limits = PLATFORM_LIMITS[platform];
  return `${count}/${limits.maxChars}`;
}






