'use client'
import { useState } from 'react'
import Link from 'next/link'
import Recorder from '@/components/Recorder'
import ReportDisplay from '@/components/ReportDisplay'
import DoctorConfigPanel from '@/components/DoctorConfigPanel'

const DOCTORS = [
  { id: 'dr_jorge', label: 'Jorge' },
  { id: 'dr_carlos', label: 'Carlos' },
]

export default function DoctorPage() {
  const [radiologistId, setRadiologistId] = useState('dr_jorge')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

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
      fd.append('user_id', radiologistId)
      fd.append('domain', 'medical')
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

  const doctor = DOCTORS.find(d => d.id === radiologistId)!

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* Nav */}
      <header style={{ background: '#2b6cb0', color: '#fff' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto', padding: '0 20px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 20, padding: '16px 0', color: '#fff', textDecoration: 'none', letterSpacing: '-0.5px' }}>
            Voxel-Med
          </Link>
          <div style={{ flex: 1 }} />

          {/* Selector de médico */}
          <select
            value={radiologistId}
            onChange={e => { setRadiologistId(e.target.value); setShowConfig(false) }}
            style={{
              padding: '6px 10px', fontSize: 14, borderRadius: 6,
              border: 'none', background: 'rgba(255,255,255,0.15)',
              color: '#fff', cursor: 'pointer', fontWeight: 600,
            }}
          >
            {DOCTORS.map(d => (
              <option key={d.id} value={d.id} style={{ color: '#333', background: '#fff' }}>{d.label}</option>
            ))}
          </select>

          {/* Ícono de configuración */}
          <button
            onClick={() => setShowConfig(v => !v)}
            title="Configuración"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: showConfig ? '#fff' : 'rgba(255,255,255,0.2)',
              color: showConfig ? '#2b6cb0' : '#fff',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'all 0.15s',
            }}
          >
            ⚙
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        {showConfig && (
          <DoctorConfigPanel radiologistId={radiologistId} />
        )}

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
                padding: '10px 32px', fontSize: 16,
                cursor: loading || sent ? 'not-allowed' : 'pointer',
                background: loading || sent ? '#cbd5e0' : '#2b6cb0',
                color: loading || sent ? '#000' : '#fff',
                border: 'none', borderRadius: 6, fontWeight: 600,
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
      </main>
    </div>
  )
}
