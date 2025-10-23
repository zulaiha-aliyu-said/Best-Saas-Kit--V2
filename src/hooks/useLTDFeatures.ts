/**
 * React Hook for LTD Features
 * Makes it easy to check feature access in client components
 */

import { useEffect, useState } from 'react';

interface FeatureAccess {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: number | string;
}

interface UserPlan {
  type: string;
  status: string;
  tier: number | null;
  credits: number;
  monthly_limit: number;
  rollover: number;
  reset_date: string;
  stacked_codes: number;
}

interface Features {
  [key: string]: any;
}

export function useLTDFeatures() {
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [features, setFeatures] = useState<Features | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ltd/features');
      
      if (!response.ok) {
        throw new Error('Failed to fetch features');
      }
      
      const data = await response.json();
      setPlan(data.plan);
      setFeatures(data.features);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featurePath: string): boolean => {
    if (!features) return false;
    
    const parts = featurePath.split('.');
    let current: any = features;
    
    for (const part of parts) {
      if (current === undefined || current === null) return false;
      current = current[part];
    }
    
    if (typeof current === 'object' && current !== null && 'enabled' in current) {
      return current.enabled === true;
    }
    
    return current !== false && current !== undefined && current !== null;
  };

  const checkFeatureAccess = async (feature: string): Promise<FeatureAccess> => {
    try {
      const response = await fetch(`/api/ltd/check-access?feature=${feature}`);
      const data = await response.json();
      return data.access;
    } catch (err) {
      return {
        hasAccess: false,
        reason: 'Failed to check access',
      };
    }
  };

  const refresh = () => {
    fetchFeatures();
  };

  return {
    plan,
    features,
    loading,
    error,
    hasFeature,
    checkFeatureAccess,
    refresh,
  };
}

export function useLTDCredits() {
  const [credits, setCredits] = useState<{
    credits: number;
    monthly_limit: number;
    rollover: number;
    reset_date: string;
    percentage_used: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ltd/credits');
      
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      
      const data = await response.json();
      setCredits(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const deductCredits = async (action: string, amount?: number, metadata?: any) => {
    try {
      const response = await fetch('/api/ltd/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, amount, metadata }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to deduct credits');
      }
      
      const data = await response.json();
      
      // Refresh credits after deduction
      await fetchCredits();
      
      return data;
    } catch (err) {
      throw err;
    }
  };

  const refresh = () => {
    fetchCredits();
  };

  return {
    credits,
    loading,
    error,
    deductCredits,
    refresh,
  };
}







