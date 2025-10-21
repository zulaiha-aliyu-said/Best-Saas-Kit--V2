"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Brain, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";

interface WritingStyleProfile {
  tone: string;
  personality_traits: string[];
  vocabulary_patterns: {
    common_words: string[];
    sentence_starters: string[];
    transition_words: string[];
    power_words: string[];
  };
  sentence_structure: {
    avg_sentence_length: number;
    complexity_level: 'simple' | 'moderate' | 'complex';
    question_frequency: number;
    exclamation_frequency: number;
  };
  emoji_usage: {
    frequency: 'none' | 'rare' | 'moderate' | 'frequent';
    preferred_emojis: string[];
    placement_pattern: 'beginning' | 'middle' | 'end' | 'throughout';
  };
  brand_elements: {
    opening_styles: string[];
    closing_styles: string[];
    call_to_action_patterns: string[];
    signature_phrases: string[];
  };
  platform_preferences: {
    [platform: string]: {
      tone_adjustment: string;
      length_preference: string;
      emoji_usage: string;
    };
  };
}

interface StyleProfileData {
  profile: WritingStyleProfile | null;
  confidence_score: number;
  sample_count: number;
  style_enabled: boolean;
  has_style: boolean;
  can_enable: boolean;
}

export function StyleProfileComponent() {
  const { toast } = useToast();
  const [styleData, setStyleData] = useState<StyleProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadStyleProfile();
  }, []);

  const loadStyleProfile = async () => {
    try {
      const response = await fetch('/api/style/profile');
      if (response.ok) {
        const data = await response.json();
        setStyleData(data);
      } else {
        throw new Error('Failed to load style profile');
      }
    } catch (error) {
      console.error('Error loading style profile:', error);
      toast({
        title: "Error",
        description: "Failed to load style profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStyleEnabled = async (enabled: boolean) => {
    if (!styleData?.can_enable && enabled) {
      toast({
        title: "Cannot enable style",
        description: "Style confidence score must be at least 60% to enable",
        variant: "destructive",
      });
      return;
    }

    setIsToggling(true);
    try {
      const response = await fetch('/api/style/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        const result = await response.json();
        setStyleData(prev => prev ? { ...prev, style_enabled: enabled } : null);
        toast({
          title: enabled ? "Style enabled" : "Style disabled",
          description: result.message,
        });
      } else {
        throw new Error('Failed to toggle style');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle writing style",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading style profile...</span>
        </CardContent>
      </Card>
    );
  }

  if (!styleData?.has_style) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>No Style Profile Found</span>
          </CardTitle>
          <CardDescription>
            You haven't trained your writing style yet. Upload some writing samples to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start by uploading 3-10 samples of your writing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Your Writing Style</span>
          </CardTitle>
          <CardDescription>
            Your unique writing voice and style characteristics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getConfidenceColor(styleData.confidence_score)}`}>
                  {styleData.confidence_score}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {getConfidenceLabel(styleData.confidence_score)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Confidence Score</div>
                <Progress value={styleData.confidence_score} className="w-32" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="style-toggle">Enable Style</Label>
              <Switch
                id="style-toggle"
                checked={styleData.style_enabled}
                onCheckedChange={toggleStyleEnabled}
                disabled={isToggling || !styleData.can_enable}
              />
            </div>
          </div>

          {/* Style Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              {styleData.style_enabled ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Style Active</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Applied to Content Generation
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Style Disabled</span>
                  <Badge variant="secondary">
                    Not Applied
                  </Badge>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetails ? "Hide Details" : "Show Details"}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{styleData.sample_count}</div>
              <div className="text-sm text-muted-foreground">Samples</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{styleData.profile?.tone}</div>
              <div className="text-sm text-muted-foreground">Tone</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {styleData.profile?.sentence_structure.complexity_level}
              </div>
              <div className="text-sm text-muted-foreground">Complexity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      {showDetails && styleData.profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personality Traits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personality Traits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {styleData.profile.personality_traits.map((trait, index) => (
                  <Badge key={index} variant="outline">
                    {trait}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vocabulary Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vocabulary Patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Common Words</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {styleData.profile.vocabulary_patterns.common_words.slice(0, 8).map((word, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Sentence Starters</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {styleData.profile.vocabulary_patterns.sentence_starters.slice(0, 5).map((starter, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {starter}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sentence Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sentence Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Average Length</span>
                <span className="font-medium">{styleData.profile.sentence_structure.avg_sentence_length} words</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Complexity</span>
                <Badge variant="outline">
                  {styleData.profile.sentence_structure.complexity_level}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Questions</span>
                <span className="font-medium">
                  {(styleData.profile.sentence_structure.question_frequency * 100).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Emoji Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emoji Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Frequency</span>
                <Badge variant="outline">
                  {styleData.profile.emoji_usage.frequency}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Placement</span>
                <span className="font-medium">{styleData.profile.emoji_usage.placement_pattern}</span>
              </div>
              {styleData.profile.emoji_usage.preferred_emojis.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Preferred Emojis</Label>
                  <div className="flex gap-1 mt-1">
                    {styleData.profile.emoji_usage.preferred_emojis.slice(0, 6).map((emoji, index) => (
                      <span key={index} className="text-lg">{emoji}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brand Elements */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Brand Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Opening Styles</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {styleData.profile.brand_elements.opening_styles.slice(0, 3).map((style, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Closing Styles</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {styleData.profile.brand_elements.closing_styles.slice(0, 3).map((style, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {styleData.profile.brand_elements.signature_phrases.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Signature Phrases</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {styleData.profile.brand_elements.signature_phrases.slice(0, 4).map((phrase, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        "{phrase}"
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Need to improve your style?</h3>
              <p className="text-sm text-muted-foreground">
                Add more diverse writing samples to increase confidence score
              </p>
            </div>
            <Button variant="outline" onClick={loadStyleProfile}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}







