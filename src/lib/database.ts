import { Pool } from '@neondatabase/serverless'

// Create a connection pool (Edge-compatible, uses fetch/WebSockets)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Export pool for use in other modules
export { pool }

export interface User {
  id: string  // Changed to string to match VARCHAR(255) in database
  google_id: string
  email: string
  name?: string
  image_url?: string
  created_at: Date
  updated_at: Date
  last_login: Date
  credits: number
  subscription_status: string
  stripe_customer_id?: string
  subscription_id?: string
  subscription_end_date?: Date
  // LTD fields
  plan_type?: 'subscription' | 'ltd'
  ltd_tier?: number | null
  monthly_credit_limit?: number
  credit_reset_date?: Date
  rollover_credits?: number
  stacked_codes?: number
}

export interface CreateUserData {
  google_id: string
  email: string
  name?: string
  image_url?: string
}

export interface UpdateUserData {
  name?: string
  image_url?: string
  last_login?: Date
}

// Discount Code Interfaces
export interface DiscountCode {
  id: number
  code: string
  stripe_coupon_id?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses?: number
  current_uses: number
  expires_at?: Date
  is_active: boolean
  created_by?: number
  created_at: Date
  updated_at: Date
}

export interface CreateDiscountCodeData {
  code: string
  stripe_coupon_id?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses?: number
  expires_at?: Date | null
  created_by?: number | null
}

export interface UpdateDiscountCodeData {
  code?: string
  discount_type?: 'percentage' | 'fixed'
  discount_value?: number
  max_uses?: number
  expires_at?: Date | null
  is_active?: boolean
}

export interface DiscountValidationResult {
  is_valid: boolean
  discount_id?: number
  discount_type?: 'percentage' | 'fixed'
  discount_value?: number
  error_message?: string
}

// Create or update user on login
export async function upsertUser(userData: CreateUserData): Promise<User> {
  const client = await pool.connect()
  
  try {
    const query = `
      INSERT INTO users (
        id, google_id, email, name, image_url, last_login,
        credits, plan_type, subscription_status, 
        monthly_credit_limit, rollover_credits, stacked_codes,
        credit_reset_date
      )
      VALUES ($1, $1, $2, $3, $4, CURRENT_TIMESTAMP, 
              10, 'subscription', 'free', 
              10, 0, 0,
              NULL)
      ON CONFLICT (google_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        image_url = EXCLUDED.image_url,
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    
    const values = [
      userData.google_id,  // Used for both id and google_id
      userData.email,
      userData.name || null,
      userData.image_url || null
    ]
    
    const result = await client.query(query, values)
    return result.rows[0] as User
  } finally {
    client.release()
  }
}

// Get user by Google ID
export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  const client = await pool.connect()
  
  try {
    // Query by google_id to handle both old numeric IDs and new VARCHAR IDs
    const query = 'SELECT * FROM users WHERE google_id = $1'
    const result = await client.query(query, [googleId])
    
    return result.rows[0] as User || null
  } finally {
    client.release()
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM users WHERE email = $1'
    const result = await client.query(query, [email])

    return result.rows[0] as User || null
  } finally {
    client.release()
  }
}

// Get user by ID
export async function getUserById(id: string | number): Promise<User | null> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM users WHERE id = $1'
    const result = await client.query(query, [id])

    return result.rows[0] as User || null
  } finally {
    client.release()
  }
}

// Update user's last login
export async function updateUserLastLogin(googleId: string): Promise<void> {
  const client = await pool.connect()
  
  try {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE google_id = $1
    `
    await client.query(query, [googleId])
  } finally {
    client.release()
  }
}

// Get all users (for admin purposes)
export async function getAllUsers(): Promise<User[]> {
  const client = await pool.connect()
  
  try {
    const query = 'SELECT * FROM users ORDER BY created_at DESC'
    const result = await client.query(query)
    
    return result.rows as User[]
  } finally {
    client.release()
  }
}

// Get user statistics
export async function getUserStats() {
  const client = await pool.connect()
  
  try {
    const queries = await Promise.all([
      client.query('SELECT COUNT(*) as total_users FROM users'),
      client.query('SELECT COUNT(*) as active_today FROM users WHERE last_login >= CURRENT_DATE'),
      client.query('SELECT COUNT(*) as new_this_week FROM users WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''),
      client.query('SELECT COUNT(*) as new_this_month FROM users WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\'')
    ])
    
    return {
      totalUsers: parseInt(queries[0].rows[0].total_users),
      activeToday: parseInt(queries[1].rows[0].active_today),
      newThisWeek: parseInt(queries[2].rows[0].new_this_week),
      newThisMonth: parseInt(queries[3].rows[0].new_this_month)
    }
  } finally {
    client.release()
  }
}

// Admin Functions

// Delete user by ID (admin only)
export async function deleteUserById(userId: string | number): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = 'DELETE FROM users WHERE id = $1'
    const result = await client.query(query, [userId])

    return (result.rowCount ?? 0) > 0
  } finally {
    client.release()
  }
}

// Delete user by Google ID (admin only)
export async function deleteUserByGoogleId(googleId: string): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = 'DELETE FROM users WHERE google_id = $1'
    const result = await client.query(query, [googleId])

    return (result.rowCount ?? 0) > 0
  } finally {
    client.release()
  }
}



// Get recent user activity (admin only)
export async function getRecentUserActivity(limit: number = 50): Promise<User[]> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM users ORDER BY last_login DESC LIMIT $1'
    const result = await client.query(query, [limit])

    return result.rows as User[]
  } finally {
    client.release()
  }
}

// Get users by date range (admin only)
export async function getUsersByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
  const client = await pool.connect()

  try {
    const query = `
      SELECT * FROM users
      WHERE created_at >= $1 AND created_at <= $2
      ORDER BY created_at DESC
    `
    const result = await client.query(query, [startDate, endDate])

    return result.rows as User[]
  } finally {
    client.release()
  }
}

// Search users by email or name (admin only)
export async function searchUsers(searchTerm: string): Promise<User[]> {
  const client = await pool.connect()

  try {
    const query = `
      SELECT * FROM users
      WHERE email ILIKE $1 OR name ILIKE $1
      ORDER BY created_at DESC
    `
    const result = await client.query(query, [`%${searchTerm}%`])

    return result.rows as User[]
  } finally {
    client.release()
  }
}

// Get detailed user statistics (admin only)
export async function getDetailedUserStats() {
  const client = await pool.connect()

  try {
    const queries = await Promise.all([
      client.query('SELECT COUNT(*) as total_users FROM users'),
      client.query('SELECT COUNT(*) as active_today FROM users WHERE last_login >= CURRENT_DATE'),
      client.query('SELECT COUNT(*) as active_week FROM users WHERE last_login >= CURRENT_DATE - INTERVAL \'7 days\''),
      client.query('SELECT COUNT(*) as active_month FROM users WHERE last_login >= CURRENT_DATE - INTERVAL \'30 days\''),
      client.query('SELECT COUNT(*) as new_today FROM users WHERE created_at >= CURRENT_DATE'),
      client.query('SELECT COUNT(*) as new_week FROM users WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''),
      client.query('SELECT COUNT(*) as new_month FROM users WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\''),
      client.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `),
    ])

    return {
      totalUsers: parseInt(queries[0].rows[0].total_users),
      activeToday: parseInt(queries[1].rows[0].active_today),
      activeThisWeek: parseInt(queries[2].rows[0].active_week),
      activeThisMonth: parseInt(queries[3].rows[0].active_month),
      newToday: parseInt(queries[4].rows[0].new_today),
      newThisWeek: parseInt(queries[5].rows[0].new_week),
      newThisMonth: parseInt(queries[6].rows[0].new_month),
      dailySignups: queries[7].rows,
    }
  } finally {
    client.release()
  }
}

// Credit Management Functions

// Get user credits by Google ID
export async function getUserCredits(googleId: string): Promise<number> {
  const client = await pool.connect()

  try {
    const query = 'SELECT credits FROM users WHERE google_id = $1'
    const result = await client.query(query, [googleId])

    return result.rows[0]?.credits || 0
  } finally {
    client.release()
  }
}

// Deduct credits from user (for AI chat usage)
export async function deductCredits(googleId: string, amount: number = 1): Promise<{ success: boolean; newBalance: number }> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Get current credits
    const currentResult = await client.query('SELECT credits FROM users WHERE google_id = $1', [googleId])
    const currentCredits = currentResult.rows[0]?.credits || 0

    if (currentCredits < amount) {
      await client.query('ROLLBACK')
      return { success: false, newBalance: currentCredits }
    }

    // Deduct credits
    const newBalance = currentCredits - amount
    await client.query(
      'UPDATE users SET credits = $1, updated_at = CURRENT_TIMESTAMP WHERE google_id = $2',
      [newBalance, googleId]
    )

    await client.query('COMMIT')
    return { success: true, newBalance }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Add credits to user (admin function)
export async function addCredits(userId: string | number, amount: number): Promise<{ success: boolean; newBalance: number }> {
  const client = await pool.connect()

  try {
    const query = `
      UPDATE users
      SET credits = credits + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING credits
    `
    const result = await client.query(query, [amount, userId])

    if (result.rows.length === 0) {
      return { success: false, newBalance: 0 }
    }

    return { success: true, newBalance: result.rows[0].credits }
  } finally {
    client.release()
  }
}

// Set user credits (admin function)
export async function setUserCredits(userId: string | number, credits: number): Promise<{ success: boolean; newBalance: number }> {
  const client = await pool.connect()

  try {
    const query = `
      UPDATE users
      SET credits = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING credits
    `
    const result = await client.query(query, [credits, userId])

    if (result.rows.length === 0) {
      return { success: false, newBalance: 0 }
    }

    return { success: true, newBalance: result.rows[0].credits }
  } finally {
    client.release()
  }
}

// Get credit statistics (admin function)
export async function getCreditStats() {
  const client = await pool.connect()

  try {
    const queries = await Promise.all([
      client.query('SELECT AVG(credits) as avg_credits FROM users'),
      client.query('SELECT SUM(credits) as total_credits FROM users'),
      client.query('SELECT COUNT(*) as users_with_zero_credits FROM users WHERE credits = 0'),
      client.query('SELECT COUNT(*) as users_with_low_credits FROM users WHERE credits <= 5'),
      client.query('SELECT MAX(credits) as max_credits FROM users'),
      client.query('SELECT MIN(credits) as min_credits FROM users'),
    ])

    return {
      averageCredits: Math.round(parseFloat(queries[0].rows[0].avg_credits) || 0),
      totalCredits: parseInt(queries[1].rows[0].total_credits) || 0,
      usersWithZeroCredits: parseInt(queries[2].rows[0].users_with_zero_credits) || 0,
      usersWithLowCredits: parseInt(queries[3].rows[0].users_with_low_credits) || 0,
      maxCredits: parseInt(queries[4].rows[0].max_credits) || 0,
      minCredits: parseInt(queries[5].rows[0].min_credits) || 0,
    }
  } finally {
    client.release()
  }
}

// repurposely Tables

export interface ContentRow {
  id: string
  user_id: string | number
  source_type: 'text' | 'url' | 'file'
  source_url?: string | null
  title?: string | null
  raw_text?: string | null
  language?: string | null
  created_at: Date
}

export interface GenerationRow {
  id: string
  user_id: string | number
  content_id?: string | null
  platform: 'x' | 'linkedin' | 'instagram' | 'email'
  tone: string
  options_json?: any
  output_json?: any
  token_usage: number
  status: string
  created_at: Date
}

export interface PostRow {
  id: string
  user_id: string | number
  generation_id?: string | null
  platform: 'x' | 'linkedin' | 'instagram' | 'email'
  body: string
  hashtags?: string[] | null
  status: 'draft' | 'scheduled' | 'posted'
  external_post_id?: string | null
  created_at: Date
}

export async function createContent(params: {
  userId: string | number
  source_type: 'text' | 'url' | 'file'
  source_url?: string | null
  title?: string | null
  raw_text?: string | null
  language?: string | null
}): Promise<ContentRow> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `INSERT INTO contents (user_id, source_type, source_url, title, raw_text, language)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [params.userId, params.source_type, params.source_url || null, params.title || null, params.raw_text || null, params.language || null]
    )
    return result.rows[0] as ContentRow
  } finally {
    client.release()
  }
}

export async function insertGeneration(params: {
  userId: string | number
  contentId?: string | null
  platform: 'x' | 'linkedin' | 'instagram' | 'email'
  tone: string
  options?: any
  output?: any
  tokenUsage?: number
  status?: string
}): Promise<GenerationRow> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `INSERT INTO generations (user_id, content_id, platform, tone, options_json, output_json, token_usage, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [params.userId, params.contentId || null, params.platform, params.tone, params.options || null, params.output || null, params.tokenUsage || 0, params.status || 'completed']
    )
    return result.rows[0] as GenerationRow
  } finally {
    client.release()
  }
}

export async function insertPost(params: {
  userId: string | number
  generationId?: string | null
  platform: 'x' | 'linkedin' | 'instagram' | 'email'
  body: string
  hashtags?: string[] | null
  status?: 'draft' | 'scheduled' | 'posted'
}): Promise<PostRow> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `INSERT INTO posts (user_id, generation_id, platform, body, hashtags, status)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [params.userId, params.generationId || null, params.platform, params.body, params.hashtags || null, params.status || 'draft']
    )
    return result.rows[0] as PostRow
  } finally {
    client.release()
  }
}

