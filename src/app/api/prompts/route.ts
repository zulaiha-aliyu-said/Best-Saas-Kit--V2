import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, getUserPrompts, createPrompt, getPromptStatistics } from '@/lib/database';

// GET /api/prompts - Get user's prompts with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserByGoogleId(session.user.email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const favoritesOnly = searchParams.get('favorites') === 'true';
    const search = searchParams.get('search') || undefined;
    const includeStats = searchParams.get('stats') === 'true';

    // Get prompts
    const prompts = await getUserPrompts(String(user.id), category, favoritesOnly, search);

    // Optionally include statistics
    let stats = null;
    if (includeStats) {
      stats = await getPromptStatistics(String(user.id));
    }

    return NextResponse.json({
      success: true,
      prompts,
      stats,
      count: prompts.length
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create new prompt
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserByGoogleId(session.user.email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, prompt, category, is_favorite } = body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        { error: 'Title must be less than 255 characters' },
        { status: 400 }
      );
    }

    // Valid categories
    const validCategories = ['content_ideas', 'research', 'writing', 'strategy', 'hooks', 'general'];
    const promptCategory = category && validCategories.includes(category) ? category : 'general';

    // Create prompt
    const newPrompt = await createPrompt({
      user_id: String(user.id), // Ensure it's a string
      title: title.trim(),
      prompt: prompt.trim(),
      category: promptCategory,
      is_favorite: is_favorite === true
    });

    return NextResponse.json({
      success: true,
      prompt: newPrompt,
      message: 'Prompt saved successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}


