"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Play,
  ThumbsUp,
  Eye,
  Clock,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  ArrowUpRight
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UpgradePrompt } from "@/components/upgrade/UpgradePrompt"
import Link from "next/link"
import Image from "next/image"

interface YouTubeVideo {
  id: string
  title: string
  channelName: string
  channelId: string
  channelUrl: string
  thumbnail: string
  thumbnailHigh: string
  views: number
  viewsFormatted: string
  likes: number
  likesFormatted: string
  publishedAt: string
  publishedRelative: string
  duration: string
  description: string
  tags: string[]
  category: string
  trending: boolean
  trendingRank: number
  engagement: number
  url: string
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'tech', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'gaming', label: 'Gaming' }
]

export default function YouTubeTrendingPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('US')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [tierInfo, setTierInfo] = useState<{ currentTier: number; requiredTier: number } | null>(null)

  useEffect(() => {
    fetchTrendingVideos()
  }, [category, region])

  const fetchTrendingVideos = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/trending/youtube?category=${category}&region=${region}`
      )
      const data = await response.json()

      // Handle tier restriction
      if (response.status === 403 && data.code === 'TIER_RESTRICTED') {
        setTierInfo({ currentTier: data.currentTier, requiredTier: data.requiredTier })
        setShowUpgradePrompt(true)
        setLoading(false)
        return
      }

      if (data.success) {
        setVideos(data.videos)
      }
    } catch (error) {
      console.error('Error fetching trending videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async (video: YouTubeVideo) => {
    try {
      await navigator.clipboard.writeText(video.url)
      setCopiedId(video.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.channelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (showUpgradePrompt && tierInfo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">YouTube Trending Videos</h1>
          <p className="text-muted-foreground">
            Discover trending content with thumbnails for inspiration
          </p>
        </div>

        <UpgradePrompt
          featureName="YouTube Trending Videos"
          currentTier={tierInfo.currentTier}
          requiredTier={tierInfo.requiredTier}
          variant="inline"
          benefits={[
            "Access trending YouTube videos with thumbnails",
            "Filter by category and region",
            "View engagement metrics and stats",
            "Copy video links for content inspiration",
            "300 credits/month (Tier 2)"
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
          <TrendingUp className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold tracking-tight">YouTube Trending Videos</h1>
        </div>
        <p className="text-muted-foreground">
          Discover what's trending on YouTube to inspire your content strategy
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Region */}
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">🇺🇸 United States</SelectItem>
                <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                <SelectItem value="IN">🇮🇳 India</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Trending Videos</CardDescription>
            <CardTitle className="text-3xl">{filteredVideos.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-3xl">
              {(filteredVideos.reduce((sum, v) => sum + v.views, 0) / 1000000).toFixed(1)}M
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Likes</CardDescription>
            <CardTitle className="text-3xl">
              {(filteredVideos.reduce((sum, v) => sum + v.likes, 0) / 1000).toFixed(0)}K
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Engagement</CardDescription>
            <CardTitle className="text-3xl">
              {(filteredVideos.reduce((sum, v) => sum + v.engagement, 0) / filteredVideos.length).toFixed(2)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, index) => (
            <Card key={video.id} className="group hover:shadow-lg transition-all overflow-hidden">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      <Play className="w-5 h-5 mr-2" />
                      Watch on YouTube
                    </a>
                  </Button>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>

                {/* Trending Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-red-600 text-white border-0 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    #{video.trendingRank}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-base line-clamp-2 leading-snug">
                  {video.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span>{video.channelName}</span>
                  <span className="text-xs">•</span>
                  <span>{video.publishedRelative}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{video.viewsFormatted}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{video.likesFormatted}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span>{video.engagement}%</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {video.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {video.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(video)}
                  >
                    {copiedId === video.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

