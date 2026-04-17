'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Caso', href: '/' },
  { label: 'Configuración', href: '/config' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header style={{ background: '#2b6cb0', color: '#fff' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 32 }}>
        <span style={{ fontWeight: 700, fontSize: 20, padding: '16px 0' }}>EasyRAD</span>
        <nav style={{ display: 'flex', gap: 4 }}>
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
      </div>
    </header>
  )
}
