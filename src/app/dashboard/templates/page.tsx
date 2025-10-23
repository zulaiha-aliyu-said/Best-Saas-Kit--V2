"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { REPURPOSE_TEMPLATES, type RepurposeTemplate } from "@/data/templates"
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  Rocket,
  Video,
  Star,
  ArrowRight,
  Filter,
  X,
  Lock,
  Crown
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const categoryIcons = {
  Social: Users,
  Launch: Rocket,
  Community: Users,
  Education: GraduationCap,
  Creator: Video
}

const categoryColors = {
  Social: "from-blue-500 to-blue-600",
  Launch: "from-orange-500 to-red-600",
  Community: "from-purple-500 to-purple-600",
  Education: "from-green-500 to-green-600",
  Creator: "from-pink-500 to-pink-600"
}

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [userTier, setUserTier] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user tier
  useEffect(() => {
    async function fetchUserTier() {
      try {
        const response = await fetch('/api/user/tier')
        if (response.ok) {
          const data = await response.json()
          setUserTier(data.tier || 1)
        }
      } catch (error) {
        console.error('Error fetching user tier:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserTier()
  }, [])

  // Calculate template limits based on tier
  const templateLimits = {
    1: 15,  // Tier 1: 15 premium templates
    2: 40,  // Tier 2: 40 premium templates
    3: 60,  // Tier 3: 60 premium templates
    4: 60,  // Tier 4: Same as Tier 3
  }

  const maxTemplates = templateLimits[userTier as keyof typeof templateLimits] || 15
  const customTemplateLimit = userTier >= 3 ? 'unlimited' : userTier === 2 ? 5 : 0

  const categories = Array.from(new Set(REPURPOSE_TEMPLATES.map(t => t.category)))
  const difficulties = Array.from(new Set(REPURPOSE_TEMPLATES.map(t => t.difficulty)))

  const filteredTemplates = useMemo(() => {
    // Filter templates based on tier access
    const accessibleTemplates = REPURPOSE_TEMPLATES.slice(0, maxTemplates)
    
    return accessibleTemplates.filter(template => {
      const matchesSearch = 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = !selectedCategory || template.category === selectedCategory
      const matchesDifficulty = !selectedDifficulty || template.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [searchQuery, selectedCategory, selectedDifficulty, maxTemplates])

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId)
      } else {
        newFavorites.add(templateId)
      }
      return newFavorites
    })
  }

  const favoriteTemplates = REPURPOSE_TEMPLATES.filter(t => favorites.has(t.id))

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-sm text-primary font-semibold">
            {filteredTemplates.length} / {maxTemplates} Professional Templates
            {userTier >= 2 && ` • ${customTemplateLimit === 'unlimited' ? 'Unlimited' : customTemplateLimit} Custom`}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Content Repurpose Templates</h1>
          {userTier >= 3 && <Crown className="w-8 h-8 text-yellow-500" />}
        </div>
        
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Choose from our curated collection of templates designed to transform your content across platforms. 
          {userTier < 2 && (
            <span className="block mt-2 text-sm">
              <Link href="/redeem" className="text-primary hover:underline font-semibold">
                Upgrade to Tier 2+
              </Link> to unlock 40+ templates + custom templates
            </span>
          )}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search templates by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Category Filters */}
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className="gap-2"
            >
              {category}
              {selectedCategory === category && <X className="h-3 w-3" />}
            </Button>
          ))}

          {/* Difficulty Filters */}
          {difficulties.map(difficulty => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
              className="gap-2"
            >
              {difficulty}
              {selectedDifficulty === difficulty && <X className="h-3 w-3" />}
            </Button>
          ))}

          {(selectedCategory || selectedDifficulty || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory(null)
                setSelectedDifficulty(null)
                setSearchQuery("")
              }}
              className="gap-2"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Favorites Section */}
      {favoriteTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-2xl font-bold">Your Favorites</h2>
            <Badge variant="secondary">{favoriteTemplates.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteTemplates.map(template => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">
              {selectedCategory || selectedDifficulty ? "Filtered Templates" : "All Templates"}
            </h2>
            <Badge variant="secondary">{filteredTemplates.length}</Badge>
          </div>
          
          {filteredTemplates.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Click any template to auto-fill the repurpose form
            </p>
          )}
        </div>

        {filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory(null)
                  setSelectedDifficulty(null)
                  setSearchQuery("")
                }}
              >
                Clear filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard 
                key={template.id} 
                template={template}
                isFavorite={favorites.has(template.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold">Can't find the perfect template?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start from scratch with our flexible repurpose tool. You can always save your custom settings for future use.
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard/repurpose">
              Create Custom Workflow
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function TemplateCard({ 
  template, 
  isFavorite, 
  onToggleFavorite 
}: { 
  template: RepurposeTemplate
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}) {
  const CategoryIcon = categoryIcons[template.category]
  const gradientClass = categoryColors[template.category]

  const buildTemplateUrl = () => {
    const params = new URLSearchParams()
    params.set('templateId', template.id)
    params.set('platforms', template.supportedPlatforms.join(','))
    params.set('tone', template.recommendedTone)
    params.set('length', template.recommendedLength)
    params.set('hashtags', template.includeHashtags.toString())
    params.set('emojis', template.includeEmojis.toString())
    params.set('cta', template.includeCTA.toString())
    return `/dashboard/repurpose?${params.toString()}`
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden">
      {/* Gradient Header */}
      <div className={cn("absolute top-0 left-0 right-0 h-2 bg-gradient-to-r", gradientClass)} />
      
      <CardHeader className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", gradientClass)}>
            <CategoryIcon className="h-6 w-6 text-white" />
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite(template.id)
            }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Star 
              className={cn(
                "h-5 w-5 transition-colors",
                isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
              )} 
            />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {template.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {template.difficulty}
            </Badge>
            {template.badge && (
              <Badge className="text-xs bg-gradient-to-r from-primary to-primary/80">
                {template.badge}
              </Badge>
            )}
          </div>
          
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {template.name}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed line-clamp-2">
            {template.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Platforms */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Platforms
          </p>
          <div className="flex flex-wrap gap-1">
            {template.supportedPlatforms.slice(0, 4).map(platform => (
              <Badge key={platform} variant="outline" className="text-xs capitalize">
                {platform}
              </Badge>
            ))}
            {template.supportedPlatforms.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{template.supportedPlatforms.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Preview
          </p>
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {template.preview.sample}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            variant="default"
            asChild
          >
            <Link href={`/dashboard/templates/customize/${template.id}`}>
              Customize
            </Link>
          </Button>
          <Button 
            className="flex-1" 
            variant="outline"
            asChild
          >
            <Link href={buildTemplateUrl()}>
              Use Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
