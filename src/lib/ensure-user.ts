/**
 * Helper function to ensure a user exists in the database
 * Call this in API routes to auto-create users from their session
 */

import { auth } from './auth';
import { upsertUser, getUserByGoogleId } from './database';

export async function ensureUserExists() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { 
      success: false, 
      error: 'Unauthorized',
      status: 401 
    };
  }

  try {
    // Check if user exists
    let user = await getUserByGoogleId(session.user.id);
    
    // If not, create them
    if (!user) {
      console.log('🆕 Creating new user:', session.user.email);
      user = await upsertUser({
        google_id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || undefined,
        image_url: session.user.image || undefined,
      });
      console.log('✅ User created successfully:', session.user.email);
    }
    
    return {
      success: true,
      user,
      session
    };
  } catch (error) {
    console.error('❌ Error ensuring user exists:', error);
    return {
      success: false,
      error: 'Failed to create user',
      status: 500
    };
  }
}





