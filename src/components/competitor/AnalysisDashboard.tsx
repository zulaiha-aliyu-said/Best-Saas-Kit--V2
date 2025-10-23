'use client';

import { useState } from 'react';
import { Competitor } from '@/hooks/useCompetitors';
import { 
  formatRelativeTime, 
  getPlatformEmoji, 
  formatNumber,
  getPlatformColor,
  formatEngagementRate 
} from '@/utils/competitorHelpers';
import { X, Loader2, TrendingUp, Users, FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { AdvancedAnalytics } from './AdvancedAnalytics';

interface AnalysisDashboardProps {
  competitor: Competitor;
  isOpen: boolean;
  onClose: () => void;
  onGenerateContent?: (gap: any) => void;
  onCreateSimilar?: (post: any) => void;
  onDelete: (id: string) => void;
  userId: string; // Add userId prop
}

export function AnalysisDashboard({
  competitor,
  isOpen,
  onClose,
  onDelete,
  userId
}: AnalysisDashboardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to stop tracking ${competitor.name}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(competitor.id);
      toast.success('Competitor removed');
      onClose();
    } catch (error) {
      toast.error('Failed to delete competitor');
    } finally {
      setIsDeleting(false);
    }
  };

  const gradientBg = getPlatformColor(competitor.platform);
  const engagementRate = formatEngagementRate(competitor.engagement_rate);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn overflow-hidden">
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradientBg} flex items-center justify-center text-white font-bold text-2xl`}>
                {competitor.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {competitor.name}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span>{getPlatformEmoji(competitor.platform)}</span>
                  <span>{competitor.username}</span>
                  {competitor.is_verified && <span className="text-blue-500">✓</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Last analyzed */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {competitor.last_analyzed_at 
              ? `Last analyzed ${formatRelativeTime(new Date(competitor.last_analyzed_at).getTime())}` 
              : 'Not analyzed yet'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Followers */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Followers</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(competitor.followers_count)}
                </p>
              </div>

              {/* Following */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Following</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(competitor.following_count)}
                </p>
              </div>

              {/* Posts */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(competitor.posts_count)}
                </p>
              </div>

              {/* Engagement */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {engagementRate}%
                </p>
              </div>
            </div>

            {/* Bio */}
            {competitor.bio && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Bio</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {competitor.bio}
                </p>
              </div>
            )}

            {/* Advanced Analytics */}
            <AdvancedAnalytics 
              competitorId={competitor.id}
              username={competitor.username}
              platform={competitor.platform}
              userId={userId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