export async function listRecentGenerations(userId: string | number, limit = 20): Promise<GenerationRow[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `SELECT * FROM generations WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    )
    return result.rows as GenerationRow[]
  } finally {
    client.release()
  }
}

export async function listRecentPosts(userId: string | number, limit = 20): Promise<PostRow[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `SELECT * FROM posts WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    )
    return result.rows as PostRow[]
  } finally {
    client.release()
  }
}

export interface ScheduleRow {
  id: string
  user_id: string | number
  post_id: string
  scheduled_at: Date
  timezone: string
  status: 'pending' | 'sent' | 'failed'
  best_time_score?: number | null
  error?: string | null
  created_at: Date
}

export async function insertSchedule(params: {
  userId: string | number
  postId: string
  scheduledAt: Date
  timezone?: string
  bestTimeScore?: number | null
}): Promise<ScheduleRow> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `INSERT INTO schedules (user_id, post_id, scheduled_at, timezone, best_time_score)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [params.userId, params.postId, params.scheduledAt, params.timezone || 'UTC', params.bestTimeScore ?? null]
    )
    return result.rows[0] as ScheduleRow
  } finally {
    client.release()
  }
}

// Billing Functions

// Update user subscription status
export async function updateUserSubscription(
  userId: string | number,
  subscriptionData: {
    subscription_status: string
    stripe_customer_id?: string
    subscription_id?: string
    subscription_end_date?: Date
  }
): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = `
      UPDATE users
      SET subscription_status = $1,
          stripe_customer_id = $2,
          subscription_id = $3,
          subscription_end_date = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `
    const result = await client.query(query, [
      subscriptionData.subscription_status,
      subscriptionData.stripe_customer_id || null,
      subscriptionData.subscription_id || null,
      subscriptionData.subscription_end_date || null,
      userId
    ])

    return (result.rowCount ?? 0) > 0
  } finally {
    client.release()
  }
}

// Get user by Stripe customer ID
export async function getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM users WHERE stripe_customer_id = $1'
    const result = await client.query(query, [stripeCustomerId])

    return result.rows[0] as User || null
  } finally {
    client.release()
  }
}

// Get subscription statistics (admin function)
export async function getSubscriptionStats() {
  const client = await pool.connect()

  try {
    const queries = await Promise.all([
      client.query('SELECT COUNT(*) as total_users FROM users'),
      client.query('SELECT COUNT(*) as free_users FROM users WHERE subscription_status = \'free\''),
      client.query('SELECT COUNT(*) as pro_users FROM users WHERE subscription_status = \'pro\''),
      client.query('SELECT COUNT(*) as active_subscriptions FROM users WHERE subscription_status = \'pro\' AND (subscription_end_date IS NULL OR subscription_end_date > CURRENT_TIMESTAMP)'),
      client.query('SELECT SUM(CASE WHEN subscription_status = \'pro\' THEN 99 ELSE 0 END) as total_revenue FROM users'),
    ])

    return {
      totalUsers: parseInt(queries[0].rows[0].total_users),
      freeUsers: parseInt(queries[1].rows[0].free_users),
      proUsers: parseInt(queries[2].rows[0].pro_users),
      activeSubscriptions: parseInt(queries[3].rows[0].active_subscriptions),
      totalRevenue: parseInt(queries[4].rows[0].total_revenue) || 0,
    }
  } finally {
    client.release()
  }
}

// Check if user has active subscription
export async function hasActiveSubscription(userId: string | number): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = `
      SELECT subscription_status, subscription_end_date
      FROM users
      WHERE id = $1
    `
    const result = await client.query(query, [userId])

    if (result.rows.length === 0) return false

    const user = result.rows[0]
    if (user.subscription_status !== 'pro') return false

    // If no end date, it's active (one-time payment)
    if (!user.subscription_end_date) return true

    // Check if subscription hasn't expired
    return new Date(user.subscription_end_date) > new Date()
  } finally {
    client.release()
  }
}

// Analytics Functions

// Get comprehensive analytics data
export async function getAnalyticsData() {
  const client = await pool.connect()

  try {
    // User analytics
    const userQueries = await Promise.all([
      // Total users
      client.query('SELECT COUNT(*) as total FROM users'),
      // Users by subscription status
      client.query(`
        SELECT
          subscription_status,
          COUNT(*) as count
        FROM users
        GROUP BY subscription_status
      `),
      // New users by day (last 30 days)
      client.query(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `),
      // New users by month (last 12 months)
      client.query(`
        SELECT
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `),
      // Active users (logged in last 30 days)
      client.query(`
        SELECT COUNT(*) as active_users
        FROM users
        WHERE last_login >= CURRENT_DATE - INTERVAL '30 days'
      `),
    ])

    // Revenue analytics
    const revenueQueries = await Promise.all([
      // Total revenue (Pro users * $99)
      client.query(`
        SELECT
          COUNT(*) as pro_users,
          COUNT(*) * 99 as total_revenue
        FROM users
        WHERE subscription_status = 'pro'
      `),
      // Revenue by month
      client.query(`
        SELECT
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as pro_signups,
          COUNT(*) * 99 as revenue
        FROM users
        WHERE subscription_status = 'pro'
          AND created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `),
    ])

    // Credit analytics
    const creditQueries = await Promise.all([
      // Total credits in system
      client.query('SELECT SUM(credits) as total_credits FROM users'),
      // Average credits per user
      client.query('SELECT AVG(credits) as avg_credits FROM users'),
      // Credits distribution (simplified)
      client.query(`
        SELECT
          CASE
            WHEN credits = 0 THEN '0'
            WHEN credits <= 10 THEN '1-10'
            WHEN credits <= 50 THEN '11-50'
            WHEN credits <= 100 THEN '51-100'
            WHEN credits <= 500 THEN '101-500'
            WHEN credits <= 1000 THEN '501-1000'
            ELSE '1000+'
          END as credit_range,
          COUNT(*) as user_count
        FROM users
        GROUP BY
          CASE
            WHEN credits = 0 THEN '0'
            WHEN credits <= 10 THEN '1-10'
            WHEN credits <= 50 THEN '11-50'
            WHEN credits <= 100 THEN '51-100'
            WHEN credits <= 500 THEN '101-500'
            WHEN credits <= 1000 THEN '501-1000'
            ELSE '1000+'
          END
        ORDER BY user_count DESC
      `),
    ])

    return {
      users: {
        total: parseInt(userQueries[0].rows[0].total),
        byStatus: userQueries[1].rows,
        dailySignups: userQueries[2].rows,
        monthlySignups: userQueries[3].rows,
        activeUsers: parseInt(userQueries[4].rows[0].active_users),
      },
      revenue: {
        total: parseInt(revenueQueries[0].rows[0].total_revenue) || 0,
        proUsers: parseInt(revenueQueries[0].rows[0].pro_users),
        monthlyRevenue: revenueQueries[1].rows,
      },
      credits: {
        total: parseInt(creditQueries[0].rows[0].total_credits) || 0,
        average: parseFloat(creditQueries[1].rows[0].avg_credits) || 0,
        distribution: creditQueries[2].rows,
      },
    }
  } finally {
    client.release()
  }
}

