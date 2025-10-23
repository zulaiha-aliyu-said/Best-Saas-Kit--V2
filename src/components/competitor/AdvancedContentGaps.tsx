'use client';

import { useState } from 'react';
import { Target, Lightbulb, Clock, TrendingUp, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Gap {
  id: string;
  gap_type: string;
  title: string;
  description: string;
  potential: string;
  potential_score?: number;
  insights?: any;
  content_ideas?: any;
}

interface AdvancedContentGapsProps {
  contentGaps?: Gap[];
  competitorId: string;
}

export function AdvancedContentGaps({ contentGaps = [], competitorId }: AdvancedContentGapsProps) {
  const [expandedGap, setExpandedGap] = useState<string | null>(null);
  const router = useRouter();

  // Use real data from DB or show empty state
  const gaps = contentGaps.length > 0 ? contentGaps : [];

  const getPotentialColor = (potential: string) => {
    switch (potential?.toLowerCase()) {
      case 'high': return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      case 'medium': return 'from-blue-500/20 to-purple-500/20 border-blue-500/30';
      case 'low': return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  const getPotentialBadge = (potential: string) => {
    switch (potential?.toLowerCase()) {
      case 'high': return { label: '🔥 High Viral Potential', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'medium': return { label: '💎 Medium Opportunity', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'low': return { label: '📊 Low Priority', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
      default: return { label: '📊 Unknown', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'topic': return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      case 'format': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'timing': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'strategy': return <Target className="w-5 h-5 text-pink-400" />;
      default: return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleGenerateContent = (gap: Gap) => {
    // Store gap info for repurpose page
    if (typeof window !== 'undefined') {
      localStorage.setItem('repurposeai_gap', JSON.stringify({
        title: gap.title,
        description: gap.description,
        from: 'competitor-analysis'
      }));
    }
    router.push('/dashboard/repurpose');
  };

  if (gaps.length === 0) {
    return (
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-white mb-2">No Content Gaps Detected Yet</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Content gap analysis requires competitor posts. Make sure the competitor has been analyzed with posts data.
        </p>
        <div className="text-sm text-gray-500">
          💡 Tip: Content gaps are automatically generated when analyzing competitors
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-400" />
              Content Opportunities
            </h2>
            <p className="text-gray-400 mt-1">
              AI-powered gap analysis reveals {gaps.length} high-impact opportunities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-medium">
              {gaps.filter(g => g.potential?.toLowerCase() === 'high').length} High Priority
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-yellow-400 text-sm font-medium mb-1">📚 Topic Gaps</div>
            <div className="text-white text-lg font-bold">
              {gaps.filter(g => g.gap_type === 'topic').length} opportunities
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-purple-400 text-sm font-medium mb-1">🎨 Format Gaps</div>
            <div className="text-white text-lg font-bold">
              {gaps.filter(g => g.gap_type === 'format').length} opportunities
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-blue-400 text-sm font-medium mb-1">⏰ Timing Gaps</div>
            <div className="text-white text-lg font-bold">
              {gaps.filter(g => g.gap_type === 'timing').length} opportunities
            </div>
          </div>
        </div>
      </div>

      {/* Gap Cards */}
      <div className="space-y-4">
        {gaps.map((gap) => {
          const isExpanded = expandedGap === gap.id;
          const badge = getPotentialBadge(gap.potential);
          const insights = gap.insights || {};
          const reasons = insights.reasons || [];
          const actionItems = insights.actionItems || [];
          const dataPoints = insights.dataPoints || [];

          return (
            <div
              key={gap.id}
              className={`bg-gradient-to-r ${getPotentialColor(gap.potential)} border rounded-xl overflow-hidden transition-all duration-300 ${
                isExpanded ? 'shadow-2xl' : 'hover:shadow-xl'
              }`}
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-gray-800/50 rounded-lg">
                      {getTypeIcon(gap.gap_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded text-xs font-medium capitalize">
                          {gap.gap_type} Gap
                        </span>
                        <span className={`px-3 py-1 ${badge.className} border rounded-full text-xs font-medium`}>
                          {badge.label}
                        </span>
                        {gap.potential_score && (
                          <span className="text-xs text-gray-400">
                            Score: {gap.potential_score}/100
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {gap.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {gap.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedGap(isExpanded ? null : gap.id)}
                    className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Data Points */}
                {dataPoints.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {dataPoints.map((point: any, idx: number) => (
                      <div key={idx} className="bg-gray-800/30 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">{point.label}</div>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-bold">{point.value}</span>
                          {point.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                          {point.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-700/50 p-6 bg-gray-900/30 space-y-4 animate-fadeIn">
                  {/* Insights */}
                  {reasons.length > 0 && (
                    <div>
                      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        Why This is an Opportunity
                      </h4>
                      <div className="space-y-2">
                        {reasons.map((insight: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-400 mt-0.5">✓</span>
                            <span className="text-gray-300">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  {actionItems.length > 0 && (
                    <div>
                      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        Recommended Actions
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {actionItems.map((action: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 bg-gray-800/50 rounded-lg p-3">
                            <span className="text-purple-400 font-bold text-sm">{idx + 1}.</span>
                            <span className="text-gray-300 text-sm">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleGenerateContent(gap)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Content for This Gap
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
