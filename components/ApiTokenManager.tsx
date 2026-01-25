'use client'

import { useState, useEffect } from 'react'

interface ApiToken {
  id: string
  name: string
  createdAt: string
  lastUsedAt: string | null
}

export default function ApiTokenManager() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [tokenName, setTokenName] = useState('')
  const [newToken, setNewToken] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTokens()
  }, [])

  async function fetchTokens() {
    try {
      const res = await fetch('/api/user/tokens')
      if (res.ok) {
        const data = await res.json()
        setTokens(data.tokens || [])
      }
    } catch (error) {
      console.error('Error fetching tokens:', error)
    }
  }

  async function createToken(e: React.FormEvent) {
    e.preventDefault()
    if (!tokenName.trim()) {
      setMessage('Please enter a token name')
      return
    }

    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/user/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tokenName })
      })

      const data = await res.json()

      if (res.ok) {
        setNewToken(data.token)
        setMessage(data.message)
        setTokenName('')
        fetchTokens()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to create token')
    } finally {
      setLoading(false)
    }
  }

  async function revokeToken(id: string) {
    if (!confirm('Are you sure you want to revoke this token? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/user/tokens/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage('Token revoked successfully')
        fetchTokens()
      } else {
        const data = await res.json()
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to revoke token')
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setMessage('Token copied to clipboard!')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="api-token-manager" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>API Access Tokens</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Create and manage API tokens for programmatic access to the API.
      </p>

      {/* Create New Token Form */}
      <form onSubmit={createToken} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="tokenName" style={{ display: 'block', marginBottom: '5px' }}>
              Token Name
            </label>
            <input
              id="tokenName"
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g., My API Client"
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Token'}
          </button>
        </div>
      </form>

      {/* New Token Display */}
      {newToken && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #0070f3',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          <h3 style={{ marginTop: 0 }}>Your New Token</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Save this token now. You won't be able to see it again!
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <code
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                wordBreak: 'break-all'
              }}
            >
              {newToken}
            </code>
            <button
              onClick={() => copyToClipboard(newToken)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: message.includes('Error') ? '#fee' : '#efe',
            border: `1px solid ${message.includes('Error') ? '#fcc' : '#cfc'}`,
            borderRadius: '4px'
          }}
        >
          {message}
        </div>
      )}

      {/* Token List */}
      <h3>Active Tokens</h3>
      {tokens.length === 0 ? (
        <p style={{ color: '#666' }}>No active tokens. Create one above to get started.</p>
      ) : (
        <div>
          {tokens.map((token) => (
            <div
              key={token.id}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>{token.name}</strong>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                  Created: {new Date(token.createdAt).toLocaleDateString()}
                  {token.lastUsedAt && (
                    <> • Last used: {new Date(token.lastUsedAt).toLocaleDateString()}</>
                  )}
                </div>
              </div>
              <button
                onClick={() => revokeToken(token.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Usage Example */}
      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      >
        <h3 style={{ marginTop: 0 }}>Usage Example</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Use your token in API requests with the Authorization header:
        </p>
        <pre
          style={{
            padding: '10px',
            backgroundColor: '#2d2d2d',
            color: '#f8f8f2',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}
        >
{`curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  https://yourapp.com/api/endpoint`}
        </pre>
      </div>
    </div>
  )
}