// Get growth metrics
export async function getGrowthMetrics() {
  const client = await pool.connect()

  try {
    const queries = await Promise.all([
      // Growth rate (users this month vs last month)
      client.query(`
        SELECT
          COUNT(*) as current_month
        FROM users
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `),
      client.query(`
        SELECT
          COUNT(*) as last_month
        FROM users
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND created_at < DATE_TRUNC('month', CURRENT_DATE)
      `),
      // Conversion rate (pro users / total users)
      client.query(`
        SELECT
          COUNT(CASE WHEN subscription_status = 'pro' THEN 1 END) as pro_users,
          COUNT(*) as total_users
        FROM users
      `),
      // Retention (users who logged in this month that were created last month)
      client.query(`
        SELECT
          COUNT(*) as retained_users
        FROM users
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND created_at < DATE_TRUNC('month', CURRENT_DATE)
          AND last_login >= DATE_TRUNC('month', CURRENT_DATE)
      `),
    ])

    const currentMonth = parseInt(queries[0].rows[0].current_month)
    const lastMonth = parseInt(queries[1].rows[0].last_month)
    const proUsers = parseInt(queries[2].rows[0].pro_users)
    const totalUsers = parseInt(queries[2].rows[0].total_users)
    const retainedUsers = parseInt(queries[3].rows[0].retained_users)

    const growthRate = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0
    const conversionRate = totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0
    const retentionRate = lastMonth > 0 ? (retainedUsers / lastMonth) * 100 : 0

    return {
      growthRate: Math.round(growthRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      retentionRate: Math.round(retentionRate * 100) / 100,
      currentMonth,
      lastMonth,
      proUsers,
      totalUsers,
      retainedUsers,
    }
  } finally {
    client.release()
  }
}

// Discount Code Functions

// Create a new discount code
export async function createDiscountCode(discountData: CreateDiscountCodeData): Promise<DiscountCode> {
  const client = await pool.connect()

  try {
    const query = `
      INSERT INTO discount_codes (
        code, stripe_coupon_id, discount_type, discount_value,
        max_uses, expires_at, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const values = [
      discountData.code,
      discountData.stripe_coupon_id || null,
      discountData.discount_type,
      discountData.discount_value,
      discountData.max_uses || null,
      discountData.expires_at || null,
      discountData.created_by
    ]

    const result = await client.query(query, values)
    return result.rows[0] as DiscountCode
  } finally {
    client.release()
  }
}

// Get all discount codes (admin only)
export async function getAllDiscountCodes(): Promise<DiscountCode[]> {
  const client = await pool.connect()

  try {
    const query = `
      SELECT dc.*, u.email as created_by_email, u.name as created_by_name
      FROM discount_codes dc
      LEFT JOIN users u ON dc.created_by = u.id
      ORDER BY dc.created_at DESC
    `
    const result = await client.query(query)

    return result.rows.map(row => ({
      id: row.id,
      code: row.code,
      stripe_coupon_id: row.stripe_coupon_id,
      discount_type: row.discount_type,
      discount_value: row.discount_value,
      max_uses: row.max_uses,
      current_uses: row.current_uses,
      expires_at: row.expires_at,
      is_active: row.is_active,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Additional fields for admin display
      created_by_email: row.created_by_email,
      created_by_name: row.created_by_name,
    })) as DiscountCode[]
  } finally {
    client.release()
  }
}

// Get discount code by ID
export async function getDiscountCodeById(id: number): Promise<DiscountCode | null> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM discount_codes WHERE id = $1'
    const result = await client.query(query, [id])

    return result.rows.length > 0 ? result.rows[0] as DiscountCode : null
  } finally {
    client.release()
  }
}

// Get discount code by code string
export async function getDiscountCodeByCode(code: string): Promise<DiscountCode | null> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM discount_codes WHERE code = $1'
    const result = await client.query(query, [code])

    return result.rows.length > 0 ? result.rows[0] as DiscountCode : null
  } finally {
    client.release()
  }
}

// Update discount code
export async function updateDiscountCode(id: number, updateData: UpdateDiscountCodeData): Promise<DiscountCode | null> {
  const client = await pool.connect()

  try {
    const fields = []
    const values = []
    let paramCount = 1

    if (updateData.code !== undefined) {
      fields.push(`code = $${paramCount}`)
      values.push(updateData.code)
      paramCount++
    }

    if (updateData.discount_type !== undefined) {
      fields.push(`discount_type = $${paramCount}`)
      values.push(updateData.discount_type)
      paramCount++
    }

    if (updateData.discount_value !== undefined) {
      fields.push(`discount_value = $${paramCount}`)
      values.push(updateData.discount_value)
      paramCount++
    }

    if (updateData.max_uses !== undefined) {
      fields.push(`max_uses = $${paramCount}`)
      values.push(updateData.max_uses)
      paramCount++
    }

    if (updateData.expires_at !== undefined) {
      fields.push(`expires_at = $${paramCount}`)
      values.push(updateData.expires_at)
      paramCount++
    }

    if (updateData.is_active !== undefined) {
      fields.push(`is_active = $${paramCount}`)
      values.push(updateData.is_active)
      paramCount++
    }

    if (fields.length === 0) {
      return await getDiscountCodeById(id)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE discount_codes
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await client.query(query, values)
    return result.rows.length > 0 ? result.rows[0] as DiscountCode : null
  } finally {
    client.release()
  }
}

// Delete discount code
export async function deleteDiscountCode(id: number): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = 'DELETE FROM discount_codes WHERE id = $1'
    const result = await client.query(query, [id])

    return (result.rowCount ?? 0) > 0
  } finally {
    client.release()
  }
}

// Validate discount code using database function
export async function validateDiscountCode(code: string): Promise<DiscountValidationResult> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM validate_discount_code($1)'
    const result = await client.query(query, [code])

    if (result.rows.length === 0) {
      return {
        is_valid: false,
        error_message: 'Invalid discount code'
      }
    }

    const row = result.rows[0]
    return {
      is_valid: row.is_valid,
      discount_id: row.discount_id,
      discount_type: row.discount_type,
      discount_value: row.discount_value,
      error_message: row.error_message
    }
  } finally {
    client.release()
  }
}

// Increment discount code usage
export async function incrementDiscountUsage(code: string): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = 'SELECT increment_discount_usage($1) as success'
    const result = await client.query(query, [code])

    return result.rows[0]?.success || false
  } finally {
    client.release()
  }
}

// Get discount code statistics
export async function getDiscountStats() {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM get_discount_stats()'
    const result = await client.query(query)

    if (result.rows.length === 0) {
      return {
        totalCodes: 0,
        activeCodes: 0,
        expiredCodes: 0,
        usedCodes: 0,
        totalUsage: 0
      }
    }

    const row = result.rows[0]
    return {
      totalCodes: row.total_codes,
      activeCodes: row.active_codes,
      expiredCodes: row.expired_codes,
      usedCodes: row.used_codes,
      totalUsage: row.total_usage
    }
  } finally {
    client.release()
  }
}

// Get discount code usage analytics
export async function getDiscountAnalytics() {
  const client = await pool.connect()

  try {
    const queries = await Promise.all([
      // Most used discount codes
      client.query(`
        SELECT code, current_uses, max_uses, discount_type, discount_value
        FROM discount_codes
        WHERE current_uses > 0
        ORDER BY current_uses DESC
        LIMIT 10
      `),
      // Recent discount code usage (last 30 days)
      client.query(`
        SELECT
          DATE(updated_at) as date,
          COUNT(*) as codes_used
        FROM discount_codes
        WHERE current_uses > 0
          AND updated_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(updated_at)
        ORDER BY date DESC
      `),
      // Discount codes by type
      client.query(`
        SELECT
          discount_type,
          COUNT(*) as count,
          SUM(current_uses) as total_uses
        FROM discount_codes
        GROUP BY discount_type
      `),
    ])

    return {
      mostUsed: queries[0].rows,
      recentUsage: queries[1].rows,
      byType: queries[2].rows,
    }
  } finally {
    client.release()
  }
}

// Performance Prediction Interfaces

export interface PerformancePrediction {
  id: number
  user_id: string | number
  content: string
  platform: 'x' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok' | 'email'
  tone: string
  content_type: string
  score: number
  breakdown: {
    contentQuality: number
    engagementPotential: number
    algorithmOptimization: number
    timingTrends: number
    audienceFit: number
  }
  insights: string[]
  recommendations: string[]
  risk_factors: string[]
  predicted_metrics: {
    likes: string
    comments: string
    shares: string
    reach: string
  }
  model_name?: string
  model_version?: string
  tokens_used: number
  created_at: Date
  updated_at: Date
}

export interface CreatePerformancePredictionData {
  user_id: string | number
  content: string
  platform: 'x' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok' | 'email'
  tone?: string
  content_type?: string
  score: number
  breakdown: {
    contentQuality: number
    engagementPotential: number
    algorithmOptimization: number
    timingTrends: number
    audienceFit: number
  }
  insights: string[]
  recommendations: string[]
  risk_factors: string[]
  predicted_metrics: {
    likes: string
    comments: string
    shares: string
    reach: string
  }
  model_name?: string
  model_version?: string
  tokens_used?: number
}

export interface PerformanceFeedback {
  id: number
  prediction_id: number
  user_id: string | number
  actual_likes: number
  actual_comments: number
  actual_shares: number
  actual_reach: number
  actual_engagement_rate: number
  feedback_notes?: string
  accuracy_rating?: number
  created_at: Date
  updated_at: Date
}

export interface CreatePerformanceFeedbackData {
  prediction_id: number
  user_id: string | number
  actual_likes?: number
  actual_comments?: number
  actual_shares?: number
  actual_reach?: number
  actual_engagement_rate?: number
  feedback_notes?: string
  accuracy_rating?: number
}

// Performance Prediction Functions

// Create a new performance prediction
export async function createPerformancePrediction(predictionData: CreatePerformancePredictionData): Promise<PerformancePrediction> {
  const client = await pool.connect()
  
  try {
    const query = `
      INSERT INTO performance_predictions (
        user_id, content, platform, tone, content_type, score, 
        breakdown, insights, recommendations, risk_factors, predicted_metrics,
        model_name, model_version, tokens_used
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `
    
    const values = [
      predictionData.user_id,
      predictionData.content,
      predictionData.platform,
      predictionData.tone || 'professional',
      predictionData.content_type || 'post',
      predictionData.score,
      JSON.stringify(predictionData.breakdown),
      predictionData.insights,
      predictionData.recommendations,
      predictionData.risk_factors,
      JSON.stringify(predictionData.predicted_metrics),
      predictionData.model_name || null,
      predictionData.model_version || null,
      predictionData.tokens_used || 0
    ]
    
    const result = await client.query(query, values)
    const row = result.rows[0]
    
    return {
      ...row,
      breakdown: JSON.parse(row.breakdown),
      predicted_metrics: JSON.parse(row.predicted_metrics)
    } as PerformancePrediction
  } finally {
    client.release()
  }
}

// Get user's recent predictions
export async function getUserPredictions(userId: string | number, limit: number = 20): Promise<PerformancePrediction[]> {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT * FROM performance_predictions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `
    
    const result = await client.query(query, [userId, limit])
    
    return result.rows.map(row => ({
      ...row,
      breakdown: JSON.parse(row.breakdown),
      predicted_metrics: JSON.parse(row.predicted_metrics)
    })) as PerformancePrediction[]
  } finally {
    client.release()
  }
}

// Get prediction by ID
export async function getPredictionById(predictionId: number): Promise<PerformancePrediction | null> {
  const client = await pool.connect()
  
  try {
    const query = 'SELECT * FROM performance_predictions WHERE id = $1'
    const result = await client.query(query, [predictionId])
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      ...row,
      breakdown: JSON.parse(row.breakdown),
      predicted_metrics: JSON.parse(row.predicted_metrics)
    } as PerformancePrediction
  } finally {
    client.release()
  }
}

// Create performance feedback
export async function createPerformanceFeedback(feedbackData: CreatePerformanceFeedbackData): Promise<PerformanceFeedback> {
  const client = await pool.connect()
  
  try {
    const query = `
      INSERT INTO performance_feedback (
        prediction_id, user_id, actual_likes, actual_comments, 
        actual_shares, actual_reach, actual_engagement_rate, 
        feedback_notes, accuracy_rating
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `
    
    const values = [
      feedbackData.prediction_id,
      feedbackData.user_id,
      feedbackData.actual_likes || 0,
      feedbackData.actual_comments || 0,
      feedbackData.actual_shares || 0,
      feedbackData.actual_reach || 0,
      feedbackData.actual_engagement_rate || 0,
      feedbackData.feedback_notes || null,
      feedbackData.accuracy_rating || null
    ]
    
    const result = await client.query(query, values)
    return result.rows[0] as PerformanceFeedback
  } finally {
    client.release()
  }
}

// Get user prediction statistics
export async function getUserPredictionStats(userId: string | number) {
  const client = await pool.connect()
  
  try {
    // Get basic stats
    const basicStatsQuery = `
      SELECT 
        COUNT(*) as total_predictions,
        ROUND(AVG(score), 2) as average_score,
        MAX(score) as highest_score,
        MIN(score) as lowest_score,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_predictions
      FROM performance_predictions
      WHERE user_id = $1
    `
    
    // Get platform breakdown
    const platformQuery = `
      SELECT platform, COUNT(*) as count
      FROM performance_predictions
      WHERE user_id = $1
      GROUP BY platform
    `
    
    const [basicStats, platformResults] = await Promise.all([
      client.query(basicStatsQuery, [userId]),
      client.query(platformQuery, [userId])
    ])
    
    // Build platform breakdown object
    const platformBreakdown = platformResults.rows.reduce((acc, row) => {
      acc[row.platform] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    const basicStatsData = basicStats.rows[0]
    
    return {
      total_predictions: parseInt(basicStatsData.total_predictions) || 0,
      average_score: parseFloat(basicStatsData.average_score) || 0,
      highest_score: parseInt(basicStatsData.highest_score) || 0,
      lowest_score: parseInt(basicStatsData.lowest_score) || 0,
      platform_breakdown: platformBreakdown,
      recent_predictions: parseInt(basicStatsData.recent_predictions) || 0
    }
  } finally {
    client.release()
  }
}

// Get prediction accuracy statistics (admin function)
export async function getPredictionAccuracyStats() {
  const client = await pool.connect()
  
  try {
    // Get basic accuracy stats
    const basicQuery = `
      SELECT 
        COUNT(pp.id) as total_predictions,
        COUNT(pf.id) as predictions_with_feedback,
        ROUND(AVG(pf.accuracy_rating), 2) as average_accuracy_rating
      FROM performance_predictions pp
      LEFT JOIN performance_feedback pf ON pp.id = pf.prediction_id
    `
    
    // Get model performance breakdown
    const modelQuery = `
      SELECT 
        COALESCE(pp.model_name, 'unknown') as model_name,
        COUNT(pp.id) as count,
        ROUND(AVG(pp.score), 2) as avg_score,
        ROUND(AVG(pf.accuracy_rating), 2) as avg_accuracy
      FROM performance_predictions pp
      LEFT JOIN performance_feedback pf ON pp.id = pf.prediction_id
      GROUP BY pp.model_name
    `
    
    const [basicResults, modelResults] = await Promise.all([
      client.query(basicQuery),
      client.query(modelQuery)
    ])
    
    // Build model performance object
    const modelPerformance = modelResults.rows.reduce((acc, row) => {
      acc[row.model_name] = {
        count: parseInt(row.count),
        avg_score: parseFloat(row.avg_score) || 0,
        avg_accuracy: parseFloat(row.avg_accuracy) || 0
      }
      return acc
    }, {} as Record<string, any>)
    
    const basicData = basicResults.rows[0]
    
    return {
      total_predictions: parseInt(basicData.total_predictions) || 0,
      predictions_with_feedback: parseInt(basicData.predictions_with_feedback) || 0,
      average_accuracy_rating: parseFloat(basicData.average_accuracy_rating) || 0,
      model_performance: modelPerformance
    }
  } finally {
    client.release()
  }
}

// Get admin prediction analytics
export async function getAdminPredictionAnalytics() {
  const client = await pool.connect()
  
  try {
    // Get basic stats
    const basicStatsQuery = `
      SELECT 
        COUNT(*) as total_predictions,
        COUNT(DISTINCT user_id) as unique_users,
        ROUND(AVG(score), 2) as average_score,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_predictions,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_predictions
      FROM performance_predictions
    `
    
    // Get platform breakdown
    const platformQuery = `
      SELECT platform, COUNT(*) as count
      FROM performance_predictions
      GROUP BY platform
    `
    
    // Get model breakdown
    const modelQuery = `
      SELECT COALESCE(model_name, 'unknown') as model_name, COUNT(*) as count
      FROM performance_predictions
      GROUP BY model_name
    `
    
    const [basicStats, platformResults, modelResults] = await Promise.all([
      client.query(basicStatsQuery),
      client.query(platformQuery),
      client.query(modelQuery)
    ])
    
    // Build platform breakdown object
    const platformBreakdown = platformResults.rows.reduce((acc, row) => {
      acc[row.platform] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    // Build model breakdown object
    const modelBreakdown = modelResults.rows.reduce((acc, row) => {
      acc[row.model_name] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    const basicStatsData = basicStats.rows[0]
    
    return {
      total_predictions: parseInt(basicStatsData.total_predictions) || 0,
      unique_users: parseInt(basicStatsData.unique_users) || 0,
      average_score: parseFloat(basicStatsData.average_score) || 0,
      recent_predictions: parseInt(basicStatsData.recent_predictions) || 0,
      monthly_predictions: parseInt(basicStatsData.monthly_predictions) || 0,
      platform_breakdown: platformBreakdown,
      model_breakdown: modelBreakdown
    }
  } finally {
    client.release()
  }
}

// Get predictions with feedback for analytics
export async function getPredictionsWithFeedback(limit: number = 50): Promise<any[]> {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT 
        pp.*,
        pf.actual_likes,
        pf.actual_comments,
        pf.actual_shares,
        pf.actual_reach,
        pf.actual_engagement_rate,
        pf.accuracy_rating,
        pf.feedback_notes,
        u.email as user_email,
        u.name as user_name
      FROM performance_predictions pp
      LEFT JOIN performance_feedback pf ON pp.id = pf.prediction_id
      LEFT JOIN users u ON pp.user_id = u.id
      ORDER BY pp.created_at DESC
      LIMIT $1
    `
    
    const result = await client.query(query, [limit])
    
    return result.rows.map(row => ({
      ...row,
      breakdown: JSON.parse(row.breakdown),
      predicted_metrics: JSON.parse(row.predicted_metrics)
    }))
  } finally {
    client.release()
  }
}

// Get user repurposed content statistics
export async function getUserRepurposedContentStats(userId: string | number) {
  const client = await pool.connect()
  
  try {
    // Get basic stats from generations table
    const basicStatsQuery = `
      SELECT 
        COUNT(*) as total_generations,
        COUNT(DISTINCT platform) as platforms_used,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_generations,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_generations,
        SUM(token_usage) as total_tokens_used,
        ROUND(AVG(token_usage), 2) as avg_tokens_per_generation
      FROM generations
      WHERE user_id = $1 AND status = 'completed'
    `
    
    // Get platform breakdown
    const platformQuery = `
      SELECT platform, COUNT(*) as count
      FROM generations
      WHERE user_id = $1 AND status = 'completed'
      GROUP BY platform
    `
    
    // Get tone breakdown
    const toneQuery = `
      SELECT tone, COUNT(*) as count
      FROM generations
      WHERE user_id = $1 AND status = 'completed'
      GROUP BY tone
    `
    
    // Get posts created from generations
    const postsQuery = `
      SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts,
        COUNT(DISTINCT platform) as platforms_with_posts
      FROM posts
      WHERE user_id = $1
    `
    
    const [basicStats, platformResults, toneResults, postsResults] = await Promise.all([
      client.query(basicStatsQuery, [userId]),
      client.query(platformQuery, [userId]),
      client.query(toneQuery, [userId]),
      client.query(postsQuery, [userId])
    ])
    
    // Build platform breakdown object
    const platformBreakdown = platformResults.rows.reduce((acc, row) => {
      acc[row.platform] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    // Build tone breakdown object
    const toneBreakdown = toneResults.rows.reduce((acc, row) => {
      acc[row.tone] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    const basicStatsData = basicStats.rows[0]
    const postsData = postsResults.rows[0]
    
    return {
      total_generations: parseInt(basicStatsData.total_generations) || 0,
      platforms_used: parseInt(basicStatsData.platforms_used) || 0,
      recent_generations: parseInt(basicStatsData.recent_generations) || 0,
      monthly_generations: parseInt(basicStatsData.monthly_generations) || 0,
      total_tokens_used: parseInt(basicStatsData.total_tokens_used) || 0,
      avg_tokens_per_generation: parseFloat(basicStatsData.avg_tokens_per_generation) || 0,
      platform_breakdown: platformBreakdown,
      tone_breakdown: toneBreakdown,
      total_posts: parseInt(postsData.total_posts) || 0,
      published_posts: parseInt(postsData.published_posts) || 0,
      draft_posts: parseInt(postsData.draft_posts) || 0,
      platforms_with_posts: parseInt(postsData.platforms_with_posts) || 0
    }
  } finally {
    client.release()
  }
}

// Get admin repurposed content analytics
export async function getAdminRepurposedContentAnalytics() {
  const client = await pool.connect()
  
  try {
    // Get basic stats
    const basicStatsQuery = `
      SELECT 
        COUNT(*) as total_generations,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_generations,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_generations,
        SUM(token_usage) as total_tokens_used,
        ROUND(AVG(token_usage), 2) as avg_tokens_per_generation
      FROM generations
      WHERE status = 'completed'
    `
    
    // Get platform breakdown
    const platformQuery = `
      SELECT platform, COUNT(*) as count
      FROM generations
      WHERE status = 'completed'
      GROUP BY platform
    `
    
    // Get tone breakdown
    const toneQuery = `
      SELECT tone, COUNT(*) as count
      FROM generations
      WHERE status = 'completed'
      GROUP BY tone
    `
    
    // Get posts stats
    const postsQuery = `
      SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts
      FROM posts
    `
    
    const [basicStats, platformResults, toneResults, postsResults] = await Promise.all([
      client.query(basicStatsQuery),
      client.query(platformQuery),
      client.query(toneQuery),
      client.query(postsQuery)
    ])
    
    // Build breakdown objects
    const platformBreakdown = platformResults.rows.reduce((acc, row) => {
      acc[row.platform] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    const toneBreakdown = toneResults.rows.reduce((acc, row) => {
      acc[row.tone] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    const basicStatsData = basicStats.rows[0]
    const postsData = postsResults.rows[0]
    
    return {
      total_generations: parseInt(basicStatsData.total_generations) || 0,
      unique_users: parseInt(basicStatsData.unique_users) || 0,
      recent_generations: parseInt(basicStatsData.recent_generations) || 0,
      monthly_generations: parseInt(basicStatsData.monthly_generations) || 0,
      total_tokens_used: parseInt(basicStatsData.total_tokens_used) || 0,
      avg_tokens_per_generation: parseFloat(basicStatsData.avg_tokens_per_generation) || 0,
      platform_breakdown: platformBreakdown,
      tone_breakdown: toneBreakdown,
      total_posts: parseInt(postsData.total_posts) || 0,
      published_posts: parseInt(postsData.published_posts) || 0,
      draft_posts: parseInt(postsData.draft_posts) || 0
    }
  } finally {
    client.release()
  }
}

// Get user schedule analytics
export async function getUserScheduleAnalytics(userId: string | number) {
  const client = await pool.connect()
  
  try {
    // Get basic stats from schedules table
    const schedulesStatsQuery = `
      SELECT 
        COUNT(*) as total_schedules,
        COUNT(CASE WHEN status = 'posted' THEN 1 END) as posted_schedules,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_schedules,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_schedules,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_schedules,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_schedules,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_schedules,
        ROUND(AVG(best_time_score), 2) as avg_best_time_score
      FROM schedules
      WHERE user_id = $1
    `
    
    // Get platform breakdown from scheduled_posts table
    const platformQuery = `
      SELECT platform, COUNT(*) as count
      FROM scheduled_posts
      WHERE user_id = $1
      GROUP BY platform
    `
    
    // Get status breakdown from scheduled_posts table
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM scheduled_posts
      WHERE user_id = $1
      GROUP BY status
    `
    
    // Get upcoming schedules
    const upcomingQuery = `
      SELECT COUNT(*) as upcoming_count
      FROM schedules
      WHERE user_id = $1 AND scheduled_at > NOW() AND status = 'pending'
    `
    
    const [schedulesStats, platformResults, statusResults, upcomingResults] = await Promise.all([
      client.query(schedulesStatsQuery, [userId]),
      client.query(platformQuery, [userId]),
      client.query(statusQuery, [userId]),
      client.query(upcomingQuery, [userId])
    ])
    
    // Build platform breakdown object
    const platformBreakdown = platformResults.rows.reduce((acc, row) => {
      acc[row.platform] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    // Build status breakdown object
    const statusBreakdown = statusResults.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    const schedulesData = schedulesStats.rows[0]
    const upcomingData = upcomingResults.rows[0]
    
    return {
      total_schedules: parseInt(schedulesData.total_schedules) || 0,
      posted_schedules: parseInt(schedulesData.posted_schedules) || 0,
      pending_schedules: parseInt(schedulesData.pending_schedules) || 0,
      failed_schedules: parseInt(schedulesData.failed_schedules) || 0,
      cancelled_schedules: parseInt(schedulesData.cancelled_schedules) || 0,
      recent_schedules: parseInt(schedulesData.recent_schedules) || 0,
      monthly_schedules: parseInt(schedulesData.monthly_schedules) || 0,
      avg_best_time_score: parseFloat(schedulesData.avg_best_time_score) || 0,
      platform_breakdown: platformBreakdown,
      status_breakdown: statusBreakdown,
      upcoming_schedules: parseInt(upcomingData.upcoming_count) || 0
    }
  } finally {
    client.release()
  }
}

// Get admin schedule analytics
export async function getAdminScheduleAnalytics() {
  const client = await pool.connect()
  
  try {
    // Get basic stats from schedules table
    const schedulesStatsQuery = `
      SELECT 
        COUNT(*) as total_schedules,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN status = 'posted' THEN 1 END) as posted_schedules,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_schedules,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_schedules,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_schedules,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_schedules,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_schedules,
        ROUND(AVG(best_time_score), 2) as avg_best_time_score
      FROM schedules
    `
    
    // Get platform breakdown from scheduled_posts table
    const platformQuery = `
      SELECT platform, COUNT(*) as count
      FROM scheduled_posts
      GROUP BY platform
    `
    
    // Get status breakdown from scheduled_posts table
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM scheduled_posts
      GROUP BY status
    `
    
    // Get upcoming schedules
    const upcomingQuery = `
      SELECT COUNT(*) as upcoming_count
      FROM schedules
      WHERE scheduled_at > NOW() AND status = 'pending'
    `
    
    const [schedulesStats, platformResults, statusResults, upcomingResults] = await Promise.all([
      client.query(schedulesStatsQuery),
      client.query(platformQuery),
      client.query(statusQuery),
      client.query(upcomingQuery)
    ])
    
    // Build breakdown objects
    const platformBreakdown = platformResults.rows.reduce((acc, row) => {
      acc[row.platform] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    const statusBreakdown = statusResults.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)
    
    const schedulesData = schedulesStats.rows[0]
    const upcomingData = upcomingResults.rows[0]
    
    return {
      total_schedules: parseInt(schedulesData.total_schedules) || 0,
      unique_users: parseInt(schedulesData.unique_users) || 0,
      posted_schedules: parseInt(schedulesData.posted_schedules) || 0,
      pending_schedules: parseInt(schedulesData.pending_schedules) || 0,
      failed_schedules: parseInt(schedulesData.failed_schedules) || 0,
      cancelled_schedules: parseInt(schedulesData.cancelled_schedules) || 0,
      recent_schedules: parseInt(schedulesData.recent_schedules) || 0,
      monthly_schedules: parseInt(schedulesData.monthly_schedules) || 0,
      avg_best_time_score: parseFloat(schedulesData.avg_best_time_score) || 0,
      platform_breakdown: platformBreakdown,
      status_breakdown: statusBreakdown,
      upcoming_schedules: parseInt(upcomingData.upcoming_count) || 0
    }
  } finally {
    client.release()
  }
}

// User Preferences Functions
export interface UserPreferences {
  id?: number;
  user_id: string | number;
  // Profile
  name?: string;
  email?: string;
  bio?: string;
  company?: string;
  timezone?: string;
  // AI Preferences
  preferred_model?: string;
  temperature?: number;
  max_tokens?: number;
  // Content Defaults
  default_tone?: string;
  default_length?: string;
  default_platforms?: string[];
  include_hashtags?: boolean;
  include_emojis?: boolean;
  include_cta?: boolean;
  custom_hook?: string;
  custom_cta?: string;
  // Notifications
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_emails?: boolean;
  usage_alerts?: boolean;
  // Privacy & Security
  two_factor_enabled?: boolean;
  data_export_enabled?: boolean;
  // Appearance
  theme?: string;
  compact_mode?: boolean;
  // API
  api_key?: string;
  // Writing Style (Talk Like Me feature)
  writing_style_profile?: WritingStyleProfile;
  style_training_samples?: StyleTrainingSample[];
  style_confidence_score?: number;
  style_enabled?: boolean;
  // Platform Optimization
  platform_optimization_enabled?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Writing Style Interfaces
export interface WritingStyleProfile {
  tone: string;
  personality_traits: string[];
  vocabulary_patterns: {
    common_words: string[];
    sentence_starters: string[];
    transition_words: string[];
    power_words: string[];
  };
  sentence_structure: {
    avg_sentence_length: number;
    complexity_level: 'simple' | 'moderate' | 'complex';
    question_frequency: number;
    exclamation_frequency: number;
  };
  emoji_usage: {
    frequency: 'none' | 'rare' | 'moderate' | 'frequent';
    preferred_emojis: string[];
    placement_pattern: 'beginning' | 'middle' | 'end' | 'throughout';
  };
  brand_elements: {
    opening_styles: string[];
    closing_styles: string[];
    call_to_action_patterns: string[];
    signature_phrases: string[];
  };
  platform_preferences: {
    [platform: string]: {
      tone_adjustment: string;
      length_preference: string;
      emoji_usage: string;
    };
  };
}

export interface StyleTrainingSample {
  id?: string;
  content: string;
  platform: string;
  content_type: string;
  word_count: number;
  character_count: number;
  uploaded_at: Date;
  analysis_metadata?: {
    detected_tone: string;
    key_phrases: string[];
    emoji_count: number;
  };
}

export interface StyleAnalysisResult {
  profile: WritingStyleProfile;
  confidence_score: number;
  sample_count: number;
  analysis_summary: {
    strengths: string[];
    areas_for_improvement: string[];
    consistency_score: number;
  };
}

export async function getUserPreferences(userId: string | number): Promise<UserPreferences> {
  try {
    const query = `
      SELECT * FROM user_preferences 
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    console.log('🗄️  database.ts - getUserPreferences');
    console.log('  userId:', userId);
    console.log('  rows found:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('  ⚠️  No preferences found, returning defaults');
      // Return default preferences if none exist
      return {
        user_id: userId,
        name: "",
        email: "",
        bio: "",
        company: "",
        timezone: "UTC",
        preferred_model: "qwen/qwen3-235b-a22b-2507",
        temperature: 0.7,
        max_tokens: 1000,
        default_tone: "professional",
        default_length: "medium",
        default_platforms: ["x", "linkedin", "instagram"],
        include_hashtags: true,
        include_emojis: false,
        include_cta: false,
        custom_hook: "",
        custom_cta: "",
        email_notifications: true,
        push_notifications: false,
        marketing_emails: true,
        usage_alerts: true,
        two_factor_enabled: false,
        data_export_enabled: true,
        theme: "system",
        compact_mode: false,
        platform_optimization_enabled: false,
      };
    }
    
    const prefs = result.rows[0];
    
    console.log('  ✅ Loaded from DB - platform_optimization_enabled:', prefs.platform_optimization_enabled);
    console.log('  ✅ Type:', typeof prefs.platform_optimization_enabled);
    
    // Parse JSON fields
    if (prefs.default_platforms && typeof prefs.default_platforms === 'string') {
      prefs.default_platforms = JSON.parse(prefs.default_platforms);
    }
    
    return prefs;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
}

export async function updateUserPreferences(userId: string | number, preferences: Partial<UserPreferences>): Promise<void> {
  try {
    const query = `
      INSERT INTO user_preferences (
        user_id, name, email, bio, company, timezone,
        preferred_model, temperature, max_tokens,
        default_tone, default_length, default_platforms,
        include_hashtags, include_emojis, include_cta,
        custom_hook, custom_cta,
        email_notifications, push_notifications, marketing_emails, usage_alerts,
        two_factor_enabled, data_export_enabled,
        theme, compact_mode, platform_optimization_enabled
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15,
        $16, $17,
        $18, $19, $20, $21,
        $22, $23,
        $24, $25, $26
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        bio = EXCLUDED.bio,
        company = EXCLUDED.company,
        timezone = EXCLUDED.timezone,
        preferred_model = EXCLUDED.preferred_model,
        temperature = EXCLUDED.temperature,
        max_tokens = EXCLUDED.max_tokens,
        default_tone = EXCLUDED.default_tone,
        default_length = EXCLUDED.default_length,
        default_platforms = EXCLUDED.default_platforms,
        include_hashtags = EXCLUDED.include_hashtags,
        include_emojis = EXCLUDED.include_emojis,
        include_cta = EXCLUDED.include_cta,
        custom_hook = EXCLUDED.custom_hook,
        custom_cta = EXCLUDED.custom_cta,
        email_notifications = EXCLUDED.email_notifications,
        push_notifications = EXCLUDED.push_notifications,
        marketing_emails = EXCLUDED.marketing_emails,
        usage_alerts = EXCLUDED.usage_alerts,
        two_factor_enabled = EXCLUDED.two_factor_enabled,
        data_export_enabled = EXCLUDED.data_export_enabled,
        theme = EXCLUDED.theme,
        compact_mode = EXCLUDED.compact_mode,
        platform_optimization_enabled = EXCLUDED.platform_optimization_enabled,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const values = [
      userId,
      preferences.name,
      preferences.email,
      preferences.bio,
      preferences.company,
      preferences.timezone,
      preferences.preferred_model,
      preferences.temperature,
      preferences.max_tokens,
      preferences.default_tone,
      preferences.default_length,
      preferences.default_platforms ? JSON.stringify(preferences.default_platforms) : null,
      preferences.include_hashtags,
      preferences.include_emojis,
      preferences.include_cta,
      preferences.custom_hook,
      preferences.custom_cta,
      preferences.email_notifications,
      preferences.push_notifications,
      preferences.marketing_emails,
      preferences.usage_alerts,
      preferences.two_factor_enabled,
      preferences.data_export_enabled,
      preferences.theme,
      preferences.compact_mode,
      preferences.platform_optimization_enabled,
    ];
    
    console.log('🗄️  database.ts - updateUserPreferences');
    console.log('  userId:', userId);
    console.log('  platform_optimization_enabled (value $26):', preferences.platform_optimization_enabled);
    
    await pool.query(query, values);
    
    console.log('  ✅ SQL query executed successfully');
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

export async function generateUserApiKey(userId: string | number): Promise<string> {
  try {
    const apiKey = `sk_user_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    const query = `
      UPDATE user_preferences 
      SET api_key = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `;
    
    await pool.query(query, [apiKey, userId]);
    return apiKey;
  } catch (error) {
    console.error('Error generating API key:', error);
    throw error;
  }
}

export async function exportUserData(userId: string | number): Promise<any> {
  try {
    // Get user data
    const userQuery = `SELECT * FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userResult.rows[0];
    
    // Get user preferences
    const preferences = await getUserPreferences(userId);
    
    // Get user's content generations (if any)
    const contentQuery = `
      SELECT id, content, platform, created_at 
      FROM repurposed_content 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const contentResult = await pool.query(contentQuery, [userId]);
    
    // Get user's performance predictions (if any)
    const predictionsQuery = `
      SELECT id, content, platform, score, created_at 
      FROM performance_predictions 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const predictionsResult = await pool.query(predictionsQuery, [userId]);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        subscription_status: user.subscription_status,
        credits: user.credits,
      },
      preferences,
      content_generations: contentResult.rows,
      performance_predictions: predictionsResult.rows,
      export_date: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}

// System Configuration Functions
export interface SystemConfig {
  id?: number;
  // API Configuration
  openrouter_api_key?: string;
  groq_api_key?: string;
  default_model?: string;
  fallback_model?: string;
  max_tokens?: number;
  temperature?: number;
  // Database Settings
  database_url?: string;
  connection_pool_size?: number;
  query_timeout?: number;
  // System Limits
  free_user_credits?: number;
  pro_user_credits?: number;
  max_generations_per_day?: number;
  max_file_size?: number;
  // Email Configuration
  resend_api_key?: string;
  from_email?: string;
  support_email?: string;
  // Security Settings
  session_timeout?: number;
  max_login_attempts?: number;
  enable_2fa?: boolean;
  allowed_domains?: string[];
  // Feature Flags
  enable_predictive_scoring?: boolean;
  enable_trend_analysis?: boolean;
  enable_scheduling?: boolean;
  enable_templates?: boolean;
  maintenance_mode?: boolean;
  // Analytics
  enable_analytics?: boolean;
  analytics_provider?: string;
  tracking_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export async function getSystemConfig(): Promise<SystemConfig> {
  try {
    const query = `SELECT * FROM system_config ORDER BY id DESC LIMIT 1`;
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      // Return default configuration
      return {
        openrouter_api_key: "",
        groq_api_key: "",
        default_model: "qwen/qwen3-235b-a22b-2507",
        fallback_model: "groq/llama-3.1-8b-instant",
        max_tokens: 1000,
        temperature: 0.7,
        database_url: "",
        connection_pool_size: 10,
        query_timeout: 30000,
        free_user_credits: 10,
        pro_user_credits: 1000,
        max_generations_per_day: 50,
        max_file_size: 10485760,
        resend_api_key: "",
        from_email: "noreply@yoursaas.com",
        support_email: "support@yoursaas.com",
        session_timeout: 86400,
        max_login_attempts: 5,
        enable_2fa: false,
        allowed_domains: [],
        enable_predictive_scoring: true,
        enable_trend_analysis: true,
        enable_scheduling: true,
        enable_templates: true,
        maintenance_mode: false,
        enable_analytics: true,
        analytics_provider: "simple-analytics",
        tracking_id: "",
      };
    }
    
    const config = result.rows[0];
    
    // Parse JSON fields
    if (config.allowed_domains && typeof config.allowed_domains === 'string') {
      config.allowed_domains = JSON.parse(config.allowed_domains);
    }
    
    return config;
  } catch (error) {
    console.error('Error fetching system config:', error);
    throw error;
  }
}

export async function updateSystemConfig(config: Partial<SystemConfig>): Promise<void> {
  try {
    const query = `
      INSERT INTO system_config (
        openrouter_api_key, groq_api_key, default_model, fallback_model,
        max_tokens, temperature, database_url, connection_pool_size, query_timeout,
        free_user_credits, pro_user_credits, max_generations_per_day, max_file_size,
        resend_api_key, from_email, support_email,
        session_timeout, max_login_attempts, enable_2fa, allowed_domains,
        enable_predictive_scoring, enable_trend_analysis, enable_scheduling, enable_templates, maintenance_mode,
        enable_analytics, analytics_provider, tracking_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
      )
      ON CONFLICT (id) 
      DO UPDATE SET
        openrouter_api_key = EXCLUDED.openrouter_api_key,
        groq_api_key = EXCLUDED.groq_api_key,
        default_model = EXCLUDED.default_model,
        fallback_model = EXCLUDED.fallback_model,
        max_tokens = EXCLUDED.max_tokens,
        temperature = EXCLUDED.temperature,
        database_url = EXCLUDED.database_url,
        connection_pool_size = EXCLUDED.connection_pool_size,
        query_timeout = EXCLUDED.query_timeout,
        free_user_credits = EXCLUDED.free_user_credits,
        pro_user_credits = EXCLUDED.pro_user_credits,
        max_generations_per_day = EXCLUDED.max_generations_per_day,
        max_file_size = EXCLUDED.max_file_size,
        resend_api_key = EXCLUDED.resend_api_key,
        from_email = EXCLUDED.from_email,
        support_email = EXCLUDED.support_email,
        session_timeout = EXCLUDED.session_timeout,
        max_login_attempts = EXCLUDED.max_login_attempts,
        enable_2fa = EXCLUDED.enable_2fa,
        allowed_domains = EXCLUDED.allowed_domains,
        enable_predictive_scoring = EXCLUDED.enable_predictive_scoring,
        enable_trend_analysis = EXCLUDED.enable_trend_analysis,
        enable_scheduling = EXCLUDED.enable_scheduling,
        enable_templates = EXCLUDED.enable_templates,
        maintenance_mode = EXCLUDED.maintenance_mode,
        enable_analytics = EXCLUDED.enable_analytics,
        analytics_provider = EXCLUDED.analytics_provider,
        tracking_id = EXCLUDED.tracking_id,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const values = [
      config.openrouter_api_key,
      config.groq_api_key,
      config.default_model,
      config.fallback_model,
      config.max_tokens,
      config.temperature,
      config.database_url,
      config.connection_pool_size,
      config.query_timeout,
      config.free_user_credits,
      config.pro_user_credits,
      config.max_generations_per_day,
      config.max_file_size,
      config.resend_api_key,
      config.from_email,
      config.support_email,
      config.session_timeout,
      config.max_login_attempts,
      config.enable_2fa,
      config.allowed_domains ? JSON.stringify(config.allowed_domains) : null,
      config.enable_predictive_scoring,
      config.enable_trend_analysis,
      config.enable_scheduling,
      config.enable_templates,
      config.maintenance_mode,
      config.enable_analytics,
      config.analytics_provider,
      config.tracking_id,
    ];
    
    await pool.query(query, values);
  } catch (error) {
    console.error('Error updating system config:', error);
    throw error;
  }
}

// Connection Testing Functions
export async function testDatabaseConnection(): Promise<void> {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    throw new Error('Database connection failed');
  }
}

export async function testOpenRouterConnection(): Promise<void> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('OpenRouter API connection failed');
    }
  } catch (error) {
    throw new Error('OpenRouter API connection failed');
  }
}

export async function testGroqConnection(): Promise<void> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Groq API connection failed');
    }
  } catch (error) {
    throw new Error('Groq API connection failed');
  }
}

export async function testEmailConnection(): Promise<void> {
  try {
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Email service connection failed');
    }
  } catch (error) {
    throw new Error('Email service connection failed');
  }
}

// Writing Style Functions (Talk Like Me feature)

export async function getUserWritingStyle(userId: string | number): Promise<{
  profile: WritingStyleProfile | null;
  confidence_score: number;
  sample_count: number;
  style_enabled: boolean;
}> {
  try {
    const query = `
      SELECT writing_style_profile, style_confidence_score, style_training_samples, style_enabled
      FROM user_preferences 
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return {
        profile: null,
        confidence_score: 0,
        sample_count: 0,
        style_enabled: false,
      };
    }
    
    const row = result.rows[0];
    const samples = row.style_training_samples || [];
    
    return {
      profile: row.writing_style_profile,
      confidence_score: row.style_confidence_score || 0,
      sample_count: samples.length,
      style_enabled: row.style_enabled || false,
    };
  } catch (error) {
    console.error('Error fetching user writing style:', error);
    throw error;
  }
}

export async function updateUserWritingStyle(
  userId: string | number, 
  profile: WritingStyleProfile, 
  samples: StyleTrainingSample[], 
  confidenceScore: number
): Promise<void> {
  try {
    const query = `
      INSERT INTO user_preferences (
        user_id, writing_style_profile, style_training_samples, style_confidence_score
      ) VALUES (
        $1, $2, $3, $4
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        writing_style_profile = EXCLUDED.writing_style_profile,
        style_training_samples = EXCLUDED.style_training_samples,
        style_confidence_score = EXCLUDED.style_confidence_score,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await pool.query(query, [
      userId,
      JSON.stringify(profile),
      JSON.stringify(samples),
      confidenceScore,
    ]);
  } catch (error) {
    console.error('Error updating user writing style:', error);
    throw error;
  }
}

export async function toggleUserStyleEnabled(userId: string | number, enabled: boolean): Promise<void> {
  try {
    const query = `
      INSERT INTO user_preferences (user_id, style_enabled)
      VALUES ($1, $2)
      ON CONFLICT (user_id) 
      DO UPDATE SET
        style_enabled = EXCLUDED.style_enabled,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await pool.query(query, [userId, enabled]);
  } catch (error) {
    console.error('Error toggling user style enabled:', error);
    throw error;
  }
}

export async function analyzeStyleSamples(samples: StyleTrainingSample[]): Promise<{
  profile: WritingStyleProfile;
  confidenceScore: number;
}> {
  // This function will be called by the AI analysis API
  // For now, return a basic analysis structure
  const wordCounts = samples.reduce((acc, sample) => acc + sample.word_count, 0);
  const avgWordCount = wordCounts / samples.length;
  
  // Calculate confidence based on sample count and diversity
  let confidenceScore = Math.min(90, samples.length * 12); // 12 points per sample, max 90
  
  // Adjust confidence based on sample diversity
  const platforms = new Set(samples.map(s => s.platform));
  const contentTypes = new Set(samples.map(s => s.content_type));
  
  if (platforms.size > 1) confidenceScore += 3;
  if (contentTypes.size > 1) confidenceScore += 3;
  
  // Ensure confidence is within valid range (0-100)
  confidenceScore = Math.min(100, Math.max(0, confidenceScore));
  
  const profile: WritingStyleProfile = {
    tone: 'professional', // Will be determined by AI analysis
    personality_traits: ['professional', 'informative'],
    vocabulary_patterns: {
      common_words: [],
      sentence_starters: [],
      transition_words: [],
      power_words: [],
    },
    sentence_structure: {
      avg_sentence_length: avgWordCount,
      complexity_level: avgWordCount > 20 ? 'complex' : avgWordCount > 12 ? 'moderate' : 'simple',
      question_frequency: 0.1,
      exclamation_frequency: 0.05,
    },
    emoji_usage: {
      frequency: 'rare',
      preferred_emojis: [],
      placement_pattern: 'end',
    },
    brand_elements: {
      opening_styles: [],
      closing_styles: [],
      call_to_action_patterns: [],
      signature_phrases: [],
    },
    platform_preferences: {},
  };
  
  return { profile, confidenceScore };
}

// Platform Optimization Analytics Functions

export interface PlatformOptimizationAnalytics {
  id?: number;
  user_id: string | number;
  generation_id?: string;
  platform: 'x' | 'linkedin' | 'instagram' | 'email' | 'facebook' | 'tiktok';
  optimization_applied: boolean;
  original_content_length?: number;
  optimized_content_length?: number;
  character_count: number;
  word_count: number;
  thread_created?: boolean;
  thread_count?: number;
  hashtag_count?: number;
  emoji_count?: number;
  line_breaks_added?: number;
  optimizations_applied?: string[];
  rules_applied?: Record<string, any>;
  warnings?: string[];
  engagement_prediction_score?: number;
  readability_score?: number;
  seo_score?: number;
  processing_time_ms?: number;
  model_used?: string;
  created_at?: Date;
  updated_at?: Date;
}

export async function insertOptimizationAnalytics(
  data: PlatformOptimizationAnalytics
): Promise<number> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT insert_optimization_analytics(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) as id
    `;
    
    const result = await client.query(query, [
      data.user_id,
      data.generation_id || null,
      data.platform,
      data.optimization_applied !== false,
      data.original_content_length || 0,
      data.optimized_content_length || 0,
      data.character_count,
      data.word_count,
      data.thread_created || false,
      data.thread_count || 0,
      data.hashtag_count || 0,
      data.emoji_count || 0,
      data.line_breaks_added || 0,
      JSON.stringify(data.optimizations_applied || []),
      JSON.stringify(data.rules_applied || {}),
      JSON.stringify(data.warnings || []),
      data.processing_time_ms || null,
      data.model_used || null,
    ]);
    
    return result.rows[0].id;
  } finally {
    client.release();
  }
}

export async function getUserOptimizationStats(userId: string | number): Promise<{
  total_optimizations: number;
  platforms_optimized: number;
  total_threads_created: number;
  avg_character_count: number;
  avg_hashtag_count: number;
  avg_emoji_count: number;
  total_warnings: number;
  most_optimized_platform: string;
  avg_readability_score: number;
  recent_optimizations: number;
}> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT * FROM get_user_optimization_stats($1)`;
    const result = await client.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return {
        total_optimizations: 0,
        platforms_optimized: 0,
        total_threads_created: 0,
        avg_character_count: 0,
        avg_hashtag_count: 0,
        avg_emoji_count: 0,
        total_warnings: 0,
        most_optimized_platform: '',
        avg_readability_score: 0,
        recent_optimizations: 0,
      };
    }
    
    return {
      total_optimizations: parseInt(result.rows[0].total_optimizations) || 0,
      platforms_optimized: parseInt(result.rows[0].platforms_optimized) || 0,
      total_threads_created: parseInt(result.rows[0].total_threads_created) || 0,
      avg_character_count: parseFloat(result.rows[0].avg_character_count) || 0,
      avg_hashtag_count: parseFloat(result.rows[0].avg_hashtag_count) || 0,
      avg_emoji_count: parseFloat(result.rows[0].avg_emoji_count) || 0,
      total_warnings: parseInt(result.rows[0].total_warnings) || 0,
      most_optimized_platform: result.rows[0].most_optimized_platform || '',
      avg_readability_score: parseFloat(result.rows[0].avg_readability_score) || 0,
      recent_optimizations: parseInt(result.rows[0].recent_optimizations) || 0,
    };
  } finally {
    client.release();
  }
}

export async function getUserPlatformBreakdown(userId: string | number): Promise<Array<{
  platform: string;
  optimization_count: number;
  avg_character_count: number;
  avg_hashtag_count: number;
  thread_count: number;
  warning_count: number;
  avg_readability_score: number;
}>> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT * FROM get_user_platform_breakdown($1)`;
    const result = await client.query(query, [userId]);
    
    return result.rows.map(row => ({
      platform: row.platform,
      optimization_count: parseInt(row.optimization_count) || 0,
      avg_character_count: parseFloat(row.avg_character_count) || 0,
      avg_hashtag_count: parseFloat(row.avg_hashtag_count) || 0,
      thread_count: parseInt(row.thread_count) || 0,
      warning_count: parseInt(row.warning_count) || 0,
      avg_readability_score: parseFloat(row.avg_readability_score) || 0,
    }));
  } finally {
    client.release();
  }
}

