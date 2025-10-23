"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Zap,
  Plus,
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  Loader2,
  AlertCircle,
  Package
} from "lucide-react"
import { UpgradePrompt } from "@/components/upgrade/UpgradePrompt"

interface BulkResult {
  topic: string
  content: Record<string, {
    platform: string
    text: string
    metadata: any
  }>
}

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter/X', icon: '𝕏' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'email', label: 'Email', icon: '📧' }
]

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'motivational', label: 'Motivational' }
]

const LENGTHS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
  { value: 'detailed', label: 'Detailed' }
]

export default function BulkGeneratePage() {
  const [topics, setTopics] = useState<string[]>([''])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'linkedin'])
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BulkResult[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [tierInfo, setTierInfo] = useState<{ currentTier: number; requiredTier: number } | null>(null)

  const addTopic = () => {
    if (topics.length < 5) {
      setTopics([...topics, ''])
    }
  }

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index))
  }

  const updateTopic = (index: number, value: string) => {
    const newTopics = [...topics]
    newTopics[index] = value
    setTopics(newTopics)
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const handleGenerate = async () => {
    const validTopics = topics.filter(t => t.trim())
    
    if (validTopics.length === 0) {
      alert('Please enter at least one topic')
      return
    }

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/repurpose/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: validTopics,
          platforms: selectedPlatforms,
          tone,
          length
        })
      })

      const data = await response.json()

      // Handle tier restriction
      if (response.status === 403 && data.code === 'TIER_RESTRICTED') {
        setTierInfo({ currentTier: data.currentTier, requiredTier: data.requiredTier })
        setShowUpgrade(true)
        setLoading(false)
        return
      }

      // Handle insufficient credits
      if (response.status === 402 && data.code === 'INSUFFICIENT_CREDITS') {
        alert(`💳 Insufficient Credits\n\nYou need ${data.required} credits but only have ${data.remaining}.\n\nYour credits will reset soon!`)
        setLoading(false)
        return
      }

      if (data.success) {
        setResults(data.results)
      }
    } catch (error) {
      console.error('Error generating bulk content:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const totalPieces = topics.filter(t => t.trim()).length * selectedPlatforms.length
  const estimatedCredits = totalPieces * 0.9

  if (showUpgrade && tierInfo) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold tracking-tight">Bulk Generation</h1>
          </div>
          <p className="text-muted-foreground">
            Generate 5 pieces of content at once with 10% discount
          </p>
        </div>

        <UpgradePrompt
          featureName="Bulk Generation"
          currentTier={tierInfo.currentTier}
          requiredTier={tierInfo.requiredTier}
          variant="inline"
          benefits={[
            "Generate up to 5 topics at once",
            "10% credit discount (0.9 per piece vs 1.0)",
            "Save time with batch processing",
            "750 credits/month (Tier 3)",
            "Perfect for content calendars"
          ]}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold tracking-tight">Bulk Content Generation</h1>
          <Badge className="bg-purple-600">Tier 3+</Badge>
        </div>
        <p className="text-muted-foreground">
          Generate content for multiple topics at once - save time and get 10% credit discount
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Topics (Max 5)</CardTitle>
              <CardDescription>
                Enter up to 5 different topics you want to create content for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topics.map((topic, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Topic ${index + 1}: e.g., Content Marketing Tips`}
                      value={topic}
                      onChange={(e) => updateTopic(index, e.target.value)}
                    />
                  </div>
                  {topics.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeTopic(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {topics.length < 5 && (
                <Button
                  variant="outline"
                  onClick={addTopic}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Topic ({topics.length}/5)
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platforms</CardTitle>
              <CardDescription>
                Select which platforms to generate content for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {PLATFORMS.map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={() => togglePlatform(platform.id)}
                    />
                    <Label htmlFor={platform.id} className="flex items-center gap-2 cursor-pointer">
                      <span>{platform.icon}</span>
                      <span>{platform.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Customize tone and length for all content
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTHS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Generate */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Topics:</span>
                  <span className="font-medium">{topics.filter(t => t.trim()).length}/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platforms:</span>
                  <span className="font-medium">{selectedPlatforms.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Pieces:</span>
                  <span className="font-medium text-purple-600">{totalPieces}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Credits:</span>
                  <div className="text-right">
                    <span className="font-medium">{estimatedCredits.toFixed(1)}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      10% off
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  vs {totalPieces} credits at regular price
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || totalPieces === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate All
                  </>
                )}
              </Button>

              {totalPieces === 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Add at least one topic and select platforms to continue
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Generated Content</h2>
            <Badge variant="outline" className="text-sm">
              {results.reduce((sum, r) => sum + Object.keys(r.content).length, 0)} pieces
            </Badge>
          </div>

          {results.map((result, topicIndex) => (
            <Card key={topicIndex}>
              <CardHeader>
                <CardTitle className="text-lg">{result.topic}</CardTitle>
                <CardDescription>
                  {Object.keys(result.content).length} platform variations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(result.content).map(([platform, content]) => (
                  <div key={platform} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">
                        {PLATFORMS.find(p => p.id === platform)?.label}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(content.text, `${topicIndex}-${platform}`)}
                        >
                          {copiedId === `${topicIndex}-${platform}` ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {content.text}
                      </pre>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{content.metadata.wordCount} words</span>
                      <span>{content.metadata.characterCount} chars</span>
                      {content.metadata.hashtags.length > 0 && (
                        <span>{content.metadata.hashtags.length} hashtags</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

