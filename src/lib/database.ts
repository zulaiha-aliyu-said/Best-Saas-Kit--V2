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

// Get user by ID (admin only)
export async function getUserById(userId: number): Promise<User | null> {
  const client = await pool.connect()

  try {
    const query = 'SELECT * FROM users WHERE id = $1'
    const result = await client.query(query, [userId])

    return result.rows[0] as User || null
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

// Close the pool (for cleanup)
export async function closePool(): Promise<void> {
  await pool.end()
}