export async function getAdminOptimizationStats(): Promise<{
  total_optimizations: number;
  unique_users: number;
  total_threads_created: number;
  avg_character_count: number;
  avg_hashtag_count: number;
  total_warnings: number;
  optimization_enabled_users: number;
  recent_optimizations: number;
  monthly_optimizations: number;
}> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT * FROM get_admin_optimization_stats()`;
    const result = await client.query(query);
    
    if (result.rows.length === 0) {
      return {
        total_optimizations: 0,
        unique_users: 0,
        total_threads_created: 0,
        avg_character_count: 0,
        avg_hashtag_count: 0,
        total_warnings: 0,
        optimization_enabled_users: 0,
        recent_optimizations: 0,
        monthly_optimizations: 0,
      };
    }
    
    return {
      total_optimizations: parseInt(result.rows[0].total_optimizations) || 0,
      unique_users: parseInt(result.rows[0].unique_users) || 0,
      total_threads_created: parseInt(result.rows[0].total_threads_created) || 0,
      avg_character_count: parseFloat(result.rows[0].avg_character_count) || 0,
      avg_hashtag_count: parseFloat(result.rows[0].avg_hashtag_count) || 0,
      total_warnings: parseInt(result.rows[0].total_warnings) || 0,
      optimization_enabled_users: parseInt(result.rows[0].optimization_enabled_users) || 0,
      recent_optimizations: parseInt(result.rows[0].recent_optimizations) || 0,
      monthly_optimizations: parseInt(result.rows[0].monthly_optimizations) || 0,
    };
  } finally {
    client.release();
  }
}

export async function getPlatformPopularity(): Promise<Array<{
  platform: string;
  optimization_count: number;
  unique_users: number;
  avg_character_count: number;
  thread_count: number;
  avg_readability_score: number;
}>> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT * FROM get_platform_popularity()`;
    const result = await client.query(query);
    
    return result.rows.map(row => ({
      platform: row.platform,
      optimization_count: parseInt(row.optimization_count) || 0,
      unique_users: parseInt(row.unique_users) || 0,
      avg_character_count: parseFloat(row.avg_character_count) || 0,
      thread_count: parseInt(row.thread_count) || 0,
      avg_readability_score: parseFloat(row.avg_readability_score) || 0,
    }));
  } finally {
    client.release();
  }
}

