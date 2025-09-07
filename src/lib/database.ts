import { Pool } from 'pg'

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export interface User {
  id: number
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

// Create or update user on login
export async function upsertUser(userData: CreateUserData): Promise<User> {
  const client = await pool.connect()
  
  try {
    const query = `
      INSERT INTO users (google_id, email, name, image_url, last_login)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
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
      userData.google_id,
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
export async function getUserById(id: number): Promise<User | null> {
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
export async function deleteUserById(userId: number): Promise<boolean> {
  const client = await pool.connect()

  try {
    const query = 'DELETE FROM users WHERE id = $1'
    const result = await client.query(query, [userId])

    return result.rowCount !== null && result.rowCount > 0
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

    return result.rowCount !== null && result.rowCount > 0
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
export async function addCredits(userId: number, amount: number): Promise<{ success: boolean; newBalance: number }> {
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
export async function setUserCredits(userId: number, credits: number): Promise<{ success: boolean; newBalance: number }> {
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

// Billing Functions

// Update user subscription status
export async function updateUserSubscription(
  userId: number,
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

    return result.rowCount !== null && result.rowCount > 0
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
export async function hasActiveSubscription(userId: number): Promise<boolean> {
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

// Close the pool (for cleanup)
export async function closePool(): Promise<void> {
  await pool.end()
}
