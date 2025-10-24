'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Competitor {
  id: string;
  name: string;
  username: string;
  platform: 'twitter' | 'instagram' | 'linkedin';
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  engagement_rate: number | string; // PostgreSQL DECIMAL returns as string
  is_verified: boolean;
  last_analyzed_at?: string;
  created_at?: string;
  stats?: {
    total_posts: number;
    avg_likes: number;
    avg_comments: number;
    avg_engagement: number;
  };
  content_gaps_count?: number;
}

export function useCompetitors(userId?: string) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Internal fetch function with retry logic
  const fetchCompetitorsInternal = async (retryCount = 0): Promise<void> => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const maxRetries = 2;
    const retryDelay = 1000; // 1 second

    try {
      setLoading(true);
      console.log(`[useCompetitors] Fetching competitors for userId: ${userId} (attempt ${retryCount + 1})`);
      
      const response = await fetch(`/api/competitors?userId=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || `Server returned ${response.status}`;
        console.error('[useCompetitors] API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`[useCompetitors] Successfully fetched ${data.competitors?.length || 0} competitors`);
      setCompetitors(data.competitors || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useCompetitors] Fetch error:', errorMessage, err);
      
      // Retry logic for network/timeout errors
      if (retryCount < maxRetries && (
        errorMessage.includes('timeout') || 
        errorMessage.includes('network') ||
        errorMessage.includes('fetch')
      )) {
        console.log(`[useCompetitors] Retrying in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => fetchCompetitorsInternal(retryCount + 1), retryDelay);
        return;
      }
      
      setError(`Failed to load competitors: ${errorMessage}`);
      setCompetitors([]); // Clear competitors on error
    } finally {
      setLoading(false);
    }
  };

  // Memoized wrapper for external use
  const fetchCompetitors = useCallback(() => {
    return fetchCompetitorsInternal(0);
  }, [userId]);

  // Load competitors on mount
  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  // Analyze a new competitor
  const analyzeCompetitor = useCallback(
    async (platform: string, identifier: string) => {
      if (!userId) {
        return { success: false, error: 'User ID required' };
      }

      try {
        const response = await fetch('/api/competitors/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platform,
            identifier,
            userId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // Pass through the full error data for better error messages
          return { 
            success: false, 
            error: errorData.error || 'Failed to analyze competitor',
            message: errorData.message,
            helpText: errorData.helpText,
            example: errorData.example
          };
        }

        const data = await response.json();

        // Refresh competitors list
        await fetchCompetitors();

        return { success: true, data };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to analyze competitor';
        setError(message);
        console.error(err);
        return { success: false, error: message };
      }
    },
    [userId, fetchCompetitors]
  );

  // Get competitor details
  const getCompetitorDetails = useCallback(
    async (competitorId: string) => {
      if (!userId) {
        return null;
      }

      try {
        const response = await fetch(`/api/competitors/${competitorId}?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch competitor details');
        }

        const data = await response.json();
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [userId]
  );

  // Delete a competitor
  const deleteCompetitor = useCallback(
    async (competitorId: string) => {
      if (!userId) {
        return { success: false, error: 'User ID required' };
      }

      try {
        const response = await fetch(`/api/competitors/${competitorId}?userId=${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete competitor');
        }

        // Update local state
        setCompetitors(prev => prev.filter(c => c.id !== competitorId));

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete competitor';
        setError(message);
        console.error(err);
        return { success: false, error: message };
      }
    },
    [userId]
  );

  // Refresh competitor analysis
  const refreshCompetitor = useCallback(
    async (competitorId: string) => {
      if (!userId) {
        return { success: false, error: 'User ID required' };
      }

      try {
        const response = await fetch(`/api/competitors/${competitorId}/refresh?userId=${userId}`, {
          method: 'POST',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to refresh competitor');
        }

        const data = await response.json();

        // Refresh competitors list
        await fetchCompetitors();

        return { success: true, data };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to refresh competitor';
        setError(message);
        console.error(err);
        return { success: false, error: message };
      }
    },
    [userId, fetchCompetitors]
  );

  return {
    competitors,
    loading,
    error,
    analyzeCompetitor,
    getCompetitorDetails,
    deleteCompetitor,
    refreshCompetitor,
    refetch: fetchCompetitors,
  };
}
