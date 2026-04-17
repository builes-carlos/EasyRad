'use client'
import { useState } from 'react'
import Link from 'next/link'
import PromptEditor from '@/components/config/PromptEditor'
import TemplatesManager from '@/components/config/TemplatesManager'

const MENU_ITEMS = ['Configuración'] as const
type MenuItem = typeof MENU_ITEMS[number]

const SUB_TABS = ['Prompt principal', 'Plantillas'] as const
type SubTab = typeof SUB_TABS[number]

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('Configuración')
  const [activeTab, setActiveTab] = useState<SubTab>('Prompt principal')

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* Nav */}
      <header style={{ background: '#2b6cb0', color: '#fff' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 20px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 20, padding: '16px 0', color: '#fff', textDecoration: 'none', letterSpacing: '-0.5px' }}>
            Voxel-Med
          </Link>
          <span style={{ fontSize: 13, background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 12, fontWeight: 600 }}>
            Admin
          </span>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px', display: 'flex', gap: 0 }}>
        {/* Sidebar */}
        <aside style={{
          width: 200, flexShrink: 0,
          background: '#fff', borderRadius: '12px 0 0 12px',
          border: '1px solid #e2e8f0', borderRight: 'none',
          padding: '16px 0',
        }}>
          {MENU_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              style={{
                display: 'block', width: '100%',
                padding: '11px 20px', textAlign: 'left',
                background: activeMenu === item ? '#ebf4ff' : 'none',
                border: 'none', borderLeft: activeMenu === item ? '3px solid #2b6cb0' : '3px solid transparent',
                cursor: 'pointer', fontSize: 14,
                color: activeMenu === item ? '#2b6cb0' : '#4a5568',
                fontWeight: activeMenu === item ? 700 : 400,
              }}
            >
              {item}
            </button>
          ))}
        </aside>

        {/* Contenido */}
        <div style={{
          flex: 1, background: '#fff',
          borderRadius: '0 12px 12px 0',
          border: '1px solid #e2e8f0',
          padding: '28px 32px',
        }}>
          {activeMenu === 'Configuración' && (
            <>
              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0', marginBottom: 28 }}>
                {SUB_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '10px 24px', border: 'none', background: 'none',
                      cursor: 'pointer', fontWeight: activeTab === tab ? 700 : 400,
                      color: activeTab === tab ? '#2b6cb0' : '#555',
                      borderBottom: activeTab === tab ? '2px solid #2b6cb0' : '2px solid transparent',
                      marginBottom: -2, fontSize: 15,
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === 'Prompt principal' && <PromptEditor />}
              {activeTab === 'Plantillas' && <TemplatesManager />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
