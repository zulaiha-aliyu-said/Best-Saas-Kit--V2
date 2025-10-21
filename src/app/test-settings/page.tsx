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
  RefreshCw
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
}

export default function TestSettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    // Profile
    name: "Test User",
    email: "test@example.com",
    bio: "",
    company: "",
    timezone: "UTC",
    
    // AI Preferences
    preferredModel: "qwen/qwen3-235b-a22b-2507",
    temperature: 0.7,
    maxTokens: 1000,
    
    // Content Defaults
    defaultTone: "professional",
    defaultLength: "medium",
    defaultPlatforms: ["x", "linkedin", "instagram"],
    includeHashtags: true,
    includeEmojis: false,
    includeCTA: false,
    customHook: "",
    customCTA: "",
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    usageAlerts: true,
    
    // Privacy & Security
    twoFactorEnabled: false,
    dataExportEnabled: true,
    
    // Appearance
    theme: "system",
    compactMode: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/users/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setPreferences({
            // Profile
            name: data.name || "Test User",
            email: data.email || "test@example.com",
            bio: data.bio || "",
            company: data.company || "",
            timezone: data.timezone || "UTC",
            
            // AI Preferences
            preferredModel: data.preferred_model || "qwen/qwen3-235b-a22b-2507",
            temperature: data.temperature || 0.7,
            maxTokens: data.max_tokens || 1000,
            
            // Content Defaults
            defaultTone: data.default_tone || "professional",
            defaultLength: data.default_length || "medium",
            defaultPlatforms: data.default_platforms || ["x", "linkedin", "instagram"],
            includeHashtags: data.include_hashtags !== false,
            includeEmojis: data.include_emojis || false,
            includeCTA: data.include_cta || false,
            customHook: data.custom_hook || "",
            customCTA: data.custom_cta || "",
            
            // Notifications
            emailNotifications: data.email_notifications !== false,
            pushNotifications: data.push_notifications || false,
            marketingEmails: data.marketing_emails !== false,
            usageAlerts: data.usage_alerts !== false,
            
            // Privacy & Security
            twoFactorEnabled: data.two_factor_enabled || false,
            dataExportEnabled: data.data_export_enabled !== false,
            
            // Appearance
            theme: data.theme || "system",
            compactMode: data.compact_mode || false,
          });
          
          if (data.api_key) {
            setApiKey(data.api_key);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated successfully.",
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateApiKey = async () => {
    try {
      const response = await fetch('/api/users/regenerate-api-key', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
        toast({
          title: "API Key regenerated",
          description: "Your new API key has been generated.",
        });
      } else {
        throw new Error('Failed to regenerate API key');
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
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Data exported",
          description: "Your data has been downloaded successfully.",
        });
      } else {
        throw new Error('Failed to export data');
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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
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
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={preferences.name}
                    onChange={(e) => setPreferences({...preferences, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={preferences.email}
                    onChange={(e) => setPreferences({...preferences, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={preferences.bio}
                  onChange={(e) => setPreferences({...preferences, bio: e.target.value})}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={preferences.company}
                    onChange={(e) => setPreferences({...preferences, company: e.target.value})}
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => setPreferences({...preferences, timezone: value})}>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Preferences
              </CardTitle>
              <CardDescription>
                Configure your AI model preferences and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="model">Preferred AI Model</Label>
                <Select value={preferences.preferredModel} onValueChange={(value) => setPreferences({...preferences, preferredModel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qwen/qwen3-235b-a22b-2507">Qwen 3 235B</SelectItem>
                    <SelectItem value="groq/llama-3.1-8b-instant">Llama 3.1 8B Instant</SelectItem>
                    <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Temperature: {preferences.temperature}</Label>
                  <Slider
                    value={[preferences.temperature]}
                    onValueChange={(value) => setPreferences({...preferences, temperature: value[0]})}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>More Consistent</span>
                    <span>More Creative</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Max Tokens: {preferences.maxTokens}</Label>
                  <Slider
                    value={[preferences.maxTokens]}
                    onValueChange={(value) => setPreferences({...preferences, maxTokens: value[0]})}
                    min={100}
                    max={4000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shorter responses</span>
                    <span>Longer responses</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Generation Defaults
              </CardTitle>
              <CardDescription>
                Set your default preferences for content generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Default Tone</Label>
                  <Select value={preferences.defaultTone} onValueChange={(value) => setPreferences({...preferences, defaultTone: value})}>
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
                  <Select value={preferences.defaultLength} onValueChange={(value) => setPreferences({...preferences, defaultLength: value})}>
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

              <div className="space-y-4">
                <Label>Default Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["x", "linkedin", "instagram", "facebook", "tiktok", "youtube", "pinterest", "threads"].map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={platform}
                        checked={preferences.defaultPlatforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPreferences({
                              ...preferences,
                              defaultPlatforms: [...preferences.defaultPlatforms, platform]
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              defaultPlatforms: preferences.defaultPlatforms.filter(p => p !== platform)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={platform} className="capitalize">{platform}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Content Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hashtags">Include Hashtags</Label>
                    <Switch
                      id="hashtags"
                      checked={preferences.includeHashtags}
                      onCheckedChange={(checked) => setPreferences({...preferences, includeHashtags: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emojis">Include Emojis</Label>
                    <Switch
                      id="emojis"
                      checked={preferences.includeEmojis}
                      onCheckedChange={(checked) => setPreferences({...preferences, includeEmojis: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cta">Include Call-to-Action</Label>
                    <Switch
                      id="cta"
                      checked={preferences.includeCTA}
                      onCheckedChange={(checked) => setPreferences({...preferences, includeCTA: checked})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customHook">Custom Hook</Label>
                  <Textarea
                    id="customHook"
                    value={preferences.customHook}
                    onChange={(e) => setPreferences({...preferences, customHook: e.target.value})}
                    placeholder="Enter your custom hook..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customCTA">Custom Call-to-Action</Label>
                  <Textarea
                    id="customCTA"
                    value={preferences.customCTA}
                    onChange={(e) => setPreferences({...preferences, customCTA: e.target.value})}
                    placeholder="Enter your custom CTA..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => setPreferences({...preferences, emailNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => setPreferences({...preferences, pushNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={preferences.marketingEmails}
                    onCheckedChange={(checked) => setPreferences({...preferences, marketingEmails: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="usageAlerts">Usage Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when approaching usage limits</p>
                  </div>
                  <Switch
                    id="usageAlerts"
                    checked={preferences.usageAlerts}
                    onCheckedChange={(checked) => setPreferences({...preferences, usageAlerts: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your privacy settings and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    id="twoFactor"
                    checked={preferences.twoFactorEnabled}
                    onCheckedChange={(checked) => setPreferences({...preferences, twoFactorEnabled: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="dataExport">Data Export</Label>
                    <p className="text-sm text-muted-foreground">Allow exporting your data</p>
                  </div>
                  <Switch
                    id="dataExport"
                    checked={preferences.dataExportEnabled}
                    onCheckedChange={(checked) => setPreferences({...preferences, dataExportEnabled: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Your API key will appear here"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(apiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={regenerateApiKey}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use this key to access our API. Keep it secure and don't share it publicly.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Management</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={exportData}
                      disabled={!preferences.dataExportEnabled}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                          toast({
                            title: "Account deletion",
                            description: "Account deletion feature coming soon.",
                          });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="compactMode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Use a more compact layout</p>
                </div>
                <Switch
                  id="compactMode"
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) => setPreferences({...preferences, compactMode: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button onClick={savePreferences} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
