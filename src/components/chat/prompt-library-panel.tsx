'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bookmark,
  Star,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  X,
  TrendingUp,
  Library,
} from 'lucide-react';

interface PromptLibraryItem {
  id: number;
  title: string;
  prompt: string;
  category: string;
  is_favorite: boolean;
  usage_count: number;
  last_used_at?: string;
}

interface PromptTemplate {
  id: number;
  title: string;
  prompt: string;
  category: string;
  description?: string;
  tags?: string[];
  usage_count: number;
}

interface PromptStats {
  total_prompts: number;
  favorite_prompts: number;
  total_uses: number;
  most_used_category: string | null;
  recent_activity: number;
}

interface PromptLibraryPanelProps {
  onSelectPrompt: (prompt: string) => void;
  onSavePrompt?: () => void;
}

const categories = [
  { value: 'all', label: 'All', icon: '📚' },
  { value: 'content_ideas', label: 'Content Ideas', icon: '💡' },
  { value: 'research', label: 'Research', icon: '🔍' },
  { value: 'writing', label: 'Writing', icon: '✍️' },
  { value: 'strategy', label: 'Strategy', icon: '🎯' },
  { value: 'hooks', label: 'Hooks', icon: '🪝' },
  { value: 'general', label: 'General', icon: '⚡' },
];

