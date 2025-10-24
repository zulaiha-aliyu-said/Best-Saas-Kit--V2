'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCompetitors, Competitor } from '@/hooks/useCompetitors';
import { CompetitorCard } from '@/components/competitor/CompetitorCard';
import { EmptyState } from '@/components/competitor/EmptyState';
import { AddCompetitorModal } from '@/components/competitor/AddCompetitorModal';
import { AnalysisDashboard } from '@/components/competitor/AnalysisDashboard';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface CompetitorAnalysisClientProps {
  userId: string;
}

export default function CompetitorAnalysisClient({ userId }: CompetitorAnalysisClientProps) {
  const router = useRouter();
  const { 
    competitors, 
    loading,
    error: fetchError,
    analyzeCompetitor,
    deleteCompetitor, 
    refreshCompetitor,
    refetch 
  } = useCompetitors(userId);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddCompetitor = async (data: { platform: string; username: string }) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeCompetitor(data.platform, data.username);
      if (result.success) {
        toast.success(`✅ ${data.username} analyzed successfully!`);
        setIsAddModalOpen(false);
      } else {
        // Show detailed error message
        const errorMessage = result.message || result.error || 'Failed to analyze competitor';
        toast.error(errorMessage, {
          description: result.helpText || result.example,
          duration: 8000, // Show longer for detailed errors
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteCompetitor = async (id: string) => {
    const result = await deleteCompetitor(id);
    if (result.success) {
      toast.success('Competitor removed');
      if (selectedCompetitor?.id === id) {
        setIsDashboardOpen(false);
        setSelectedCompetitor(null);
      }
    } else {
      toast.error('Failed to delete competitor');
    }
  };

  const handleRefreshCompetitor = async (id: string) => {
    const toastId = toast.loading('Refreshing competitor data...');
    const result = await refreshCompetitor(id);
    
    if (result.success) {
      toast.success('Competitor data updated!', { id: toastId });
    } else {
      toast.error(result.error || 'Failed to refresh competitor', { id: toastId });
    }
  };

  const handleViewAnalysis = async (competitor: Competitor) => {
    setSelectedCompetitor(competitor);
    setIsDashboardOpen(true);
    
    // Note: AnalysisDashboard will fetch detailed data using the competitor ID and userId
  };

  const handleCloseDashboard = () => {
    setIsDashboardOpen(false);
    setTimeout(() => setSelectedCompetitor(null), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading competitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Banner */}
        {fetchError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-red-800 dark:text-red-200 font-semibold mb-1">
                  Error Loading Competitors
                </h3>
                <p className="text-red-600 dark:text-red-300 text-sm">{fetchError}</p>
                <p className="text-red-500 dark:text-red-400 text-xs mt-2">
                  Check your browser console (F12) for more details
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Competitor Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and analyze your competitors' content strategies
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            Add Competitor
          </button>
        </div>

        {/* Competitors Grid */}
        {competitors.length === 0 ? (
          <EmptyState onAddCompetitor={() => setIsAddModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitors.map((competitor) => (
              <CompetitorCard
                key={competitor.id}
                competitor={competitor}
                onView={handleViewAnalysis}
                onRefresh={handleRefreshCompetitor}
                onDelete={handleDeleteCompetitor}
              />
            ))}
          </div>
        )}

        {/* Add Competitor Modal */}
        <AddCompetitorModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCompetitor}
          isLoading={isAnalyzing}
        />

        {/* Analysis Dashboard */}
        {selectedCompetitor && (
          <AnalysisDashboard
            isOpen={isDashboardOpen}
            onClose={handleCloseDashboard}
            competitor={selectedCompetitor}
            onDelete={handleDeleteCompetitor}
            userId={userId}
            onGenerateContent={(gap) => {
              // Navigate to repurpose page with gap data
              router.push(`/dashboard/repurpose?gapId=${gap.id}&competitorId=${selectedCompetitor.id}`);
              toast.success('Opening content generator...');
            }}
            onCreateSimilar={(post) => {
              // Navigate to repurpose page with post data
              router.push(`/dashboard/repurpose?postId=${post.id}&competitorId=${selectedCompetitor.id}`);
              toast.success('Creating similar content...');
            }}
          />
        )}
      </div>
    </div>
  );
}

