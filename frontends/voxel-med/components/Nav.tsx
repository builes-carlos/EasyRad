'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const TABS = [
  { label: 'Caso', href: '/' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header style={{ background: '#2b6cb0', color: '#fff' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 32 }}>
        <span style={{ fontWeight: 700, fontSize: 20, padding: '16px 0' }}>Voxel-Med</span>
        <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
          {TABS.map((tab) => {
            const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  padding: '18px 20px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: active ? 700 : 400,
                  borderBottom: active ? '3px solid #fff' : '3px solid transparent',
                  display: 'inline-block',
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>

        {/* Usuario */}
        <div ref={menuRef} style={{ position: 'relative', padding: '12px 0' }}>
          <div
            onClick={() => setOpen((v) => !v)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#fff',
              color: '#2b6cb0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            JV
          </div>

          {open && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 4px)',
              background: '#fff',
              color: '#333',
              borderRadius: 12,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              minWidth: 220,
              zIndex: 100,
              overflow: 'hidden',
            }}>
              {/* Cabecera del usuario */}
              <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#2b6cb0',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 22,
                  margin: '0 auto 10px',
                }}>
                  JV
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Jorge Vergara</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Radiólogo</div>
              </div>

              {/* Opciones */}
              {[
                { label: 'Perfil', href: '#' },
                { label: 'Configuración', href: '/config' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 20px',
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: 14,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
