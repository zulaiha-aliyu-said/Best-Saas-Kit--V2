import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/database';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT 
        id, name, description, word_count, tone, vocabulary_level,
        sentence_structure, paragraph_length, use_of_emojis,
        use_of_hashtags, use_of_questions, storytelling_approach,
        common_phrases, unique_patterns, is_active, trained_at, created_at
      FROM writing_style_profiles
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json({
      success: true,
      profiles: result.rows
    });

  } catch (error) {
    console.error('Error fetching style profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch style profiles' },
      { status: 500 }
    );
  }
}
