/**
 * Credit Management Utilities
 * Handle credit deduction and tracking
 */

import { pool } from './database';

export async function deductCredits(
  userId: string,
  amount: number,
  actionType: string,
  metadata?: any
): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Deduct credits from user
    const updateResult = await client.query(
      `UPDATE users 
       SET credits = credits - $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND credits >= $1
       RETURNING credits`,
      [amount, userId]
    );

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new Error('Insufficient credits');
    }

    // Track usage
    await client.query(
      `INSERT INTO credit_usage (user_id, action_type, credits_used, metadata)
       VALUES ($1, $2, $3, $4)`,
      [userId, actionType, amount, JSON.stringify(metadata || {})]
    );

    await client.query('COMMIT');
    return true;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function checkCredits(userId: string, required: number): Promise<boolean> {
  const result = await pool.query(
    `SELECT credits FROM users WHERE id = $1`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    return false;
  }
  
  return result.rows[0].credits >= required;
}

export async function getUserCredits(userId: string): Promise<number> {
  const result = await pool.query(
    `SELECT credits FROM users WHERE id = $1`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  return result.rows[0].credits;
}


