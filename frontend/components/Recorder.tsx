'use client'
import { useState, useRef } from 'react'

interface Props {
  onRecordingComplete: (blob: Blob) => void
}

export default function Recorder({ onRecordingComplete }: Props) {
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
    } else {
      mrRef.current?.stop()
      setRecording(false)
    }
  }

  return (
    <button
      onClick={toggle}
      style={{
        padding: '10px 24px',
        fontSize: 16,
        background: recording ? '#e53e3e' : '#2b6cb0',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      {recording ? 'Detener grabacion' : 'Grabar'}
    </button>
  )
}
