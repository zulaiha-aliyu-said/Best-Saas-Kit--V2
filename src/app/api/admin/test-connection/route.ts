import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { testDatabaseConnection, testOpenRouterConnection, testGroqConnection, testEmailConnection } from '@/lib/database';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    await requireAdminAccess();
    
    const { searchParams } = new URL(req.url);
    const service = searchParams.get('service');

    if (!service) {
      return NextResponse.json({ error: "Service parameter is required" }, { status: 400 });
    }

    let result = { status: "error", message: "Unknown service" };

    switch (service) {
      case 'database':
        try {
          await testDatabaseConnection();
          result = { status: "connected", message: "Database connection successful" };
        } catch (error: any) {
          result = { status: "error", message: `Database connection failed: ${error.message}` };
        }
        break;

      case 'openrouter':
        try {
          await testOpenRouterConnection();
          result = { status: "connected", message: "OpenRouter API connection successful" };
        } catch (error: any) {
          result = { status: "error", message: `OpenRouter API connection failed: ${error.message}` };
        }
        break;

      case 'groq':
        try {
          await testGroqConnection();
          result = { status: "connected", message: "Groq API connection successful" };
        } catch (error: any) {
          result = { status: "error", message: `Groq API connection failed: ${error.message}` };
        }
        break;

      case 'email':
        try {
          await testEmailConnection();
          result = { status: "connected", message: "Email service connection successful" };
        } catch (error: any) {
          result = { status: "error", message: `Email service connection failed: ${error.message}` };
        }
        break;

      case 'analytics':
        result = { status: "connected", message: "Analytics service is always available" };
        break;

      default:
        return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}







