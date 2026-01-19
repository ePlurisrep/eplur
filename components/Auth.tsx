import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Sending magic link...')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Magic link sent — check your email.')
    }
  }

  return (
    <div className="auth-box">
      <form onSubmit={handleMagicLink}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button type="submit">Send Magic Link</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
