"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings,
  Server,
  Database,
  Key,
  Users,
  BarChart3,
  Shield,
  Mail,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  Edit,
  Monitor,
  Zap,
  Globe,
  Lock
} from "lucide-react";

interface SystemConfig {
  // API Configuration
  openrouterApiKey: string;
  groqApiKey: string;
  defaultModel: string;
  fallbackModel: string;
  maxTokens: number;
  temperature: number;
  
  // Database Settings
  databaseUrl: string;
  connectionPoolSize: number;
  queryTimeout: number;
  
  // System Limits
  freeUserCredits: number;
  proUserCredits: number;
  maxGenerationsPerDay: number;
  maxFileSize: number;
  
  // Email Configuration
  resendApiKey: string;
  fromEmail: string;
  supportEmail: string;
  
  // Security Settings
  sessionTimeout: number;
  maxLoginAttempts: number;
  enable2FA: boolean;
  allowedDomains: string[];
  
  // Feature Flags
  enablePredictiveScoring: boolean;
  enableTrendAnalysis: boolean;
  enableScheduling: boolean;
  enableTemplates: boolean;
  maintenanceMode: boolean;
  
  // Analytics
  enableAnalytics: boolean;
  analyticsProvider: string;
  trackingId: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig>({
    openrouterApiKey: "",
    groqApiKey: "",
    defaultModel: "qwen/qwen3-235b-a22b-2507",
    fallbackModel: "groq/llama-3.1-8b-instant",
    maxTokens: 1000,
    temperature: 0.7,
    databaseUrl: "",
    connectionPoolSize: 10,
    queryTimeout: 30000,
    freeUserCredits: 10,
    proUserCredits: 1000,
    maxGenerationsPerDay: 50,
    maxFileSize: 10485760, // 10MB
    resendApiKey: "",
    fromEmail: "noreply@yoursaas.com",
    supportEmail: "support@yoursaas.com",
    sessionTimeout: 86400, // 24 hours
    maxLoginAttempts: 5,
    enable2FA: false,
    allowedDomains: [],
    enablePredictiveScoring: true,
    enableTrendAnalysis: true,
    enableScheduling: true,
    enableTemplates: true,
    maintenanceMode: false,
    enableAnalytics: true,
    analyticsProvider: "simple-analytics",
    trackingId: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    database: "connected",
    openrouter: "connected",
    groq: "connected",
    email: "connected",
    analytics: "connected"
  });

  useEffect(() => {
    loadSystemConfig();
    checkSystemStatus();
  }, []);

