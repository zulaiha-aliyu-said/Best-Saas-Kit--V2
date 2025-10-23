'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Target, Trophy, Loader2 } from 'lucide-react';
import { PerformanceCharts } from './PerformanceCharts';
import { AdvancedContentGaps } from './AdvancedContentGaps';
import { AdvancedTopPosts } from './AdvancedTopPosts';
import { toast } from 'sonner';

interface AdvancedAnalyticsProps {
  competitorId: string;
  username: string;
  platform: string;
  userId: string; // Add userId prop instead of using useSession
  isLoading?: boolean;
}

type TabType = 'charts' | 'gaps' | 'posts';

interface AnalyticsData {
  postingPattern: any[];
  contentTypes: any[];
  engagementTrend: any[];
  bestTimes: any[];
  stats: {
    avgEngagement: number;
    trendPercentage: number;
    totalPosts: number;
    peakDay: string;
    peakTime: string;
  };
  topPosts: any[];
  contentGaps: any[];
}

export function AdvancedAnalytics({ 
  competitorId, 
  username, 
  platform,
  userId,
  isLoading: initialLoading = false 
}: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('charts');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data on mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId || !competitorId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/competitors/${competitorId}/analytics?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();

        console.log('[AdvancedAnalytics] API Response:', {
          success: data.success,
          hasAnalytics: !!data.analytics,
          message: data.message,
          analyticsKeys: data.analytics ? Object.keys(data.analytics) : []
        });

        if (data.success && data.analytics) {
          console.log('[AdvancedAnalytics] Setting analytics data:', data.analytics);
          setAnalyticsData(data.analytics);
        } else if (data.message) {
          console.log('[AdvancedAnalytics] No analytics data, message:', data.message);
          setError(data.message);
          toast.info(data.message);
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Failed to load analytics. Please try refreshing.');
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [competitorId, userId]);

  const tabs = [
    { 
      id: 'charts' as TabType, 
      label: 'Performance Charts', 
      icon: BarChart3,
      emoji: '📊',
      description: 'Posting patterns, engagement trends'
    },
    { 
      id: 'gaps' as TabType, 
      label: 'Content Gaps', 
      icon: Target,
      emoji: '💡',
      description: 'AI-powered opportunities'
    },
    { 
      id: 'posts' as TabType, 
      label: 'Top Posts', 
      icon: Trophy,
      emoji: '🏆',
      description: 'Best performing content'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          🔍 Analyzing {username}...
        </h3>
        <p className="text-gray-400 text-center max-w-md">
          Fetching posts, calculating metrics, and identifying opportunities. This may take 30-60 seconds.
        </p>
        <div className="mt-6 space-y-2 text-sm text-gray-500">
          <p>✓ Fetching recent posts...</p>
          <p>✓ Analyzing engagement patterns...</p>
          <p className="text-purple-400">⏳ Identifying content gaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🚀 Advanced Analytics
            </h2>
            <p className="text-gray-400 mt-1">
              Deep insights into <span className="text-purple-400 font-medium">{username}</span>'s content strategy on {platform}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Live Data</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{tab.emoji}</span>
              <div className="text-left">
                <div className="font-bold">{tab.label}</div>
                <div className={`text-xs ${activeTab === tab.id ? 'text-purple-100' : 'text-gray-400'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {activeTab === 'charts' && analyticsData && (
          <PerformanceCharts 
            data={{
              postingPattern: analyticsData.postingPattern,
              contentTypes: analyticsData.contentTypes,
              engagementTrend: analyticsData.engagementTrend,
              bestTimes: analyticsData.bestTimes,
              stats: analyticsData.stats,
            }}
          />
        )}
        
        {activeTab === 'gaps' && analyticsData && (
          <AdvancedContentGaps 
            contentGaps={analyticsData.contentGaps}
            competitorId={competitorId}
          />
        )}
        
        {activeTab === 'posts' && analyticsData && (
          <AdvancedTopPosts 
            topPosts={analyticsData.topPosts}
            competitorId={competitorId}
          />
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
            <div className="text-red-400 text-lg mb-2">⚠️ {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Ready to apply these insights?
            </h3>
            <p className="text-gray-400 text-sm">
              Use what you learned to create better content and beat your competition
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105 whitespace-nowrap">
            Generate Content →
          </button>
        </div>
      </div>
    </div>
  );
}


