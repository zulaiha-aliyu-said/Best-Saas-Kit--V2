"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Repeat2, Download, Sparkles, Calendar as CalendarIcon, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ScheduleModal } from "@/components/schedule/schedule-modal";
import { PredictivePerformanceModal } from "@/components/ai/predictive-performance-modal";
import { StyleIndicator } from "@/components/style/style-indicator";

// Types for the API response
type ThreadItem = string | { id?: number; text: string };
interface GeneratedOutput {
  x_thread?: ThreadItem[];
  linkedin_post?: string;
  instagram_caption?: string;
  email_newsletter?: { subject?: string; body?: string };
  facebook_post?: string;
  reddit_post?: string;
  pinterest_description?: string;
  _fallback_note?: string;
}

import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { CompetitorIntegrationWidget } from "@/components/competitor/CompetitorIntegrationWidget";
import { REPURPOSE_TEMPLATES } from "@/data/templates";

const REPURPOSE_PLATFORM_KEYS = ["x", "linkedin", "instagram", "email", "facebook", "reddit", "pinterest"] as const;

const TEMPLATE_ID_ALIASES: Record<string, string> = {
  "blog-social": "blog-to-social",
  "video-posts": "youtube-to-thread",
  "podcast-thread": "youtube-to-thread",
  "article-newsletter": "article-to-newsletter",
};

