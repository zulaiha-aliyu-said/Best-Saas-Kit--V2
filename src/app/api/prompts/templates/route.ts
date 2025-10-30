import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPromptTemplates, incrementTemplateUsage } from '@/lib/database';

export const runtime = 'edge';

// GET /api/prompts/templates - Get system prompt templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get templates
    const templates = await getPromptTemplates(category, limit);

    // Group by category for easier navigation
    const groupedByCategory = templates.reduce((acc: any, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      templates,
      grouped: groupedByCategory,
      count: templates.length,
      categories: Object.keys(groupedByCategory)
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/prompts/templates/[id]/use - Track template usage
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { templateId } = body;

    if (!templateId || typeof templateId !== 'number') {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Increment usage counter
    await incrementTemplateUsage(templateId);

    return NextResponse.json({
      success: true,
      message: 'Template usage tracked'
    });
  } catch (error) {
    console.error('Error tracking template usage:', error);
    return NextResponse.json(
      { error: 'Failed to track template usage' },
      { status: 500 }
    );
  }
}

