"use server"

import { auth } from "./auth"
import { upsertUser } from "./database"

export async function saveUserToDatabase() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const userData = {
      google_id: session.user.id,
      email: session.user.email!,
      name: session.user.name || undefined,
      image_url: session.user.image || undefined,
    }

    const savedUser = await upsertUser(userData)

    return { 
      success: true, 
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        created_at: savedUser.created_at,
        last_login: savedUser.last_login
      }
    }
  } catch (error) {
    console.error("Error saving user to database:", error)
    return { success: false, error: "Database error" }
  }
}