export async function getOptimizationTrends(days: number = 30): Promise<Array<{
  date: string;
  optimization_count: number;
  unique_users: number;
  thread_count: number;
  avg_character_count: number;
}>> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT * FROM get_optimization_trends($1)`;
    const result = await client.query(query, [days]);
    
    return result.rows.map(row => ({
      date: row.date,
      optimization_count: parseInt(row.optimization_count) || 0,
      unique_users: parseInt(row.unique_users) || 0,
      thread_count: parseInt(row.thread_count) || 0,
      avg_character_count: parseFloat(row.avg_character_count) || 0,
    }));
  } finally {
    client.release();
  }
}

// Close the pool (for cleanup)
export async function closePool(): Promise<void> {
  await pool.end()
}

// =============================================
// Chat Conversations & Messages
// =============================================

export interface ChatConversation {
  id: number;
  user_id: string; // VARCHAR to match users.id
  title: string;
  created_at: Date;
  updated_at: Date;
  last_message_at: Date;
  message_count: number;
  total_tokens_used: number;
  is_archived: boolean;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: number;
  model?: string;
  created_at: Date;
}

export interface CreateConversationData {
  user_id: string; // VARCHAR to match users.id
  title?: string;
}

export interface CreateMessageData {
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  model?: string;
}

// Create new conversation
export async function createConversation(data: CreateConversationData): Promise<ChatConversation> {
  const client = await pool.connect();
  
  try {
    const query = `
      INSERT INTO chat_conversations (user_id, title)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      data.user_id,
      data.title || 'New Conversation'
    ]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get user's conversations
