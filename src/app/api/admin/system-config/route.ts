import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { getSystemConfig, updateSystemConfig } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    await requireAdminAccess();
    
    const config = await getSystemConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching system config:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminAccess();
    
    const config = await req.json();
    
    // Validate and sanitize configuration
    const validConfig = {
      // API Configuration
      openrouterApiKey: config.openrouterApiKey || "",
      groqApiKey: config.groqApiKey || "",
      defaultModel: config.defaultModel || "qwen/qwen3-235b-a22b-2507",
      fallbackModel: config.fallbackModel || "groq/llama-3.1-8b-instant",
      maxTokens: Math.max(100, Math.min(4000, config.maxTokens || 1000)),
      temperature: Math.max(0.1, Math.min(1.0, config.temperature || 0.7)),
      
      // Database Settings
      databaseUrl: config.databaseUrl || "",
      connectionPoolSize: Math.max(1, Math.min(50, config.connectionPoolSize || 10)),
      queryTimeout: Math.max(1000, Math.min(300000, config.queryTimeout || 30000)),
      
      // System Limits
      freeUserCredits: Math.max(0, Math.min(100, config.freeUserCredits || 10)),
      proUserCredits: Math.max(100, Math.min(10000, config.proUserCredits || 1000)),
      maxGenerationsPerDay: Math.max(1, Math.min(1000, config.maxGenerationsPerDay || 50)),
      maxFileSize: Math.max(1048576, Math.min(104857600, config.maxFileSize || 10485760)),
      
      // Email Configuration
      resendApiKey: config.resendApiKey || "",
      fromEmail: config.fromEmail || "noreply@yoursaas.com",
      supportEmail: config.supportEmail || "support@yoursaas.com",
      
      // Security Settings
      sessionTimeout: Math.max(3600, Math.min(604800, config.sessionTimeout || 86400)),
      maxLoginAttempts: Math.max(3, Math.min(20, config.maxLoginAttempts || 5)),
      enable2FA: Boolean(config.enable2FA),
      allowedDomains: Array.isArray(config.allowedDomains) ? config.allowedDomains : [],
      
      // Feature Flags
      enablePredictiveScoring: Boolean(config.enablePredictiveScoring),
      enableTrendAnalysis: Boolean(config.enableTrendAnalysis),
      enableScheduling: Boolean(config.enableScheduling),
      enableTemplates: Boolean(config.enableTemplates),
      maintenanceMode: Boolean(config.maintenanceMode),
      
      // Analytics
      enableAnalytics: Boolean(config.enableAnalytics),
      analyticsProvider: config.analyticsProvider || "simple-analytics",
      trackingId: config.trackingId || "",
    };

    await updateSystemConfig(validConfig);
    
    return NextResponse.json({ 
      message: "System configuration updated successfully",
      config: validConfig 
    });
  } catch (error) {
    console.error('Error updating system config:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}








