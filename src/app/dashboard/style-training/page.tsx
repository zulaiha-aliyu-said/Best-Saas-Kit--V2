"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Wand2,
  Plus,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Brain,
  FileText,
  TrendingUp,
  Target,
  Trash2
} from "lucide-react"
import { UpgradePrompt } from "@/components/upgrade/UpgradePrompt"

interface StyleProfile {
  id: number
  name: string
  description: string
  word_count: number
  tone: string
  vocabulary_level: string
  sentence_structure: string
  paragraph_length: string
  use_of_emojis: boolean
  use_of_hashtags: boolean
  use_of_questions: boolean
  storytelling_approach: string
  common_phrases: string[]
  unique_patterns: string[]
  is_active: boolean
  trained_at: string
  created_at: string
}

const PLATFORMS = [
  { value: 'general', label: 'General' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'email', label: 'Email' }
]

export default function StyleTrainingPage() {
  const [profiles, setProfiles] = useState<StyleProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<StyleProfile | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<number | null>(null)

  // Create form
  const [profileName, setProfileName] = useState('')
  const [profileDescription, setProfileDescription] = useState('')
  const [sampleContent, setSampleContent] = useState('')

  // Generate form
  const [generateTopic, setGenerateTopic] = useState('')
  const [generatePlatform, setGeneratePlatform] = useState('general')
  const [generatedContent, setGeneratedContent] = useState('')
  const [styleMatchScore, setStyleMatchScore] = useState(0)

  // Upgrade prompt
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [tierInfo, setTierInfo] = useState<{ currentTier: number; requiredTier: number } | null>(null)

  useEffect(() => {
    fetchProfiles()
    fetchUserTier()
  }, [])

  const fetchUserTier = async () => {
    try {
      const response = await fetch('/api/user/tier')
      if (response.ok) {
        const data = await response.json()
        setUserTier(data.tier || 1)
      }
    } catch (error) {
      console.error('Error fetching user tier:', error)
      setUserTier(1)
    }
  }

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/style-training/list')
      const data = await response.json()

      if (data.success) {
        setProfiles(data.profiles)
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = async () => {
    if (!profileName || !sampleContent) {
      alert('Please provide a name and sample content')
      return
    }

    if (sampleContent.split(/\s+/).length < 100) {
      alert('Please provide at least 100 words of sample content for better analysis')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/style-training/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          description: profileDescription,
          sampleContent
        })
      })

      const data = await response.json()

      // Handle tier restriction
      if (response.status === 403 && data.code === 'TIER_RESTRICTED') {
        setTierInfo({ currentTier: data.currentTier, requiredTier: data.requiredTier })
        setShowUpgrade(true)
        setCreating(false)
        setShowCreateDialog(false)
        return
      }

      // Handle limit exceeded
      if (response.status === 429 && data.code === 'LIMIT_EXCEEDED') {
        alert(data.message)
        setCreating(false)
        return
      }

      // Handle insufficient credits
      if (response.status === 402 && data.code === 'INSUFFICIENT_CREDITS') {
        alert(`💳 Insufficient Credits\n\nYou need ${data.required} credits but only have ${data.remaining}.`)
        setCreating(false)
        return
      }

      if (data.success) {
        setProfiles([data.profile, ...profiles])
        setShowCreateDialog(false)
        setProfileName('')
        setProfileDescription('')
        setSampleContent('')
      }
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Failed to create profile. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleGenerateContent = async () => {
    if (!selectedProfile || !generateTopic) {
      alert('Please select a profile and provide a topic')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/style-training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleProfileId: selectedProfile.id,
          topic: generateTopic,
          platform: generatePlatform
        })
      })

      const data = await response.json()

      if (response.status === 402 && data.code === 'INSUFFICIENT_CREDITS') {
        alert(`💳 Insufficient Credits\n\nYou need ${data.required} credits but only have ${data.remaining}.`)
        setGenerating(false)
        return
      }

      if (data.success) {
        setGeneratedContent(data.content)
        setStyleMatchScore(data.styleMatchScore)
      }
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setGenerating(false)
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

  // Check if user has access to this feature (Tier 3+)
  const hasAccess = userTier !== null && userTier >= 3

  // Show upgrade prompt if user doesn't have access
  if (userTier !== null && !hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold tracking-tight">"Talk Like Me" Style Training</h1>
            <Badge className="bg-purple-600">Tier 3+</Badge>
          </div>
          <p className="text-muted-foreground">
            Train AI to write in your unique voice and style
          </p>
        </div>

        <UpgradePrompt
          featureName='"Talk Like Me" Style Training'
          currentTier={userTier}
          requiredTier={3}
          variant="inline"
          benefits={[
            "AI learns your unique writing voice",
            "Generate content that sounds like you",
            "1 style profile (Tier 3), 3 profiles (Tier 4)",
            "Maintain brand consistency",
            "750 credits/month (Tier 3)"
          ]}
        />
      </div>
    )
  }

  // Also show upgrade prompt if triggered by API call
  if (showUpgrade && tierInfo) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold tracking-tight">"Talk Like Me" Style Training</h1>
          </div>
          <p className="text-muted-foreground">
            Train AI to write in your unique voice and style
          </p>
        </div>

        <UpgradePrompt
          featureName='"Talk Like Me" Style Training'
          currentTier={tierInfo.currentTier}
          requiredTier={tierInfo.requiredTier}
          variant="inline"
          benefits={[
            "AI learns your unique writing voice",
            "Generate content that sounds like you",
            "1 style profile (Tier 3), 3 profiles (Tier 4)",
            "Maintain brand consistency",
            "750 credits/month (Tier 3)"
          ]}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold tracking-tight">"Talk Like Me" Style Training</h1>
              <Badge className="bg-purple-600">Tier 3+</Badge>
            </div>
            <p className="text-muted-foreground">
              Train AI to write in your unique voice and style
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Style Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Writing Style Profile</DialogTitle>
                <DialogDescription>
                  Provide a sample of your writing (100+ words) for AI to learn your style
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Profile Name</Label>
                  <Input
                    placeholder="e.g., Professional LinkedIn Voice"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Description (Optional)</Label>
                  <Input
                    placeholder="When to use this style..."
                    value={profileDescription}
                    onChange={(e) => setProfileDescription(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Sample Content (Min 100 words)</Label>
                  <Textarea
                    placeholder="Paste a sample of your writing here. The more content you provide, the better the AI will learn your style..."
                    value={sampleContent}
                    onChange={(e) => setSampleContent(e.target.value)}
                    rows={10}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Words: {sampleContent.split(/\s+/).filter(w => w).length}/100
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProfile} disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Train AI (5 credits)
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Style Profiles Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first profile to train AI on your unique writing style
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{profile.name}</span>
                  {profile.is_active && (
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  )}
                </CardTitle>
                {profile.description && (
                  <CardDescription>{profile.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Style Characteristics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tone:</span>
                    <Badge variant="secondary">{profile.tone}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vocabulary:</span>
                    <span className="capitalize">{profile.vocabulary_level}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Structure:</span>
                    <span className="capitalize">{profile.sentence_structure}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {profile.use_of_emojis && <Badge variant="outline" className="text-xs">😊 Emojis</Badge>}
                  {profile.use_of_hashtags && <Badge variant="outline" className="text-xs">#️⃣ Hashtags</Badge>}
                  {profile.use_of_questions && <Badge variant="outline" className="text-xs">❓ Questions</Badge>}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedProfile(profile)
                      setShowGenerateDialog(true)
                      setGeneratedContent('')
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generate Content with "{selectedProfile?.name}"</DialogTitle>
            <DialogDescription>
              AI will write in your trained style
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Topic</Label>
              <Input
                placeholder="What do you want to write about?"
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
              />
            </div>

            <div>
              <Label>Platform</Label>
              <Select value={generatePlatform} onValueChange={setGeneratePlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {generatedContent && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Generated Content</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {styleMatchScore}% match
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(generatedContent, 'generated')}
                    >
                      {copiedId === 'generated' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Close
            </Button>
            <Button onClick={handleGenerateContent} disabled={generating || !generateTopic}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate (1 credit)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

