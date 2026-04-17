'use client'
import { useState } from 'react'
import PromptEditor from '@/components/config/PromptEditor'
import TemplatesManager from '@/components/config/TemplatesManager'

const SUB_TABS = ['Prompt principal', 'Plantillas'] as const
type SubTab = typeof SUB_TABS[number]

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('Prompt principal')

  return (
    <div>
      {/* Especialidad — sección superior */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
          Especialidad
        </label>
        <select
          defaultValue="Radiología"
          style={{
            padding: '8px 16px',
            border: '1px solid #bee3f8',
            borderRadius: 8,
            background: '#ebf4ff',
            color: '#2b6cb0',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          <option>Radiología</option>
        </select>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0', marginBottom: 32 }}>
        {SUB_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? '#2b6cb0' : '#555',
              borderBottom: activeTab === tab ? '2px solid #2b6cb0' : '2px solid transparent',
              marginBottom: -2,
              fontSize: 15,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Prompt principal' && <PromptEditor />}
      {activeTab === 'Plantillas' && <TemplatesManager />}
    </div>
  )
}
