"use client"

import React, { useEffect, useRef, useState } from 'react'

export default function PreviewFrame({ url, pdf }: { url: string; pdf: boolean }) {
  const [loaded, setLoaded] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setLoaded(false)
    setBlocked(false)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    // if load doesn't happen within 3s, consider it blocked/unavailable
    timerRef.current = window.setTimeout(() => {
      if (!loaded) setBlocked(true)
    }, 3000)

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [url])

  function handleLoad() {
    setLoaded(true)
    setBlocked(false)
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }

  function handleError() {
    setBlocked(true)
  }

  if (blocked) {
    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'monospace', textTransform: 'uppercase', color: '#444' }}>Preview unavailable</div>
        <div style={{ color: '#666', textAlign: 'center' }}>The source may block in-page previews. Open the original to view the document.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ background: '#002868', color: '#fff', padding: '8px 12px', textDecoration: 'none' }}>Open Original</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {pdf ? (
        // embed usually fires load; if it doesn't, our timeout will flip to blocked
        // eslint-disable-next-line @next/next/no-img-element
        <embed src={url} type="application/pdf" style={{ width: '100%', height: '100%' }} onLoad={handleLoad} onError={handleError} />
      ) : (
        <iframe
          src={url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          sandbox="allow-same-origin allow-scripts allow-forms"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}
