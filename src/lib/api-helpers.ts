import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export async function rateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): Promise<boolean> {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

// API error handler
export function apiError(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

// API success response
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

// Auth middleware wrapper
export async function withAuth(
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await auth()
    
    if (!session) {
      return apiError("Unauthorized", 401)
    }

    return handler(req, session)
  }
}

// Combined auth + rate limit wrapper
export async function withAuthAndRateLimit(
  handler: (req: NextRequest, session: any) => Promise<NextResponse>,
  options: { limit?: number; windowMs?: number } = {}
) {
  return async (req: NextRequest) => {
    const session = await auth()
    
    if (!session) {
      return apiError("Unauthorized", 401)
    }

    const identifier = session.user?.email || session.user?.id || 'unknown'
    const allowed = await rateLimit(identifier, options.limit, options.windowMs)

    if (!allowed) {
      return apiError("Too many requests. Please try again later.", 429)
    }

    return handler(req, session)
  }
}

// Request body parser with error handling
export async function parseBody<T>(req: NextRequest): Promise<T | null> {
  try {
    return await req.json()
  } catch (error) {
    return null
  }
}

// Clean up rate limit map periodically (every 10 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}




