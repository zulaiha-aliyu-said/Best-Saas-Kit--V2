'use client';

import { ContentGap, TrendingTopic } from '@/utils/competitorData';
import { getTrendColor } from '@/utils/competitorHelpers';
import { TrendingUp, Lightbulb } from 'lucide-react';

interface CompetitorInsightsProps {
  gaps: ContentGap[];
  trendingTopics: TrendingTopic[];
  aiInsights: string[];
  onViewAllGaps: () => void;
  onGenerateFromGap: (gap: ContentGap) => void;
  onCreateFromTrend: (topic: TrendingTopic) => void;
}

export function CompetitorInsights({
  gaps,
  trendingTopics,
  aiInsights,
  onViewAllGaps,
  onGenerateFromGap,
  onCreateFromTrend
}: CompetitorInsightsProps) {
  const topGaps = gaps.slice(0, 3);
  const topTrends = trendingTopics.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Content Gaps Widget */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">💡 Opportunities</h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            {gaps.length} gaps found
          </span>
        </div>

        <div className="space-y-3">
          {topGaps.map((gap) => (
            <div 
              key={gap.id}
              className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xl">{gap.type === 'topic' ? '🎯' : gap.type === 'format' ? '⚡' : '⏰'}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{gap.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{gap.description}</p>
                  {gap.data.engagementBoost && (
                    <p className="text-xs font-medium text-purple-700">
                      {gap.data.engagementBoost} more engagement
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onGenerateFromGap(gap)}
                className="w-full mt-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded text-xs font-medium hover:shadow-lg transition-all"
              >
                Generate Content
              </button>
            </div>
          ))}
        </div>

        {gaps.length > 3 && (
          <button
            onClick={onViewAllGaps}
            className="w-full mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View All {gaps.length} Gaps →
          </button>
        )}
      </div>

      {/* Trending Topics Widget */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">🔥 Trending Topics</h3>
        </div>

        <div className="space-y-2">
          {topTrends.map((topic) => (
            <div 
              key={topic.tag}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">{topic.tag}</span>
                  {topic.trend === 'exploding' && <span className="text-red-500">🔥</span>}
                </div>
                <div className={`text-xs font-medium ${getTrendColor(topic.trend)}`}>
                  ↑ {topic.growth}% today
                </div>
              </div>
              <button
                onClick={() => onCreateFromTrend(topic)}
                className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-all"
              >
                Create
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights Widget */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">✨ AI Insights</h3>
        </div>

        <div className="space-y-3">
          {aiInsights.map((insight, index) => (
            <div 
              key={index}
              className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2" />
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}













