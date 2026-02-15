import { NextRequest, NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';
import { YoutubeTranscript } from 'youtube-transcript';

export const runtime = 'nodejs';

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
    // Method 1: Use youtubei.js Innertube client (primary method)
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6dc0d248-1774-4273-9dc8-843c894b5700',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'youtube-transcript/route.ts:init',message:'Innertube create start',data:{videoId},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      console.log('[YouTube Transcript] Initializing Innertube client...');
      const youtube = await Innertube.create();

      console.log('[YouTube Transcript] Fetching video info for:', videoId);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6dc0d248-1774-4273-9dc8-843c894b5700',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'youtube-transcript/route.ts:preGetInfo',message:'Before getInfo',data:{videoId},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      const video = await youtube.getInfo(videoId);

      const page = (video as any).page;
      const nextResponse = Array.isArray(page) ? page[1] : undefined;
      const engagementPanels = nextResponse?.engagement_panels;
      const transcriptPanel = Array.isArray(engagementPanels)
        ? engagementPanels.find((p: any) => p?.panel_identifier === 'engagement-panel-searchable-transcript')
        : undefined;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6dc0d248-1774-4273-9dc8-843c894b5700',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'youtube-transcript/route.ts:afterGetInfo',message:'After getInfo',data:{videoId,pageLength:page?.length,hasNextResponse:!!nextResponse,engagementPanelsLength:engagementPanels?.length,hasTranscriptPanel:!!transcriptPanel,titles:engagementPanels?.map((p:any)=>p?.panel_identifier)},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
      // #endregion

      // Get video title from video info
      const videoTitle = video.basic_info?.title || (video as any).video_details?.title || 'YouTube Video';
      console.log('[YouTube Transcript] Video title:', videoTitle);

      // Try to get transcript - handle 400 errors gracefully
      console.log('[YouTube Transcript] Getting transcript...');
      let transcriptData;

      try {
        transcriptData = await video.getTranscript();
      } catch (transcriptError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6dc0d248-1774-4273-9dc8-843c894b5700',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'youtube-transcript/route.ts:getTranscriptCatch',message:'getTranscript threw',data:{errorMessage:transcriptError?.message},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        // If it's a 400 error, the video likely doesn't have transcripts
        if (transcriptError?.message?.includes('400') ||
          transcriptError?.message?.includes('status code 400')) {
          console.log('[YouTube Transcript] Transcript API returned 400 - video may not have captions available');
          transcriptData = null;
        } else {
          // getTranscript failed (e.g. "Transcript panel not found") but we may have caption_tracks from the player response
          const captionTracks = (video as any).captions?.caption_tracks;
          const trackUrl = captionTracks?.[0]?.base_url && (typeof captionTracks[0].base_url === 'string'
            ? captionTracks[0].base_url
            : (captionTracks[0].base_url as any)?.baseUrl);
          if (trackUrl) {
            try {
              const res = await fetch(trackUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0' } });
              const xml = await res.text();
              const RE_XML = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
              const parts: string[] = [];
              for (const m of xml.matchAll(RE_XML)) parts.push(decodeHTMLEntities(m[3]));
              const text = parts.join(' ').replace(/\s+/g, ' ').trim();
              if (text) {
                console.log('[YouTube Transcript] Caption track fallback succeeded');
                return { title: videoTitle, text, videoId, source: 'caption_track' };
              }
            } catch (_) {
              // ignore, fall through to re-throw
            }
          }
          throw transcriptError;
        }
      }

      if (transcriptData && transcriptData.transcript) {
        // Access segments via the correct path: transcript.content.body.initial_segments
        const segments = transcriptData.transcript.content?.body?.initial_segments || [];

        console.log('[YouTube Transcript] Found segments:', segments?.length || 0);

        if (segments && segments.length > 0) {
          // Extract text from segments - each segment has snippet.text
          const transcriptText = segments
            .filter((segment: any) => segment.snippet && segment.snippet.text)
            .map((segment: any) => segment.snippet.text)
            .filter(Boolean)
            .join(' ');

          if (transcriptText && transcriptText.trim().length > 0) {
            console.log(
              '[YouTube Transcript] Innertube succeeded, segments:',
              segments.length,
              'text length:',
              transcriptText.length
            );

            return {
              title: videoTitle,
              text: transcriptText,
              videoId,
              source: 'youtubei.js',
            };
          } else {
            console.log(
              '[YouTube Transcript] Innertube returned empty text after processing segments'
            );
            console.log('[YouTube Transcript] Sample segment structure:', JSON.stringify(segments[0] || {}).substring(0, 200));
          }
        } else {
          console.log(
            '[YouTube Transcript] No segments found. Transcript structure:',
            JSON.stringify({
              hasTranscript: !!transcriptData.transcript,
              hasContent: !!transcriptData.transcript?.content,
              hasBody: !!transcriptData.transcript?.content?.body,
              keys: Object.keys(transcriptData.transcript?.content?.body || {})
            })
          );
        }
      } else {
        console.log('[YouTube Transcript] No transcript data available from Innertube');
      }
    } catch (innertubeError: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6dc0d248-1774-4273-9dc8-843c894b5700',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'youtube-transcript/route.ts:innertubeCatch',message:'Innertube catch',data:{errorMessage:innertubeError?.message,errorName:innertubeError?.name},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      console.error(
        '[YouTube Transcript] Innertube failed:',
        innertubeError?.message || innertubeError
      );
      console.error('[YouTube Transcript] Error stack:', innertubeError?.stack);

      // Don't throw here - let it fall through to fallback methods
      // Only log the error and continue
    }

    // Method 2: Scrape watch page for caption track URL (works when player response captions missing)
    try {
      const scraped = await fetchTranscriptFromWatchPage(videoId);
      if (scraped) {
        console.log('[YouTube Transcript] Watch page scrape fallback succeeded');
        return scraped;
      }
    } catch (scrapeErr: any) {
      console.log('[YouTube Transcript] Watch page scrape failed:', scrapeErr?.message);
    }

    // Method 3: youtube-transcript package (fallback when youtubei.js parser fails)
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      if (segments && segments.length > 0) {
        const transcriptText = segments.map((s: { text: string }) => s.text).join(' ');
        if (transcriptText.trim()) {
          console.log('[YouTube Transcript] youtube-transcript fallback succeeded');
          return {
            title: 'YouTube Video',
            text: transcriptText,
            videoId,
            source: 'youtube-transcript',
          };
        }
      }
    } catch (ytTranscriptError: any) {
      console.log('[YouTube Transcript] youtube-transcript fallback failed:', ytTranscriptError?.message);
    }

    // Method 4: Try using a third-party transcript API (RapidAPI) – optional fallback
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
          console.log('[YouTube Transcript] RapidAPI fallback succeeded');
          return {
            title: data.title || 'YouTube Video',
            text: transcriptText,
            videoId,
            source: 'rapidapi',
          };
        }
      }
    } catch (apiError: any) {
      console.log('[YouTube Transcript] RapidAPI fallback failed:', apiError?.message);
    }

    // If all methods fail, return a helpful error message
    // Don't throw - return null so upstream can handle it gracefully
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6dc0d248-1774-4273-9dc8-843c894b5700',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'youtube-transcript/route.ts:allFailed',message:'All transcript methods failed',data:{videoId},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    console.log('[YouTube Transcript] All transcript methods failed. Video may not have captions available.');
    return null;

  } catch (error: any) {
    console.error('[YouTube Transcript] All methods failed:', error);
    console.error('[YouTube Transcript] Error details:', error.message);
    // Return null instead of throwing to allow better error handling upstream
    return null;
  }
}

