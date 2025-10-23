import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/database';
import { deductCredits as deductLTDCredits, getUserPlan } from '@/lib/feature-gate';
import { calculateCreditCost } from '@/lib/ltd-tiers';

// Placeholder replacement values
const AMOUNTS = ['10K', '50K', '100K', '250K', '500K', '1M'];
const NUMBERS = [3, 5, 7, 10, 12, 15];
const TIMEFRAMES = ['6 months', '1 year', '2 years', '3 years', '5 years'];
const PERCENTAGES = [25, 40, 67, 75, 85, 92, 95];

// Calculate viral potential based on score
function getViralPotential(score: number): string {
  if (score >= 85) return 'Very High';
  if (score >= 75) return 'High';
  return 'Medium';
}

// Replace placeholders in hook pattern
function replacePlaceholders(pattern: string, topic: string): string {
  let hook = pattern;
  
  // Replace topic
  hook = hook.replace(/{topic}/g, topic);
  
  // Replace random values
  hook = hook.replace(/\$?{amount}/g, () => {
    const amount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
    return `$${amount}`;
  });
  
  hook = hook.replace(/{number}/g, () => {
    return String(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
  });
  
  hook = hook.replace(/{timeframe}/g, () => {
    return TIMEFRAMES[Math.floor(Math.random() * TIMEFRAMES.length)];
  });
  
  hook = hook.replace(/{percentage}/g, () => {
    return String(PERCENTAGES[Math.floor(Math.random() * PERCENTAGES.length)]);
  });
  
  // Replace common placeholders
  hook = hook.replace(/{goal}/g, 'achieve your goals');
  hook = hook.replace(/{achievement}/g, '10x your results');
  hook = hook.replace(/{solution}/g, 'expensive tools');
  hook = hook.replace(/{challenge}/g, 'tough obstacles');
  hook = hook.replace(/{situation}/g, 'struggling');
  hook = hook.replace(/{starting_position}/g, 'beginner');
  hook = hook.replace(/{common_requirement}/g, 'spending thousands');
  hook = hook.replace(/{year}/g, '2020');
  
  return hook;
}

// Calculate engagement score with variance
function calculateEngagementScore(baseScore: number): number {
  // Add random variance of ±5
  const variance = Math.floor(Math.random() * 11) - 5;
  const score = baseScore + variance;
  return Math.max(65, Math.min(95, score));
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    const { topic, platform, niche } = await request.json();

    // Calculate and deduct credits for viral hook generation
    const plan = await getUserPlan(userId);
    const creditCost = calculateCreditCost('viral_hook', plan?.ltd_tier ?? undefined);
    
    console.log(`💳 Viral Hook Credit Calculation: ${creditCost} credits (Tier ${plan?.ltd_tier || 'free'})`);

    // Check and deduct credits
    const creditResult = await deductLTDCredits(
      userId,
      creditCost,
      'viral_hook',
      { topic, platform, niche }
    );

    if (!creditResult.success) {
      return NextResponse.json({
        error: creditResult.error || 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        remaining: creditResult.remaining,
        required: creditCost
      }, { status: 402 });
    }

    console.log(`✅ Deducted ${creditCost} credits for viral hooks. Remaining: ${creditResult.remaining}`);

    if (!topic || !platform || !niche) {
      return NextResponse.json(
        { error: 'Topic, platform, and niche are required' },
        { status: 400 }
      );
    }

    // Fetch patterns from database
    const result = await pool.query(
      `SELECT * FROM hook_patterns 
       WHERE platform = $1 AND niche = $2 
       ORDER BY RANDOM() 
       LIMIT 10`,
      [platform, niche]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No patterns found for this platform and niche' },
        { status: 404 }
      );
    }

    // Generate hooks with replaced placeholders
    const hooks = result.rows.map(pattern => {
      const engagementScore = calculateEngagementScore(pattern.base_engagement_score);
      const generatedHook = replacePlaceholders(pattern.pattern, topic);
      
      return {
        id: pattern.id,
        hook: generatedHook,
        engagementScore,
        category: pattern.category,
        viralPotential: getViralPotential(engagementScore),
        description: pattern.description,
        platform: pattern.platform,
        niche: pattern.niche,
      };
    });

    // Sort by engagement score (highest first)
    hooks.sort((a, b) => b.engagementScore - a.engagementScore);

    // Save generated hooks to database
    for (const hook of hooks) {
      await pool.query(
        `INSERT INTO generated_hooks 
         (user_id, pattern_id, platform, niche, topic, generated_hook, engagement_score, category, viral_potential)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          hook.id,
          hook.platform,
          hook.niche,
          topic,
          hook.hook,
          hook.engagementScore,
          hook.category,
          hook.viralPotential,
        ]
      );
    }

    return NextResponse.json({ 
      hooks,
      credits: creditResult.remaining,
      creditsUsed: creditCost
    });
  } catch (error) {
    console.error('Error generating hooks:', error);
    return NextResponse.json(
      { error: 'Failed to generate hooks' },
      { status: 500 }
    );
  }
}





