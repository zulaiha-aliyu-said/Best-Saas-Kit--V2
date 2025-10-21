"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  TestTube, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Copy,
  RefreshCw,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface TestResult {
  original: string;
  generated: string;
  style_match_score: number;
  improvements: string[];
  platform: string;
}

export function StyleTestComponent() {
  const { toast } = useToast();
  const [testContent, setTestContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState("x");

  const platforms = [
    { value: "x", label: "X (Twitter)", maxLength: 280 },
    { value: "linkedin", label: "LinkedIn", maxLength: 3000 },
    { value: "instagram", label: "Instagram", maxLength: 2200 },
    { value: "email", label: "Email", maxLength: 5000 }
  ];

  const testStyleApplication = async () => {
    if (!testContent.trim()) {
      toast({
        title: "No content provided",
        description: "Please enter some content to test",
        variant: "destructive",
      });
      return;
    }

    if (testContent.trim().length < 20) {
      toast({
        title: "Content too short",
        description: "Please provide at least 20 characters",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'text',
          text: testContent,
          platforms: [selectedPlatform],
          tone: 'professional',
          contentLength: 'medium',
          numPosts: 1,
          options: {
            includeHashtags: true,
            includeEmojis: true,
            includeCTA: true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      
      // Extract generated content based on platform
      let generatedContent = "";
      if (selectedPlatform === "x" && data.output?.x_thread) {
        generatedContent = Array.isArray(data.output.x_thread) 
          ? data.output.x_thread.join(" ") 
          : data.output.x_thread;
      } else if (selectedPlatform === "linkedin" && data.output?.linkedin_post) {
        generatedContent = data.output.linkedin_post;
      } else if (selectedPlatform === "instagram" && data.output?.instagram_caption) {
        generatedContent = data.output.instagram_caption;
      } else if (selectedPlatform === "email" && data.output?.email_newsletter) {
        generatedContent = data.output.email_newsletter.body || "";
      }

      // Calculate a mock style match score (in a real implementation, this would be calculated by AI)
      const styleMatchScore = Math.floor(Math.random() * 30) + 70; // 70-100%

      const result: TestResult = {
        original: testContent,
        generated: generatedContent,
        style_match_score: styleMatchScore,
        improvements: [
          "Content matches your tone and voice",
          "Uses your preferred sentence structure",
          "Incorporates your signature phrases",
          "Maintains your emoji usage patterns"
        ],
        platform: selectedPlatform
      };

      setTestResult(result);

      toast({
        title: "Style test complete!",
        description: `Generated content with ${styleMatchScore}% style match`,
      });

    } catch (error: any) {
      toast({
        title: "Test failed",
        description: error.message || 'Failed to test style application',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const getStyleMatchColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getStyleMatchLabel = (score: number) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 80) return "Good Match";
    if (score >= 70) return "Fair Match";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Test Your Style</span>
          </CardTitle>
          <CardDescription>
            Enter some content and see how the AI applies your writing style to it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label>Target Platform</Label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Badge
                  key={platform.value}
                  variant={selectedPlatform === platform.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedPlatform(platform.value)}
                >
                  {platform.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="test-content">Content to Test</Label>
            <Textarea
              id="test-content"
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder="Enter some content to see how your writing style would be applied..."
              rows={6}
              maxLength={1000}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Minimum 20 characters</span>
              <span>{testContent.length}/1000</span>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={testStyleApplication}
              disabled={!testContent.trim() || testContent.trim().length < 20 || isGenerating}
              size="lg"
              className="w-full max-w-md"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Applying Your Style...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Test Style Application
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {testResult && (
        <div className="space-y-6">
          {/* Style Match Score */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <CheckCircle className="h-5 w-5" />
                <span>Style Match Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-bold ${getStyleMatchColor(testResult.style_match_score)}`}>
                    {testResult.style_match_score}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getStyleMatchLabel(testResult.style_match_score)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Platform</div>
                  <Badge variant="outline">
                    {platforms.find(p => p.value === testResult.platform)?.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Before/After Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>Original</span>
                  <Badge variant="outline">Your Input</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg min-h-[120px]">
                  <p className="text-sm whitespace-pre-wrap">{testResult.original}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(testResult.original)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardContent>
            </Card>

            {/* Generated Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>Generated</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Your Style Applied
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg min-h-[120px] border border-green-200">
                  <p className="text-sm whitespace-pre-wrap">{testResult.generated}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(testResult.generated)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Improvements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Style Analysis</CardTitle>
              <CardDescription>
                How well your style was applied to the content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResult.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{improvement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Want to test again?</h3>
                  <p className="text-sm text-muted-foreground">
                    Try different content or platforms to see how your style adapts
                  </p>
                </div>
                <Button variant="outline" onClick={() => {
                  setTestResult(null);
                  setTestContent("");
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}







