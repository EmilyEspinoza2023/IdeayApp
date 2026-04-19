import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import NavCliente from '../../components/navegacion/NavCliente'

export default function MisReservas() {
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const [activas, setActivas] = useState([])
  const [historial, setHistorial] = useState([])
  const [tiempos, setTiempos] = useState({})

  useEffect(() => { if (perfil) cargarReservas() }, [perfil])

  useEffect(() => {
    const interval = setInterval(() => {
      const nuevos = {}
      activas.forEach(r => {
        if (r.expira_en) nuevos[r.id] = Math.max(0, new Date(r.expira_en) - new Date())
      })
      setTiempos(nuevos)
    }, 1000)
    return () => clearInterval(interval)
  }, [activas])

  async function cargarReservas() {
    const { data } = await supabase
      .from('reservas_mesas').select('*, mesas(numero, capacidad, zona), eventos(titulo, fecha)')
      .eq('usuario_id', perfil.id).order('creado_en', { ascending: false })
    setActivas(data?.filter(r => ['pendiente', 'confirmada'].includes(r.estado)) || [])
    setHistorial(data?.filter(r => ['liberada', 'cancelada'].includes(r.estado)) || [])
  }

  function formatTiempo(ms) {
    if (!ms) return '00:00'
    return `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`
  }

  function badgeEstado(estado) {
    if (estado === 'confirmada') return 'badge-confirmada'
    if (estado === 'pendiente') return 'badge-pendiente'
    return 'badge-finalizado'
  }

  function labelEstado(estado) {
    return { confirmada: 'Confirmada', pendiente: 'Pendiente', liberada: 'Completada', cancelada: 'Cancelada' }[estado] || estado
  }

  return (
    <div className="page-cliente">
      <NavCliente />
      <div className="container-fluid px-3 px-md-4" style={{ maxWidth: 800 }}>
        <div className="pt-4 pb-3 d-flex align-items-center gap-2">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <i className="bi bi-chevron-left" style={{ fontSize: 16 }}></i>
          </button>
          <h4 className="fw-bold mb-0">Mis Reservas</h4>
        </div>

        {activas.length > 0 && (
          <>
            <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Activas</p>
            <div className="d-flex flex-column gap-3 mb-4">
              {activas.map(r => (
                <div key={r.id} className="card-ideay p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <p className="fw-bold mb-0">Mesa M{r.mesas?.numero}
                        <span className="text-muted fw-normal" style={{ fontSize: 12 }}> · {r.mesas?.zona === 'planta_baja' ? 'Planta Baja' : 'Planta Alta'}</span>
                      </p>
                      <small className="text-muted">{r.eventos?.titulo}</small>
                    </div>
                    <span className={`badge ${badgeEstado(r.estado)}`}>{labelEstado(r.estado)}</span>
                  </div>
                  {r.expira_en && tiempos[r.id] !== undefined && (
                    <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ backgroundColor: tiempos[r.id] < 300000 ? '#fce4ec' : '#f8f9fa' }}>
                      <i className="bi bi-clock" style={{ color: tiempos[r.id] < 300000 ? 'var(--rojo)' : '#6c757d', fontSize: 14 }}></i>
                      <span className="fw-semibold" style={{ fontSize: 13, color: tiempos[r.id] < 300000 ? 'var(--rojo)' : '#6c757d' }}>
                        Tiempo restante: {formatTiempo(tiempos[r.id])}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {historial.length > 0 && (
          <>
            <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Historial</p>
            <div className="d-flex flex-column gap-2 pb-4">
              {historial.map(r => (
                <div key={r.id} className="card-ideay p-3" style={{ opacity: 0.7 }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="fw-semibold mb-0" style={{ fontSize: 14 }}>Mesa M{r.mesas?.numero}</p>
                      <small className="text-muted">{r.eventos?.titulo}</small>
                    </div>
                    <span className={`badge ${badgeEstado(r.estado)}`}>{labelEstado(r.estado)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activas.length === 0 && historial.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x" style={{ fontSize: 48, color: '#dee2e6' }}></i>
            <p className="text-muted mt-3">No tenés reservas todavía</p>
            <button className="btn btn-sm" style={{ backgroundColor: 'var(--rojo)', color: '#fff', borderRadius: 10 }} onClick={() => navigate('/explorar')}>
              Ver eventos
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
