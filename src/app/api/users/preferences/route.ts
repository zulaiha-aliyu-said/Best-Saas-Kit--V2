import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, updateUserPreferences, getUserPreferences } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // For testing purposes, if no session, return default preferences
    if (!session?.user?.id) {
      return NextResponse.json({
        name: "Test User",
        email: "test@example.com",
        bio: "",
        company: "",
        timezone: "UTC",
        preferred_model: "qwen/qwen3-235b-a22b-2507",
        temperature: 0.7,
        max_tokens: 1000,
        default_tone: "professional",
        default_length: "medium",
        default_platforms: ["x", "linkedin", "instagram"],
        include_hashtags: true,
        include_emojis: false,
        include_cta: false,
        custom_hook: "",
        custom_cta: "",
        email_notifications: true,
        push_notifications: false,
        marketing_emails: true,
        usage_alerts: true,
        two_factor_enabled: false,
        data_export_enabled: true,
        theme: "system",
        compact_mode: false,
        platform_optimization_enabled: false,
        api_key: ""
      });
    }

    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
    const preferences = await getUserPreferences(userId);
    
    console.log('🔍 GET /api/users/preferences');
    console.log('  User ID:', userId);
    console.log('  DB platform_optimization_enabled:', preferences.platform_optimization_enabled);
    console.log('  DB preferences keys:', Object.keys(preferences));
    
    // Convert snake_case from database to camelCase for frontend
    const frontendPreferences = {
      name: preferences.name || "",
      email: preferences.email || "",
      bio: preferences.bio || "",
      company: preferences.company || "",
      timezone: preferences.timezone || "UTC",
      preferredModel: preferences.preferred_model || "qwen/qwen3-235b-a22b-2507",
      temperature: preferences.temperature || 0.7,
      maxTokens: preferences.max_tokens || 1000,
      defaultTone: preferences.default_tone || "professional",
      defaultLength: preferences.default_length || "medium",
      defaultPlatforms: Array.isArray(preferences.default_platforms) 
        ? preferences.default_platforms 
        : ["x", "linkedin", "instagram"],
      includeHashtags: preferences.include_hashtags !== false,
      includeEmojis: preferences.include_emojis === true,
      includeCTA: preferences.include_cta === true,
      customHook: preferences.custom_hook || "",
      customCTA: preferences.custom_cta || "",
      emailNotifications: preferences.email_notifications !== false,
      pushNotifications: preferences.push_notifications === true,
      marketingEmails: preferences.marketing_emails !== false,
      usageAlerts: preferences.usage_alerts !== false,
      twoFactorEnabled: preferences.two_factor_enabled === true,
      dataExportEnabled: preferences.data_export_enabled !== false,
      theme: preferences.theme || "system",
      compactMode: preferences.compact_mode === true,
      platformOptimizationEnabled: preferences.platform_optimization_enabled === true,
    };
    
    console.log('  ✅ Returning platformOptimizationEnabled:', frontendPreferences.platformOptimizationEnabled);
    
    return NextResponse.json(frontendPreferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // For testing purposes, if no session, just return success
    if (!session?.user?.id) {
      const preferences = await req.json();
      console.log("Test preferences saved:", preferences);
      return NextResponse.json({ 
        message: "Test preferences saved successfully",
        preferences: preferences 
      });
    }

    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
    const preferences = await req.json();
    
    console.log('💾 POST /api/users/preferences');
    console.log('  User ID:', userId);
    console.log('  Received platformOptimizationEnabled:', preferences.platformOptimizationEnabled);
    
    // Convert camelCase from frontend to snake_case for database
    const dbPreferences = {
      // Profile
      name: preferences.name || user.name || "",
      email: preferences.email || user.email || "",
      bio: preferences.bio || "",
      company: preferences.company || "",
      timezone: preferences.timezone || "UTC",
      
      // AI Preferences
      preferred_model: preferences.preferredModel || "qwen/qwen3-235b-a22b-2507",
      temperature: Math.max(0.1, Math.min(1.0, preferences.temperature || 0.7)),
      max_tokens: Math.max(100, Math.min(4000, preferences.maxTokens || 1000)),
      
      // Content Defaults
      default_tone: preferences.defaultTone || "professional",
      default_length: preferences.defaultLength || "medium",
      default_platforms: Array.isArray(preferences.defaultPlatforms) ? preferences.defaultPlatforms : ["x", "linkedin", "instagram"],
      include_hashtags: Boolean(preferences.includeHashtags),
      include_emojis: Boolean(preferences.includeEmojis),
      include_cta: Boolean(preferences.includeCTA),
      custom_hook: preferences.customHook || "",
      custom_cta: preferences.customCTA || "",
      
      // Notifications
      email_notifications: Boolean(preferences.emailNotifications),
      push_notifications: Boolean(preferences.pushNotifications),
      marketing_emails: Boolean(preferences.marketingEmails),
      usage_alerts: Boolean(preferences.usageAlerts),
      
      // Privacy & Security
      two_factor_enabled: Boolean(preferences.twoFactorEnabled),
      data_export_enabled: Boolean(preferences.dataExportEnabled),
      
      // Appearance
      theme: preferences.theme || "system",
      compact_mode: Boolean(preferences.compactMode),
      
      // Platform Optimization
      platform_optimization_enabled: Boolean(preferences.platformOptimizationEnabled),
    };

    console.log('  ✅ Saving platform_optimization_enabled:', dbPreferences.platform_optimization_enabled);
    
    await updateUserPreferences(userId, dbPreferences);
    
    console.log('  ✅ Database updated successfully');
    
    // Convert back to camelCase for response
    const responsePreferences = {
      name: dbPreferences.name,
      email: dbPreferences.email,
      bio: dbPreferences.bio,
      company: dbPreferences.company,
      timezone: dbPreferences.timezone,
      preferredModel: dbPreferences.preferred_model,
      temperature: dbPreferences.temperature,
      maxTokens: dbPreferences.max_tokens,
      defaultTone: dbPreferences.default_tone,
      defaultLength: dbPreferences.default_length,
      defaultPlatforms: dbPreferences.default_platforms,
      includeHashtags: dbPreferences.include_hashtags,
      includeEmojis: dbPreferences.include_emojis,
      includeCTA: dbPreferences.include_cta,
      customHook: dbPreferences.custom_hook,
      customCTA: dbPreferences.custom_cta,
      emailNotifications: dbPreferences.email_notifications,
      pushNotifications: dbPreferences.push_notifications,
      marketingEmails: dbPreferences.marketing_emails,
      usageAlerts: dbPreferences.usage_alerts,
      twoFactorEnabled: dbPreferences.two_factor_enabled,
      dataExportEnabled: dbPreferences.data_export_enabled,
      theme: dbPreferences.theme,
      compactMode: dbPreferences.compact_mode,
      platformOptimizationEnabled: dbPreferences.platform_optimization_enabled,
    };
    
    return NextResponse.json({ 
      message: "Preferences updated successfully",
      preferences: responsePreferences 
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
