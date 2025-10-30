import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the web page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Extract text content from HTML
    const text = extractTextFromHTML(html);

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract meaningful content from the URL' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      url,
    });

  } catch (error: any) {
    console.error('URL extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract content from URL' },
      { status: 500 }
    );
  }
}

function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  
  // Extract content from common article tags
  const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const contentMatch = text.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  
  // Use the most specific content area if found
  if (articleMatch) {
    text = articleMatch[1];
  } else if (mainMatch) {
    text = mainMatch[1];
  } else if (contentMatch) {
    text = contentMatch[1];
  }
  
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = decodeHTMLEntities(text);
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Remove common navigation/footer text patterns
  text = text.replace(/\b(Home|About|Contact|Privacy Policy|Terms of Service|Cookie Policy|Subscribe|Newsletter)\b/gi, '');
  
  return text;
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  return text.replace(/&[^;]+;/g, (entity) => {
    // Handle numeric entities
    if (entity.startsWith('&#')) {
      const code = entity.match(/&#(\d+);/);
      if (code) {
        return String.fromCharCode(parseInt(code[1]));
      }
    }
    return entities[entity] || entity;
  });
}