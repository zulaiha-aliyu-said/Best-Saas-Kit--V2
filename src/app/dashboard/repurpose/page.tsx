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
import { Copy, Repeat2, Download, Sparkles, Calendar as CalendarIcon } from "lucide-react";

// Types for the API response
type ThreadItem = string | { id?: number; text: string };
interface GeneratedOutput {
  x_thread?: ThreadItem[];
  linkedin_post?: string;
  instagram_caption?: string;
  email_newsletter?: { subject?: string; body?: string };
  _fallback_note?: string;
}

import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function RepurposePage() {
  const [tab, setTab] = useState<"text"|"url"|"file">("text");
  const search = useSearchParams();
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(false);
  const [includeCTA, setIncludeCTA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<GeneratedOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedulePlatform, setSchedulePlatform] = useState<"x"|"linkedin"|"instagram"|"email"|null>(null);
  const [scheduleBody, setScheduleBody] = useState("");
  const [scheduleAt, setScheduleAt] = useState<string>(() => {
    const d = new Date(Date.now() + 60*60*1000);
    const pad = (n:number)=> String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const tweets = useMemo(() => {
    if (!output?.x_thread) return [] as string[];
    return output.x_thread.map((t) => typeof t === 'string' ? t : t?.text || "");
  }, [output]);

  const copy = async (text: string) => {
    toast.success('Copied to clipboard');
    await navigator.clipboard.writeText(text);
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

  useEffect(()=>{
    const prefill = search.get('prefill');
    const platforms = (search.get('platforms') || '').split(',').filter(Boolean);
    const num = search.get('num');
    if (prefill) {
      const textarea = document.getElementById('rp-input') as HTMLTextAreaElement | null;
      if (textarea) textarea.value = prefill;
    }
    if (platforms.length) {
      const container = document.getElementById('rp-platforms');
      container?.querySelectorAll('button[data-key]')?.forEach((btn)=>{
        const b = btn as HTMLButtonElement;
        b.dataset.active = platforms.includes(String(b.dataset.key)) ? 'true' : 'false';
      });
    }
    if (num) {
      // best-effort: not strictly controlling Select; ok to ignore
    }
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
            <div className="flex gap-2 p-1 bg-secondary/40 rounded-xl">
              <Button 
                variant={tab==="text"?"default":"ghost"} 
                onClick={()=>setTab("text")}
                className={tab==="text" ? "flex-1 bg-white shadow-sm" : "flex-1"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Text/Article
              </Button>
              <Button 
                variant={tab==="url"?"default":"ghost"} 
                onClick={()=>setTab("url")}
                className={tab==="url" ? "flex-1 bg-white shadow-sm" : "flex-1"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                URL/Link
              </Button>
              <Button 
                variant={tab==="file"?"default":"ghost"} 
                onClick={()=>setTab("file")}
                className={tab==="file" ? "flex-1 bg-white shadow-sm" : "flex-1"}
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
                <Input id="rp-url" placeholder="https://example.com/your-article" className="h-12" />
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
              {tab === 'file' && fileContent ? `${fileContent.length} characters` : '0 characters'}
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
                  const text = tab === 'file' ? fileContent : (textArea?.value || '');
                  const url = urlInput?.value || '';

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
                  const data = await res.json();
                  if (!res.ok) {
                    setError(data.error || 'Failed to generate');
                    setOutput(null);
                  } else {
                    setOutput(data.output as GeneratedOutput);
                  }
                } catch (e: any) {
                  setError(e.message || 'Failed to generate');
                  setOutput(null);
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
          <Button variant="link" className="text-primary">View All Templates →</Button>
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
                <Button variant="link" className="text-primary p-0 h-auto">Use Template →</Button>
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
                <Button variant="link" className="text-primary p-0 h-auto">Use Template →</Button>
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
                <Button variant="link" className="text-primary p-0 h-auto">Use Template →</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Output */}
      {(output || error) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Repurposing Activity</h2>
            <Button variant="link" className="text-primary">View All →</Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Twitter/X Thread */}
            <Card className="card-soft-shadow border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold">Twitter/X Thread</h3>
                      <p className="text-xs text-white/80">Generated {tweets.length} tweets • {tweets.length > 0 ? '2 hours ago' : 'Not generated'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(tweets.join('\n\n'))}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {error && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">Error: {error}</div>
                )}
                {tweets.length === 0 && !error && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No thread yet. Generate to see results.</div>
                )}
                <div className="space-y-3">
                  {tweets.map((t, idx) => (
                    <div key={idx} className="rounded-xl border-2 bg-white p-4 hover:border-primary/30 transition-all">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">{idx + 1}</div>
                          <span className="text-xs text-muted-foreground">{t.length}/280 chars</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => copy(t)}><Copy className="h-3 w-3"/></Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSchedulePlatform('x'); setScheduleBody(t); setScheduleOpen(true); }}><CalendarIcon className="h-3 w-3"/></Button>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{t}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn Post */}
            <Card className="card-soft-shadow border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold">LinkedIn Post</h3>
                      <p className="text-xs text-white/80">Generated 5 posts • {output?.linkedin_post ? '5 hours ago' : 'Not generated'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(output?.linkedin_post || '')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                {output?.linkedin_post ? (
                  <div className="rounded-xl border-2 bg-white p-5 text-sm whitespace-pre-wrap leading-relaxed">
                    {output.linkedin_post}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">No LinkedIn post yet.</div>
                )}
              </CardContent>
            </Card>

            {/* Instagram Caption */}
            <Card className="card-soft-shadow border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold">Instagram Caption</h3>
                      <p className="text-xs text-white/80">Generated 6 captions • {output?.instagram_caption ? 'Yesterday' : 'Not generated'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(output?.instagram_caption || '')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                {output?.instagram_caption ? (
                  <div className="rounded-xl border-2 bg-white p-5 text-sm whitespace-pre-wrap leading-relaxed">
                    {output.instagram_caption}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">No Instagram caption yet.</div>
                )}
              </CardContent>
            </Card>

            {/* Email Newsletter */}
            <Card className="card-soft-shadow border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold">Email Newsletter</h3>
                      <p className="text-xs text-white/80">Newsletter format • {output?.email_newsletter ? 'Yesterday' : 'Not generated'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => copy(`${output?.email_newsletter?.subject || ''}\n\n${output?.email_newsletter?.body || ''}`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {output?.email_newsletter ? (
                  <>
                    <div className="rounded-lg border-2 bg-secondary/40 p-3 text-sm">
                      <span className="text-xs text-muted-foreground font-medium">Subject Line</span>
                      <div className="font-semibold mt-1">{output.email_newsletter.subject}</div>
                    </div>
                    <div className="rounded-xl border-2 bg-white p-5 text-sm whitespace-pre-wrap leading-relaxed">{output.email_newsletter.body}</div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">No email content yet.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {output?._fallback_note && (
        <div className="text-xs text-muted-foreground">{output._fallback_note}</div>
      )}

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
            <DialogDescription>Select a date and time to schedule this {schedulePlatform?.toUpperCase()} post.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">Timezone: {tz}</div>
            <Input type="datetime-local" value={scheduleAt} onChange={(e)=>setScheduleAt(e.target.value)} />
            <div className="rounded-md border p-2 text-sm max-h-40 overflow-auto whitespace-pre-wrap">{scheduleBody}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={async ()=>{
              if (!schedulePlatform) return;
              const res = await fetch('/api/schedule', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform: schedulePlatform, content: scheduleBody, scheduledAt: scheduleAt, timezone: tz }) });
              if (res.ok) { setScheduleOpen(false); toast.success('Scheduled successfully', { action: { label: 'View', onClick: ()=> location.assign('/dashboard/schedule') } }); }
            }}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