  const loadSystemConfig = async () => {
    try {
      const response = await fetch('/api/admin/system-config');
      if (response.ok) {
        const data = await response.json();
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to load system config:', error);
    }
  };

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/admin/system-status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
    }
  };

  const saveSystemConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/system-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast({
          title: "Configuration saved",
          description: "System configuration has been updated successfully.",
        });
        checkSystemStatus(); // Refresh status after config change
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (service: string) => {
    try {
      const response = await fetch(`/api/admin/test-connection?service=${service}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Connection test successful",
          description: `${service} connection is working properly.`,
        });
        checkSystemStatus();
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      toast({
        title: "Connection test failed",
        description: `${service} connection is not working.`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and manage application behavior.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={checkSystemStatus}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
          <Button onClick={saveSystemConfig} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>System Status</span>
            </CardTitle>
            <CardDescription>
            Current status of all system components
            </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(systemStatus).map(([service, status]) => (
              <div key={service} className="flex items-center space-x-2 p-3 border rounded-lg">
                {getStatusIcon(status)}
                <div>
                  <p className="font-medium capitalize">{service}</p>
                  <p className={`text-sm ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
            </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection(service)}
                  className="ml-auto"
                >
                  Test
                </Button>
            </div>
            ))}
            </div>
          </CardContent>
        </Card>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Config
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Limits
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* API Configuration */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>AI API Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure AI service providers and models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show API Keys</Label>
                <Switch
                  checked={showApiKeys}
                  onCheckedChange={setShowApiKeys}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="openrouterKey">OpenRouter API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="openrouterKey"
                    type={showApiKeys ? "text" : "password"}
                    value={config.openrouterApiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, openrouterApiKey: e.target.value }))}
                    placeholder="Enter OpenRouter API key"
                  />
                  <Button variant="outline" size="sm" onClick={() => testConnection('openrouter')}>
                    Test
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="groqKey">Groq API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="groqKey"
                    type={showApiKeys ? "text" : "password"}
                    value={config.groqApiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, groqApiKey: e.target.value }))}
                    placeholder="Enter Groq API key"
                  />
                  <Button variant="outline" size="sm" onClick={() => testConnection('groq')}>
                    Test
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultModel">Default Model</Label>
                  <Select value={config.defaultModel} onValueChange={(value) => setConfig(prev => ({ ...prev, defaultModel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qwen/qwen3-235b-a22b-2507">Qwen 3 235B</SelectItem>
                      <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="meta-llama/llama-3.1-405b-instruct">Llama 3.1 405B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fallbackModel">Fallback Model</Label>
                  <Select value={config.fallbackModel} onValueChange={(value) => setConfig(prev => ({ ...prev, fallbackModel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fallback model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="groq/llama-3.1-8b-instant">Llama 3.1 8B (Groq)</SelectItem>
                      <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="anthropic/claude-3-haiku">Claude 3 Haiku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1000 }))}
                    min={100}
                    max={4000}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.7 }))}
                    min={0.1}
                    max={1.0}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Configuration */}
        <TabsContent value="database" className="space-y-6">
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
                <span>Database Configuration</span>
            </CardTitle>
            <CardDescription>
                Configure database connection and performance settings
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="databaseUrl">Database URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="databaseUrl"
                    type="password"
                    value={config.databaseUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, databaseUrl: e.target.value }))}
                    placeholder="postgresql://..."
                  />
                  <Button variant="outline" size="sm" onClick={() => testConnection('database')}>
                    Test
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poolSize">Connection Pool Size</Label>
                  <Input
                    id="poolSize"
                    type="number"
                    value={config.connectionPoolSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, connectionPoolSize: parseInt(e.target.value) || 10 }))}
                    min={1}
                    max={50}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="queryTimeout">Query Timeout (ms)</Label>
                  <Input
                    id="queryTimeout"
                    type="number"
                    value={config.queryTimeout}
                    onChange={(e) => setConfig(prev => ({ ...prev, queryTimeout: parseInt(e.target.value) || 30000 }))}
                    min={1000}
                    max={300000}
                  />
                </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* System Limits */}
        <TabsContent value="limits" className="space-y-6">
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Usage Limits & Security</span>
            </CardTitle>
            <CardDescription>
                Configure usage limits and security settings
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freeCredits">Free User Credits</Label>
                  <Input
                    id="freeCredits"
                    type="number"
                    value={config.freeUserCredits}
                    onChange={(e) => setConfig(prev => ({ ...prev, freeUserCredits: parseInt(e.target.value) || 10 }))}
                    min={0}
                    max={100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proCredits">Pro User Credits</Label>
                  <Input
                    id="proCredits"
                    type="number"
                    value={config.proUserCredits}
                    onChange={(e) => setConfig(prev => ({ ...prev, proUserCredits: parseInt(e.target.value) || 1000 }))}
                    min={100}
                    max={10000}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxGenerations">Max Generations Per Day</Label>
                  <Input
                    id="maxGenerations"
                    type="number"
                    value={config.maxGenerationsPerDay}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxGenerationsPerDay: parseInt(e.target.value) || 50 }))}
                    min={1}
                    max={1000}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (bytes)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={config.maxFileSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) || 10485760 }))}
                    min={1048576} // 1MB
                    max={104857600} // 100MB
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.sessionTimeout}
                    onChange={(e) => setConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 86400 }))}
                    min={3600} // 1 hour
                    max={604800} // 1 week
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={config.maxLoginAttempts}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 }))}
                    min={3}
                    max={20}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all users
                  </p>
            </div>
                <Switch
                  checked={config.enable2FA}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enable2FA: checked }))}
                />
            </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowedDomains">Allowed Email Domains</Label>
                <Textarea
                  id="allowedDomains"
                  value={config.allowedDomains.join(', ')}
                  onChange={(e) => setConfig(prev => ({ ...prev, allowedDomains: e.target.value.split(',').map(d => d.trim()).filter(d => d) }))}
                  placeholder="example.com, company.org (leave empty to allow all)"
                  rows={3}
                />
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Email Configuration */}
        <TabsContent value="email" className="space-y-6">
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
                <span>Email Configuration</span>
            </CardTitle>
            <CardDescription>
                Configure email service and templates
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resendKey">Resend API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="resendKey"
                    type="password"
                    value={config.resendApiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, resendApiKey: e.target.value }))}
                    placeholder="Enter Resend API key"
                  />
                  <Button variant="outline" size="sm" onClick={() => testConnection('email')}>
                    Test
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={config.fromEmail}
                    onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                    placeholder="noreply@yoursaas.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={config.supportEmail}
                    onChange={(e) => setConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                    placeholder="support@yoursaas.com"
                  />
            </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Feature Flags</span>
              </CardTitle>
              <CardDescription>
                Enable or disable application features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Predictive Performance Scoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered content performance predictions
                    </p>
                  </div>
                  <Switch
                    checked={config.enablePredictiveScoring}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enablePredictiveScoring: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Trend Analysis</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable trending topics and hashtag analysis
                    </p>
                  </div>
                  <Switch
                    checked={config.enableTrendAnalysis}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableTrendAnalysis: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Content Scheduling</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable scheduled content posting
                    </p>
                  </div>
                  <Switch
                    checked={config.enableScheduling}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableScheduling: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Content Templates</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable customizable content templates
                    </p>
                  </div>
                  <Switch
                    checked={config.enableTemplates}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableTemplates: checked }))}
                  />
      </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-orange-600">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable the application for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Configuration */}
        <TabsContent value="analytics" className="space-y-6">
      <Card>
        <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Analytics Configuration</span>
              </CardTitle>
          <CardDescription>
                Configure analytics and tracking services
          </CardDescription>
        </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Track user behavior and application metrics
                  </p>
                </div>
                <Switch
                  checked={config.enableAnalytics}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableAnalytics: checked }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="analyticsProvider">Analytics Provider</Label>
                <Select value={config.analyticsProvider} onValueChange={(value) => setConfig(prev => ({ ...prev, analyticsProvider: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select analytics provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple-analytics">Simple Analytics</SelectItem>
                    <SelectItem value="google-analytics">Google Analytics</SelectItem>
                    <SelectItem value="posthog">PostHog</SelectItem>
                    <SelectItem value="mixpanel">Mixpanel</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trackingId">Tracking ID / API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="trackingId"
                    type="password"
                    value={config.trackingId}
                    onChange={(e) => setConfig(prev => ({ ...prev, trackingId: e.target.value }))}
                    placeholder="Enter tracking ID or API key"
                  />
                  <Button variant="outline" size="sm" onClick={() => testConnection('analytics')}>
                    Test
                  </Button>
                </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}