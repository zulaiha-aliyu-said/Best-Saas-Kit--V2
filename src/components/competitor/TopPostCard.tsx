'use client';

import { TopPost } from '@/utils/competitorData';
import { ExternalLink, Sparkles, BarChart3 } from 'lucide-react';
import { formatNumber } from '@/utils/competitorHelpers';

interface TopPostCardProps {
  post: TopPost;
  onCreateSimilar: (post: TopPost) => void;
}

export function TopPostCard({ post, onCreateSimilar }: TopPostCardProps) {
  const handleViewOriginal = () => {
    // In a real app, this would open the actual post URL
    window.open('#', '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-5 space-y-4">
      {/* Post Preview */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-gray-900 line-clamp-3 flex-1">
            {post.preview}
          </p>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium whitespace-nowrap">
            {post.type}
          </span>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-2xl">🔥</span>
          <span className="font-bold text-gray-900">{formatNumber(post.engagement)}</span>
          <span className="text-gray-500">total</span>
        </div>
        <div className="text-gray-500">
          {formatNumber(post.breakdown.likes)} likes •{' '}
          {formatNumber(post.breakdown.comments)} comments •{' '}
          {formatNumber(post.breakdown.shares)} shares
        </div>
      </div>

      <div className="text-xs text-gray-500">{post.date}</div>

      {/* Why It Worked */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-900">💡 Why it worked:</p>
        <div className="grid grid-cols-1 gap-2">
          {post.whyItWorked.map((reason, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="text-gray-700">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onCreateSimilar(post)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Create Similar
        </button>
        <button
          onClick={handleViewOriginal}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          aria-label="View original post"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}












