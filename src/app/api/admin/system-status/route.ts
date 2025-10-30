import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { testDatabaseConnection, testOpenRouterConnection, testGroqConnection, testEmailConnection } from '@/lib/database';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    await requireAdminAccess();
    
    const status = {
      database: "unknown",
      openrouter: "unknown",
      groq: "unknown",
      email: "unknown",
      analytics: "unknown"
    };

    // Test database connection
    try {
      await testDatabaseConnection();
      status.database = "connected";
    } catch (error) {
      status.database = "error";
    }

    // Test OpenRouter connection
    try {
      await testOpenRouterConnection();
      status.openrouter = "connected";
    } catch (error) {
      status.openrouter = "error";
    }

    // Test Groq connection
    try {
      await testGroqConnection();
      status.groq = "connected";
    } catch (error) {
      status.groq = "error";
    }

    // Test email connection
    try {
      await testEmailConnection();
      status.email = "connected";
    } catch (error) {
      status.email = "error";
    }

    // Analytics is always connected (no external service)
    status.analytics = "connected";

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking system status:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}







