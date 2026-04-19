import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import NavCliente from '../../components/navegacion/NavCliente'

export default function ReservarMesa() {
  const { id: eventoId } = useParams()
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const [mesas, setMesas] = useState([])
  const [seleccionada, setSeleccionada] = useState(null)
  const [evento, setEvento] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => { cargarDatos() }, [eventoId])

  async function cargarDatos() {
    const [{ data: mesasData }, { data: evData }] = await Promise.all([
      supabase.from('mesas').select('*').order('numero'),
      supabase.from('eventos').select('titulo, fecha, hora').eq('id', eventoId).single(),
    ])
    setMesas(mesasData || [])
    setEvento(evData)
  }

  async function reservar() {
    if (!seleccionada || !perfil) return
    setCargando(true)
    const { data, error } = await supabase.from('reservas_mesas').insert({
      usuario_id: perfil.id,
      mesa_id: seleccionada.id,
      evento_id: eventoId,
      fecha_reserva: evento.fecha,
      hora_reserva: evento.hora,
      estado: 'pendiente',
    }).select().single()
    if (!error) navigate(`/evento/${eventoId}/mesa-reservada`, { state: { reserva: data, mesa: seleccionada, evento } })
    setCargando(false)
  }

  function colorMesa(mesa) {
    if (!mesa.disponible) return '#ef4444'
    if (seleccionada?.id === mesa.id) return '#f59e0b'
    return '#198754'
  }

  const mesasBajas = mesas.filter((_, i) => i < Math.ceil(mesas.length / 2))
  const mesasAltas = mesas.filter((_, i) => i >= Math.ceil(mesas.length / 2))

  function PlantaMesas({ lista, titulo }) {
    return (
      <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: '#fff3f3' }}>
        <div className="rounded-3 py-2 text-center mb-3 d-flex align-items-center justify-content-center gap-2"
          style={{ backgroundColor: '#fce8e8' }}>
          <i className="bi bi-music-note-beamed" style={{ color: 'var(--rojo)', fontSize: 14 }}></i>
          <span style={{ fontSize: 13, color: 'var(--rojo)', fontWeight: 600 }}>DJ Toña</span>
        </div>
        <p className="text-muted text-center mb-3" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Pista</p>
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-2">
          {lista.map(mesa => (
            <button key={mesa.id}
              className="rounded-circle border-0 text-white fw-bold d-flex align-items-center justify-content-center"
              style={{ width: 44, height: 44, fontSize: 11, backgroundColor: colorMesa(mesa), opacity: !mesa.disponible ? 0.65 : 1, cursor: mesa.disponible ? 'pointer' : 'not-allowed' }}
              onClick={() => mesa.disponible && setSeleccionada(mesa)}>
              M{mesa.numero}
            </button>
          ))}
        </div>
        <p className="text-muted text-center mb-0" style={{ fontSize: 11 }}>{titulo}</p>
      </div>
    )
  }

  return (
    <div className="page-cliente">
      <NavCliente />
      <div className="container-fluid px-3 px-md-4" style={{ maxWidth: 700 }}>
        <div className="pt-4 pb-3 d-flex align-items-center gap-2">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <i className="bi bi-chevron-left" style={{ fontSize: 16 }}></i>
          </button>
          <h4 className="fw-bold mb-0">Reservar Mesa</h4>
        </div>

        {/* Info evento */}
        {evento && (
          <div className="card-ideay px-3 py-2 d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-calendar-event" style={{ color: 'var(--rojo)', fontSize: 14 }}></i>
            <small className="text-muted">
              {evento.titulo} · {new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-NI', { weekday: 'short', day: 'numeric', month: 'long' })}
            </small>
          </div>
        )}

        {/* Leyenda */}
        <div className="d-flex gap-3 mb-3">
          {[{ color: '#198754', label: 'Disponible' }, { color: '#f59e0b', label: 'Seleccionada' }, { color: '#ef4444', label: 'Ocupada' }].map(({ color, label }) => (
            <div key={label} className="d-flex align-items-center gap-1">
              <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: color }} />
              <small className="text-muted" style={{ fontSize: 11 }}>{label}</small>
            </div>
          ))}
        </div>

        {/* Mapa mesas */}
        <PlantaMesas lista={mesasBajas} titulo="Planta Baja" />
        <PlantaMesas lista={mesasAltas} titulo="Planta Alta" />

        {/* Detalle seleccionada */}
        {seleccionada && (
          <div className="card-ideay p-3 mb-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="fw-bold mb-1">Mesa M{seleccionada.numero}</p>
                <div className="d-flex align-items-center gap-1 text-muted mb-1">
                  <i className="bi bi-people-fill" style={{ fontSize: 13 }}></i>
                  <small>Capacidad: {seleccionada.capacidad} personas</small>
                </div>
                <div className="d-flex align-items-center gap-1 text-muted">
                  <i className="bi bi-geo-alt-fill" style={{ fontSize: 13 }}></i>
                  <small>Zona {seleccionada.zona === 'planta_baja' ? 'Planta Baja' : 'Planta Alta'}</small>
                </div>
              </div>
              <span className="badge" style={{ backgroundColor: '#e8f5e9', color: '#198754', fontSize: 11 }}>Disponible</span>
            </div>
            <div className="d-flex align-items-center gap-2 mt-2" style={{ color: 'var(--rojo)', fontSize: 13 }}>
              <i className="bi bi-clock-fill" style={{ fontSize: 13 }}></i>
              La reserva se mantiene por 30:00 min
            </div>
          </div>
        )}

        {/* Botón reservar */}
        <div className="pb-4">
          <button className="btn w-100 py-3 text-white fw-semibold"
            style={{ backgroundColor: 'var(--rojo)', borderRadius: 12, opacity: (!seleccionada || cargando) ? 0.5 : 1 }}
            disabled={!seleccionada || cargando}
            onClick={reservar}>
            {cargando
              ? <><span className="spinner-border spinner-border-sm me-2" />Reservando...</>
              : seleccionada
                ? `Reservar Mesa M${seleccionada.numero}`
                : 'Seleccioná una mesa'}
          </button>
        </div>
      </div>
    </div>
  )
}
