'use client';

import { useState } from 'react';
import { ContentGap } from '@/utils/competitorData';
import { getGapTypeIcon, getPotentialColor } from '@/utils/competitorHelpers';
import { ChevronDown, ChevronUp, Bookmark, Sparkles } from 'lucide-react';

interface ContentGapCardProps {
  gap: ContentGap;
  onGenerateContent: (gap: ContentGap) => void;
}

export function ContentGapCard({ gap, onGenerateContent }: ContentGapCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const potentialColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border border-red-200',
    medium: 'bg-blue-100 text-blue-700 border border-blue-200',
    low: 'bg-gray-100 text-gray-700 border border-gray-200'
  };

  const potentialLabels: Record<string, string> = {
    high: '🔥 High Viral Potential',
    medium: '💎 Medium Opportunity',
    low: '📊 Low Priority'
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-3xl">{getGapTypeIcon(gap.type)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium capitalize">
                  {gap.type} Gap
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${potentialColors[gap.potential]}`}>
                  {potentialLabels[gap.potential]}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {gap.title}
              </h3>
              <p className="text-sm text-gray-600">
                {gap.description}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-4 text-sm">
          {gap.data.searchVolume && (
            <div>
              <span className="text-gray-500">Search volume: </span>
              <span className="font-medium text-gray-900">{gap.data.searchVolume}/month</span>
            </div>
          )}
          {gap.data.competition && (
            <div>
              <span className="text-gray-500">Competition: </span>
              <span className={`font-medium ${
                gap.data.competition === 'low' ? 'text-green-600' : 
                gap.data.competition === 'medium' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {gap.data.competition}
              </span>
            </div>
          )}
          {gap.data.trend && (
            <div>
              <span className="text-gray-500">Trend: </span>
              <span className="font-medium text-green-600">↑ {gap.data.trend}</span>
            </div>
          )}
          {gap.data.engagementBoost && (
            <div>
              <span className="text-gray-500">Potential boost: </span>
              <span className="font-medium text-purple-600">{gap.data.engagementBoost}</span>
            </div>
          )}
        </div>

        {/* Analysis Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Why this is an opportunity:</p>
          <div className="space-y-1">
            {gap.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5">✅</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Ideas (Expandable) */}
        {gap.contentIdeas && gap.contentIdeas.length > 0 && (
          <div className="border-t pt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-gray-900">
                Content Ideas ({gap.contentIdeas.length})
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {isExpanded && (
              <div className="mt-3 space-y-2">
                {gap.contentIdeas.map((idea, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {index + 1}. {idea}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress Indicator */}
        {gap.data.competitorCoverage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Competitor coverage</span>
              <span className="font-medium text-gray-900">{gap.data.competitorCoverage}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                style={{ width: gap.data.competitorCoverage }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onGenerateContent(gap)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generate Content
          </button>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              isSaved 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : 'border-gray-300 text-gray-600 hover:border-purple-300'
            }`}
            aria-label="Save for later"
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}













