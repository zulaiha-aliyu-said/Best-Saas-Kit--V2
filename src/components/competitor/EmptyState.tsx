'use client';

import { Target } from 'lucide-react';

interface EmptyStateProps {
  onAddCompetitor: () => void;
}

export function EmptyState({ onAddCompetitor }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-5xl">🕵️</span>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Start Analyzing Competitors
      </h2>
      
      <p className="text-gray-600 text-center max-w-md mb-8">
        Add your first competitor to see what's working in your niche and find content opportunities
      </p>

      <button
        onClick={onAddCompetitor}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
      >
        Add Your First Competitor
      </button>

      {/* Helpful tips */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">Track Multiple Competitors</h3>
          <p className="text-sm text-gray-600">
            Analyze competitor strategies and performance
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">💡</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">Real-time Insights</h3>
          <p className="text-sm text-gray-600">
            Get instant analysis and content gap identification
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">Generate Content</h3>
          <p className="text-sm text-gray-600">
            Create content based on competitor strategies
          </p>
        </div>
      </div>
    </div>
  );
}


















