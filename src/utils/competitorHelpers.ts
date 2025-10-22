// Helper functions for competitor analysis

import { Competitor } from './competitorData';

export const STORAGE_KEY = 'repurposeai_competitors';

// Get all competitors from localStorage
export const getCompetitors = (): Competitor[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save competitors to localStorage
export const saveCompetitors = (competitors: Competitor[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(competitors));
};

// Add a new competitor
export const addCompetitor = (competitor: Competitor): Competitor[] => {
  const competitors = getCompetitors();
  const updated = [...competitors, competitor];
  saveCompetitors(updated);
  return updated;
};

// Update a competitor
export const updateCompetitor = (id: string, updates: Partial<Competitor>): Competitor[] => {
  const competitors = getCompetitors();
  const updated = competitors.map(comp => 
    comp.id === id ? { ...comp, ...updates } : comp
  );
  saveCompetitors(updated);
  return updated;
};

// Delete a competitor
export const deleteCompetitor = (id: string): Competitor[] => {
  const competitors = getCompetitors();
  const updated = competitors.filter(comp => comp.id !== id);
  saveCompetitors(updated);
  return updated;
};

// Get a single competitor by ID
export const getCompetitorById = (id: string): Competitor | undefined => {
  const competitors = getCompetitors();
  return competitors.find(comp => comp.id === id);
};

// Format timestamp to relative time
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

// Format large numbers
export const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Get platform emoji
export const getPlatformEmoji = (platform: string): string => {
  const emojis: Record<string, string> = {
    twitter: '𝕏',
    linkedin: '💼',
    instagram: '📸'
  };
  return emojis[platform] || '📱';
};

// Get platform color
export const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    twitter: 'from-blue-500 to-blue-600',
    linkedin: 'from-blue-600 to-blue-700',
    instagram: 'from-pink-500 to-purple-600'
  };
  return colors[platform] || 'from-gray-500 to-gray-600';
};

// Get trend color based on growth
export const getTrendColor = (trend: string): string => {
  const colors: Record<string, string> = {
    exploding: 'text-red-500',
    growing: 'text-green-500',
    steady: 'text-blue-500'
  };
  return colors[trend] || 'text-gray-500';
};

// Get potential badge color
export const getPotentialColor = (potential: string): string => {
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    low: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colors[potential] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// Get gap type icon
export const getGapTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    topic: '💡',
    format: '🎨',
    timing: '⏰',
    angle: '🔄'
  };
  return icons[type] || '📊';
};

// Generate a unique ID
export const generateId = (): string => {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Validate username format
export const validateUsername = (username: string): boolean => {
  // Allow @username or full URL
  if (!username) return false;
  if (username.startsWith('@')) return username.length > 1;
  if (username.includes('linkedin.com/') || 
      username.includes('twitter.com/') || 
      username.includes('instagram.com/')) {
    return true;
  }
  return false;
};

// Extract username from URL
export const extractUsername = (input: string): string => {
  if (input.startsWith('@')) return input;
  
  // Extract from URL
  const patterns = [
    /linkedin\.com\/(?:in|company)\/([^\/\?]+)/,
    /twitter\.com\/([^\/\?]+)/,
    /instagram\.com\/([^\/\?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return `@${match[1]}`;
  }
  
  return input;
};

// Calculate engagement rate
export const calculateEngagementRate = (
  engagement: number,
  followers: number
): number => {
  if (followers === 0) return 0;
  return (engagement / followers) * 100;
};

// Get comparison status
export const getComparisonStatus = (
  yourValue: number,
  competitorValue: number
): 'ahead' | 'equal' | 'behind' => {
  if (yourValue > competitorValue * 1.1) return 'ahead';
  if (yourValue < competitorValue * 0.9) return 'behind';
  return 'equal';
};

// Get comparison color
export const getComparisonColor = (status: 'ahead' | 'equal' | 'behind'): string => {
  const colors = {
    ahead: 'bg-green-100 text-green-700',
    equal: 'bg-yellow-100 text-yellow-700',
    behind: 'bg-red-100 text-red-700'
  };
  return colors[status];
};



