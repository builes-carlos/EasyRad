'use client'
import { useState, useRef } from 'react'

interface Props {
  onRecordingComplete: (blob: Blob) => void
  onRecordingStart?: () => void
}

export default function Recorder({ onRecordingComplete, onRecordingStart }: Props) {
  const [recording, setRecording] = useState(false)
  const mrRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<BlobPart[]>([])

  async function toggle() {
    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunks.current = []
      mr.ondataavailable = (e) => chunks.current.push(e.data)
      mr.onstop = () => {
        onRecordingComplete(new Blob(chunks.current, { type: 'audio/webm' }))
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      mrRef.current = mr
      setRecording(true)
      onRecordingStart?.()
    } else {
      mrRef.current?.stop()
      setRecording(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
      <button
        onClick={toggle}
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: 'none',
          background: recording ? '#e53e3e' : '#2b6cb0',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: recording ? '0 0 0 8px rgba(229,62,62,0.25)' : '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'all 0.2s',
        }}
      >
        {recording ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-7 8a7 7 0 0 0 14 0h2a9 9 0 0 1-8 8.94V22h-2v-2.06A9 9 0 0 1 3 11h2z"/>
          </svg>
        )}
      </button>
      <span style={{ fontSize: 14, color: recording ? '#e53e3e' : '#aaa' }}>
        {recording ? 'Grabando… (click para detener)' : 'Grabar ahora'}
      </span>
    </div>
  )
}