export async function getUserConversations(userId: string, includeArchived: boolean = false): Promise<ChatConversation[]> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT * FROM chat_conversations
      WHERE user_id = $1
        ${includeArchived ? '' : 'AND is_archived = false'}
      ORDER BY last_message_at DESC
    `;
    
    const result = await client.query(query, [userId]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get conversation by ID
export async function getConversationById(conversationId: number, userId: string | number): Promise<ChatConversation | null> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT * FROM chat_conversations
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await client.query(query, [conversationId, userId]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Update conversation
export async function updateConversation(conversationId: number, userId: string | number, updates: { title?: string; is_archived?: boolean }): Promise<ChatConversation | null> {
  const client = await pool.connect();
  
  try {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    
    if (updates.is_archived !== undefined) {
      setClauses.push(`is_archived = $${paramIndex++}`);
      values.push(updates.is_archived);
    }
    
    if (setClauses.length === 0) {
      return null;
    }
    
    setClauses.push(`updated_at = NOW()`);
    values.push(conversationId, userId);
    
    const query = `
      UPDATE chat_conversations
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Delete conversation
export async function deleteConversation(conversationId: number, userId: string | number): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    const query = `
      DELETE FROM chat_conversations
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await client.query(query, [conversationId, userId]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// Add message to conversation
export async function addMessage(data: CreateMessageData): Promise<ChatMessage> {
  const client = await pool.connect();
  
  try {
    const query = `
      INSERT INTO chat_messages (conversation_id, role, content, tokens_used, model)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      data.conversation_id,
      data.role,
      data.content,
      data.tokens_used || 0,
      data.model
    ]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get conversation messages
