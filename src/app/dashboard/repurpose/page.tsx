"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
import ErrorBoundary from "@/components/error-boundary";

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
import { Suspense } from "react";

function RepurposePageContent() {
  const [tab, setTab] = useState<"text"|"url"|"file">("text");
  const search = useSearchParams();
  const [includeHashtags, setIncludeHashtags] = useState(true);
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
  
  // Safe timezone detection
  const [tz, setTz] = useState('UTC');
  
  useEffect(() => {
    try {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      setTz(detectedTz);
    } catch (e) {
      setTz('UTC');
    }
  }, []);

  const tweets = useMemo(() => {
    if (!output?.x_thread) return [] as string[];
    return output.x_thread.map((t) => typeof t === 'string' ? t : t?.text || "");
  }, [output]);

  const copy = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  useEffect(()=>{
    const prefill = search.get('prefill');
    const platforms = (search.get('platforms') || '').split(',').filter(Boolean);
    const num = search.get('num');
    
    if (prefill) {
      const textarea = document.getElementById('rp-input') as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.value = prefill;
      }
    }
    
    if (platforms.length) {
      // Use a more robust approach for platform selection
      setTimeout(() => {
        const container = document.getElementById('rp-platforms');
        if (container) {
          container.querySelectorAll('button[data-key]')?.forEach((btn)=>{
            const b = btn as HTMLButtonElement;
            if (b.dataset.key) {
              b.dataset.active = platforms.includes(String(b.dataset.key)) ? 'true' : 'false';
            }
          });
        }
      }, 100);
    }
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Repurposing</h1>
        <p className="text-muted-foreground">Transform your long-form content into engaging social media posts</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card className="card-soft-shadow">
          <CardHeader>
            <CardTitle>Input Your Content</CardTitle>
            <CardDescription>Paste text, add a link, or upload a file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant={tab==="text"?"default":"outline"} onClick={()=>setTab("text")}>Text/Article</Button>
              <Button variant={tab==="url"?"default":"outline"} onClick={()=>setTab("url")}>URL/Link</Button>
              <Button variant={tab==="file"?"default":"outline"} onClick={()=>setTab("file")}>Upload File</Button>
            </div>

            {tab === "text" && (
              <Textarea id="rp-input" rows={12} placeholder="Paste your blog post, article, transcript, or long-form content here..." />
            )}
            {tab === "url" && (
              <Input id="rp-url" placeholder="https://example.com/your-article" />
            )}
            {tab === "file" && (
              <Input id="rp-file" type="file" />
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card className="card-soft-shadow">
          <CardHeader>
            <CardTitle>Configuration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform multi-select */}
            <div className="space-y-2">
              <Label className="block">Platforms</Label>
              <div className="flex flex-wrap gap-2" id="rp-platforms">
                {[
                  { key: 'x', label: 'Twitter/X' },
                  { key: 'linkedin', label: 'LinkedIn' },
                  { key: 'instagram', label: 'Instagram' },
                  { key: 'email', label: 'Email' },
                ].map(p => (
                  <button
                    key={p.key}
                    type="button"
                    data-key={p.key}
                    className="px-3 py-1.5 text-sm rounded-full border bg-white hover:bg-secondary/60 data-[active=true]:bg-primary data-[active=true]:text-white"
                    onClick={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.dataset.active = el.dataset.active === 'true' ? 'false' : 'true';
                    }}
                    data-active="true"
                  >{p.label}</button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <Label className="mb-2 block">Content Tone</Label>
              <Select defaultValue="professional">
                <SelectTrigger>
                  <SelectValue placeholder="Choose tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="funny">Funny</SelectItem>
                  <SelectItem value="motivational">Motivational</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="num">Number of posts (thread length)</Label>
                <Select defaultValue="3">
                  <SelectTrigger id="rp-num">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hashtags">Include hashtags</Label>
                <Switch id="hashtags" checked={includeHashtags} onCheckedChange={setIncludeHashtags} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emojis">Include emojis</Label>
                <Switch id="emojis" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cta">Include call-to-action</Label>
                <Switch id="cta" />
              </div>
            </div>

            <Button
              disabled={loading}
              className="w-full h-12 text-base repurpose-gradient hover:opacity-90 disabled:opacity-70"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const textArea = document.getElementById('rp-input') as HTMLTextAreaElement | null;
                  const urlInput = document.getElementById('rp-url') as HTMLInputElement | null;
                  const text = textArea?.value || '';
                  const url = urlInput?.value || '';

                  // Collect selected platforms
                  const container = document.getElementById('rp-platforms');
                  const platforms: string[] = [];
                  if (container) {
                    container.querySelectorAll('button[data-key]')?.forEach((btn) => {
                      const b = btn as HTMLButtonElement;
                      if (b.dataset.active === 'true' && b.dataset.key) {
                        platforms.push(String(b.dataset.key));
                      }
                    });
                  }
                  
                  // Get number of posts - simplified approach
                  const numSelect = document.getElementById('rp-num') as HTMLButtonElement | null;
                  let numPosts = 3;
                  if (numSelect) {
                    const selectedValue = numSelect.getAttribute('data-value') || numSelect.textContent;
                    numPosts = Number(selectedValue) || 3;
                  }

                  const res = await fetch('/api/repurpose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sourceType: tab, text, url, platforms, numPosts, tone: 'professional' })
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
              <Sparkles className="mr-2 h-5 w-5" /> {loading ? 'Generating…' : 'Repurpose Now 💡'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Output */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Twitter/X Thread */}
        <Card className="card-soft-shadow">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Twitter/X Thread</CardTitle>
              <CardDescription>Split into numbered tweets</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(tweets.join('\n\n'))}><Copy className="mr-2 h-4 w-4"/>Copy All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">Error: {error}</div>
            )}
            {tweets.length === 0 && !error && (
              <div className="text-sm text-muted-foreground">No thread yet. Generate to see results.</div>
            )}
            <div className="space-y-3">
              {tweets.map((t, idx) => (
                <div key={idx} className="rounded-lg border bg-card p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{idx + 1}</Badge>
                      <span className="text-xs text-muted-foreground">{t.length}/280</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => copy(t)}><Copy className="h-4 w-4 mr-1"/>Copy</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSchedulePlatform('x'); setScheduleBody(t); setScheduleOpen(true); }}><CalendarIcon className="h-4 w-4 mr-1"/>Send to Schedule</Button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6">{t}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Post */}
        <Card className="card-soft-shadow">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>LinkedIn Post</CardTitle>
              <CardDescription>Formatted for professional tone</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(output?.linkedin_post || '')}><Copy className="mr-2 h-4 w-4"/>Copy</Button>
              <Button variant="outline" size="sm" onClick={() => { if (output?.linkedin_post) { setSchedulePlatform('linkedin'); setScheduleBody(output.linkedin_post); setScheduleOpen(true); } }}><CalendarIcon className="h-4 w-4 mr-1"/>Send to Schedule</Button>
            </div>
          </CardHeader>
          <CardContent>
            {output?.linkedin_post ? (
              <div className="rounded-xl border bg-card p-4 text-sm whitespace-pre-wrap leading-7">
                {output.linkedin_post}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No LinkedIn post yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Instagram Caption */}
        <Card className="card-soft-shadow">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Instagram Caption</CardTitle>
              <CardDescription>Hashtags styled at the end</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(output?.instagram_caption || '')}><Copy className="mr-2 h-4 w-4"/>Copy</Button>
              <Button variant="outline" size="sm" onClick={() => { if (output?.instagram_caption) { setSchedulePlatform('instagram'); setScheduleBody(output.instagram_caption); setScheduleOpen(true); } }}><CalendarIcon className="h-4 w-4 mr-1"/>Send to Schedule</Button>
            </div>
          </CardHeader>
          <CardContent>
            {output?.instagram_caption ? (
              <div className="rounded-xl border bg-card p-4 text-sm whitespace-pre-wrap leading-7">
                {output.instagram_caption}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No Instagram caption yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Email Newsletter */}
        <Card className="card-soft-shadow">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Email Newsletter</CardTitle>
              <CardDescription>Subject + body</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(`${output?.email_newsletter?.subject || ''}\n\n${output?.email_newsletter?.body || ''}`)}><Copy className="mr-2 h-4 w-4"/>Copy</Button>
              <Button variant="outline" size="sm" onClick={() => { if (output?.email_newsletter) { setSchedulePlatform('email'); setScheduleBody(`${output.email_newsletter.subject || ''}\n\n${output.email_newsletter.body || ''}`); setScheduleOpen(true); } }}><CalendarIcon className="h-4 w-4 mr-1"/>Send to Schedule</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {output?.email_newsletter ? (
              <>
                <div className="rounded-lg border bg-secondary/40 p-3 text-sm"><span className="text-xs text-muted-foreground">Subject</span><div className="font-medium">{output.email_newsletter.subject}</div></div>
                <div className="rounded-xl border bg-card p-4 text-sm whitespace-pre-wrap leading-7">{output.email_newsletter.body}</div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No email content yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

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

export default function RepurposePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading repurpose tool...</p>
          </div>
        </div>
      }>
        <RepurposePageContent />
      </Suspense>
    </ErrorBoundary>
  );
}