export default function PromptLibraryPanel({ onSelectPrompt, onSavePrompt }: PromptLibraryPanelProps) {
  const [activeTab, setActiveTab] = useState<'my_prompts' | 'templates'>('my_prompts');
  const [myPrompts, setMyPrompts] = useState<PromptLibraryItem[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [stats, setStats] = useState<PromptStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user prompts
  const fetchMyPrompts = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (favoritesOnly) params.set('favorites', 'true');
      if (searchQuery) params.set('search', searchQuery);
      params.set('stats', 'true');

      const response = await fetch(`/api/prompts?${params.toString()}`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMyPrompts(data.prompts || []);
        if (data.stats) setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load prompts');
        setMyPrompts([]); // Set empty array on error
      }
    } catch (err: any) {
      console.error('Error fetching prompts:', err);
      setError(err.name === 'TimeoutError' ? 'Request timed out' : 'Failed to load prompts');
      setMyPrompts([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);

      const response = await fetch(`/api/prompts/templates?${params.toString()}`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates || []);
      } else {
        setError(data.error || 'Failed to load templates');
        setTemplates([]); // Set empty array on error
      }
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.name === 'TimeoutError' ? 'Request timed out' : 'Failed to load templates');
      setTemplates([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (activeTab === 'my_prompts') {
      fetchMyPrompts();
    } else {
      fetchTemplates();
    }
  }, [activeTab]); // Only refetch when tab changes

  // Refetch when filters change
  useEffect(() => {
    if (activeTab === 'my_prompts') {
      const timer = setTimeout(() => fetchMyPrompts(), 300); // Debounce
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => fetchTemplates(), 300); // Debounce
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, favoritesOnly, searchQuery]);

  // Toggle favorite
  const toggleFavorite = async (promptId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !currentStatus }),
      });

      if (response.ok) {
        await fetchMyPrompts();
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Delete prompt
  const deletePrompt = async (promptId: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMyPrompts();
      }
    } catch (err) {
      console.error('Error deleting prompt:', err);
    }
  };

  // Use prompt
  const usePrompt = async (prompt: string, isTemplate: boolean, id?: number) => {
    onSelectPrompt(prompt);

    // Track usage
    if (isTemplate && id) {
      try {
        await fetch('/api/prompts/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: id }),
        });
      } catch (err) {
        console.error('Error tracking template usage:', err);
      }
    } else if (!isTemplate && id) {
      // Refresh to update usage count
      setTimeout(() => fetchMyPrompts(), 500);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="p-4 space-y-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Library className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Prompt Library</h2>
              <p className="text-xs text-muted-foreground">
                {activeTab === 'templates' ? 'Pre-built templates' : 'Your saved prompts'}
              </p>
            </div>
          </div>
          {onSavePrompt && (
            <Button size="sm" onClick={onSavePrompt} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Save
            </Button>
          )}
        </div>

        {/* Stats */}
        {stats && activeTab === 'my_prompts' && (
          <div className="grid grid-cols-3 gap-2">
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-3 border border-blue-200/50 dark:border-blue-800/50">
              <div className="relative z-10">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_prompts}</div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Saved</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-3 border border-yellow-200/50 dark:border-yellow-800/50">
              <div className="relative z-10">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.favorite_prompts}</div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Favorites</div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 p-3 border border-green-200/50 dark:border-green-800/50">
              <div className="relative z-10">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.total_uses}</div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Uses</div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b bg-muted/30 h-11">
          <TabsTrigger value="my_prompts" className="flex-1 gap-2 data-[state=active]:shadow-sm">
            <Bookmark className="h-4 w-4" />
            My Prompts
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1 gap-2 data-[state=active]:shadow-sm">
            <Sparkles className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Category Filter */}
        <div className="px-3 py-2 border-b bg-background/50">
          <ScrollArea className="w-full" type="scroll">
            <div className="flex gap-1.5 pb-1">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  size="sm"
                  variant={selectedCategory === cat.value ? 'default' : 'ghost'}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`whitespace-nowrap h-8 px-3 text-xs font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'shadow-sm'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="mr-1.5">{cat.icon}</span>
                  {cat.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* My Prompts Tab */}
        <TabsContent value="my_prompts" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              {/* Favorites Filter */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={favoritesOnly ? 'default' : 'outline'}
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className="h-8 gap-1.5"
                >
                  <Star className={`h-3.5 w-3.5 ${favoritesOnly ? 'fill-current' : ''}`} />
                  Favorites
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchMyPrompts}
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border bg-card p-3 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-full mb-1" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-3">
                    <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Failed to load</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                  <Button size="sm" variant="outline" onClick={fetchMyPrompts} className="mt-3">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && myPrompts.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4">
                    <Bookmark className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">No prompts yet</h3>
                  <p className="text-xs text-muted-foreground mb-4 max-w-[200px] mx-auto">
                    Save your favorite prompts for quick access later
                  </p>
                  {onSavePrompt && (
                    <Button size="sm" onClick={onSavePrompt} className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Save Your First Prompt
                    </Button>
                  )}
                </div>
              )}

              {/* Prompt Cards */}
              {!isLoading && myPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50 cursor-pointer bg-card"
                  onClick={() => usePrompt(prompt.prompt, false, prompt.id)}
                >
                  <div className="p-3">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 line-clamp-1">{prompt.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {prompt.prompt}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(prompt.id, prompt.is_favorite);
                        }}
                        className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                      >
                        <Star
                          className={`h-4 w-4 transition-all ${
                            prompt.is_favorite
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                          {categories.find((c) => c.value === prompt.category)?.icon}
                          <span className="ml-1">{prompt.category}</span>
                        </Badge>
                        {prompt.usage_count > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            {prompt.usage_count}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePrompt(prompt.id);
                        }}
                        className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              {/* Loading State */}
              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-lg border bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 p-3 animate-pulse">
                      <div className="h-4 bg-muted/50 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted/50 rounded w-full mb-1" />
                      <div className="h-3 bg-muted/50 rounded w-5/6" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-3">
                    <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Failed to load</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                  <Button size="sm" variant="outline" onClick={fetchTemplates} className="mt-3">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && templates.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4">
                    <Sparkles className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">No templates found</h3>
                  <p className="text-xs text-muted-foreground">
                    Try selecting a different category
                  </p>
                </div>
              )}

              {/* Template Cards */}
              {!isLoading && templates.map((template) => (
                <Card
                  key={template.id}
                  className="group relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-blue-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-blue-950/20"
                  onClick={() => usePrompt(template.prompt, true, template.id)}
                >
                  {/* Sparkle decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-2xl" />

                  <div className="relative p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="shrink-0 p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-0.5 line-clamp-1">
                          {template.title}
                        </h4>
                        {template.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pl-1 mb-2">
                      <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed italic">
                        "{template.prompt}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-purple-100 dark:bg-purple-900/30">
                          {categories.find((c) => c.value === template.category)?.icon}
                          <span className="ml-1">{template.category}</span>
                        </Badge>
                        {template.tags && template.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-purple-200 dark:border-purple-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {template.usage_count > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          {template.usage_count}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
