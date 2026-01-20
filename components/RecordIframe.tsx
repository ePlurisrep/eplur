"use client"
import React, { useRef, useState, useEffect } from 'react'

type Props = {
  src: string
  title?: string
}

export default function RecordIframe({ src, title }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loaded) {
        // If iframe hasn't fired load within 6s, show an explanatory hint
        // but don't mark as blocked yet — user can still interact.
      }
    }, 6000)
    return () => clearTimeout(timeout)
  }, [loaded])

  function handleLoad() {
    setLoaded(true)
    try {
      const doc = ref.current?.contentDocument
      if (!doc || (doc.documentElement && doc.documentElement.innerHTML.trim().length === 0)) {
        setBlocked(true)
      } else {
        setBlocked(false)
      }
    } catch (e) {
      // cross-origin but embedded successfully
      setBlocked(false)
    }
  }

  function handleError() {
    setBlocked(true)
  }

  return (
    <div>
      <iframe
        ref={ref}
        src={src}
        title={title}
        className="record-frame"
        onLoad={handleLoad}
        onError={handleError}
      />

      {blocked && (
        <div className="record-metadata" style={{ marginTop: 8 }}>
          <p>
            If the record does not load,
            {' '}
            <a href={src} target="_blank" rel="noreferrer">open official source</a>.
          </p>
          <p>
            <a href={src} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#002868', color: '#fff', padding: '8px 12px', textDecoration: 'none' }}>Open Official Source</a>
          </p>
        </div>
      )}
    </div>
  )
}