/** Extract caption track URL from watch page HTML and fetch + parse transcript. */
async function fetchTranscriptFromWatchPage(videoId: string): Promise<{ title: string; text: string; videoId: string; source: string } | null> {
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0';
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
  });
  const html = await res.text();
  if (html.includes('class="g-recaptcha"')) return null;

  let baseUrl: string | null = null;

  // Strategy 1: Same as youtube-transcript – "captions":{...} then JSON parse up to ,"videoDetails"
  const byCaptions = html.split('"captions":');
  if (byCaptions.length > 1) {
    const block = byCaptions[1].split(',"videoDetails"')[0].split(';"videoDetails"')[0].replace(/\n/g, ' ').trim();
    try {
      const captionsJson = JSON.parse(block);
      const tracklist = captionsJson?.playerCaptionsTracklistRenderer;
      const track = tracklist?.captionTracks?.[0];
      if (track?.baseUrl) baseUrl = track.baseUrl;
    } catch {
      // try alternate boundary (some pages use different key order)
      const altBlock = byCaptions[1].split(',"videoDetails')[0].split('};')[0] + '}';
      try {
        const captionsJson = JSON.parse(altBlock);
        const track = captionsJson?.playerCaptionsTracklistRenderer?.captionTracks?.[0];
        if (track?.baseUrl) baseUrl = track.baseUrl;
      } catch {
        // fall through
      }
    }
  }

  // Strategy 2: Direct timedtext URL in page (escaped or unescaped)
  if (!baseUrl) {
    const directUrl = html.match(/https?:\\?\/\\?\/www\.youtube\.com\\?\/api\\?\/timedtext\?[^"']+/);
    if (directUrl?.[0]) {
      baseUrl = directUrl[0].replace(/\\\//g, '/').replace(/\\u0026/g, '&');
    }
  }
  if (!baseUrl) {
    const simpleMatch = html.match(/"baseUrl"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (simpleMatch) {
      baseUrl = simpleMatch[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
    }
  }

  if (!baseUrl) return null;

  const sep = baseUrl.includes('?') ? '&' : '?';
  // Try json3 first (structured, often more reliable)
  let trackRes = await fetch(baseUrl + sep + 'fmt=json3', { headers: { 'User-Agent': USER_AGENT } });
  let body = trackRes.ok ? await trackRes.text() : '';
  let text = '';

  if (trackRes.ok && body.trim().startsWith('{')) {
    try {
      const json = JSON.parse(body);
      const events = json?.events || [];
      const parts: string[] = [];
      for (const e of events) {
        for (const s of e?.segs || []) {
          if (s?.utf8) parts.push(s.utf8);
        }
      }
      text = parts.join(' ').replace(/\s+/g, ' ').trim();
    } catch {
      // ignore
    }
  }

  if (!text) {
    trackRes = await fetch(baseUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!trackRes.ok) return null;
    body = await trackRes.text();
    const RE_XML = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
    const xmlParts: string[] = [];
    for (const m of body.matchAll(RE_XML)) xmlParts.push(decodeHTMLEntities(m[3]));
    text = xmlParts.join(' ').replace(/\s+/g, ' ').trim();
  }

  if (!text) return null;
  return { title: 'YouTube Video', text, videoId, source: 'watch_page' };
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