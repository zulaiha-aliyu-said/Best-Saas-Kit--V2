'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check, ChevronDown, ChevronUp, Loader2, TrendingUp, BarChart3 } from 'lucide-react';

interface GeneratedHook {
  id: string;
  hook: string;
  engagementScore: number;
  category: string;
  viralPotential: string;
  description: string;
  platform: string;
  niche: string;
}

const PLATFORMS = [
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'email', label: 'Email' },
];

const NICHES = {
  twitter: [
    { value: 'business', label: 'Business' },
    { value: 'tech', label: 'Tech' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'personal', label: 'Personal' },
  ],
  linkedin: [
    { value: 'business', label: 'Business' },
    { value: 'career', label: 'Career' },
    { value: 'leadership', label: 'Leadership' },
  ],
  instagram: [
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'education', label: 'Education' },
    { value: 'motivation', label: 'Motivation' },
  ],
  email: [
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'sales', label: 'Sales' },
  ],
};

const CATEGORY_COLORS = {
  high_performing: 'bg-green-100 text-green-800 border-green-300',
  proven: 'bg-blue-100 text-blue-800 border-blue-300',
  experimental: 'bg-purple-100 text-purple-800 border-purple-300',
};

const CATEGORY_LABELS = {
  high_performing: 'High Performing',
  proven: 'Proven',
  experimental: 'Experimental',
};

export default function ViralHookGenerator() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [niche, setNiche] = useState('business');
  const [hooks, setHooks] = useState<GeneratedHook[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/hooks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, niche }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hooks');
      }

      const data = await response.json();
      setHooks(data.hooks);
    } catch (error) {
      console.error('Error generating hooks:', error);
      alert('Failed to generate hooks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (hook: GeneratedHook) => {
    try {
      await navigator.clipboard.writeText(hook.hook);
      setCopiedId(hook.id);
      
      // Track the copy
      await fetch('/api/hooks/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hookId: hook.id }),
      });

      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying hook:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    return 'text-purple-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 75) return 'bg-blue-50 border-blue-200';
    return 'bg-purple-50 border-purple-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Viral Hook Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            Generate high-performing viral hooks powered by 500+ proven patterns
          </p>
          <Link 
            href="/dashboard/hooks/analytics"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <BarChart3 className="w-5 h-5" />
            View Analytics & Insights
          </Link>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-purple-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Topic Input */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., content marketing, AI automation, personal branding..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>

            {/* Platform Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  // Reset niche to first option of new platform
                  const newNiche = NICHES[e.target.value as keyof typeof NICHES][0].value;
                  setNiche(newNiche);
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Niche Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Niche
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {NICHES[platform as keyof typeof NICHES].map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate 10 Hooks
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Hooks */}
        {hooks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                Your Viral Hooks
              </h2>
              <p className="text-sm text-gray-600">
                Sorted by engagement score (highest first)
              </p>
            </div>

            {hooks.map((hook, index) => (
              <div
                key={hook.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 ${getScoreBgColor(
                  hook.engagementScore
                )} p-6 transform hover:-translate-y-1`}
              >
                {/* Hook Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          CATEGORY_COLORS[
                            hook.category as keyof typeof CATEGORY_COLORS
                          ]
                        }`}
                      >
                        {CATEGORY_LABELS[hook.category as keyof typeof CATEGORY_LABELS]}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-gray-800 leading-relaxed">
                      {hook.hook}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopy(hook)}
                    className="flex-shrink-0 p-3 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-all"
                    title="Copy to clipboard"
                  >
                    {copiedId === hook.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      Engagement Score:
                    </span>
                    <span
                      className={`text-xl font-bold ${getScoreColor(
                        hook.engagementScore
                      )}`}
                    >
                      {hook.engagementScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      Viral Potential:
                    </span>
                    <span
                      className={`font-semibold ${
                        hook.viralPotential === 'Very High'
                          ? 'text-green-600'
                          : hook.viralPotential === 'High'
                          ? 'text-blue-600'
                          : 'text-purple-600'
                      }`}
                    >
                      {hook.viralPotential}
                    </span>
                  </div>
                </div>

                {/* Expandable Description */}
                <div className="border-t pt-3">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === hook.id ? null : hook.id)
                    }
                    className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    {expandedId === hook.id ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Why This Works
                      </>
                    )}
                  </button>
                  {expandedId === hook.id && (
                    <div className="mt-3 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {hook.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {hooks.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-purple-100">
            <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready to Generate Viral Hooks?
            </h3>
            <p className="text-gray-600">
              Enter your topic, select a platform and niche, then click generate to
              get 10 high-performing viral hooks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}






