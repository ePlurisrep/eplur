import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashToken, isValidTokenFormat } from './apiTokens'

const prisma = new PrismaClient()

/**
 * Authenticate a request using Bearer token or Supabase session
 * @param request - The Next.js request object
 * @returns The authenticated user ID or null
 */
export async function authenticateRequest(request: NextRequest): Promise<string | null> {
  // Check for Bearer token in Authorization header
  const authHeader = request.headers.get('authorization')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    
    // Validate token format
    if (!isValidTokenFormat(token)) {
      return null
    }
    
    // Hash the token and look it up in the database
    const tokenHash = hashToken(token)
    
    const apiToken = await prisma.apiToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    })
    
    // Check if token exists, is not revoked, and user exists
    if (!apiToken || apiToken.revokedAt || !apiToken.user) {
      return null
    }
    
    // Update last used timestamp (async, don't await)
    prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() }
    }).catch(() => {
      // Ignore errors updating last used timestamp
    })
    
    return apiToken.userId
  }
  
  // If no Bearer token, could fall back to Supabase session here
  // For now, return null if no Bearer token
  return null
}
