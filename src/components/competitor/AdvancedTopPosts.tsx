'use client';

import { useState } from 'react';
import { Trophy, Heart, MessageCircle, Share2, TrendingUp, Sparkles, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface TopPost {
  id: string;
  content: string;
  type: string;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    totalEngagement: number;
  };
  posted: string;
  url?: string;
  thumbnail?: string;
  performanceScore: number;
  whyItWorked?: {
    category: string;
    reasons: string[];
  }[];
}

interface AdvancedTopPostsProps {
  topPosts?: TopPost[];
  competitorId: string;
}

export function AdvancedTopPosts({ topPosts = [], competitorId }: AdvancedTopPostsProps) {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video' | 'carousel' | 'reel' | 'text'>('all');

  // Mock data for demonstration (when no real data available)
  const mockPosts: TopPost[] = [
    {
      id: 'post_1',
      content: 'The Amazon rainforest breathes. Watch as morning mist rises through the canopy, revealing a world few have seen. 🌿 This ancient ecosystem produces 20% of Earth\'s oxygen—yet it\'s disappearing at an alarming rate. Swipe to see the devastating before/after. 📸 @photographer',
      type: 'carousel',
      metrics: {
        likes: 1245000,
        comments: 45300,
        shares: 23400,
        saves: 89000,
        totalEngagement: 1402700
      },
      posted: '2 days ago',
      thumbnail: '🌿',
      whyItWorked: [
        {
          category: 'Hook Strategy',
          reasons: [
            'Emotional opening: "The Amazon breathes"',
            'Created curiosity with "world few have seen"',
            'Used urgency: "disappearing at an alarming rate"'
          ]
        },
        {
          category: 'Content Structure',
          reasons: [
            'Carousel format kept viewers engaged longer',
            'Before/after comparison drove saves (+89K)',
            'Educational value (20% of oxygen fact)',
            'Strong call-to-action to swipe'
          ]
        },
        {
          category: 'Timing & Format',
          reasons: [
            'Posted Thursday 3:15 PM (peak time)',
            'Carousel format perfect for storytelling',
            'Photographer credit built community trust'
          ]
        }
      ],
      performanceScore: 98
    },
    {
      id: 'post_2',
      content: 'Scientists just discovered this octopus can edit its own RNA to adapt to different temperatures. Nature\'s ultimate biohacker 🐙 Sound on for the full story. [Video]',
      type: 'reel',
      metrics: {
        likes: 890000,
        comments: 32100,
        shares: 45200,
        saves: 67000,
        totalEngagement: 1034300
      },
      posted: '5 days ago',
      thumbnail: '🐙',
      whyItWorked: [
        {
          category: 'Hook Strategy',
          reasons: [
            'Led with surprising discovery',
            'Used relatable term "biohacker"',
            '"Sound on" increased watch time',
            'Created instant curiosity'
          ]
        },
        {
          category: 'Format Optimization',
          reasons: [
            'Video format drives 3.2x more shares',
            'Short-form content (45 seconds)',
            'Sound design enhanced storytelling',
            'Perfect for mobile viewing'
          ]
        },
        {
          category: 'Engagement Triggers',
          reasons: [
            'Unique/rare content (high save rate)',
            'Scientific credibility',
            'Visual wow factor'
          ]
        }
      ],
      performanceScore: 96
    },
    {
      id: 'post_3',
      content: 'This photographer waited 117 days in -40°F temperatures to capture a single moment. The result? Pure magic. ❄️✨ Behind every NatGeo photo is a story of dedication. Thread 🧵👇',
      type: 'photo',
      metrics: {
        likes: 756000,
        comments: 28700,
        shares: 19400,
        saves: 54000,
        totalEngagement: 858100
      },
      posted: '1 week ago',
      thumbnail: '❄️',
      whyItWorked: [
        {
          category: 'Storytelling',
          reasons: [
            'Specific detail (117 days, -40°F)',
            'Behind-the-scenes angle',
            'Emotional payoff: "Pure magic"',
            'Thread format promised more value'
          ]
        },
        {
          category: 'Human Element',
          reasons: [
            'Highlighted dedication and sacrifice',
            'Made audience appreciate the work',
            'Built respect for photographers'
          ]
        },
        {
          category: 'Engagement Mechanics',
          reasons: [
            'Thread format increased time on post',
            'Question implied: "What did they capture?"',
            'Aspirational content'
          ]
        }
      ],
      performanceScore: 92
    },
    {
      id: 'post_4',
      content: 'POV: You\'re a baby penguin taking your first swim in Antarctica 🐧💙 Watch what happens when big waves come... [Reel]',
      type: 'reel',
      metrics: {
        likes: 923000,
        comments: 41200,
        shares: 67800,
        saves: 45000,
        totalEngagement: 1077000
      },
      posted: '1 week ago',
      thumbnail: '🐧',
      whyItWorked: [
        {
          category: 'Format Innovation',
          reasons: [
            'POV format is highly engaging',
            'Created immediate empathy',
            'Suspenseful cliffhanger',
            'Perfect for Reels algorithm'
          ]
        },
        {
          category: 'Emotional Appeal',
          reasons: [
            'Baby animals = instant engagement',
            'Vulnerability creates connection',
            'Joyful, positive content',
            'Shareable feel-good moment'
          ]
        },
        {
          category: 'Technical Execution',
          reasons: [
            'Slow-motion enhanced drama',
            'Natural sound added authenticity',
            'Short length (28 seconds) = high completion rate'
          ]
        }
      ],
      performanceScore: 95
    },
    {
      id: 'post_5',
      content: 'The Northern Lights aren\'t just beautiful—they\'re Earth\'s natural defense system against solar radiation. Here\'s the science behind the spectacle 🌌 [Carousel: 8 slides]',
      type: 'carousel',
      metrics: {
        likes: 678000,
        comments: 19800,
        shares: 34200,
        saves: 125000,
        totalEngagement: 857000
      },
      posted: '2 weeks ago',
      thumbnail: '🌌',
      whyItWorked: [
        {
          category: 'Educational Hook',
          reasons: [
            'Challenged common perception',
            'Combined beauty with science',
            'Promised explanation',
            'High save rate (educational content)'
          ]
        },
        {
          category: 'Content Strategy',
          reasons: [
            '8-slide carousel = perfect depth',
            'Mix of visuals and facts',
            'Each slide built on previous',
            'Finale tied back to opening'
          ]
        },
        {
          category: 'Audience Alignment',
          reasons: [
            'Appeals to science enthusiasts',
            'Shareable fun facts',
            'Stunning visuals',
            'Educational value = saves'
          ]
        }
      ],
      performanceScore: 94
    }
  ];

  // Use real data if available, otherwise use mock data
  const posts = topPosts.length > 0 ? topPosts : mockPosts;
  
  const filteredPosts = filterType === 'all' 
    ? posts 
    : posts.filter(post => post.type.toLowerCase() === filterType);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'photo': return '📸';
      case 'video': return '🎥';
      case 'carousel': return '📱';
      case 'reel': return '🎬';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'photo': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'video': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'carousel': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'reel': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Top Performing Content
            </h2>
            <p className="text-gray-400 mt-1">
              Learn from their {posts.length} best posts • Average engagement: {formatNumber(posts.reduce((sum, p) => sum + p.metrics.totalEngagement, 0) / posts.length)}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'photo', 'video', 'carousel', 'reel'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === type
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {type === 'all' ? '🎯' : getTypeEmoji(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
              {type !== 'all' && ` (${posts.filter(p => p.type.toLowerCase() === type).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Top Posts Grid */}
      <div className="space-y-4">
        {filteredPosts.map((post, index) => {
          const isExpanded = selectedPost === post.id;
          
          return (
            <div
              key={post.id}
              className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden transition-all duration-300 ${
                isExpanded ? 'shadow-2xl ring-2 ring-yellow-500/20' : 'hover:shadow-xl hover:border-gray-600'
              }`}
            >
              {/* Main Content */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Ranking Badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-purple-500 to-pink-500'
                    } flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                  </div>

                  {/* Post Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 ${getTypeColor(post.type)} border rounded-full text-xs font-medium`}>
                        {getTypeEmoji(post.type)} {post.type.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-sm">{post.posted}</span>
                      <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold text-sm">{post.performanceScore}/100</span>
                      </div>
                    </div>

                    <p className="text-white text-base mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-pink-400 mb-1">
                          <Heart className="w-4 h-4" />
                          <span className="text-xs font-medium">Likes</span>
                        </div>
                        <div className="text-white font-bold">{formatNumber(post.metrics.likes)}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Comments</span>
                        </div>
                        <div className="text-white font-bold">{formatNumber(post.metrics.comments)}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-400 mb-1">
                          <Share2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Shares</span>
                        </div>
                        <div className="text-white font-bold">{formatNumber(post.metrics.shares)}</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                          <span className="text-lg">🔖</span>
                          <span className="text-xs font-medium">Saves</span>
                        </div>
                        <div className="text-white font-bold">{formatNumber(post.metrics.saves)}</div>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-yellow-400 mb-1">
                          <Trophy className="w-4 h-4" />
                          <span className="text-xs font-medium">Total</span>
                        </div>
                        <div className="text-white font-bold">{formatNumber(post.metrics.totalEngagement)}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedPost(isExpanded ? null : post.id)}
                        className="flex-1 min-w-[200px] px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {isExpanded ? 'Hide' : 'See Why It Worked'}
                      </button>
                      <button
                        onClick={() => copyContent(post.content)}
                        className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      {post.url && (
                        <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Analysis */}
              {isExpanded && (
                <div className="border-t border-gray-700/50 p-6 bg-gray-900/30 animate-fadeIn">
                  {(post as any).whyItWorked ? (
                    <>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        Why This Post Performed So Well
                      </h3>

                      <div className="space-y-4">
                        {(post as any).whyItWorked.map((category: any, idx: number) => (
                          <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                            <h4 className="text-purple-400 font-bold mb-3">{category.category}</h4>
                            <div className="space-y-2">
                              {category.reasons.map((reason: string, rIdx: number) => (
                                <div key={rIdx} className="flex items-start gap-2">
                                  <span className="text-green-400 mt-1">✓</span>
                                  <span className="text-gray-300 text-sm">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-purple-400 font-bold mb-2">
                          <Lightbulb className="w-5 h-5" />
                          Key Takeaway
                        </div>
                        <p className="text-gray-300 text-sm">
                          This post succeeded by combining {(post as any).whyItWorked.length} critical elements: compelling storytelling, optimal format choice, and strategic timing. Consider applying these insights to your content strategy.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">
                        💡 AI-powered insights coming soon! This will show you exactly why this post performed well.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const Lightbulb = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);


