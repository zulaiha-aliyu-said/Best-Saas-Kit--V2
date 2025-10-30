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

    // Extract video ID from various YouTube URL formats
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Fetch video metadata using YouTube Data API v3 (if available)
    let videoMetadata = null;
    if (process.env.YOUTUBE_API_KEY) {
      try {
        videoMetadata = await fetchYouTubeMetadata(videoId);
        console.log('YouTube metadata fetched successfully');
      } catch (error: any) {
        console.log('YouTube Data API failed:', error.message);
        // Continue without metadata
      }
    }

    // Fetch transcript using YouTube's API or third-party service
    let transcript = null;
    try {
      transcript = await fetchYouTubeTranscript(videoId);
      console.log('Transcript fetched:', transcript ? 'success' : 'failed');
    } catch (transcriptError: any) {
      console.error('Transcript fetch error:', transcriptError.message);
      return NextResponse.json(
        { error: `Could not fetch transcript: ${transcriptError.message}` },
        { status: 404 }
      );
    }

    if (!transcript) {
      return NextResponse.json(
        { error: 'Could not fetch transcript. The video may not have captions available.' },
        { status: 404 }
      );
    }

    // Merge metadata with transcript
    const response = {
      success: true,
      transcript: {
        ...transcript,
        title: videoMetadata?.title || transcript.title || 'YouTube Video',
      },
      videoId,
      title: videoMetadata?.title || transcript.title || 'YouTube Video',
      description: videoMetadata?.description || '',
      channelTitle: videoMetadata?.channelTitle || '',
      publishedAt: videoMetadata?.publishedAt || '',
      viewCount: videoMetadata?.viewCount || '',
      likeCount: videoMetadata?.likeCount || '',
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('YouTube transcript error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch YouTube transcript',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

async function fetchYouTubeMetadata(videoId: string): Promise<any> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`YouTube API request failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }

  const video = data.items[0];
  
  return {
    title: video.snippet.title,
    description: video.snippet.description,
    channelTitle: video.snippet.channelTitle,
    publishedAt: video.snippet.publishedAt,
    viewCount: video.statistics.viewCount,
    likeCount: video.statistics.likeCount,
    thumbnails: video.snippet.thumbnails,
  };
}

async function fetchYouTubeTranscript(videoId: string): Promise<any> {
  try {
    // Method 1: Try using a third-party transcript API
    try {
      const apiResponse = await fetch(`https://youtube-transcript-api.p.rapidapi.com/transcript?video_id=${videoId}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        },
      });

      if (apiResponse.ok && process.env.RAPIDAPI_KEY) {
        const data = await apiResponse.json();
        if (data.transcript && data.transcript.length > 0) {
          const transcriptText = data.transcript.map((item: any) => item.text).join(' ');
          return {
            title: data.title || 'YouTube Video',
            text: transcriptText,
            videoId,
          };
        }
      }
    } catch (apiError) {
      console.log('Third-party API failed, trying direct method...');
    }

    // Method 2: Direct extraction from YouTube page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch video page');
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title>(.+?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'YouTube Video';

    // More robust caption track extraction
    // Look for the captionTracks array in the page
    let captionUrl: string | null = null;

    // Method 1: Try to find captionTracks directly
    const captionTracksPattern = /"captionTracks":\s*\[([^\]]+)\]/;
    const captionTracksMatch = html.match(captionTracksPattern);

    if (captionTracksMatch) {
      try {
        // Extract the baseUrl from the first caption track
        const baseUrlMatch = captionTracksMatch[0].match(/"baseUrl":\s*"([^"]+)"/);
        if (baseUrlMatch) {
          captionUrl = baseUrlMatch[1].replace(/\\u0026/g, '&');
        }
      } catch (e) {
        console.error('Error parsing caption tracks:', e);
      }
    }

    // Method 2: Try alternative pattern
    if (!captionUrl) {
      const altPattern = /"captionTracks":\[{"baseUrl":"([^"]+)"/;
      const altMatch = html.match(altPattern);
      if (altMatch) {
        captionUrl = altMatch[1].replace(/\\u0026/g, '&');
      }
    }

    if (!captionUrl) {
      throw new Error('No captions available for this video. The video may not have subtitles/captions enabled.');
    }

    // Fetch the actual transcript
    const transcriptResponse = await fetch(captionUrl);
    
    if (!transcriptResponse.ok) {
      throw new Error('Failed to fetch transcript data');
    }

    const transcriptXml = await transcriptResponse.text();

    // Parse XML and extract text - handle multiple formats
    const transcriptParts: string[] = [];
    
    // Method 1: Standard text tags with content
    const textMatches = transcriptXml.matchAll(/<text[^>]*>([^<]+)<\/text>/g);
    for (const match of textMatches) {
      const text = decodeHTMLEntities(match[1].trim());
      if (text) {
        transcriptParts.push(text);
      }
    }

    // Method 2: Handle CDATA sections
    if (transcriptParts.length === 0) {
      const cdataMatches = transcriptXml.matchAll(/<text[^>]*><!\[CDATA\[([^\]]+)\]\]><\/text>/g);
      for (const match of cdataMatches) {
        const text = decodeHTMLEntities(match[1].trim());
        if (text) {
          transcriptParts.push(text);
        }
      }
    }

    // Method 3: Try to extract any text between tags
    if (transcriptParts.length === 0) {
      const allTextMatches = transcriptXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);
      for (const match of allTextMatches) {
        const text = decodeHTMLEntities(match[1].trim());
        if (text) {
          transcriptParts.push(text);
        }
      }
    }

    if (transcriptParts.length === 0) {
      // Log the full XML for debugging
      console.log('Full Transcript XML:', transcriptXml);
      console.log('Caption URL used:', captionUrl);
      
      // Return a helpful error with XML sample
      const xmlSample = transcriptXml.substring(0, 300);
      throw new Error(`No transcript text found. XML format may be unsupported. Sample: ${xmlSample}`);
    }

    const transcriptText = transcriptParts.join(' ');

    return {
      title,
      text: transcriptText,
      videoId,
    };

  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    console.error('Error details:', error.message);
    // Return null instead of throwing to allow better error handling upstream
    return null;
  }
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
    // Handle numeric entities (&#123; or &#xAB;)
    if (entity.startsWith('&#x')) {
      const code = entity.match(/&#x([0-9A-Fa-f]+);/);
      if (code) {
        return String.fromCharCode(parseInt(code[1], 16));
      }
    } else if (entity.startsWith('&#')) {
      const code = entity.match(/&#(\d+);/);
      if (code) {
        return String.fromCharCode(parseInt(code[1]));
      }
    }
    return entities[entity] || entity;
  });
}