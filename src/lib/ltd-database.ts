/**
 * Database functions for LTD (Lifetime Deal) operations
 */

import { pool } from './database';
import { LTDTier, getSubscriptionStatusFromTier } from './ltd-tiers';

// ============================================================================
// INTERFACES
// ============================================================================

export interface LTDCode {
  id: number;
  code: string;
  tier: LTDTier;
  is_redeemed: boolean;
  redeemed_by: number | null;
  redeemed_at: Date | null;
  created_at: Date;
  expires_at: Date | null;
  batch_id: string | null;
}

export interface LTDRedemption {
  id: number;
  user_id: number;
  code_id: number;
  tier: LTDTier;
  redeemed_at: Date;
  credits_added: number;
  previous_tier: number | null;
}

export interface CreateLTDCodeData {
  code: string;
  tier: LTDTier;
  expires_at?: Date;
  batch_id?: string;
}

// ============================================================================
// LTD CODE MANAGEMENT
// ============================================================================

/**
 * Generate a single LTD code
 */
export async function createLTDCode(data: CreateLTDCodeData): Promise<LTDCode> {
  const client = await pool.connect();
  
  try {
    const query = `
      INSERT INTO ltd_codes (code, tier, expires_at, batch_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      data.code,
      data.tier,
      data.expires_at || null,
      data.batch_id || null,
    ]);
    
    return result.rows[0] as LTDCode;
  } finally {
    client.release();
  }
}

/**
 * Generate multiple LTD codes in a batch
 */
export async function createLTDCodeBatch(
  tier: LTDTier,
  count: number,
  prefix: string = 'APPSUMO',
  expiresAt?: Date
): Promise<LTDCode[]> {
  const client = await pool.connect();
  const batchId = `BATCH_${Date.now()}`;
  const codes: LTDCode[] = [];
  
  try {
    await client.query('BEGIN');
    
    for (let i = 0; i < count; i++) {
      const code = `${prefix}-${tier}-${generateRandomString(12)}`;
      
      const query = `
        INSERT INTO ltd_codes (code, tier, expires_at, batch_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await client.query(query, [
        code,
        tier,
        expiresAt || null,
        batchId,
      ]);
      
      codes.push(result.rows[0] as LTDCode);
    }
    
    await client.query('COMMIT');
    return codes;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get LTD code by code string
 */
export async function getLTDCode(code: string): Promise<LTDCode | null> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT * FROM ltd_codes WHERE code = $1
    `;
    
    const result = await client.query(query, [code]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as LTDCode;
  } finally {
    client.release();
  }
}

/**
 * Check if a code is valid and can be redeemed
 */
export async function validateLTDCode(code: string): Promise<{
  valid: boolean;
  reason?: string;
  codeData?: LTDCode;
}> {
  const codeData = await getLTDCode(code);
  
  if (!codeData) {
    return { valid: false, reason: 'Code not found' };
  }
  
  if (codeData.is_redeemed) {
    return { valid: false, reason: 'Code already redeemed' };
  }
  
  if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
    return { valid: false, reason: 'Code has expired' };
  }
  
  return { valid: true, codeData };
}

// ============================================================================
// CODE REDEMPTION
// ============================================================================

/**
 * Redeem an LTD code for a user
 */
export async function redeemLTDCode(
  userId: string | number,
  code: string
): Promise<{
  success: boolean;
  error?: string;
  tier?: LTDTier;
  credits_added?: number;
  new_tier?: LTDTier;
}> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Validate code
    const validation = await validateLTDCode(code);
    if (!validation.valid || !validation.codeData) {
      await client.query('ROLLBACK');
      return { success: false, error: validation.reason };
    }
    
    const codeData = validation.codeData;
    
    // Get user's current plan
    const userQuery = `
      SELECT id, plan_type, ltd_tier, monthly_credit_limit, stacked_codes
      FROM users
      WHERE id = $1
      FOR UPDATE
    `;
    const userResult = await client.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'User not found' };
    }
    
    const user = userResult.rows[0];
    const currentTier = user.ltd_tier;
    const currentStackedCodes = user.stacked_codes || 0;
    
    // Determine new tier and credits
    let newTier: LTDTier;
    let creditsToAdd: number;
    let newMonthlyLimit: number;
    let newStackedCodes: number;
    
    if (user.plan_type === 'ltd' && currentTier) {
      // User already has LTD - check if stacking or upgrading
      if (codeData.tier === currentTier) {
        // Stacking same tier
        newTier = currentTier;
        newStackedCodes = currentStackedCodes + 1;
        const tierCredits = getTierMonthlyCredits(codeData.tier);
        creditsToAdd = tierCredits;
        newMonthlyLimit = tierCredits * newStackedCodes;
      } else if (codeData.tier > currentTier) {
        // Upgrading to higher tier
        newTier = codeData.tier;
        newStackedCodes = 1; // Reset stacked codes on upgrade
        creditsToAdd = getTierMonthlyCredits(codeData.tier);
        newMonthlyLimit = creditsToAdd;
      } else {
        // Trying to redeem lower tier - not allowed
        await client.query('ROLLBACK');
        return { 
          success: false, 
          error: `Cannot redeem Tier ${codeData.tier} when you have Tier ${currentTier}. You can only upgrade or stack same tier.` 
        };
      }
    } else {
      // First LTD code
      newTier = codeData.tier;
      newStackedCodes = 1;
      creditsToAdd = getTierMonthlyCredits(codeData.tier);
      newMonthlyLimit = creditsToAdd;
    }
    
    // Update user
    const updateQuery = `
      UPDATE users
      SET 
        plan_type = 'ltd',
        ltd_tier = $1,
        subscription_status = $2,
        monthly_credit_limit = $3,
        credits = credits + $4,
        stacked_codes = $5,
        credit_reset_date = COALESCE(credit_reset_date, CURRENT_TIMESTAMP + INTERVAL '1 month'),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `;
    
    await client.query(updateQuery, [
      newTier,
      getSubscriptionStatusFromTier(newTier),
      newMonthlyLimit,
      creditsToAdd,
      newStackedCodes,
      userId,
    ]);
    
    // Mark code as redeemed
    const redeemCodeQuery = `
      UPDATE ltd_codes
      SET is_redeemed = TRUE,
          redeemed_by = $1,
          redeemed_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    await client.query(redeemCodeQuery, [userId, codeData.id]);
    
    // Record redemption
    const redemptionQuery = `
      INSERT INTO ltd_redemptions (user_id, code_id, tier, credits_added, previous_tier)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    await client.query(redemptionQuery, [
      userId,
      codeData.id,
      newTier,
      creditsToAdd,
      currentTier,
    ]);
    
    await client.query('COMMIT');
    
    return {
      success: true,
      tier: codeData.tier,
      credits_added: creditsToAdd,
      new_tier: newTier,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error redeeming LTD code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  } finally {
    client.release();
  }
}

/**
 * Get user's redemption history
 */
export async function getUserRedemptions(userId: string | number): Promise<LTDRedemption[]> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT r.*, c.code
      FROM ltd_redemptions r
      JOIN ltd_codes c ON c.id = r.code_id
      WHERE r.user_id = $1
      ORDER BY r.redeemed_at DESC
    `;
    
    const result = await client.query(query, [userId]);
    return result.rows as LTDRedemption[];
  } finally {
    client.release();
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get monthly credits for a tier
 */
function getTierMonthlyCredits(tier: LTDTier): number {
  const credits: Record<LTDTier, number> = {
    1: 100,
    2: 300,
    3: 750,
    4: 2000,
  };
  
  return credits[tier];
}

/**
 * Generate random string for codes
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get LTD statistics for admin
 */
export async function getLTDStatistics() {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        tier,
        COUNT(*) as total_codes,
        COUNT(*) FILTER (WHERE is_redeemed = TRUE) as redeemed_codes,
        COUNT(*) FILTER (WHERE is_redeemed = FALSE) as available_codes,
        COUNT(DISTINCT redeemed_by) as unique_users
      FROM ltd_codes
      GROUP BY tier
      ORDER BY tier
    `;
    
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get users by LTD tier
 */
export async function getUsersByLTDTier(tier: LTDTier) {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id,
        email,
        name,
        ltd_tier,
        monthly_credit_limit,
        credits,
        stacked_codes,
        created_at
      FROM users
      WHERE plan_type = 'ltd' AND ltd_tier = $1
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query, [tier]);
    return result.rows;
  } finally {
    client.release();
  }
}