export default function RepurposePage() {
  const [tab, setTab] = useState<"text"|"url"|"youtube"|"file">("text");
  const search = useSearchParams();
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(false);
  const [includeCTA, setIncludeCTA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<GeneratedOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditError, setCreditError] = useState<{remaining: number; required: number} | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleContent, setScheduleContent] = useState("");
  const [schedulePlatform, setSchedulePlatform] = useState<string>("all");
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [performanceContent, setPerformanceContent] = useState("");
  const [performancePlatform, setPerformancePlatform] = useState<string>("x");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadedTemplate, setLoadedTemplate] = useState<string | null>(null);
  const [urlContent, setUrlContent] = useState<string>("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [showYouTubeHelp, setShowYouTubeHelp] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeContent, setYoutubeContent] = useState<string>("");
  const [youtubeMetadata, setYoutubeMetadata] = useState<{title?: string; description?: string; channelTitle?: string} | null>(null);

  const tweets = useMemo(() => {
    if (!output?.x_thread) return [] as string[];
    return output.x_thread.map((t) => typeof t === 'string' ? t : t?.text || "");
  }, [output]);

  const copy = async (text: string) => {
    toast.success('Copied to clipboard');
    await navigator.clipboard.writeText(text);
  };

  const handleSchedule = (content: string, platform: string) => {
    setScheduleContent(content);
    setSchedulePlatform(platform);
    setScheduleModalOpen(true);
  };

  const handlePerformancePrediction = (content: string, platform: string) => {
    setPerformanceContent(content);
    setPerformancePlatform(platform);
    setPerformanceModalOpen(true);
  };

  // Parse content to extract title, body, and CTA
  const parseContent = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // First line is often the title/hook
    const title = lines[0] || '';
    
    // Find CTA patterns
    const ctaPatterns = [
      /visit our/i,
      /learn more/i,
      /get started/i,
      /read more/i,
      /click here/i,
      /sign up/i,
      /try it/i,
      /check out/i,
      /discover/i,
      /explore/i
    ];
    
    let ctaIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (ctaPatterns.some(pattern => pattern.test(lines[i]))) {
        ctaIndex = i;
        break;
      }
    }
    
    const cta = ctaIndex >= 0 ? lines.slice(ctaIndex).join(' ') : '';
    const bodyLines = ctaIndex >= 0 ? lines.slice(1, ctaIndex) : lines.slice(1);
    const body = bodyLines.join('\n\n');
    
    return { title, body, cta };
  };

  const handleUrlFetch = async (url: string) => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setUrlLoading(true);
    setError(null);
    setUrlContent('');

    // Check if it's a YouTube URL
    const isYouTube = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/.test(url);

    try {

      if (isYouTube) {
        // Fetch YouTube transcript
        const response = await fetch('/api/youtube-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch YouTube transcript');
        }

        const data = await response.json();
        setUrlContent(data.transcript.text);
        setShowYouTubeHelp(false);
        toast.success(`YouTube transcript extracted: ${data.transcript.title}`);
      } else {
        // Fetch regular web page content
        const response = await fetch('/api/extract-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch URL content');
        }

        const data = await response.json();
        setUrlContent(data.text);
        toast.success('Content extracted successfully');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch content from URL';
      setError(errorMessage);
      
      // If it's a YouTube error, show help UI and a clear toast
      if (isYouTube) {
        setShowYouTubeHelp(true);
        const isFriendly = /use the steps below|manual method|try again/i.test(errorMessage);
        toast.error(isFriendly ? 'Couldn\'t get transcript — use the steps below' : 'Could not extract YouTube transcript automatically');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUrlLoading(false);
    }
  };

  const handleYoutubeFetch = async (url: string) => {
    if (!url.trim()) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    // Validate YouTube URL
    const isYouTube = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/.test(url);
    if (!isYouTube) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setYoutubeLoading(true);
    setError(null);
    setYoutubeContent('');
    setYoutubeMetadata(null);

    try {
      // Fetch YouTube transcript and metadata
      const response = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        let errorData: { error?: string; title?: string } = {};
        try {
          errorData = await response.json();
        } catch {
          // non-JSON or empty body
        }
        const friendlyMessage =
          errorData?.error ||
          (response.status === 404
            ? "We couldn't extract the transcript for this video. It may not have captions, or you can paste it yourself using the steps below."
            : response.status === 408
              ? 'Transcript request took too long. Please try again or use the manual method below.'
              : response.statusText || 'Failed to fetch YouTube content');
        const isExpectedFailure = (response.status === 404 || response.status === 408) && /transcript|steps below|manual method|try again/i.test(friendlyMessage);
        if (isExpectedFailure) {
          console.log('YouTube transcript not available:', errorData?.title ? `"${errorData.title}"` : response.status, friendlyMessage.slice(0, 60) + '…');
        } else {
          console.error('YouTube API error:', errorData?.error || errorData || response.statusText);
        }
        throw new Error(friendlyMessage);
      }

      const data = await response.json();
      console.log('YouTube data received:', data);
      
      if (!data.transcript || !data.transcript.text) {
        throw new Error('No transcript data received from API');
      }
      
      setYoutubeContent(data.transcript.text);
      setYoutubeMetadata({
        title: data.transcript.title || data.title,
        description: data.description,
        channelTitle: data.channelTitle,
      });
      toast.success(`YouTube content extracted: ${data.transcript.title || 'Video'}`);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch YouTube content';
      const isFriendly = /use the steps below|manual method|try again|couldn't extract the transcript/i.test(errorMessage);
      if (!isFriendly) console.error('YouTube fetch error:', errorMessage, err);
      setError(errorMessage);
      setShowYouTubeHelp(true);
      toast.error(isFriendly ? 'Couldn\'t get transcript — use the steps below' : `Could not extract YouTube content: ${errorMessage}`);
    } finally {
      setYoutubeLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setUploadProgress(0);
    setError(null);

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Check file type
    const validTypes = [
      'text/plain',
      'text/markdown',
      'text/html'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(txt|md|html)$/i)) {
      setError('Please upload a valid file type (TXT, MD, HTML). PDF and DOCX support coming soon!');
      return;
    }

    try {
      setUploadProgress(30);
      
      // For text files, read directly
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        setFileContent(text);
        setUploadProgress(100);
        toast.success(`File "${file.name}" uploaded successfully`);
        return;
      }

      // For other file types, use FormData to send to API for processing
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(50);
      
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      const data = await response.json();
      setFileContent(data.text || '');
      setUploadProgress(100);
      toast.success(`File "${file.name}" uploaded and processed successfully`);
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
      setUploadedFile(null);
      setFileContent('');
      toast.error('Failed to process file');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const prefill = search.get('prefill');
        const platformsParam = search.get('platforms') || '';
        const tone = search.get('tone');
        const hashtags = search.get('hashtags');
        const emojis = search.get('emojis');
        const cta = search.get('cta');
        const rawTemplateId = search.get('template') || search.get('templateId');
        const templateId = rawTemplateId ? (TEMPLATE_ID_ALIASES[rawTemplateId] || rawTemplateId) : null;

        let platforms = platformsParam.split(',').filter(Boolean);

        if (templateId) {
          const template = REPURPOSE_TEMPLATES.find((t) => t.id === templateId);
          if (template) {
            setLoadedTemplate(templateId);
            const allowed = REPURPOSE_PLATFORM_KEYS.filter((p) =>
              (template.supportedPlatforms as string[]).includes(p)
            );
            platforms = allowed.length ? allowed : platforms;
            setIncludeHashtags(template.includeHashtags);
            setIncludeEmojis(template.includeEmojis);
            setIncludeCTA(template.includeCTA);
            if (template.recommendedTone) {
              const toneToApply = template.recommendedTone;
              document.querySelectorAll('[data-tone]').forEach((el) => {
                const button = el as HTMLElement;
                button.dataset.selected = button.dataset.tone === toneToApply ? 'true' : 'false';
              });
            }
            // YouTube → Thread: switch to YouTube tab and default to Twitter/X for thread output
            if (templateId === 'youtube-to-thread') {
              setTab('youtube');
              platforms = ['x'];
            }
            toast.success(`"${template.name}" applied. Customize and paste your content.`);
          } else {
            toast.error('Template not found. Please choose a template from the list.');
          }
        }

        if (prefill) {
          const textarea = document.getElementById('rp-input') as HTMLTextAreaElement | null;
          if (textarea) textarea.value = prefill;
        }

        if (platforms.length) {
          const container = document.getElementById('rp-platforms');
          container?.querySelectorAll('button[data-key]')?.forEach((btn) => {
            const b = btn as HTMLButtonElement;
            b.dataset.active = platforms.includes(String(b.dataset.key)) ? 'true' : 'false';
          });
        }

        if (tone && !templateId) {
          document.querySelectorAll('[data-tone]').forEach((el) => {
            const button = el as HTMLElement;
            button.dataset.selected = button.dataset.tone === tone ? 'true' : 'false';
          });
        }

        if (!templateId) {
          if (hashtags !== null && hashtags !== undefined) setIncludeHashtags(hashtags === 'true');
          if (emojis !== null && emojis !== undefined) setIncludeEmojis(emojis === 'true');
          if (cta !== null && cta !== undefined) setIncludeCTA(cta === 'true');
        }
      } catch (err) {
        console.error('Repurpose URL/template apply error:', err);
        toast.error('Could not apply settings from URL. Please set options manually.');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="text-center space-y-6 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-sm text-primary font-semibold">AI-Powered Content Transformation</p>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Turn One Piece of Content Into Many</h1>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto">Paste your blog, article, or YouTube transcript and watch our AI transform it into platform-specific social media posts</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-4 md:gap-8 pt-4">
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">1. Paste Content</p>
              <p className="text-xs text-muted-foreground">Add your blog, article, or YouTube URL</p>
            </div>
          </div>

          <svg className="w-6 h-6 text-muted-foreground/30 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <div className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
            <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">2. Choose Settings</p>
              <p className="text-xs text-muted-foreground">Select platform, tone, and style</p>
            </div>
          </div>

          <svg className="w-6 h-6 text-muted-foreground/30 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <div className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
            <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">3. Get Results</p>
              <p className="text-xs text-muted-foreground">Copy, export, or regenerate content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Loaded Banner */}
      {loadedTemplate && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Template Applied</p>
                <p className="text-xs text-muted-foreground">
                  Settings have been pre-configured. Customize them below as needed.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/templates">Browse Templates</Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLoadedTemplate(null)}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Style Indicator */}
      <StyleIndicator />

      {/* Competitor Insights Widget */}
      <CompetitorIntegrationWidget />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card className="card-soft-shadow border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg">Input Your Content</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/40 rounded-xl">
              <Button 
                variant={tab==="text"?"default":"ghost"} 
                onClick={()=>setTab("text")}
                className={tab==="text" ? "bg-white shadow-sm" : ""}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Text/Article
              </Button>
              <Button 
                variant={tab==="url"?"default":"ghost"} 
                onClick={()=>setTab("url")}
                className={tab==="url" ? "bg-white shadow-sm" : ""}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                URL/Link
              </Button>
              <Button 
                variant={tab==="youtube"?"default":"ghost"} 
                onClick={()=>setTab("youtube")}
                className={tab==="youtube" ? "bg-white shadow-sm" : ""}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </Button>
              <Button 
                variant={tab==="file"?"default":"ghost"} 
                onClick={()=>setTab("file")}
                className={tab==="file" ? "bg-white shadow-sm" : ""}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload File
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Paste your content here</Label>
              {tab === "text" && (
                <Textarea 
                  id="rp-input" 
                  rows={10} 
                  placeholder="Paste your blog post, article, transcript, or any long-form content here. The AI will analyze and transform it into engaging social media posts."
                  className="resize-none border-border/50 focus:border-primary"
                />
              )}
              {tab === "url" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      id="rp-url" 
                      placeholder="https://youtube.com/watch?v=... or https://example.com/article" 
                      className="h-12 flex-1" 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget as HTMLInputElement;
                          handleUrlFetch(input.value);
                        }
                      }}
                    />
                    <Button 
                      onClick={() => {
                        const input = document.getElementById('rp-url') as HTMLInputElement;
                        if (input) handleUrlFetch(input.value);
                      }}
                      disabled={urlLoading}
                      className="h-12 px-6"
                    >
                      {urlLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Fetching...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Fetch
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {urlContent && (
                    <div className="rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-green-800">Content extracted successfully</p>
                      </div>
                      <p className="text-xs text-green-700">{urlContent.length} characters extracted</p>
                    </div>
                  )}

                  {/* YouTube Manual Workaround Help */}
                  {showYouTubeHelp && (
                    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="font-bold text-lg text-orange-900 mb-1">YouTube Transcript - Manual Method</h3>
                              <p className="text-sm text-orange-800">Automatic extraction failed. Follow these simple steps to get the transcript:</p>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-foreground mb-1">Open the YouTube video</p>
                                  <p className="text-xs text-muted-foreground">Go to the video page in your browser</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-foreground mb-1">Click the "..." (More) button</p>
                                  <p className="text-xs text-muted-foreground">Located below the video, next to Share and Save</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-foreground mb-1">Select "Show transcript"</p>
                                  <p className="text-xs text-muted-foreground">A panel will open with the full video transcript</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-foreground mb-1">Copy the transcript text</p>
                                  <p className="text-xs text-muted-foreground">Select all text and copy it</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">5</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-foreground mb-1">Paste in the "Text/Article" tab</p>
                                  <p className="text-xs text-muted-foreground">Switch to the Text tab above and paste the transcript</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => {
                                  setTab('text');
                                  setShowYouTubeHelp(false);
                                  toast.success('Switched to Text tab - paste your transcript here');
                                }}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                Switch to Text Tab
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowYouTubeHelp(false)}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-blue-800">
                      <p className="font-semibold mb-1">Supports:</p>
                      <ul className="space-y-0.5 list-disc list-inside">
                        <li>YouTube videos (transcript extraction)</li>
                        <li>Blog posts and articles</li>
                        <li>Any public web page with text content</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {tab === "youtube" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      id="rp-youtube" 
                      placeholder="https://youtube.com/watch?v=... or https://youtu.be/..." 
                      className="h-12 flex-1" 
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleYoutubeFetch(youtubeUrl);
                        }
                      }}
                    />
                    <Button 
                      onClick={() => handleYoutubeFetch(youtubeUrl)}
                      disabled={youtubeLoading}
                      className="h-12 px-6"
                    >
                      {youtubeLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Fetching...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Extract
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {youtubeContent && youtubeMetadata && (
                    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-semibold text-red-900">Video content extracted successfully</p>
                          </div>
                          <h3 className="font-bold text-base text-red-900 mb-1">{youtubeMetadata.title}</h3>
                          {youtubeMetadata.channelTitle && (
                            <p className="text-xs text-red-700 mb-2">Channel: {youtubeMetadata.channelTitle}</p>
                          )}
                          <p className="text-xs text-red-700">{youtubeContent.length} characters • Transcript ready for repurposing</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* YouTube Help Section */}
                  {showYouTubeHelp && (
                    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="font-bold text-lg text-orange-900 mb-1">YouTube Transcript - Manual Method</h3>
                              <p className="text-sm text-orange-800">Automatic extraction failed. Follow these simple steps to get the transcript:</p>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-foreground mb-1">Open the YouTube video</p>
                                  <p className="text-xs text-muted-foreground">Go to the video page in your browser</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-foreground mb-1">Click the "..." (More) button</p>
                                  <p className="text-xs text-muted-foreground">Located below the video, next to Share and Save</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-foreground mb-1">Select "Show transcript"</p>
                                  <p className="text-xs text-muted-foreground">A panel will open with the full video transcript</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-foreground mb-1">Copy the transcript text</p>
                                  <p className="text-xs text-muted-foreground">Select all text and copy it</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">5</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-foreground mb-1">Paste in the "Text/Article" tab</p>
                                  <p className="text-xs text-muted-foreground">Switch to the Text tab above and paste the transcript</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => {
                                  setTab('text');
                                  setShowYouTubeHelp(false);
                                  toast.success('Switched to Text tab - paste your transcript here');
                                }}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                Switch to Text Tab
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowYouTubeHelp(false)}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <div className="text-xs text-red-800">
                      <p className="font-semibold mb-1">YouTube Video Repurposing:</p>
                      <ul className="space-y-0.5 list-disc list-inside">
                        <li>Paste any YouTube video URL</li>
                        <li>Automatic transcript extraction</li>
                        <li>Works with videos that have captions/subtitles</li>
                        <li>Perfect for turning video content into social posts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {tab === "file" && (
                <div className="space-y-3">
                  <div 
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-all cursor-pointer bg-secondary/20"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileUpload(file);
                    }}
                    onClick={() => document.getElementById('rp-file')?.click()}
                  >
                    {!uploadedFile ? (
                      <>
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="font-semibold text-base mb-2">Drop your file here or click to browse</p>
                        <p className="text-sm text-muted-foreground mb-3">Supports: TXT, MD, HTML (Max 10MB)</p>
                        <Button type="button" variant="outline" size="sm">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Choose File
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="font-semibold text-base mb-1">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground mb-3">{(uploadedFile.size / 1024).toFixed(2)} KB • {fileContent.length} characters extracted</p>
                        {uploadProgress < 100 && (
                          <div className="w-full max-w-xs mx-auto mb-3">
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 justify-center">
                          <Button type="button" variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                            setFileContent('');
                            setUploadProgress(0);
                          }}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('rp-file')?.click();
                          }}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Upload Different File
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  <input 
                    id="rp-file" 
                    type="file" 
                    className="hidden" 
                    accept=".txt,.md,.html"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  {fileContent && (
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-semibold">Extracted Content Preview</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => copy(fileContent)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-wrap p-2 rounded bg-white border border-border">
                        {fileContent.slice(0, 500)}...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {tab === 'file' && fileContent ? `${fileContent.length} characters` : 
               tab === 'youtube' && youtubeContent ? `${youtubeContent.length} characters` :
               tab === 'url' && urlContent ? `${urlContent.length} characters` : '0 characters'}
            </p>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card className="card-soft-shadow border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg">Choose Settings</CardTitle>
                <CardDescription>Select platform, tone, and style</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform multi-select */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Target Platform</Label>
              <div className="grid grid-cols-2 gap-3" id="rp-platforms">
                {[
                  { key: 'x', label: 'Twitter/X', subtitle: 'Threads & single tweets', icon: 'M' },
                  { key: 'linkedin', label: 'LinkedIn', subtitle: 'Professional posts', icon: 'in' },
                  { key: 'instagram', label: 'Instagram', subtitle: 'Captions & stories', icon: 'IG' },
                  { key: 'email', label: 'Email Newsletter', subtitle: 'Newsletter format', icon: '✉' },
                  { key: 'facebook', label: 'Facebook', subtitle: 'Posts & updates', icon: 'f' },
                  { key: 'reddit', label: 'Reddit', subtitle: 'Posts & comments', icon: 'r' },
                  { key: 'pinterest', label: 'Pinterest', subtitle: 'Pins & descriptions', icon: 'P' },
                ].map(p => (
                  <button
                    key={p.key}
                    type="button"
                    data-key={p.key}
                    className="p-3 text-left rounded-xl border-2 bg-white hover:border-primary/40 transition-all data-[active=true]:border-primary data-[active=true]:bg-primary/5 data-[active=true]:ring-2 data-[active=true]:ring-primary/20"
                    onClick={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.dataset.active = el.dataset.active === 'true' ? 'false' : 'true';
                    }}
                    data-active="true"
                  >
                    <div className="flex items-start gap-2">
                      <div className="text-lg">{p.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{p.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.subtitle}</div>
                      </div>
                      <div className="data-[active=true]:block hidden w-4 h-4 rounded-full bg-primary flex-shrink-0" data-active={p.key === 'x' ? 'true' : 'false'}>
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Content Tone</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'professional', label: 'Professional', subtitle: 'Business-focused, formal', emoji: '💼' },
                  { value: 'funny', label: 'Funny', subtitle: 'Humorous, entertaining', emoji: '😄' },
                  { value: 'motivational', label: 'Motivational', subtitle: 'Inspiring, uplifting', emoji: '✨' },
                  { value: 'casual', label: 'Casual', subtitle: 'Friendly, conversational', emoji: '💬' },
                ].map(t => (
                  <button
                    key={t.value}
                    type="button"
                    data-tone={t.value}
                    className="p-3 text-left rounded-xl border-2 bg-white hover:border-primary/40 transition-all data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                    onClick={(e) => {
                      document.querySelectorAll('[data-tone]').forEach(el => (el as HTMLElement).dataset.selected = 'false');
                      e.currentTarget.dataset.selected = 'true';
                    }}
                    data-selected={t.value === 'professional' ? 'true' : 'false'}
                  >
                    <div className="flex items-start gap-2">
                      <div className="text-lg">{t.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{t.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{t.subtitle}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Advanced options */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Advanced Options</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <Label htmlFor="num" className="text-sm font-medium">Number of Posts</Label>
                    <p className="text-xs text-muted-foreground">Thread length</p>
                  </div>
                  <Select defaultValue="3">
                    <SelectTrigger id="rp-num" className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Post</SelectItem>
                      <SelectItem value="3">3 Posts</SelectItem>
                      <SelectItem value="5">5 Posts</SelectItem>
                      <SelectItem value="8">8 Posts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <Label htmlFor="length" className="text-sm font-medium">Content Length</Label>
                    <p className="text-xs text-muted-foreground">Detail level per post</p>
                  </div>
                  <Select defaultValue="medium">
                    <SelectTrigger id="rp-length" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <Label htmlFor="hashtags" className="text-sm font-medium">Include hashtags</Label>
                  </div>
                  <Switch id="hashtags" checked={includeHashtags} onCheckedChange={setIncludeHashtags} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <Label htmlFor="emojis" className="text-sm font-medium">Include emojis</Label>
                  </div>
                  <Switch id="emojis" checked={includeEmojis} onCheckedChange={setIncludeEmojis} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <Label htmlFor="cta" className="text-sm font-medium">Include call-to-action</Label>
                  </div>
                  <Switch id="cta" checked={includeCTA} onCheckedChange={setIncludeCTA} />
                </div>
              </div>
            </div>

            <Button
              disabled={loading}
              className="w-full h-14 text-base font-semibold repurpose-gradient hover:opacity-90 disabled:opacity-70 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const textArea = document.getElementById('rp-input') as HTMLTextAreaElement | null;
                  const urlInput = document.getElementById('rp-url') as HTMLInputElement | null;
                  let text = '';
                  let url = '';
                  
                  // Get content based on active tab
                  if (tab === 'text') {
                    text = textArea?.value || '';
                  } else if (tab === 'file') {
                    text = fileContent;
                  } else if (tab === 'youtube') {
                    text = youtubeContent;
                    url = youtubeUrl;
                  } else if (tab === 'url') {
                    text = urlContent;
                    url = urlInput?.value || '';
                  }

                  // Validate input
                  if (tab === 'text' && !text) {
                    setError('Please enter some content');
                    setLoading(false);
                    return;
                  }
                  if (tab === 'url' && !url) {
                    setError('Please enter a URL');
                    setLoading(false);
                    return;
                  }
                  // URL tab with YouTube: require Fetch first (backend doesn't use transcript API for url source)
                  const urlIsYouTube = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/.test(url || '');
                  if (tab === 'url' && urlIsYouTube && !urlContent) {
                    setError('Please click "Fetch" to extract the YouTube transcript first, or use the YouTube tab.');
                    setLoading(false);
                    return;
                  }
                  if (tab === 'youtube' && !youtubeContent) {
                    setError('Please fetch YouTube content first');
                    setLoading(false);
                    return;
                  }
                  if (tab === 'file' && !fileContent) {
                    setError('Please upload a file first');
                    setLoading(false);
                    return;
                  }

                  // Collect selected platforms
                  const container = document.getElementById('rp-platforms');
                  const platforms: string[] = [];
                  container?.querySelectorAll('button[data-key]')?.forEach((btn) => {
                    const b = btn as HTMLButtonElement;
                    if (b.dataset.active === 'true') platforms.push(String(b.dataset.key));
                  });
                  
                  if (platforms.length === 0) {
                    setError('Please select at least one platform');
                    setLoading(false);
                    return;
                  }

                  const numSelect = document.getElementById('rp-num') as HTMLButtonElement | null;
                  const numPosts = Number(numSelect?.dataset.state ? numSelect.textContent : (document.querySelector('[aria-labelledby="rp-num"]') as HTMLElement)?.innerText) || 3;
                  
                  // Get content length setting
                  const lengthSelect = document.getElementById('rp-length') as HTMLButtonElement | null;
                  const contentLength = lengthSelect?.dataset.state ? lengthSelect.textContent?.toLowerCase() : (document.querySelector('[aria-labelledby="rp-length"]') as HTMLElement)?.innerText?.toLowerCase() || 'medium';
                  
                  // Get selected tone
                  const selectedToneEl = document.querySelector('[data-tone][data-selected="true"]') as HTMLElement;
                  const selectedTone = selectedToneEl?.dataset.tone || 'professional';
                  
                  const res = await fetch('/api/repurpose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      sourceType: tab, 
                      text, 
                      url, 
                      platforms, 
                      numPosts, 
                      tone: selectedTone,
                      contentLength,
                      options: {
                        includeHashtags,
                        includeEmojis,
                        includeCTA
                      }
                    })
                  });
                  let data;
                  try {
                    const responseText = await res.text();
                    try {
                      data = JSON.parse(responseText);
                    } catch (parseError) {
                      console.error('❌ Failed to parse JSON response:', parseError);
                      console.error('  Response text:', responseText);
                      setError('Invalid response from server. Please try again.');
                      setCreditError(null);
                      setOutput(null);
                      setLoading(false);
                      return;
                    }
                  } catch (readError) {
                    console.error('❌ Failed to read response:', readError);
                    setError('Failed to read server response. Please try again.');
                    setCreditError(null);
                    setOutput(null);
                    setLoading(false);
                    return;
                  }
                  
                  console.log('📥 FRONTEND: Received data from API');
                  console.log('  Response status:', res.status);
                  console.log('  Response ok:', res.ok);
                  console.log('  Full response:', data);
                  console.log('  Has output:', !!data.output);
                  console.log('  Has error:', !!data.error);
                  console.log('  Has code:', data.code);
                  console.log('  output.x_thread:', data.output?.x_thread);
                  if (data.output?.x_thread && Array.isArray(data.output.x_thread)) {
                    console.log('  First tweet:', data.output.x_thread[0]);
                    console.log('  First tweet substring:', data.output.x_thread[0]?.substring?.(0, 100));
                  }
                  
                  if (!res.ok) {
                    console.log('❌ Response not OK, status:', res.status);
                    if (res.status === 402 && data.code === 'INSUFFICIENT_CREDITS') {
                      console.log('💰 Credit error detected:', { remaining: data.remaining, required: data.required });
                      setCreditError({
                        remaining: data.remaining || 0,
                        required: data.required || 0
                      });
                      setError(null);
                      toast.error('Insufficient credits. Please add more or select fewer platforms.');
                    } else {
                      const errMsg = data.error || `Server error (${res.status}). Please try again.`;
                      setError(errMsg);
                      setCreditError(null);
                      toast.error(errMsg, { duration: 5000 });
                    }
                    setOutput(null);
                  } else if (data.output) {
                    // Success - set output (check for output field)
                    console.log('✅ Success - setting output');
                    setOutput(data.output as GeneratedOutput);
                    setError(null);
                    setCreditError(null);
                  } else if (data.error) {
                    console.log('⚠️ Response OK but has error field:', data.error);
                    const errMsg = data.error || 'Failed to generate';
                    setError(errMsg);
                    setCreditError(null);
                    setOutput(null);
                    toast.error(errMsg, { duration: 5000 });
                  } else {
                    console.error('❌ Unexpected API response structure:', data);
                    const errMsg = 'Unexpected response from server. Please try again.';
                    setError(errMsg);
                    setCreditError(null);
                    setOutput(null);
                    toast.error(errMsg, { duration: 5000 });
                  }
                } catch (e: any) {
                  console.error('❌ Exception caught:', e);
                  console.error('  Error message:', e.message);
                  console.error('  Error stack:', e.stack);
                  const message = e?.message || 'Failed to generate';
                  setError(message);
                  setCreditError(null);
                  setOutput(null);
                  toast.error(message, { duration: 5000 });
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" /> Repurpose Now 💡
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">AI will analyze your content and create optimized posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Pro Tips Section */}
      <div className="repurpose-gradient rounded-3xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Pro Tips for Better Repurposing</h2>
            <p className="text-white/90 text-sm">Maximize the impact of your repurposed content</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Know Your Audience</h3>
            <p className="text-sm text-white/80 leading-relaxed">Different platforms have different audiences. Tailor your tone and style accordingly.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Timing Matters</h3>
            <p className="text-sm text-white/80 leading-relaxed">Post when your audience is most active. Use our analytics to find optimal times.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Use Relevant Hashtags</h3>
            <p className="text-sm text-white/80 leading-relaxed">Include trending and niche hashtags to increase discoverability and engagement.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Visual Appeal</h3>
            <p className="text-sm text-white/80 leading-relaxed">Add images, GIFs, or videos to make your posts more engaging and shareable.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Encourage Interaction</h3>
            <p className="text-sm text-white/80 leading-relaxed">Ask questions, create polls, and invite comments to boost engagement rates.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Track Performance</h3>
            <p className="text-sm text-white/80 leading-relaxed">Monitor which repurposed content performs best and optimize your strategy.</p>
          </div>
        </div>
      </div>

      {/* Quick Start Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Quick Start Templates</h2>
          <Button variant="link" className="text-primary" asChild>
            <Link href="/dashboard/templates">View All Templates →</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-soft-shadow border-0 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Blog Post → Social Media</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Transform your blog posts into engaging social media content across all platforms.</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">Popular</span>
                <Button variant="link" className="text-primary p-0 h-auto" asChild>
                  <Link href="/dashboard/repurpose?template=blog-to-social">Use Template →</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-soft-shadow border-0 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">YouTube → Twitter Thread</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Convert YouTube video content into compelling Twitter threads and LinkedIn posts.</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">New</span>
                <Button variant="link" className="text-primary p-0 h-auto" asChild>
                  <Link href="/dashboard/repurpose?template=youtube-to-thread">Use Template →</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-soft-shadow border-0 hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Article → Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Turn articles and long-form content into engaging email newsletter content.</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">Pro</span>
                <Button variant="link" className="text-primary p-0 h-auto" asChild>
                  <Link href="/dashboard/repurpose?template=article-to-newsletter">Use Template →</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Output */}
      {(output || error || creditError) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Generated Content</h2>
              <p className="text-sm text-muted-foreground mt-1">Review, copy, or schedule your repurposed content</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/history">View History →</Link>
            </Button>
          </div>
          
          {/* Credit Error Display */}
          {creditError && (
            <Card className="border-2 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 text-amber-900 dark:text-amber-100">Insufficient Credits</h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed mb-3">
                      You need <strong>{creditError.required} credits</strong> to repurpose content to {creditError.required} platform{creditError.required > 1 ? 's' : ''}, but you only have <strong>{creditError.remaining} credits</strong> remaining.
                    </p>
                    <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">💡 Free Trial Information:</p>
                      <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                        <li>Free trial users get 10 credits (one-time)</li>
                        <li>Each platform costs 1 credit (4 platforms = 4 credits)</li>
                        <li>You can select fewer platforms to use fewer credits</li>
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" onClick={() => { setCreditError(null); setError(null); }}>
                        Dismiss
                      </Button>
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" asChild>
                        <Link href="/redeem">Redeem LTD Code →</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/credits">View Credits →</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && !creditError && (
            <Card className="border-2 border-destructive/50 bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 text-destructive">Generation Error</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setError(null)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Twitter/X Thread */}
            {tweets.length > 0 && (
              <Card className="overflow-hidden border-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </div>
                      <div className="text-white">
                        <h3 className="font-semibold text-lg">Twitter/X Thread</h3>
                        <p className="text-sm text-white/90">{tweets.length} tweet{tweets.length > 1 ? 's' : ''} • Ready to post</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(tweets.join('\n\n'))}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handlePerformancePrediction(tweets.join('\n\n'), 'x')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Predict Performance
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 bg-gradient-to-b from-blue-50/50 dark:from-blue-950/30 to-transparent">
                  <div className="space-y-4">
                    {tweets.map((t, idx) => (
                      <div key={idx} className="group relative">
                        {/* Thread connector line */}
                        {idx < tweets.length - 1 && (
                          <div className="absolute left-[19px] top-[60px] bottom-[-16px] w-0.5 bg-gradient-to-b from-blue-300 to-blue-100" />
                        )}
                        
                        <div className="relative bg-card rounded-2xl border-2 border-border hover:border-blue-300 hover:shadow-lg transition-all p-5">
                          {/* Tweet header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm flex items-center justify-center font-bold shadow-md">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tweet {idx + 1}</p>
                                <p className="text-xs text-muted-foreground">{t.length}/280 characters</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" onClick={() => copy(t)} title="Copy tweet">
                                <Copy className="h-4 w-4"/>
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleSchedule(t, 'x')} title="Schedule">
                                <CalendarIcon className="h-4 w-4"/>
                              </Button>
                            </div>
                          </div>
                          
                          {/* Tweet content */}
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {t}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* LinkedIn Post */}
            {output?.linkedin_post && (
              <Card className="overflow-hidden border-2">
                <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                      <div className="text-white">
                        <h3 className="font-semibold text-lg">LinkedIn Post</h3>
                        <p className="text-sm text-white/90">Professional format • Ready to share</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(output.linkedin_post || '')}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Post
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handleSchedule(output.linkedin_post || '', 'linkedin')}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handlePerformancePrediction(output.linkedin_post || '', 'linkedin')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Predict Performance
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-5 bg-gradient-to-b from-blue-50/30 dark:from-blue-950/20 to-transparent">
                  <div className="bg-card rounded-xl border-2 border-border p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center text-white font-bold text-sm">
                        U
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Your Company</p>
                        <p className="text-xs text-muted-foreground">Professional Post</p>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground m-0">
                      {output.linkedin_post}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instagram Caption */}
            {output?.instagram_caption && (
              <Card className="overflow-hidden border-2">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <div className="text-white">
                        <h3 className="font-semibold text-lg">Instagram Caption</h3>
                        <p className="text-sm text-white/90">Visual storytelling • Ready to post</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(output.instagram_caption || '')}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Caption
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handleSchedule(output.instagram_caption || '', 'instagram')}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handlePerformancePrediction(output.instagram_caption || '', 'instagram')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Predict Performance
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 bg-gradient-to-b from-pink-50/30 dark:from-pink-950/20 to-transparent">
                  <div className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-sm">
                    {/* Mock Instagram Post Header */}
                    <div className="flex items-center gap-3 p-4 border-b">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        Y
                      </div>
                      <div>
                        <p className="font-semibold text-sm">your_brand</p>
                        <p className="text-xs text-muted-foreground">Just now</p>
                      </div>
                    </div>
                    {/* Mock Image Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <svg className="w-16 h-16 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">Your image here</p>
                      </div>
                    </div>
                    {/* Caption */}
                    <div className="p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {output.instagram_caption}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Email Newsletter */}
            {output?.facebook_post && (
              <Card className="overflow-hidden border-2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-bold text-xl">f</span>
                      </div>
                      <div className="text-white">
                        <h3 className="font-semibold text-lg">Facebook Post</h3>
                        <p className="text-sm text-white/90">Engaging format • Ready to share</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(output.facebook_post || '')}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Post
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handleSchedule(output.facebook_post || '', 'facebook')}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handlePerformancePrediction(output.facebook_post || '', 'facebook')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Predict Performance
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-5 bg-gradient-to-b from-blue-50/50 dark:from-blue-950/30 to-transparent">
                  <div className="bg-card rounded-xl border-2 border-border hover:border-blue-300 hover:shadow-lg transition-all p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground m-0">
                      {output.facebook_post}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {output?.reddit_post && (() => {
              // Parse Reddit post - check if it has a title (starts with # or has title/body format)
              const redditContent = output.reddit_post || '';
              const titleMatch = redditContent.match(/^#\s+(.+)$/m);
              const title = titleMatch ? titleMatch[1] : null;
              const body = titleMatch ? redditContent.replace(/^#\s+.+$/m, '').trim() : redditContent;
              
              return (
                <Card className="overflow-hidden border-2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-white font-bold text-xl">R</span>
                        </div>
                        <div className="text-white">
                          <h3 className="font-semibold text-lg">Reddit Post</h3>
                          <p className="text-sm text-white/90">Discussion format • Ready to post</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(output.reddit_post || '')}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Post
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handleSchedule(output.reddit_post || '', 'reddit')}>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handlePerformancePrediction(output.reddit_post || '', 'reddit')}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Predict Performance
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 bg-gradient-to-b from-orange-50/50 dark:from-orange-950/30 to-transparent">
                    <div className="bg-card rounded-xl border-2 border-border hover:border-orange-300 hover:shadow-lg transition-all p-4">
                      {title && (
                        <h3 className="text-lg font-bold text-foreground border-b pb-2 mb-3 mt-0">{title}</h3>
                      )}
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-foreground m-0">
                        <ReactMarkdown>
                          {body}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {output?.pinterest_description && (
              <Card className="overflow-hidden border-2">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-bold text-xl">P</span>
                      </div>
                      <div className="text-white">
                        <h3 className="font-semibold text-lg">Pinterest Pin</h3>
                        <p className="text-sm text-white/90">Keyword-rich • Ready to pin</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(output.pinterest_description || '')}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Description
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handleSchedule(output.pinterest_description || '', 'pinterest')}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handlePerformancePrediction(output.pinterest_description || '', 'pinterest')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Predict Performance
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-5 bg-gradient-to-b from-red-50/50 dark:from-red-950/30 to-transparent">
                  <div className="bg-card rounded-xl border-2 border-border hover:border-red-300 hover:shadow-lg transition-all p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground m-0">
                      {output.pinterest_description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {output?.email_newsletter && (
              <Card className="overflow-hidden border-2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-white">
                        <h3 className="font-semibold text-lg">Email Newsletter</h3>
                        <p className="text-sm text-white/90">Professional format • Ready to send</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(`Subject: ${output.email_newsletter?.subject || ''}\n\n${output.email_newsletter?.body || ''}`)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Email
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handleSchedule(`Subject: ${output.email_newsletter?.subject || ''}\n\n${output.email_newsletter?.body || ''}`, 'email')}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handlePerformancePrediction(`Subject: ${output.email_newsletter?.subject || ''}\n\n${output.email_newsletter?.body || ''}`, 'email')}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Predict Performance
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 bg-gradient-to-b from-green-50/30 dark:from-green-950/20 to-transparent">
                  <div className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-sm">
                    {/* Email Header */}
                    <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-6 border-b-2">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">From</p>
                            <p className="text-sm font-medium">Your Company &lt;hello@yourcompany.com&gt;</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">Draft</Badge>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">To</p>
                          <p className="text-sm font-medium">subscribers@yourlist.com</p>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Subject</p>
                          <p className="text-base font-semibold text-foreground">{output.email_newsletter.subject}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Email Body */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {/* Greeting */}
                        <div className="pb-4 border-b border-dashed">
                          <p className="text-sm text-muted-foreground italic">Email greeting will appear here</p>
                        </div>
                        
                        {/* Main Content */}
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground m-0">
                            {output.email_newsletter.body}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Email Footer */}
                    <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-6 border-t-2">
                      <div className="space-y-3 text-center">
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                          <button className="hover:text-foreground transition-colors">View in browser</button>
                          <span>•</span>
                          <button className="hover:text-foreground transition-colors">Unsubscribe</button>
                          <span>•</span>
                          <button className="hover:text-foreground transition-colors">Update preferences</button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          © 2024 Your Company. All rights reserved.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          123 Business St, City, State 12345
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {output?._fallback_note && (
        <div className="text-xs text-muted-foreground">{output._fallback_note}</div>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        content={scheduleContent}
        platform={schedulePlatform}
        title="Schedule Content"
        description="Schedule this repurposed content for posting"
      />

      {/* Predictive Performance Modal */}
      <PredictivePerformanceModal
        isOpen={performanceModalOpen}
        onClose={() => setPerformanceModalOpen(false)}
        content={performanceContent}
        platform={performancePlatform}
        tone="professional"
        contentType="post"
      />
    </div>
  );
}
