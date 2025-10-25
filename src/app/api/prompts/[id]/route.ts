import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, getPromptById, updatePrompt, deletePrompt } from '@/lib/database';

// GET /api/prompts/[id] - Get single prompt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const promptId = parseInt(resolvedParams.id);
    if (isNaN(promptId)) {
      return NextResponse.json(
        { error: 'Invalid prompt ID' },
        { status: 400 }
      );
    }

    const prompt = await getPromptById(promptId, String(user.id));

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

// PUT /api/prompts/[id] - Update prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const promptId = parseInt(resolvedParams.id);
    if (isNaN(promptId)) {
      return NextResponse.json(
        { error: 'Invalid prompt ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, prompt, category, is_favorite } = body;

    // Build updates object
    const updates: any = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      if (title.length > 255) {
        return NextResponse.json(
          { error: 'Title must be less than 255 characters' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (prompt !== undefined) {
      if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        return NextResponse.json(
          { error: 'Prompt must be a non-empty string' },
          { status: 400 }
        );
      }
      updates.prompt = prompt.trim();
    }

    if (category !== undefined) {
      const validCategories = ['content_ideas', 'research', 'writing', 'strategy', 'hooks', 'general'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
      updates.category = category;
    }

    if (is_favorite !== undefined) {
      updates.is_favorite = is_favorite === true;
    }

    // Update prompt
    const updatedPrompt = await updatePrompt(promptId, String(user.id), updates);

    if (!updatedPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt: updatedPrompt,
      message: 'Prompt updated successfully'
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id] - Delete prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const promptId = parseInt(resolvedParams.id);
    if (isNaN(promptId)) {
      return NextResponse.json(
        { error: 'Invalid prompt ID' },
        { status: 400 }
      );
    }

    const deleted = await deletePrompt(promptId, String(user.id));

    if (!deleted) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
