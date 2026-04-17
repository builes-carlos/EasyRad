'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

interface Template {
  indicacion: string | null
  tecnica: string | null
  hallazgos: string | null
  opinion: string | null
  nota: string | null
}

const FIELDS: { key: keyof Template; label: string; rows: number }[] = [
  { key: 'indicacion', label: 'Indicación', rows: 2 },
  { key: 'tecnica', label: 'Técnica', rows: 5 },
  { key: 'hallazgos', label: 'Hallazgos', rows: 12 },
  { key: 'opinion', label: 'Opinión', rows: 4 },
  { key: 'nota', label: 'Nota', rows: 4 },
]

const EMPTY: Template = { indicacion: '', tecnica: '', hallazgos: '', opinion: '', nota: '' }

export default function TemplatesManager() {
  const [names, setNames] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [template, setTemplate] = useState<Template>(EMPTY)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`${API}/templates`).then((r) => r.json()).then(setNames)
  }, [])

  async function selectTemplate(name: string) {
    setSelected(name)
    setSaved(false)
    const data = await fetch(`${API}/templates/${encodeURIComponent(name)}`).then((r) => r.json())
    setTemplate({ indicacion: data.indicacion, tecnica: data.tecnica, hallazgos: data.hallazgos, opinion: data.opinion, nota: data.nota })
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    await fetch(`${API}/templates/${encodeURIComponent(selected)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDelete() {
    if (!selected || !confirm(`¿Eliminar "${selected}"?`)) return
    await fetch(`${API}/templates/${encodeURIComponent(selected)}`, { method: 'DELETE' })
    setNames((prev) => prev.filter((n) => n !== selected))
    setSelected(null)
    setTemplate(EMPTY)
  }

  async function handleCreate() {
    if (!newName.trim()) return
    await fetch(`${API}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), ...EMPTY }),
    })
    setNames((prev) => [...prev, newName.trim()])
    setCreating(false)
    selectTemplate(newName.trim())
    setNewName('')
  }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Lista */}
      <div style={{ width: 260, flexShrink: 0 }}>
        <button
          onClick={() => setCreating(true)}
          style={{ width: '100%', marginBottom: 12, padding: '8px 0', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
        >
          + Nueva plantilla
        </button>
        {creating && (
          <div style={{ marginBottom: 12 }}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nombre de la plantilla"
              style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e0', marginBottom: 6, boxSizing: 'border-box', color: '#000', background: '#fafafa' }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={handleCreate} style={{ flex: 1, padding: '6px 0', background: '#276749', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Crear</button>
              <button onClick={() => { setCreating(false); setNewName('') }} style={{ flex: 1, padding: '6px 0', background: '#e2e8f0', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        )}
        <div style={{ maxHeight: 600, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          {names.map((name) => (
            <button
              key={name}
              onClick={() => selectTemplate(name)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                border: 'none',
                background: selected === name ? '#ebf4ff' : '#fff',
                color: selected === name ? '#2b6cb0' : '#000',
                fontWeight: selected === name ? 600 : 400,
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                fontSize: 13,
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      {selected ? (
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: 16 }}>{selected}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleDelete}
                style={{ padding: '7px 16px', background: '#fed7d7', color: '#c53030', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                Eliminar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '7px 16px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                {saved ? 'Guardado ✓' : saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
          {FIELDS.map(({ key, label, rows }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, color: '#fff', fontSize: 14 }}>{label}</label>
              <textarea
                value={template[key] ?? ''}
                onChange={(e) => setTemplate((prev) => ({ ...prev, [key]: e.target.value }))}
                rows={rows}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, padding: 10, border: '1px solid #e2e8f0', borderRadius: 6, resize: 'vertical', color: '#000', background: '#fafafa', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#666', marginTop: 8 }}>Selecciona una plantilla para editarla.</p>
      )}
    </div>
  )
}
