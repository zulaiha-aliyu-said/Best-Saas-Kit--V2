'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { extractUsername } from '@/utils/competitorHelpers';
import { toast } from 'sonner';

interface AddCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { platform: string; username: string }) => void | Promise<void>;
  isLoading?: boolean;
}

type Platform = 'twitter' | 'instagram';

export function AddCompetitorModal({ isOpen, onClose, onAdd, isLoading = false }: AddCompetitorModalProps) {
  const [formData, setFormData] = useState({
    platform: '' as Platform | '',
    username: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.platform) {
      newErrors.platform = 'Please select a platform';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username or ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Extract username (remove @ and URLs)
    const cleanUsername = extractUsername(formData.username);
    
    await onAdd({
      platform: formData.platform,
      username: cleanUsername,
    });
    
    // Reset form on success (will be handled by parent)
    setFormData({
      platform: '' as Platform | '',
      username: '',
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        platform: '' as Platform | '',
        username: '',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Competitor to Analyze</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 flex flex-col items-center justify-center z-10 rounded-2xl">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">🔍 Analyzing competitor...</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fetching data from {formData.platform}...</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Platform *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'twitter', label: 'Twitter', emoji: '𝕏' },
                { value: 'instagram', label: 'Instagram', emoji: '📸' }
              ].map((platform) => (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, platform: platform.value as Platform })}
                  disabled={isLoading}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    formData.platform === platform.value
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{platform.emoji}</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{platform.label}</div>
                </button>
              ))}
            </div>
            {errors.platform && (
              <p className="mt-2 text-sm text-red-600">{errors.platform}</p>
            )}
          </div>

          {/* Username/ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formData.platform === 'twitter' ? 'User ID *' : 'Username *'}
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder={formData.platform === 'twitter' ? 'e.g., 44196397' : 'e.g., natgeo or @natgeo'}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.platform === 'twitter' 
                ? 'Enter the numeric Twitter user ID (found in profile URLs)'
                : 'We\'ll analyze their public posts and profile'}
            </p>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>What we'll analyze:</strong><br />
              • Profile metrics (followers, engagement rate)<br />
              • Recent posts and performance<br />
              • Content gaps and opportunities<br />
              • Posting patterns and strategies
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.platform || !formData.username}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Competitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}










