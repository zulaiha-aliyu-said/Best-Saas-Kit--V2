'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, CheckCircle } from 'lucide-react';

interface PredictionFeedbackProps {
  predictionId: number;
  predictedMetrics: {
    likes: string;
    comments: string;
    shares: string;
    reach: string;
  };
  onFeedbackSubmitted?: () => void;
}

export function PredictionFeedback({ 
  predictionId, 
  predictedMetrics, 
  onFeedbackSubmitted 
}: PredictionFeedbackProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [actualMetrics, setActualMetrics] = useState({
    likes: '',
    comments: '',
    shares: '',
    reach: '',
    engagement_rate: ''
  });
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ai/prediction-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prediction_id: predictionId,
          actual_likes: actualMetrics.likes ? parseInt(actualMetrics.likes) : undefined,
          actual_comments: actualMetrics.comments ? parseInt(actualMetrics.comments) : undefined,
          actual_shares: actualMetrics.shares ? parseInt(actualMetrics.shares) : undefined,
          actual_reach: actualMetrics.reach ? parseInt(actualMetrics.reach) : undefined,
          actual_engagement_rate: actualMetrics.engagement_rate ? parseFloat(actualMetrics.engagement_rate) : undefined,
          feedback_notes: feedbackNotes || undefined,
          accuracy_rating: rating || undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        onFeedbackSubmitted?.();
      } else {
        console.error('Failed to submit feedback:', data.error);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Feedback Submitted</span>
          </CardTitle>
          <CardDescription>Thank you for helping improve our AI predictions!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your feedback helps us improve the accuracy of future predictions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How did your content perform?</CardTitle>
        <CardDescription>
          Help us improve by sharing your actual performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Accuracy Rating */}
          <div className="space-y-2">
            <Label>How accurate was this prediction?</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {rating === 0 && 'Rate the prediction accuracy'}
              {rating === 1 && 'Very inaccurate'}
              {rating === 2 && 'Somewhat inaccurate'}
              {rating === 3 && 'Moderately accurate'}
              {rating === 4 && 'Very accurate'}
              {rating === 5 && 'Extremely accurate'}
            </p>
          </div>

          {/* Actual Metrics */}
          <div className="space-y-4">
            <Label>Actual Performance Metrics (optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actual-likes" className="text-sm">Likes</Label>
                <Input
                  id="actual-likes"
                  type="number"
                  placeholder={predictedMetrics.likes}
                  value={actualMetrics.likes}
                  onChange={(e) => setActualMetrics(prev => ({ ...prev, likes: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual-comments" className="text-sm">Comments</Label>
                <Input
                  id="actual-comments"
                  type="number"
                  placeholder={predictedMetrics.comments}
                  value={actualMetrics.comments}
                  onChange={(e) => setActualMetrics(prev => ({ ...prev, comments: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual-shares" className="text-sm">Shares</Label>
                <Input
                  id="actual-shares"
                  type="number"
                  placeholder={predictedMetrics.shares}
                  value={actualMetrics.shares}
                  onChange={(e) => setActualMetrics(prev => ({ ...prev, shares: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual-reach" className="text-sm">Reach</Label>
                <Input
                  id="actual-reach"
                  type="number"
                  placeholder={predictedMetrics.reach}
                  value={actualMetrics.reach}
                  onChange={(e) => setActualMetrics(prev => ({ ...prev, reach: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="feedback-notes">Additional Notes (optional)</Label>
            <Textarea
              id="feedback-notes"
              placeholder="Any additional insights about your content's performance..."
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