export async function getConversationMessages(conversationId: number, limit?: number): Promise<ChatMessage[]> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT * FROM chat_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      ${limit ? `LIMIT ${limit}` : ''}
    `;
    
    const result = await client.query(query, [conversationId]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get user's chat context (recent activity)
export async function getUserChatContext(userId: string): Promise<any> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT get_user_chat_context($1) as context`;
    const result = await client.query(query, [userId]);
    return result.rows[0]?.context || {};
  } catch (error) {
    console.error('Error getting user chat context:', error);
    // Fallback: Return empty context if function doesn't exist yet
    return {
      recent_hooks: [],
      recent_repurposed: [],
      writing_style: null,
      competitor_count: 0
    };
  } finally {
    client.release();
  }
}

// Get chat statistics
export async function getChatStatistics(userId: string, days: number = 30): Promise<any> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT * FROM get_chat_statistics($1, $2)`;
    const result = await client.query(query, [userId, days]);
    return result.rows[0] || {
      total_conversations: 0,
      total_messages: 0,
      total_tokens_used: 0,
      avg_messages_per_conversation: 0,
      active_days: 0
    };
  } catch (error) {
    console.error('Error getting chat statistics:', error);
    return {
      total_conversations: 0,
      total_messages: 0,
      total_tokens_used: 0,
      avg_messages_per_conversation: 0,
      active_days: 0
    };
  } finally {
    client.release();
  }
}

// =============================================
// Prompt Library
// =============================================

export interface PromptLibraryItem {
  id: number;
  user_id: string; // VARCHAR to match users.id
  title: string;
  prompt: string;
  category: string;
  is_favorite: boolean;
  usage_count: number;
  last_used_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PromptTemplate {
  id: number;
  title: string;
  prompt: string;
  category: string;
  description?: string;
  tags?: string[];
  usage_count: number;
}

export interface CreatePromptData {
  user_id: string; // VARCHAR to match users.id
  title: string;
  prompt: string;
  category?: string;
  is_favorite?: boolean;
}

// Create new prompt
export async function createPrompt(data: CreatePromptData): Promise<PromptLibraryItem> {
  const client = await pool.connect();
  
  try {
    const query = `
      INSERT INTO prompt_library (user_id, title, prompt, category, is_favorite)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      data.user_id,
      data.title,
      data.prompt,
      data.category || 'general',
      data.is_favorite || false
    ]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get user's prompts
