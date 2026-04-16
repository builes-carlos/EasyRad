'use client'
import { useState } from 'react'
import Recorder from '@/components/Recorder'
import ReportDisplay from '@/components/ReportDisplay'

export default function Home() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  function handleRecordingComplete(blob: Blob) {
    setAudioBlob(blob)
    setSent(false)
    setResult(null)
    setError(null)
  }

  async function handleSend() {
    if (!audioBlob) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('audio', audioBlob, 'recording.webm')
      fd.append('radiologist_id', 'dr_web')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/process`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Error en el pipeline')
      setResult(await res.json())
      setSent(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: '60px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>EasyRAD</h1>
      <Recorder onRecordingComplete={handleRecordingComplete} />
      <button
        onClick={handleSend}
        disabled={!audioBlob || loading || sent}
        style={{
          display: 'block',
          marginTop: 16,
          padding: '10px 24px',
          fontSize: 16,
          cursor: audioBlob && !loading && !sent ? 'pointer' : 'not-allowed',
          background: audioBlob && !loading && !sent ? '#2b6cb0' : '#cbd5e0',
          color: '#000',
          border: 'none',
          borderRadius: 6,
        }}
      >
        {loading ? 'Procesando…' : 'Enviar'}
      </button>
      {audioBlob && !loading && !result && (
        <p style={{ color: '#666', marginTop: 8 }}>Audio listo — presiona Enviar para procesar.</p>
      )}
      {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}
      {result && <ReportDisplay report={result} />}
    </main>
  )
}
