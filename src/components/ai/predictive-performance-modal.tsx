"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Target, 
  Lightbulb, 
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { ContentImprovementModal } from "./content-improvement-modal";
import { UpgradePrompt } from "@/components/upgrade/UpgradePrompt";

interface PerformancePrediction {
  score: number;
  breakdown: {
    contentQuality: number;
    engagementPotential: number;
    algorithmOptimization: number;
    timingTrends: number;
    audienceFit: number;
  };
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
  predictedMetrics: {
    likes: string;
    comments: string;
    shares: string;
    reach: string;
  };
}

interface PredictivePerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  platform: string;
  tone?: string;
  hashtags?: string[];
  scheduledTime?: Date;
  contentType?: string;
}

export function PredictivePerformanceModal({
  isOpen,
  onClose,
  content,
  platform,
  tone = 'professional',
  hashtags = [],
  scheduledTime,
  contentType = 'post'
}: PredictivePerformanceModalProps) {
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [improvementModalOpen, setImprovementModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [tierInfo, setTierInfo] = useState<{ currentTier: number; requiredTier: number } | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPrediction(null);
      setError(null);
      setHasGenerated(false);
    }
  }, [isOpen]);

  const handleContentSelect = (newContent: string) => {
    setSelectedContent(newContent);
    toast.success('Content selected! You can now use this improved version.');
  };

  const handleImproveContent = () => {
    setImprovementModalOpen(true);
  };

  const generatePrediction = async () => {
    if (!content.trim()) {
      toast.error('Please provide content to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/predict-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          platform,
          tone,
          hashtags,
          scheduledTime: scheduledTime?.toISOString(),
          contentType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle tier restriction with upgrade prompt
        if (response.status === 403 && errorData.code === 'TIER_RESTRICTED') {
          setTierInfo({ currentTier: errorData.currentTier, requiredTier: errorData.requiredTier });
          setShowUpgrade(true);
          setIsLoading(false);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to generate prediction');
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setHasGenerated(true);
      
      toast.success('Performance prediction generated successfully!');
    } catch (error) {
      console.error('Error generating prediction:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate prediction');
      toast.error('Failed to generate prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const formatPlatformName = (platform: string) => {
    const platformNames: { [key: string]: string } = {
      'instagram': 'Instagram',
      'x': 'X (Twitter)',
      'linkedin': 'LinkedIn',
      'facebook': 'Facebook',
      'tiktok': 'TikTok'
    };
    return platformNames[platform] || platform;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Predictive Performance Score
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              BETA
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Use AI to predict how well your {formatPlatformName(platform)} post will perform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Content Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Content Preview</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {content}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>Platform: {formatPlatformName(platform)}</span>
              <span>Tone: {tone}</span>
              {hashtags.length > 0 && <span>Hashtags: {hashtags.length}</span>}
            </div>
          </div>

          {/* Score Display */}
          {prediction ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Score */}
              <div className="lg:col-span-1">
                <div className={`p-6 rounded-lg text-center ${getScoreBgColor(prediction.score)}`}>
                  <div className={`text-4xl font-bold ${getScoreColor(prediction.score)} mb-2`}>
                    {prediction.score}
                  </div>
                  <div className={`text-lg font-semibold ${getScoreColor(prediction.score)} mb-1`}>
                    {getScoreLabel(prediction.score)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Performance Score
                  </div>
                  <Progress 
                    value={prediction.score} 
                    className="mt-4 h-2"
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Score Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Content Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={prediction.breakdown.contentQuality} className="w-24 h-2" />
                      <span className="text-sm font-medium w-8">{prediction.breakdown.contentQuality}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Engagement Potential</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={prediction.breakdown.engagementPotential} className="w-24 h-2" />
                      <span className="text-sm font-medium w-8">{prediction.breakdown.engagementPotential}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Algorithm Optimization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={prediction.breakdown.algorithmOptimization} className="w-24 h-2" />
                      <span className="text-sm font-medium w-8">{prediction.breakdown.algorithmOptimization}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium">Timing & Trends</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={prediction.breakdown.timingTrends} className="w-24 h-2" />
                      <span className="text-sm font-medium w-8">{prediction.breakdown.timingTrends}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-600" />
                      <span className="text-sm font-medium">Audience Fit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={prediction.breakdown.audienceFit} className="w-24 h-2" />
                      <span className="text-sm font-medium w-8">{prediction.breakdown.audienceFit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No results generated</p>
              <Button 
                onClick={generatePrediction}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Result'
                )}
              </Button>
            </div>
          )}

          {/* Low Score Improvement Suggestion */}
          {prediction && prediction.score <= 50 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 mb-1">
                    Your content can be improved
                  </h3>
                  <p className="text-orange-700 text-sm mb-3">
                    With a score of {prediction.score}%, this content may not perform well. 
                    Let our AI generate better-performing alternatives for you.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleImproveContent}
                    className="bg-orange-600 hover:bg-orange-700 gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Better Content
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {showUpgrade && tierInfo ? (
            <div className="my-4">
              <UpgradePrompt
                featureName="AI Performance Predictions"
                currentTier={tierInfo.currentTier}
                requiredTier={tierInfo.requiredTier}
                variant="inline"
                benefits={[
                  "AI-powered performance scoring (0-100)",
                  "5-factor breakdown analysis",
                  "Actionable optimization tips",
                  "Platform-specific predictions",
                  "750 credits/month (Tier 3)"
                ]}
              />
            </div>
          ) : error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="w-4 h-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={generatePrediction}
                className="mt-3"
                disabled={isLoading}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Insights and Recommendations */}
          {prediction && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Insights */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Key Insights
                </h3>
                <div className="space-y-2">
                  {prediction.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-green-800">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {prediction.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {prediction && prediction.riskFactors.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Risk Factors
              </h3>
              <div className="space-y-2">
                {prediction.riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-orange-800">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predicted Metrics */}
          {prediction && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Predicted Performance</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">👍</div>
                  <div className="text-sm font-medium text-blue-800">Likes</div>
                  <div className="text-lg font-semibold text-blue-900">{prediction.predictedMetrics.likes}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">💬</div>
                  <div className="text-sm font-medium text-green-800">Comments</div>
                  <div className="text-lg font-semibold text-green-900">{prediction.predictedMetrics.comments}</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">🔄</div>
                  <div className="text-sm font-medium text-purple-800">Shares</div>
                  <div className="text-lg font-semibold text-purple-900">{prediction.predictedMetrics.shares}</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">👀</div>
                  <div className="text-sm font-medium text-orange-800">Reach</div>
                  <div className="text-lg font-semibold text-orange-900">{prediction.predictedMetrics.reach}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
            
            <div className="flex items-center gap-2">
              {hasGenerated && (
                <Button 
                  variant="outline" 
                  onClick={generatePrediction}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
              )}
              
              {prediction && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                  onClick={() => {
                    // You can add functionality to save or schedule the content here
                    toast.success('Content saved for scheduling!');
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Use This Content
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Content Improvement Modal */}
      <ContentImprovementModal
        isOpen={improvementModalOpen}
        onClose={() => setImprovementModalOpen(false)}
        originalContent={content}
        platform={platform}
        currentScore={prediction?.score || 0}
        tone={tone}
        onContentSelect={handleContentSelect}
      />
    </Dialog>
  );
}
