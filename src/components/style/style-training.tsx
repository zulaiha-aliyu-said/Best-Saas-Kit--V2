"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Plus,
  X
} from "lucide-react";

interface TrainingSample {
  id: string;
  content: string;
  platform: string;
  content_type: string;
}

interface StyleAnalysisResult {
  profile: any;
  confidence_score: number;
  sample_count: number;
  analysis_summary: {
    strengths: string[];
    areas_for_improvement: string[];
    consistency_score: number;
  };
}

export function StyleTrainingComponent() {
  const { toast } = useToast();
  const [samples, setSamples] = useState<TrainingSample[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StyleAnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);

  const platforms = [
    { value: 'x', label: 'X (Twitter)' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'email', label: 'Email' },
    { value: 'blog', label: 'Blog Post' },
    { value: 'other', label: 'Other' }
  ];

  const contentTypes = [
    { value: 'post', label: 'Social Media Post' },
    { value: 'article', label: 'Article/Blog' },
    { value: 'email', label: 'Email' },
    { value: 'caption', label: 'Caption' },
    { value: 'thread', label: 'Thread' },
    { value: 'other', label: 'Other' }
  ];

  const addSample = () => {
    const newSample: TrainingSample = {
      id: `sample_${Date.now()}`,
      content: '',
      platform: 'x',
      content_type: 'post'
    };
    setSamples([...samples, newSample]);
  };

  const removeSample = (id: string) => {
    setSamples(samples.filter(sample => sample.id !== id));
  };

  const updateSample = (id: string, field: keyof TrainingSample, value: string) => {
    setSamples(samples.map(sample => 
      sample.id === id ? { ...sample, [field]: value } : sample
    ));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .md file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content.length < 50) {
        toast({
          title: "File too short",
          description: "Please upload a file with at least 50 characters",
          variant: "destructive",
        });
        return;
      }

      const newSample: TrainingSample = {
        id: `sample_${Date.now()}`,
        content: content.trim(),
        platform: 'other',
        content_type: 'other'
      };
      setSamples([...samples, newSample]);
    };
    reader.readAsText(file);
  };

  const analyzeStyle = async () => {
    if (samples.length < 3) {
      toast({
        title: "Not enough samples",
        description: "Please provide at least 3 writing samples",
        variant: "destructive",
      });
      return;
    }

    // Validate samples
    const validSamples = samples.filter(sample => 
      sample.content.trim().length >= 50 && 
      sample.platform && 
      sample.content_type
    );

    if (validSamples.length < 3) {
      toast({
        title: "Invalid samples",
        description: "Each sample must have at least 50 characters and specify platform/content type",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/style/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples: validSamples }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze writing style');
      }

      const result = await response.json();
      setAnalysisResult(result);

      toast({
        title: "Style analysis complete!",
        description: `Your writing style has been analyzed with ${result.confidence_score}% confidence`,
      });

    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || 'Failed to analyze writing style',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Train Your Writing Style</span>
          </CardTitle>
          <CardDescription>
            Upload 3-10 samples of your writing to train the AI to match your unique voice and style.
            The more diverse samples you provide, the better the AI will understand your writing patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Text File</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="file-upload"
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button variant="outline" onClick={addSample}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sample
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload .txt or .md files, or manually add samples below
            </p>
          </div>

          <Separator />

          {/* Manual Samples */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Writing Samples ({samples.length}/10)</Label>
              <Badge variant={samples.length >= 3 ? "default" : "secondary"}>
                {samples.length >= 3 ? "Ready to analyze" : "Need at least 3 samples"}
              </Badge>
            </div>

            {samples.map((sample, index) => (
              <Card key={sample.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sample {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSample(sample.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`platform-${sample.id}`}>Platform</Label>
                      <Select
                        value={sample.platform}
                        onValueChange={(value) => updateSample(sample.id, 'platform', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map(platform => (
                            <SelectItem key={platform.value} value={platform.value}>
                              {platform.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`type-${sample.id}`}>Content Type</Label>
                      <Select
                        value={sample.content_type}
                        onValueChange={(value) => updateSample(sample.id, 'content_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`content-${sample.id}`}>Content</Label>
                    <Textarea
                      id={`content-${sample.id}`}
                      value={sample.content}
                      onChange={(e) => updateSample(sample.id, 'content', e.target.value)}
                      placeholder="Paste your writing sample here (minimum 50 characters)..."
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      {sample.content.length} characters
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {samples.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No samples added yet. Upload a file or add samples manually.</p>
              </div>
            )}
          </div>

          {/* Analysis Button */}
          <div className="flex justify-center">
            <Button
              onClick={analyzeStyle}
              disabled={samples.length < 3 || isAnalyzing}
              size="lg"
              className="w-full max-w-md"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Style...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze My Writing Style
                </>
              )}
            </Button>
          </div>

          {/* Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing your writing style...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Results */}
          {analysisResult && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span>Style Analysis Complete!</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-green-700">Confidence Score</Label>
                    <p className="text-2xl font-bold text-green-800">
                      {analysisResult.confidence_score}%
                    </p>
                  </div>
                  <div>
                    <Label className="text-green-700">Samples Analyzed</Label>
                    <p className="text-2xl font-bold text-green-800">
                      {analysisResult.sample_count}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-green-700">Detected Tone</Label>
                  <Badge variant="outline" className="text-green-800">
                    {analysisResult.profile.tone}
                  </Badge>
                </div>

                <div>
                  <Label className="text-green-700">Strengths</Label>
                  <ul className="list-disc list-inside text-sm text-green-700">
                    {analysisResult.analysis_summary.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>

                {analysisResult.analysis_summary.areas_for_improvement.length > 0 && (
                  <div>
                    <Label className="text-green-700">Suggestions</Label>
                    <ul className="list-disc list-inside text-sm text-green-700">
                      {analysisResult.analysis_summary.areas_for_improvement.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}







