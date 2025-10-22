'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { Competitor, ContentGap } from '@/utils/competitorData';
import { getCompetitors } from '@/utils/competitorHelpers';

interface GapInfo {
  gapId: string;
  title: string;
  description: string;
  type: string;
}

interface CompetitorIntegrationWidgetProps {
  onTopicSelect?: (topic: string) => void;
}

export function CompetitorIntegrationWidget({ onTopicSelect }: CompetitorIntegrationWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [gapInfo, setGapInfo] = useState<GapInfo | null>(null);

  useEffect(() => {
    // Load competitors from localStorage
    const stored = getCompetitors();
    setCompetitors(stored);

    // Check if there's a gap being filled
    if (typeof window !== 'undefined') {
      const gapData = localStorage.getItem('repurposeai_gap');
      if (gapData) {
        setGapInfo(JSON.parse(gapData));
        // Clear it after reading
        localStorage.removeItem('repurposeai_gap');
      }
    }
  }, []);

  if (competitors.length === 0 && !gapInfo) return null;

  // Collect all trending topics from all competitors
  const allTrendingTopics = competitors.flatMap(c => 
    c.trendingTopics.slice(0, 2)
  ).slice(0, 3);

  // Collect all content gaps
  const allGaps = competitors.flatMap(c => 
    c.contentGaps.filter(g => g.potential === 'high').slice(0, 1)
  ).slice(0, 3);

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl overflow-hidden shadow-md">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">🕵️</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900">Competitor Insights</h3>
              <p className="text-xs text-gray-600">
                {gapInfo 
                  ? `Filling gap: ${gapInfo.title}`
                  : `${allGaps.length} content gaps • ${allTrendingTopics.length} hot topics`
                }
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="px-6 pb-6 space-y-4">
            {/* Gap Being Filled */}
            {gapInfo && (
              <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-900">Filling Content Gap</span>
                </div>
                <p className="text-sm text-green-800 mb-1 font-medium">
                  {gapInfo.title}
                </p>
                <p className="text-xs text-green-700">
                  {gapInfo.description}
                </p>
                <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
                  💡 This content fills a gap your competitors are missing! Expected higher engagement.
                </div>
              </div>
            )}

            {/* Hot Topics */}
            {allTrendingTopics.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                  🔥 Hot Topics Right Now
                </h4>
                <div className="space-y-2">
                  {allTrendingTopics.map((topic, index) => (
                    <button
                      key={`${topic.tag}-${index}`}
                      onClick={() => onTopicSelect && onTopicSelect(topic.tag)}
                      className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all group"
                    >
                      <div className="text-left">
                        <span className="font-medium text-gray-900 text-sm">{topic.tag}</span>
                        <p className="text-xs text-purple-600">↑ {topic.growth}% growth today</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">Use</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content Gaps */}
            {allGaps.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                  💡 Content Opportunities
                </h4>
                <div className="space-y-2">
                  {allGaps.map((gap, index) => (
                    <div
                      key={`${gap.id}-${index}`}
                      className="p-3 bg-white rounded-lg border border-purple-100"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{gap.type === 'topic' ? '🎯' : gap.type === 'format' ? '⚡' : '⏰'}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{gap.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{gap.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View All Link */}
            <Link
              href="/dashboard/competitors"
              className="block w-full text-center py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
            >
              View All Competitor Analysis →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}



