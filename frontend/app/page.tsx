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
  const [isRecording, setIsRecording] = useState(false)

  function handleRecordingComplete(blob: Blob) {
    setAudioBlob(blob)
    setSent(false)
    setResult(null)
    setError(null)
    setIsRecording(false)
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
    <div>
      <Recorder
        onRecordingComplete={handleRecordingComplete}
        onRecordingStart={() => { setIsRecording(true); setAudioBlob(null); setSent(false); setResult(null) }}
      />
      {audioBlob && !isRecording && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button
            onClick={handleSend}
            disabled={loading || sent}
            style={{
              padding: '10px 32px',
              fontSize: 16,
              cursor: loading || sent ? 'not-allowed' : 'pointer',
              background: loading || sent ? '#cbd5e0' : '#2b6cb0',
              color: loading || sent ? '#000' : '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {loading ? 'Procesando…' : sent ? 'Enviado ✓' : 'Enviar'}
          </button>
        </div>
      )}
      {error && (
        <p style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>
          {error.includes('Expecting value') || error.includes('JSONDecodeError')
            ? 'El dictado es muy corto o no contiene información clínica suficiente. Intenta de nuevo con un dictado más completo.'
            : error}
        </p>
      )}
      {result && <ReportDisplay report={result} />}
    </div>
  )
}