export async function getUserPrompts(
  userId: string, // VARCHAR to match users.id
  category?: string,
  favoritesOnly?: boolean,
  search?: string
): Promise<PromptLibraryItem[]> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT * FROM get_user_prompts($1, $2, $3, $4)`;
    const result = await client.query(query, [
      userId,
      category || null,
      favoritesOnly || false,
      search || null
    ]);
    
    return result.rows;
  } finally {
    client.release();
  }
}

// Get prompt by ID
export async function getPromptById(promptId: number, userId: string): Promise<PromptLibraryItem | null> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT * FROM prompt_library
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await client.query(query, [promptId, userId]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Update prompt
export async function updatePrompt(
  promptId: number,
  userId: string, // VARCHAR to match users.id
  updates: {
    title?: string;
    prompt?: string;
    category?: string;
    is_favorite?: boolean;
  }
): Promise<PromptLibraryItem | null> {
  const client = await pool.connect();
  
  try {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    
    if (updates.prompt !== undefined) {
      setClauses.push(`prompt = $${paramIndex++}`);
      values.push(updates.prompt);
    }
    
    if (updates.category !== undefined) {
      setClauses.push(`category = $${paramIndex++}`);
      values.push(updates.category);
    }
    
    if (updates.is_favorite !== undefined) {
      setClauses.push(`is_favorite = $${paramIndex++}`);
      values.push(updates.is_favorite);
    }
    
    if (setClauses.length === 0) {
      return null;
    }
    
    setClauses.push(`updated_at = NOW()`);
    values.push(promptId, userId);
    
    const query = `
      UPDATE prompt_library
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Delete prompt
export async function deletePrompt(promptId: number, userId: string): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    const query = `
      DELETE FROM prompt_library
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await client.query(query, [promptId, userId]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// Increment prompt usage
export async function incrementPromptUsage(promptId: number, userId: string): Promise<void> {
  const client = await pool.connect();
  
  try {
    const query = `
      UPDATE prompt_library
      SET 
        usage_count = usage_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
      WHERE id = $1 AND user_id = $2
    `;
    
    await client.query(query, [promptId, userId]);
  } finally {
    client.release();
  }
}

// Get prompt templates
export async function getPromptTemplates(category?: string, limit: number = 20): Promise<PromptTemplate[]> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT * FROM get_popular_templates($1, $2)`;
    const result = await client.query(query, [category || null, limit]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Increment template usage
export async function incrementTemplateUsage(templateId: number): Promise<void> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT increment_template_usage($1)`;
    await client.query(query, [templateId]);
  } finally {
    client.release();
  }
}

// Get prompt statistics
export async function getPromptStatistics(userId: string): Promise<any> {
  const client = await pool.connect();
  
  try {
    const query = `SELECT get_prompt_statistics($1) as stats`;
    const result = await client.query(query, [userId]);
    return result.rows[0]?.stats || {
      total_prompts: 0,
      favorite_prompts: 0,
      total_uses: 0,
      most_used_category: null,
      recent_activity: 0
    };
  } catch (error) {
    console.error('Error getting prompt statistics:', error);
    return {
      total_prompts: 0,
      favorite_prompts: 0,
      total_uses: 0,
      most_used_category: null,
      recent_activity: 0
    };
  } finally {
    client.release();
  }
}
