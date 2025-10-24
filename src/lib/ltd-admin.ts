/**
 * LTD Admin Utility Functions
 * Code generation and management
 */

import { pool } from './database';
import { LTDTier } from './ltd-tiers';
import { logAdminAction } from './admin-auth';
import crypto from 'crypto';

export interface LTDCode {
  id: number;
  code: string;
  tier: LTDTier;
  max_redemptions: number;
  current_redemptions: number;
  expires_at: Date | null;
  is_active: boolean;
  created_by_admin_id: string | null;
  notes: string | null;
  batch_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface GenerateCodesParams {
  tier: LTDTier;
  quantity: number;
  prefix?: string;
  maxRedemptions?: number;
  expiresAt?: Date;
  notes?: string;
  adminUserId: string;
}

export interface CodeFilters {
  tier?: LTDTier;
  status?: 'active' | 'expired' | 'redeemed' | 'disabled';
  batchId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Generate a unique code with prefix
 */
function generateUniqueCode(prefix: string): string {
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  const formatted = randomPart.match(/.{1,4}/g)?.join('-') || randomPart;
  return `${prefix}${formatted}`;
}

/**
 * Generate multiple LTD codes
 */
export async function generateLTDCodes(params: GenerateCodesParams): Promise<LTDCode[]> {
  const {
    tier,
    quantity,
    prefix = `LTD-T${tier}-`,
    maxRedemptions = 1,
    expiresAt = null,
    notes = null,
    adminUserId,
  } = params;

  if (quantity < 1 || quantity > 1000) {
    throw new Error('Quantity must be between 1 and 1000');
  }

  const batchId = `BATCH-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const codes: LTDCode[] = [];
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (let i = 0; i < quantity; i++) {
      // Generate unique code
      let code = generateUniqueCode(prefix);
      let attempts = 0;
      
      // Ensure code is unique
      while (attempts < 10) {
        const existing = await client.query(
          'SELECT id FROM ltd_codes WHERE code = $1',
          [code]
        );
        
        if (existing.rows.length === 0) break;
        code = generateUniqueCode(prefix);
        attempts++;
      }

      if (attempts >= 10) {
        throw new Error('Failed to generate unique code after 10 attempts');
      }

      // Insert code
      const result = await client.query(
        `INSERT INTO ltd_codes (
          code, tier, max_redemptions, expires_at, is_active,
          created_by_admin_id, notes, batch_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [code, tier, maxRedemptions, expiresAt, true, adminUserId, notes, batchId]
      );

      codes.push(result.rows[0] as LTDCode);
    }

    await client.query('COMMIT');
    
    console.log(`✅ Generated ${quantity} codes for Tier ${tier} (Batch: ${batchId})`);
    return codes;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating LTD codes:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get all LTD codes with filters
 */
export async function getLTDCodes(filters: CodeFilters = {}): Promise<{
  codes: LTDCode[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const {
    tier,
    status,
    batchId,
    search,
    page = 1,
    limit = 50,
  } = filters;

  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Build WHERE conditions
  if (tier) {
    conditions.push(`tier = $${paramIndex++}`);
    values.push(tier);
  }

  if (status) {
    switch (status) {
      case 'active':
        conditions.push(`is_active = true AND (expires_at IS NULL OR expires_at > NOW()) AND current_redemptions < max_redemptions`);
        break;
      case 'expired':
        conditions.push(`expires_at IS NOT NULL AND expires_at <= NOW()`);
        break;
      case 'redeemed':
        conditions.push(`current_redemptions >= max_redemptions`);
        break;
      case 'disabled':
        conditions.push(`is_active = false`);
        break;
    }
  }

  if (batchId) {
    conditions.push(`batch_id = $${paramIndex++}`);
    values.push(batchId);
  }

  if (search) {
    conditions.push(`(code ILIKE $${paramIndex++} OR notes ILIKE $${paramIndex++})`);
    values.push(`%${search}%`, `%${search}%`);
    paramIndex++; // Increment for second search param
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const client = await pool.connect();
  try {
    // Get total count
    const countResult = await client.query(
      `SELECT COUNT(*) as total FROM ltd_codes ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated codes
    const codesResult = await client.query(
      `SELECT * FROM ltd_codes ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    return {
      codes: codesResult.rows as LTDCode[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } finally {
    client.release();
  }
}

/**
 * Get a single LTD code by ID
 */
export async function getLTDCodeById(codeId: number): Promise<LTDCode | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM ltd_codes WHERE id = $1',
      [codeId]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Update LTD code
 */
export async function updateLTDCode(
  codeId: number,
  updates: Partial<Pick<LTDCode, 'max_redemptions' | 'expires_at' | 'is_active' | 'notes'>>
): Promise<LTDCode> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.max_redemptions !== undefined) {
    fields.push(`max_redemptions = $${paramIndex++}`);
    values.push(updates.max_redemptions);
  }

  if (updates.expires_at !== undefined) {
    fields.push(`expires_at = $${paramIndex++}`);
    values.push(updates.expires_at);
  }

  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(updates.is_active);
  }

  if (updates.notes !== undefined) {
    fields.push(`notes = $${paramIndex++}`);
    values.push(updates.notes);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(codeId);

  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE ltd_codes
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Code not found');
    }

    return result.rows[0] as LTDCode;
  } finally {
    client.release();
  }
}

/**
 * Delete LTD code
 */
export async function deleteLTDCode(codeId: number): Promise<void> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM ltd_codes WHERE id = $1 RETURNING id',
      [codeId]
    );

