"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { REPURPOSE_TEMPLATES, RepurposeTemplate } from "@/data/templates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Sparkles, Eye, Wand2, Image as ImageIcon, BarChart3, Copy, Calendar } from "lucide-react"
import { toast } from "sonner"
import { PredictivePerformanceModal } from "@/components/ai/predictive-performance-modal"
import { ScheduleModal } from "@/components/schedule/schedule-modal"

export default function CustomizeTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const template = REPURPOSE_TEMPLATES.find(t => t.id === templateId)

  // Customization states
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [tone, setTone] = useState("")
  const [length, setLength] = useState("")
  const [includeHashtags, setIncludeHashtags] = useState(false)
  const [includeEmojis, setIncludeEmojis] = useState(false)
  const [includeCTA, setIncludeCTA] = useState(false)
  const [customHook, setCustomHook] = useState("")
  const [customCTA, setCustomCTA] = useState("")
  const [hashtagCount, setHashtagCount] = useState([3])
  const [emojiDensity, setEmojiDensity] = useState([2])
  const [creativityLevel, setCreativityLevel] = useState([5])
  const [selectedImage, setSelectedImage] = useState("")
  const [inputContent, setInputContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedOutput, setGeneratedOutput] = useState<any>(null)
  
  // Prediction modal state
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false)
  const [performanceContent, setPerformanceContent] = useState("")
  const [performancePlatform, setPerformancePlatform] = useState<string>("x")
  
  // Schedule modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleContent, setScheduleContent] = useState("")
  const [schedulePlatform, setSchedulePlatform] = useState<string>("x")

  useEffect(() => {
    if (template) {
      setSelectedPlatforms(template.supportedPlatforms)
      setTone(template.recommendedTone)
      setLength(template.recommendedLength)
      setIncludeHashtags(template.includeHashtags)
      setIncludeEmojis(template.includeEmojis)
      setIncludeCTA(template.includeCTA)
      setCustomHook(template.hooks[0] || "")
      setCustomCTA(template.ctaSuggestions[0] || "")
    }
  }, [template])

  if (!template) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Template Not Found</h2>
          <p className="text-muted-foreground mb-6">The template you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/dashboard/templates">Back to Templates</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handleGenerate = async () => {
    if (!inputContent.trim()) {
      toast.error('Please enter some content to repurpose')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    setLoading(true)
    setGeneratedOutput(null)

    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'text',
          text: inputContent,
          platforms: selectedPlatforms,
          tone,
          contentLength: length,
          numPosts: 3,
          options: {
            includeHashtags,
            includeEmojis,
            includeCTA,
            customHook: customHook.trim() || undefined,
            customCTA: customCTA.trim() || undefined,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate content' }))
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const data = await response.json()
      
      // Check if we got valid output
      if (!data.output && !data.x_thread && !data.linkedin_post) {
        console.error('Invalid response:', data)
        throw new Error('Invalid response from server. Please try again.')
      }
      
      const output = data.output || data
      
      // Check if using fallback mode
      if (output._fallback_note) {
        toast.warning('Using basic mode. For better results, configure AI API keys (GROQ_API_KEY or OPENROUTER_API_KEY)', {
          duration: 5000,
        })
      } else {
        toast.success('Content generated successfully!')
      }
      
      setGeneratedOutput(output)
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyCustomization = () => {
    const params = new URLSearchParams()
    params.set('templateId', template.id)
    params.set('platforms', selectedPlatforms.join(','))
    params.set('tone', tone)
    params.set('length', length)
    params.set('hashtags', includeHashtags.toString())
    params.set('emojis', includeEmojis.toString())
    params.set('cta', includeCTA.toString())
    if (customHook) params.set('hook', customHook)
    if (customCTA) params.set('customCta', customCTA)
    
    router.push(`/dashboard/repurpose?${params.toString()}`)
    toast.success('Template customized! Ready to generate content.')
  }

  const handlePerformancePrediction = (content: string, platform: string) => {
    setPerformanceContent(content)
    setPerformancePlatform(platform)
    setPerformanceModalOpen(true)
  }

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Content copied to clipboard!')
  }

  const handleScheduleContent = (content: string, platform: string) => {
    setScheduleContent(content)
    setSchedulePlatform(platform)
    setScheduleModalOpen(true)
  }

  const platformIcons: Record<string, string> = {
    x: "𝕏",
    linkedin: "in",
    instagram: "📷",
    email: "✉️",
    tiktok: "🎵",
    youtube: "▶️",
    blog: "📝",
    podcast: "🎙️",
    shorts: "📹"
  }

  const unsplashImages = [
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
  ]

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{template.name}</h1>
            <p className="text-muted-foreground text-lg">{template.description}</p>
            <div className="flex gap-2 mt-3">
              <Badge>{template.category}</Badge>
              <Badge variant="outline">{template.difficulty}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="lg" 
              onClick={handleGenerate} 
              disabled={loading || !inputContent.trim()}
              className="gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Content
                </>
              )}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleApplyCustomization} 
              className="gap-2"
            >
              <Wand2 className="h-5 w-5" />
              Use in Repurpose Page
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Customization Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Customization Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Input */}
              <div className="space-y-3">
                <Label htmlFor="content" className="text-base font-semibold">Your Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your blog post, article, video transcript, or any content you want to repurpose..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {inputContent.length} characters • Minimum 100 characters recommended
                </p>
              </div>

              <Separator />

              {/* Platform Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Target Platforms</Label>
                <div className="grid grid-cols-3 gap-2">
                  {template.supportedPlatforms.map(platform => (
                    <Button
                      key={platform}
                      variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePlatform(platform)}
                      className="justify-start gap-2"
                    >
                      <span className="text-lg">{platformIcons[platform]}</span>
                      <span className="capitalize text-xs">{platform}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              <Separator />

              {/* Tone Selection */}
              <div className="space-y-3">
                <Label htmlFor="tone" className="text-base font-semibold">Content Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="funny">Funny</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Length Selection */}
              <div className="space-y-3">
                <Label htmlFor="length" className="text-base font-semibold">Content Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger id="length">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (Quick reads)</SelectItem>
                    <SelectItem value="medium">Medium (Standard)</SelectItem>
                    <SelectItem value="long">Long (In-depth)</SelectItem>
                    <SelectItem value="detailed">Detailed (Comprehensive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Advanced Options */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Advanced Options</Label>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hashtags">Include Hashtags</Label>
                    <p className="text-xs text-muted-foreground">Add relevant hashtags</p>
                  </div>
                  <Switch
                    id="hashtags"
                    checked={includeHashtags}
                    onCheckedChange={setIncludeHashtags}
                  />
                </div>

                {includeHashtags && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    <Label className="text-sm">Hashtag Count: {hashtagCount[0]}</Label>
                    <Slider
                      value={hashtagCount}
                      onValueChange={setHashtagCount}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emojis">Include Emojis</Label>
                    <p className="text-xs text-muted-foreground">Add expressive emojis</p>
                  </div>
                  <Switch
                    id="emojis"
                    checked={includeEmojis}
                    onCheckedChange={setIncludeEmojis}
                  />
                </div>

                {includeEmojis && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    <Label className="text-sm">Emoji Density: {emojiDensity[0]}/5</Label>
                    <Slider
                      value={emojiDensity}
                      onValueChange={setEmojiDensity}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cta">Include Call-to-Action</Label>
                    <p className="text-xs text-muted-foreground">Add engagement prompt</p>
                  </div>
                  <Switch
                    id="cta"
                    checked={includeCTA}
                    onCheckedChange={setIncludeCTA}
                  />
                </div>
              </div>

              <Separator />

              {/* Creativity Level */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Creativity Level: {creativityLevel[0]}/10
                </Label>
                <Slider
                  value={creativityLevel}
                  onValueChange={setCreativityLevel}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {creativityLevel[0] <= 3 && "Conservative - Stays close to original"}
                  {creativityLevel[0] > 3 && creativityLevel[0] <= 7 && "Balanced - Mix of original and creative"}
                  {creativityLevel[0] > 7 && "Creative - More unique variations"}
                </p>
              </div>

              <Separator />

              {/* Custom Hook */}
              <div className="space-y-3">
                <Label htmlFor="hook" className="text-base font-semibold">Custom Hook (Optional)</Label>
                <Textarea
                  id="hook"
                  placeholder="Enter a custom opening hook..."
                  value={customHook}
                  onChange={(e) => setCustomHook(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Suggested: {template.hooks[0]}
                </p>
              </div>

              {/* Custom CTA */}
              {includeCTA && (
                <div className="space-y-3">
                  <Label htmlFor="customCta" className="text-base font-semibold">Custom CTA (Optional)</Label>
                  <Input
                    id="customCta"
                    placeholder="Enter your call-to-action..."
                    value={customCTA}
                    onChange={(e) => setCustomCTA(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Suggested: {template.ctaSuggestions[0]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {generatedOutput ? 'Generated Content' : 'Live Preview'}
              </CardTitle>
              {generatedOutput && (
                <p className="text-sm text-muted-foreground mt-1">
                  Your repurposed content is ready!
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">{generatedOutput ? (
                // Show Generated Content
                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Twitter/X Thread */}
                  {generatedOutput.x_thread && generatedOutput.x_thread.length > 0 && (
                    <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50/50 dark:bg-blue-900/30 space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                            𝕏
                          </div>
                          <span className="font-semibold text-sm">Twitter/X Thread ({generatedOutput.x_thread.length} tweets)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyContent(generatedOutput.x_thread.join('\n\n'))}
                            className="gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleContent(generatedOutput.x_thread.join('\n\n'), 'x')}
                            className="gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePerformancePrediction(generatedOutput.x_thread.join('\n\n'), 'x')}
                            className="gap-1"
                          >
                            <BarChart3 className="h-3 w-3" />
                            Predict
                          </Button>
                        </div>
                      </div>
                      {generatedOutput.x_thread.map((tweet: string, idx: number) => (
                        <div key={idx} className="bg-card rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">Tweet {idx + 1}</Badge>
                            <span className="text-xs text-muted-foreground">{tweet.length}/280</span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{tweet}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* LinkedIn Post */}
                  {generatedOutput.linkedin_post && (
                    <div className="border-2 border-blue-700/20 dark:border-blue-700/40 rounded-xl p-4 bg-blue-50/30 dark:bg-blue-900/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                            in
                          </div>
                          <span className="font-semibold text-sm">LinkedIn Post</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyContent(generatedOutput.linkedin_post)}
                            className="gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleContent(generatedOutput.linkedin_post, 'linkedin')}
                            className="gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePerformancePrediction(generatedOutput.linkedin_post, 'linkedin')}
                            className="gap-1"
                          >
                            <BarChart3 className="h-3 w-3" />
                            Predict
                          </Button>
                        </div>
                      </div>
                      {selectedImage && (
                        <img src={selectedImage} alt="Preview" className="w-full aspect-video object-cover rounded-lg mb-3" />
                      )}
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{generatedOutput.linkedin_post}</p>
                    </div>
                  )}

                  {/* Instagram Caption */}
                  {generatedOutput.instagram_caption && (
                    <div className="border-2 border-pink-200 rounded-xl p-4 bg-pink-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-lg">
                            📷
                          </div>
                          <span className="font-semibold text-sm">Instagram Caption</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyContent(generatedOutput.instagram_caption)}
                            className="gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleContent(generatedOutput.instagram_caption, 'instagram')}
                            className="gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePerformancePrediction(generatedOutput.instagram_caption, 'instagram')}
                            className="gap-1"
                          >
                            <BarChart3 className="h-3 w-3" />
                            Predict
                          </Button>
                        </div>
                      </div>
                      {selectedImage && (
                        <img src={selectedImage} alt="Preview" className="w-full aspect-square object-cover rounded-lg mb-3" />
                      )}
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{generatedOutput.instagram_caption}</p>
                    </div>
                  )}

                  {/* Email Newsletter */}
                  {generatedOutput.email_newsletter && (
                    <div className="border-2 border-green-200 dark:border-green-800 rounded-xl p-4 bg-green-50/50 dark:bg-green-900/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center text-lg">
                            ✉️
                          </div>
                          <span className="font-semibold text-sm">Email Newsletter</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyContent(`Subject: ${generatedOutput.email_newsletter.subject}\n\n${generatedOutput.email_newsletter.body}`)}
                            className="gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleContent(`Subject: ${generatedOutput.email_newsletter.subject}\n\n${generatedOutput.email_newsletter.body}`, 'email')}
                            className="gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePerformancePrediction(`Subject: ${generatedOutput.email_newsletter.subject}\n\n${generatedOutput.email_newsletter.body}`, 'email')}
                            className="gap-1"
                          >
                            <BarChart3 className="h-3 w-3" />
                            Predict
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Subject:</p>
                        <p className="font-semibold text-sm">{generatedOutput.email_newsletter.subject}</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mt-3">{generatedOutput.email_newsletter.body}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Show Template Preview
                <>
              {/* Image Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Visual Assets (Optional)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {unsplashImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Platform Previews */}
              <div className="space-y-4">
                {selectedPlatforms.includes('x') && (
                  <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50/50 dark:bg-blue-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center font-bold">
                        𝕏
                      </div>
                      <span className="font-semibold text-sm">Twitter/X Post</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {customHook || template.hooks[0]}
                      {includeEmojis && " ✨"}
                      {includeHashtags && (
                        <span className="block mt-2 text-blue-600">
                          {template.hashtagPacks[0]?.split(' ').slice(0, hashtagCount[0]).join(' ')}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {selectedPlatforms.includes('linkedin') && (
                  <div className="border-2 border-blue-700/20 dark:border-blue-700/40 rounded-xl p-4 bg-blue-50/30 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                        in
                      </div>
                      <span className="font-semibold text-sm">LinkedIn Post</span>
                    </div>
                    {selectedImage && (
                      <img src={selectedImage} alt="Preview" className="w-full aspect-video object-cover rounded-lg mb-3" />
                    )}
                    <p className="text-sm text-foreground leading-relaxed">
                      <strong>{template.preview.headline}</strong>
                      <br /><br />
                      {template.preview.sample}
                      {includeCTA && (
                        <span className="block mt-3 font-semibold text-blue-700">
                          👉 {customCTA || template.ctaSuggestions[0]}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {selectedPlatforms.includes('instagram') && (
                  <div className="border-2 border-pink-200 rounded-xl p-4 bg-pink-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-lg">
                        📷
                      </div>
                      <span className="font-semibold text-sm">Instagram Caption</span>
                    </div>
                    {selectedImage && (
                      <img src={selectedImage} alt="Preview" className="w-full aspect-square object-cover rounded-lg mb-3" />
                    )}
                    <p className="text-sm text-foreground leading-relaxed">
                      {customHook || template.hooks[0]}
                      {includeEmojis && " ✨💫"}
                      {includeHashtags && (
                        <span className="block mt-2 text-pink-600">
                          {template.hashtagPacks[0]?.split(' ').slice(0, hashtagCount[0]).join(' ')}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {selectedPlatforms.includes('email') && (
                  <div className="border-2 border-green-200 dark:border-green-800 rounded-xl p-4 bg-green-50/50 dark:bg-green-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center text-lg">
                        ✉️
                      </div>
                      <span className="font-semibold text-sm">Email Newsletter</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Subject:</p>
                      <p className="font-semibold text-sm">{template.preview.headline}</p>
                      <p className="text-sm text-foreground leading-relaxed mt-3">
                        {template.preview.sample}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedPlatforms.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Select platforms to see preview</p>
                </div>
              )}
              </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Predictive Performance Modal */}
      <PredictivePerformanceModal
        isOpen={performanceModalOpen}
        onClose={() => setPerformanceModalOpen(false)}
        content={performanceContent}
        platform={performancePlatform}
        tone={tone}
        contentType="post"
      />

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        content={scheduleContent}
        platform={schedulePlatform}
      />
    </div>
  )
}
