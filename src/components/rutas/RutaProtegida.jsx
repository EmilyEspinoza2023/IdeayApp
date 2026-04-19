import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, perfil, cargando } = useAuth()

  if (cargando) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#F5F0EB' }}>
      <div className="spinner-border" style={{ color: 'var(--rojo)' }} />
    </div>
  )

  if (!usuario) return <Navigate to="/login" replace />
  if (soloAdmin && perfil?.rol !== 'admin') return <Navigate to="/inicio" replace />
  if (!soloAdmin && perfil?.rol === 'admin') return <Navigate to="/admin/dashboard" replace />

  return children
}