    if (result.rows.length === 0) {
      throw new Error('Code not found');
    }
  } finally {
    client.release();
  }
}

/**
 * Get code statistics
 */
export async function getCodeStatistics() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        COUNT(*) as total_codes,
        COUNT(*) FILTER (WHERE is_active = true) as active_codes,
        COUNT(*) FILTER (WHERE current_redemptions > 0) as redeemed_codes,
        COUNT(*) FILTER (WHERE current_redemptions >= max_redemptions) as fully_redeemed,
        COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at <= NOW()) as expired_codes,
        COUNT(*) FILTER (WHERE tier = 1) as tier1_codes,
        COUNT(*) FILTER (WHERE tier = 2) as tier2_codes,
        COUNT(*) FILTER (WHERE tier = 3) as tier3_codes,
        COUNT(*) FILTER (WHERE tier = 4) as tier4_codes
      FROM ltd_codes
    `);

    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Export codes to CSV format
 */
export function exportCodesToCSV(codes: LTDCode[]): string {
  const headers = ['Code', 'Tier', 'Max Uses', 'Redeemed', 'Expires At', 'Status', 'Batch ID', 'Notes'];
  const rows = codes.map(code => [
    code.code,
    code.tier,
    code.max_redemptions,
    code.current_redemptions,
    code.expires_at ? new Date(code.expires_at).toISOString().split('T')[0] : 'Never',
    code.is_active ? 'Active' : 'Disabled',
    code.batch_id || '',
    code.notes || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export interface LTDUser {
  id: string;
  email: string;
  name: string | null;
  plan_type: string;
  ltd_tier: number | null;
  credits: number;
  monthly_credit_limit: number;
  credit_reset_date: Date;
  rollover_credits: number;
  stacked_codes: number;
  created_at: Date;
  last_login: Date;
  subscription_status: string;
  total_redemptions: number;
  last_redeemed_at: Date | null;
}

/**
 * Get all LTD users with pagination
 */
export async function getAllLTDUsers(
  page: number = 1,
  limit: number = 50,
  search?: string
): Promise<{ users: LTDUser[]; total: number; totalPages: number }> {
  const offset = (page - 1) * limit;
  const client = await pool.connect();
  
  try {
    let whereClause = "WHERE u.plan_type = 'ltd'";
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (u.email ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await client.query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get users with redemption data
    const result = await client.query(
      `SELECT 
        u.*,
        COUNT(lr.id) as total_redemptions,
        MAX(lr.redeemed_at) as last_redeemed_at
       FROM users u
       LEFT JOIN ltd_redemptions lr ON u.id = lr.user_id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    return {
      users: result.rows.map(row => ({
        ...row,
        total_redemptions: parseInt(row.total_redemptions, 10),
      })),
      total,
      totalPages,
    };
  } finally {
    client.release();
  }
}

/**
 * Get single LTD user by ID
 */
export async function getLTDUserById(userId: string): Promise<LTDUser | null> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT 
        u.*,
        COUNT(lr.id) as total_redemptions,
        MAX(lr.redeemed_at) as last_redeemed_at
       FROM users u
       LEFT JOIN ltd_redemptions lr ON u.id = lr.user_id
       WHERE u.id = $1 AND u.plan_type = 'ltd'
       GROUP BY u.id`,
      [userId]
    );

    if (result.rows.length === 0) return null;

    return {
      ...result.rows[0],
      total_redemptions: parseInt(result.rows[0].total_redemptions, 10),
    };
  } finally {
    client.release();
  }
}

/**
 * Update user's LTD plan
 */
export async function updateUserLTDPlan(
  userId: string,
  adminUserId: string,
  updates: {
    ltd_tier?: number;
    credits?: number;
    monthly_credit_limit?: number;
  }
): Promise<LTDUser | null> {
  const client = await pool.connect();
  
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.ltd_tier !== undefined) {
      fields.push(`ltd_tier = $${paramIndex++}`);
      values.push(updates.ltd_tier);
    }

    if (updates.credits !== undefined) {
      fields.push(`credits = $${paramIndex++}`);
      values.push(updates.credits);
    }

    if (updates.monthly_credit_limit !== undefined) {
      fields.push(`monthly_credit_limit = $${paramIndex++}`);
      values.push(updates.monthly_credit_limit);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    await client.query(
      `UPDATE users
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}`,
      values
    );

    // Log action
    await logAdminAction(adminUserId, 'user_plan_updated', userId, updates);

    // Return updated user
    return getLTDUserById(userId);
  } finally {
    client.release();
  }
}

