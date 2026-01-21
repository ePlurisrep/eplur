// Simple centralized LLM configuration helper.
// Read the CLAUDE_MODEL env var; default to claude-sonnet-4.5 for safety.
export const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-4.5'

export function getClaudeModel(): string {
  if (typeof process === 'undefined' || !process.env) return DEFAULT_CLAUDE_MODEL
  return process.env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL
}

export default getClaudeModel
