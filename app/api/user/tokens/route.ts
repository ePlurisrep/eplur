import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateApiToken } from '@/lib/auth/apiTokens'
import { createServerClient } from '@supabase/ssr'

const prisma = new PrismaClient()

/**
 * GET /api/user/tokens - List all API tokens for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from Supabase session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => {
            const cookies = request.cookies.get(name)
            return cookies?.value
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find or create user in our database
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          id: user.id
        }
      })
    }

    // Get all non-revoked tokens for this user
    const tokens = await prisma.apiToken.findMany({
      where: {
        userId: dbUser.id,
        revokedAt: null
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        lastUsedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/tokens - Create a new API token
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from Supabase session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => {
            const cookies = request.cookies.get(name)
            return cookies?.value
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Token name is required' },
        { status: 400 }
      )
    }

    // Find or create user in our database
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          id: user.id
        }
      })
    }

    // Generate a new token
    const { token, tokenHash } = generateApiToken()

    // Store the token in the database
    const apiToken = await prisma.apiToken.create({
      data: {
        userId: dbUser.id,
        name: name.trim(),
        tokenHash
      },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    })

    // Return the token (only time it will be shown in plaintext)
    return NextResponse.json({
      token,
      ...apiToken,
      message: 'Token created successfully. Save this token - it will not be shown again.'
    })
  } catch (error) {
    console.error('Error creating token:', error)
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    )
  }
}
