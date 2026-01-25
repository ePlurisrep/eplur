import { createHash, randomBytes } from 'crypto'

/**
 * Generate a new API token
 * @returns {object} Object containing the plaintext token and its hash
 */
export function generateApiToken(): { token: string; tokenHash: string } {
  // Generate a secure random token
  const token = randomBytes(32).toString('hex')
  
  // Create a hash of the token for storage
  const tokenHash = hashToken(token)
  
  return { token, tokenHash }
}

/**
 * Hash a token using SHA-256
 * @param token - The plaintext token to hash
 * @returns The hex-encoded hash
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Validate a token format (basic checks)
 * @param token - The token to validate
 * @returns True if the token appears valid
 */
export function isValidTokenFormat(token: string): boolean {
  // Token should be 64 hex characters (32 bytes)
  return /^[0-9a-f]{64}$/i.test(token)
}
