"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  PenTool, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface StyleData {
  profile: any;
  confidence_score: number;
  sample_count: number;
  style_enabled: boolean;
  has_style: boolean;
  can_enable: boolean;
}

export function StyleIndicator() {
  const { toast } = useToast();
  const [styleData, setStyleData] = useState<StyleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [userTier, setUserTier] = useState<number | null>(null);

  useEffect(() => {
    loadStyleData();
    fetchUserTier();
  }, []);

  const fetchUserTier = async () => {
    try {
      const response = await fetch('/api/user/tier');
      if (response.ok) {
        const data = await response.json();
        setUserTier(data.tier || 1);
      }
    } catch (error) {
      console.error('Error fetching user tier:', error);
      setUserTier(1);
    }
  };

  const loadStyleData = async () => {
    try {
      const response = await fetch('/api/style/profile');
      if (response.ok) {
        const data = await response.json();
        setStyleData(data);
      }
    } catch (error) {
      console.error('Error loading style data:', error);
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
        setStyleData(prev => prev ? { ...prev, style_enabled: enabled } : null);
        toast({
          title: enabled ? "Style enabled" : "Style disabled",
          description: enabled 
            ? "Your writing style will be applied to generated content" 
            : "Content will be generated without your personal style",
        });
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

  // Don't show for Tier 1-2 users
  if (userTier !== null && userTier < 3) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading style settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!styleData?.has_style) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <PenTool className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Train Your Writing Style</h3>
                <p className="text-sm text-blue-700">
                  Upload writing samples to make AI generate content in your unique voice
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/settings?tab=style">
                <Settings className="h-4 w-4 mr-2" />
                Setup Style
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${styleData.style_enabled ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              styleData.style_enabled ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {styleData.style_enabled ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-semibold ${
                  styleData.style_enabled ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  Your Writing Style
                </h3>
                <Badge variant={styleData.style_enabled ? "default" : "secondary"}>
                  {styleData.confidence_score}% confidence
                </Badge>
              </div>
              <p className={`text-sm ${
                styleData.style_enabled ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {styleData.style_enabled 
                  ? `Active - AI will write in your ${styleData.profile?.tone} style`
                  : `Disabled - Upload more samples to improve ${styleData.confidence_score}% confidence`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="style-toggle" className="text-sm font-medium">
                {styleData.style_enabled ? 'Active' : 'Inactive'}
              </Label>
              <Switch
                id="style-toggle"
                checked={styleData.style_enabled}
                onCheckedChange={toggleStyleEnabled}
                disabled={isToggling || !styleData.can_enable}
              />
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/settings?tab=style">
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}







