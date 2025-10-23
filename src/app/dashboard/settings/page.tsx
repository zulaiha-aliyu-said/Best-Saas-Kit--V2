"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { StyleTrainingComponent } from "@/components/style/style-training";
import { StyleProfileComponent } from "@/components/style/style-profile";
import { StyleTestComponent } from "@/components/style/style-test";
import { UpgradePrompt } from "@/components/upgrade/UpgradePrompt";
import { 
  User, 
  Bot, 
  FileText, 
  Bell, 
  Shield, 
  CreditCard, 
  Palette,
  Settings,
  Key,
  Trash2,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  PenTool
} from "lucide-react";

interface UserPreferences {
  // Profile
  name: string;
  email: string;
  bio: string;
  company: string;
  timezone: string;
  
  // AI Preferences
  preferredModel: string;
  temperature: number;
  maxTokens: number;
  
  // Content Defaults
  defaultTone: string;
  defaultLength: string;
  defaultPlatforms: string[];
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
  customHook: string;
  customCTA: string;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  usageAlerts: boolean;
  
  // Privacy & Security
  twoFactorEnabled: boolean;
  dataExportEnabled: boolean;
  
  // Appearance
  theme: string;
  compactMode: boolean;
  
  // Platform Optimization
  platformOptimizationEnabled: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>({
    name: "",
    email: "",
    bio: "",
    company: "",
    timezone: "UTC",
    preferredModel: "qwen/qwen3-235b-a22b-2507",
    temperature: 0.7,
    maxTokens: 1000,
    defaultTone: "professional",
    defaultLength: "medium",
    defaultPlatforms: ["x", "linkedin", "instagram"],
    includeHashtags: true,
    includeEmojis: false,
    includeCTA: false,
    customHook: "",
    customCTA: "",
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    usageAlerts: true,
    twoFactorEnabled: false,
    dataExportEnabled: true,
    theme: "system",
    compactMode: false,
    platformOptimizationEnabled: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [userTier, setUserTier] = useState<number>(1);

  useEffect(() => {
    // Load user preferences from API
    loadPreferences();
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

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/users/preferences');
      if (response.ok) {
        const data = await response.json();
        // Ensure defaultPlatforms is always an array
        if (data.defaultPlatforms && !Array.isArray(data.defaultPlatforms)) {
          data.defaultPlatforms = ["x", "linkedin", "instagram"];
        }
        if (!data.defaultPlatforms) {
          data.defaultPlatforms = ["x", "linkedin", "instagram"];
        }
        setPreferences(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = async () => {
    setIsLoading(true);
    console.log('💾 FRONTEND: Saving preferences...');
    console.log('  platformOptimizationEnabled:', preferences.platformOptimizationEnabled);
    console.log('  Full preferences:', preferences);
    
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      console.log('  Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('  ✅ Response data:', data);
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated successfully.",
        });
      } else {
        console.error('  ❌ Save failed with status:', response.status);
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('  ❌ Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setPreferences(prev => ({
      ...prev,
      defaultPlatforms: prev.defaultPlatforms.includes(platform)
        ? prev.defaultPlatforms.filter(p => p !== platform)
        : [...prev.defaultPlatforms, platform]
    }));
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText("sk_user_••••••••••••••••••••••••••••");
    toast({
      title: "API Key copied",
      description: "Your API key has been copied to clipboard.",
    });
  };

  const regenerateApiKey = async () => {
    try {
      const response = await fetch('/api/users/regenerate-api-key', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "API Key regenerated",
          description: "Your API key has been regenerated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate API key.",
        variant: "destructive",
      });
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/users/export-data');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user-data-export.json';
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Data exported",
          description: "Your data has been downloaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Button onClick={savePreferences} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${userTier >= 3 ? 'grid-cols-7' : 'grid-cols-6'}`}>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          {userTier >= 3 && (
            <TabsTrigger value="style" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Writing Style
              <Badge className="ml-1 bg-purple-600 text-[10px] px-1 py-0">Tier 3+</Badge>
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Update your personal information and display preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={preferences.name}
                    onChange={(e) => setPreferences(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={preferences.email}
                    onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={preferences.company}
                  onChange={(e) => setPreferences(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter your company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={preferences.bio}
                  onChange={(e) => setPreferences(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={preferences.timezone} onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>
                Customize your interface preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use a more compact interface layout
                  </p>
                </div>
                <Switch
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, compactMode: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Preferences */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>AI Model Settings</span>
              </CardTitle>
              <CardDescription>
                Configure your AI model preferences and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Preferred AI Model</Label>
                <Select value={preferences.preferredModel} onValueChange={(value) => setPreferences(prev => ({ ...prev, preferredModel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qwen/qwen3-235b-a22b-2507">Qwen 3 235B (Recommended)</SelectItem>
                    <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="meta-llama/llama-3.1-405b-instruct">Llama 3.1 405B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Temperature: {preferences.temperature}</Label>
                <p className="text-sm text-muted-foreground">
                  Controls creativity vs consistency (0.1 = consistent, 1.0 = creative)
                </p>
                <Slider
                  value={[preferences.temperature]}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, temperature: value[0] }))}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={preferences.maxTokens}
                  onChange={(e) => setPreferences(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1000 }))}
                  min={100}
                  max={4000}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum length of AI responses
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>API Access</span>
              </CardTitle>
              <CardDescription>
                Manage your API keys for integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User API Key</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {showApiKey ? "sk_user_••••••••••••••••••••••••••••" : "sk_user_••••••••••••••••••••••••••••"}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={regenerateApiKey}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Defaults */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Content Generation Defaults</span>
              </CardTitle>
              <CardDescription>
                Set your preferred defaults for content generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Default Tone</Label>
                  <Select value={preferences.defaultTone} onValueChange={(value) => setPreferences(prev => ({ ...prev, defaultTone: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="length">Default Length</Label>
                  <Select value={preferences.defaultLength} onValueChange={(value) => setPreferences(prev => ({ ...prev, defaultLength: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Default Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {['x', 'linkedin', 'instagram', 'facebook', 'tiktok', 'email'].map((platform) => (
                    <Badge
                      key={platform}
                      variant={preferences.defaultPlatforms.includes(platform) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handlePlatformToggle(platform)}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Hashtags</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically add relevant hashtags to generated content
                    </p>
                  </div>
                  <Switch
                    checked={preferences.includeHashtags}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, includeHashtags: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Emojis</Label>
                    <p className="text-sm text-muted-foreground">
                      Add emojis to make content more engaging
                    </p>
                  </div>
                  <Switch
                    checked={preferences.includeEmojis}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, includeEmojis: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Call-to-Action</Label>
                    <p className="text-sm text-muted-foreground">
                      End posts with a call-to-action
                    </p>
                  </div>
                  <Switch
                    checked={preferences.includeCTA}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, includeCTA: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Platform-Specific Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically optimize content for each platform (character limits, hashtags, threads, formatting)
                    </p>
                  </div>
                  <Switch
                    checked={preferences.platformOptimizationEnabled}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, platformOptimizationEnabled: checked }))}
                  />
                </div>
              </div>
              
              {preferences.platformOptimizationEnabled && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Platform Optimization Features:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li><strong>Twitter/X:</strong> Auto-split into threads if &gt;280 chars, 2-3 hashtags, line breaks</li>
                      <li><strong>LinkedIn:</strong> Optimize hook for first 140 chars, 3-5 hashtags, professional tone</li>
                      <li><strong>Instagram:</strong> Optimize hook for first 125 chars, 10-15 hashtags, emoji-friendly</li>
                      <li><strong>Email:</strong> Subject line & preview text optimization, shorter paragraphs, CTA suggestions</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="customHook">Custom Opening Hook</Label>
                <Input
                  id="customHook"
                  value={preferences.customHook}
                  onChange={(e) => setPreferences(prev => ({ ...prev, customHook: e.target.value }))}
                  placeholder="Enter a custom opening hook (optional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customCTA">Custom Call-to-Action</Label>
                <Input
                  id="customCTA"
                  value={preferences.customCTA}
                  onChange={(e) => setPreferences(prev => ({ ...prev, customCTA: e.target.value }))}
                  placeholder="Enter a custom call-to-action (optional)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Writing Style */}
        {userTier >= 3 ? (
          <TabsContent value="style" className="space-y-6">
            <div className="space-y-6">
              <StyleProfileComponent />
              <StyleTrainingComponent />
              <StyleTestComponent />
            </div>
          </TabsContent>
        ) : (
          <TabsContent value="style" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <UpgradePrompt
                  featureName='"Talk Like Me" Style Training'
                  currentTier={userTier}
                  requiredTier={3}
                  variant="inline"
                  benefits={[
                    "AI learns your unique writing voice",
                    "Generate content that sounds like you",
                    "1 style profile (Tier 3), 3 profiles (Tier 4)",
                    "Maintain brand consistency across platforms",
                    "750 credits/month (Tier 3)"
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your account
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and updates
                  </p>
                </div>
                <Switch
                  checked={preferences.marketingEmails}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketingEmails: checked }))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Usage Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when credits are running low
                  </p>
                </div>
                <Switch
                  checked={preferences.usageAlerts}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, usageAlerts: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Security */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {preferences.twoFactorEnabled ? "Disable" : "Enable"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Management</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage your active sessions
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Sessions
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or delete your account data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of your account data
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing & Usage */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Subscription & Billing</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription and payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Current Plan</Label>
                  <p className="text-sm text-muted-foreground">
                    Free Plan - 10 credits included
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Upgrade to Pro
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Credits Remaining</Label>
                  <p className="text-sm text-muted-foreground">
                    8 credits available
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Buy More Credits
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Method</Label>
                  <p className="text-sm text-muted-foreground">
                    No payment method on file
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Track your usage and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>This Month</Label>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Content generations</p>
                </div>
                <div className="space-y-2">
                  <Label>Total Predictions</Label>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground">Performance scores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
