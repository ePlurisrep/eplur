import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { hashToken, isValidTokenFormat } from './apiTokens'
import { prisma } from '@/lib/prisma'

interface AuthResult {
  userId: string | null
  supabase?: any
  supabaseResponse?: NextResponse
}

/**
 * Authenticate a request using either Bearer token or Supabase session
 * @param request - The Next.js request object
 * @returns Object containing userId and optionally supabase client
 */
export async function authenticate(request: NextRequest): Promise<AuthResult> {
  // Check for Bearer token in Authorization header
  const authHeader = request.headers.get('authorization')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    
    // Validate token format
    if (isValidTokenFormat(token)) {
      // Hash the token and look it up in the database
      const tokenHash = hashToken(token)
      
      const apiToken = await prisma.apiToken.findUnique({
        where: { tokenHash },
        include: { user: true }
      })
      
      // Check if token exists, is not revoked, and user exists
      if (apiToken && !apiToken.revokedAt && apiToken.user) {
        // Update last used timestamp (async, don't await)
        prisma.apiToken.update({
          where: { id: apiToken.id },
          data: { lastUsedAt: new Date() }
        }).catch((error) => {
          // Log error but don't fail the request
          console.error('Failed to update token lastUsedAt:', error)
        })
        
        return { userId: apiToken.userId }
      }
    }
    
    // If we have a Bearer token but it's invalid, don't fall back to session
    return { userId: null }
  }
  
  // Fall back to Supabase session authentication
  let supabaseResponse = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next()
          cookiesToSet.forEach(({ name, value }) => supabaseResponse.cookies.set(name, value))
        },
      },
    }
  )

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  
  if (!user) {
    return { userId: null, supabase, supabaseResponse }
  }
  
  return { userId: user.id, supabase, supabaseResponse }
}
