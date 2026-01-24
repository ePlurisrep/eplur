import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/user/tokens/[id] - Revoke an API token
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find user in our database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tokenId = params.id

    // Find the token and verify it belongs to this user
    const apiToken = await prisma.apiToken.findUnique({
      where: { id: tokenId }
    })

    if (!apiToken) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    if (apiToken.userId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Token does not belong to this user' },
        { status: 403 }
      )
    }

    // Mark the token as revoked
    await prisma.apiToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() }
    })

    return NextResponse.json({ message: 'Token revoked successfully' })
  } catch (error) {
    console.error('Error revoking token:', error)
    return NextResponse.json(
      { error: 'Failed to revoke token' },
      { status: 500 }
    )
  }
}
