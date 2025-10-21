"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Lightbulb, 
  RefreshCw, 
  Copy, 
  Star,
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface ContentSuggestion {
  title: string;
  content: string;
  predictedScore: number;
  improvements: string[];
}

interface ImprovementAnalysis {
  mainIssues: string[];
  keyImprovements: string[];
  platformOptimization: string;
}

interface ContentImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalContent: string;
  platform: string;
  currentScore: number;
  tone?: string;
  onContentSelect?: (content: string) => void;
}

export function ContentImprovementModal({
  isOpen,
  onClose,
  originalContent,
  platform,
  currentScore,
  tone = 'professional',
  onContentSelect
}: ContentImprovementModalProps) {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<ImprovementAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number>(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSuggestions([]);
      setAnalysis(null);
      setError(null);
      setSelectedSuggestion(null);
      setUserRating(0);
      // Auto-generate suggestions when modal opens
      generateImprovements();
    }
  }, [isOpen]);

  const generateImprovements = async () => {
    if (!originalContent.trim()) {
      toast.error('Please provide content to improve');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-improved-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalContent,
          platform,
          tone,
          currentScore,
          improvementType: 'general'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate improvements');
      }

      const data = await response.json();
      setSuggestions(data.improvements.suggestions);
      setAnalysis(data.improvements.analysis);
      
      toast.success('Content improvements generated successfully!');
    } catch (error) {
      console.error('Error generating improvements:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate improvements');
      toast.error('Failed to generate improvements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  const formatPlatformName = (platform: string) => {
    const platformNames: { [key: string]: string } = {
      'instagram': 'Instagram',
      'x': 'X (Twitter)',
      'linkedin': 'LinkedIn',
      'facebook': 'Facebook',
      'tiktok': 'TikTok',
      'email': 'Email'
    };
    return platformNames[platform] || platform;
  };

  const handleSuggestionSelect = (index: number) => {
    setSelectedSuggestion(index);
    if (onContentSelect) {
      onContentSelect(suggestions[index].content);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
    // You can add API call here to save user feedback
    toast.success(`Rated ${rating} stars`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            FeedHive AI
          </DialogTitle>
          <DialogDescription>
            AI-powered content improvement suggestions for {formatPlatformName(platform)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feedback Banner */}
          <div className="bg-blue-900 text-white p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-900 text-sm font-bold">i</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Your post can be improved</h3>
                <p className="text-blue-100 text-sm">
                  The post scored {currentScore}% and lacks specific actionable advice. 
                  Try one of our AI-generated suggestions instead for better performance.
                </p>
              </div>
            </div>
          </div>

          {/* Original Content Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Original Content</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {originalContent}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-red-600 border-red-200">
                Score: {currentScore}%
              </Badge>
              <span className="text-xs text-gray-500">
                Platform: {formatPlatformName(platform)}
              </span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Generating AI-powered improvements...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={generateImprovements}
                className="mt-3"
                disabled={isLoading}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Analysis Section */}
          {analysis && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Analysis
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Main Issues */}
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Main Issues</h4>
                  <ul className="space-y-1">
                    {analysis.mainIssues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Improvements */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Key Improvements</h4>
                  <ul className="space-y-1">
                    {analysis.keyImprovements.map((improvement, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Platform Optimization */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Platform Optimization</h4>
                <p className="text-sm text-blue-700">{analysis.platformOptimization}</p>
              </div>
            </div>
          )}

          {/* Suggestions Section */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Suggestions</h3>
              
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedSuggestion === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSuggestionSelect(index)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {suggestion.title}
                        </h4>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {suggestion.content}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getScoreColor(suggestion.predictedScore)}`}>
                          {suggestion.predictedScore}
                        </div>
                        <span className="text-xs text-gray-500 text-center">
                          {getScoreLabel(suggestion.predictedScore)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Improvements */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Key Improvements:</h5>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.improvements.map((improvement, impIndex) => (
                          <Badge key={impIndex} variant="secondary" className="text-xs">
                            {improvement}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyContent(suggestion.content);
                        }}
                        className="gap-2"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </Button>
                      {selectedSuggestion === index && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">How is this result?</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className={`w-5 h-5 ${
                      star <= userRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Close
              </Button>
              
              {suggestions.length > 0 && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                  onClick={() => {
                    if (selectedSuggestion !== null) {
                      handleCopyContent(suggestions[selectedSuggestion].content);
                    }
                    onClose();
                  }}
                  disabled={selectedSuggestion === null}
                >
                  <CheckCircle className="w-4 h-4" />
                  Use Selected Content
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


