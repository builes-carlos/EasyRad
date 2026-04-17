'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

export default function PromptEditor() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`${API}/prompt`)
      .then((r) => r.json())
      .then((d) => { setContent(d.content); setLoading(false) })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await fetch(`${API}/prompt`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: '#fff' }}>Prompt principal de Jorge</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '8px 20px',
            background: '#2b6cb0',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {saved ? 'Guardado ✓' : saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          width: '100%',
          height: 500,
          fontFamily: 'monospace',
          fontSize: 13,
          padding: 16,
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          resize: 'vertical',
          color: '#000',
          background: '#fafafa',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
