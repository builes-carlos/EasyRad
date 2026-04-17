'use client'
import { useEffect, useState } from 'react'

interface Props {
  radiologistId: string
}

export default function DoctorConfigPanel({ radiologistId }: Props) {
  const [profile, setProfile] = useState<{ name: string; specialty: string } | null>(null)
  const [style, setStyle] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!radiologistId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/medical/${radiologistId}`)
      .then(r => r.json())
      .then(d => {
        setProfile({ name: d.name, specialty: d.specialty })
        setStyle(d.style || '')
      })
      .catch(() => {})
  }, [radiologistId])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/medical/${radiologistId}/style`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '24px 28px',
      marginBottom: 24,
      maxWidth: 640,
      margin: '0 auto 24px',
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#2d3748', marginBottom: 20 }}>Configuración</div>

      {/* Perfil — solo lectura */}
      {profile && (
        <div style={{ display: 'flex', gap: 32, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f0f0f0' }}>
          <Field label="Nombre" value={profile.name} />
          <Field label="Especialidad" value={profile.specialty} />
          <Field label="ID" value={radiologistId} />
        </div>
      )}

      {/* Personalización de estilo */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 8 }}>
          Tu estilo personal
        </label>
        <p style={{ fontSize: 13, color: '#718096', marginBottom: 10, lineHeight: 1.5 }}>
          Escribe en lenguaje natural cómo prefieres que se redacten tus reportes.
          Ejemplo: "Prefiero primera persona", "Siempre mencionar dosis de radiación", etc.
        </p>
        <textarea
          value={style}
          onChange={e => setStyle(e.target.value)}
          rows={5}
          placeholder="Ej: Prefiero ser conciso en la sección de técnica. Siempre mencionar si el estudio es comparativo..."
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #cbd5e0',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box',
            color: '#2d3748',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 20px',
              background: saved ? '#38a169' : '#2b6cb0',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#2d3748', fontWeight: 500 }}>{value}</div>
    </div>
  )
}
