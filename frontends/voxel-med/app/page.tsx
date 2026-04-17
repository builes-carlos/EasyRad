'use client'
import { useRouter } from 'next/navigation'

export default function Landing() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7fafc',
      gap: 48,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#2b6cb0', letterSpacing: '-1px' }}>Voxel-Med</div>
        <div style={{ fontSize: 15, color: '#718096', marginTop: 6 }}>¿Cómo deseas ingresar?</div>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <RoleCard
          title="Doctor"
          description="Dictar y generar reportes"
          icon="🩺"
          onClick={() => router.push('/doctor')}
        />
        <RoleCard
          title="Admin"
          description="Gestionar configuración"
          icon="⚙️"
          onClick={() => router.push('/admin')}
        />
      </div>
    </div>
  )
}

function RoleCard({ title, description, icon, onClick }: {
  title: string
  description: string
  icon: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 180,
        padding: '32px 24px',
        background: '#fff',
        border: '2px solid #e2e8f0',
        borderRadius: 16,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.15s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#2b6cb0'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(43,108,176,0.15)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e2e8f0'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      <span style={{ fontSize: 40 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 18, color: '#2d3748' }}>{title}</span>
      <span style={{ fontSize: 13, color: '#718096', textAlign: 'center' }}>{description}</span>
    </button>
  )
}
