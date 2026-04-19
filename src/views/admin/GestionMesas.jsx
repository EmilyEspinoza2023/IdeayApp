import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import LayoutAdmin from '../../components/admin/LayoutAdmin'

// Posiciones predefinidas de mesas en el mapa visual
const POSICIONES_BAJA = [
  { x: 15, y: 30 }, { x: 35, y: 30 }, { x: 55, y: 30 },
  { x: 15, y: 60 }, { x: 35, y: 60 }, { x: 55, y: 60 },
  { x: 75, y: 45 },
]
const POSICIONES_ALTA = [
  { x: 20, y: 25 }, { x: 45, y: 25 }, { x: 70, y: 25 },
  { x: 20, y: 60 }, { x: 45, y: 60 }, { x: 70, y: 60 },
  { x: 85, y: 42 },
]

export default function GestionMesas() {
  const [mesas, setMesas] = useState([])
  const [modoEdicion, setModoEdicion] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null)

  useEffect(() => { cargarMesas() }, [])

  async function cargarMesas() {
    const { data } = await supabase.from('mesas').select('*').order('numero')
    setMesas(data || [])
  }

  async function guardarCambios() {
    setGuardando(true)
    for (const mesa of mesas) {
      await supabase.from('mesas').update({ disponible: mesa.disponible }).eq('id', mesa.id)
    }
    setGuardando(false)
    setModoEdicion(false)
    setMesaSeleccionada(null)
  }

  async function agregarMesa(zona) {
    const numerosZona = mesas.filter(m => m.zona === zona).map(m => m.numero)
    const siguiente = numerosZona.length > 0 ? Math.max(...numerosZona) + 1 : 1
    const { data } = await supabase.from('mesas').insert({ numero: siguiente, zona, disponible: true, capacidad: 4 }).select().single()
    if (data) setMesas(prev => [...prev, data])
  }

  async function eliminarMesa(id) {
    await supabase.from('mesas').delete().eq('id', id)
    setMesas(prev => prev.filter(m => m.id !== id))
    if (mesaSeleccionada?.id === id) setMesaSeleccionada(null)
  }

  function toggleDisponible(mesa) {
    if (!modoEdicion) return
    setMesas(prev => prev.map(m => m.id === mesa.id ? { ...m, disponible: !m.disponible } : m))
  }

  function colorMesa(mesa) {
    if (!mesa.disponible) return '#dc3545'
    return '#198754'
  }

  const bajas = mesas.filter(m => m.zona === 'planta_baja')
  const altas = mesas.filter(m => m.zona === 'planta_alta')
  const disponibles = mesas.filter(m => m.disponible).length
  const reservadas = mesas.filter(m => !m.disponible).length

  function MapaMesas({ lista, titulo, posiciones, zona }) {
    return (
      <div className="card-ideay p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-semibold mb-0" style={{ fontSize: 13 }}>{titulo}</h6>
          {modoEdicion && (
            <button className="btn btn-sm" style={{ backgroundColor: 'var(--rojo)', color: '#fff', borderRadius: 8, fontSize: 12 }}
              onClick={() => agregarMesa(zona)}>
              <i className="bi bi-plus-lg me-1"></i>Agregar mesa
            </button>
          )}
        </div>

        <div className="planta-container" style={{ height: 200 }}>
          {/* DJ / Escenario */}
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#f8d7da', borderRadius: 8, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="bi bi-music-note-beamed" style={{ color: 'var(--rojo)', fontSize: 12 }}></i>
            <span className="zona-label" style={{ color: 'var(--rojo)' }}>DJ Toña</span>
          </div>
          <span className="zona-label" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>PISTA</span>

          {/* Mesas */}
          {lista.map((mesa, i) => {
            const pos = posiciones[i] || { x: (i % 4) * 22 + 5, y: Math.floor(i / 4) * 30 + 20 }
            return (
              <button key={mesa.id}
                className="btn-mesa"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, backgroundColor: colorMesa(mesa), border: mesaSeleccionada?.id === mesa.id ? '2px solid #fff' : 'none', boxShadow: mesaSeleccionada?.id === mesa.id ? '0 0 0 3px var(--rojo)' : '0 2px 8px rgba(0,0,0,0.18)' }}
                onClick={() => { toggleDisponible(mesa); setMesaSeleccionada(mesa) }}
                title={`M${mesa.numero} — ${mesa.disponible ? 'Disponible' : 'Reservada'}`}>
                M{mesa.numero}
              </button>
            )
          })}

          {/* BAR label */}
          <span className="zona-label" style={{ position: 'absolute', bottom: 8, left: 8 }}>BAR</span>
          <span className="zona-label" style={{ position: 'absolute', bottom: 8, right: 8 }}>BAÑOS</span>
        </div>
      </div>
    )
  }

  return (
    <LayoutAdmin titulo="Gestión de Mesas">
      <div className="row g-3">
        {/* Panel mapa */}
        <div className="col-lg-8">
          {/* Controles */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex gap-3 align-items-center">
              {[
                { color: '#198754', label: 'Disponible' },
                { color: '#dc3545', label: 'Reservada' },
              ].map(({ color, label }) => (
                <span key={label} className="d-flex align-items-center gap-2" style={{ fontSize: 12 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }}></span>
                  {label}
                </span>
              ))}
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: 13 }}>Modo edición</span>
              <div className={`toggle ${modoEdicion ? 'on' : 'off'}`} onClick={() => { setModoEdicion(!modoEdicion); setMesaSeleccionada(null) }}>
                <div className="toggle-knob" />
              </div>
            </div>
          </div>

          <MapaMesas lista={bajas} titulo="Planta Baja" posiciones={POSICIONES_BAJA} zona="planta_baja" />
          <MapaMesas lista={altas} titulo="Planta Alta" posiciones={POSICIONES_ALTA} zona="planta_alta" />

          {modoEdicion && (
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-light flex-fill" style={{ borderRadius: 10 }} onClick={() => { setModoEdicion(false); setMesaSeleccionada(null); cargarMesas() }}>
                Cancelar
              </button>
              <button className="btn flex-fill fw-semibold" style={{ backgroundColor: 'var(--rojo)', color: '#fff', borderRadius: 10 }}
                disabled={guardando} onClick={guardarCambios}>
                {guardando ? <span className="spinner-border spinner-border-sm" /> : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>

        {/* Panel lateral — info */}
        <div className="col-lg-4">
          {/* Resumen */}
          <div className="card-ideay p-3 mb-3">
            <h6 className="fw-bold mb-3">Resumen</h6>
            <div className="d-flex flex-column gap-2">
              {[
                { label: 'Total mesas', valor: mesas.length, color: '#0d6efd' },
                { label: 'Disponibles', valor: disponibles, color: '#198754' },
                { label: 'Reservadas', valor: reservadas, color: '#dc3545' },
                { label: 'Planta Baja', valor: bajas.length, color: '#6c757d' },
                { label: 'Planta Alta', valor: altas.length, color: '#6c757d' },
              ].map(({ label, valor, color }) => (
                <div key={label} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                  <span className="text-muted" style={{ fontSize: 13 }}>{label}</span>
                  <span className="fw-semibold" style={{ color, fontSize: 14 }}>{valor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mesa seleccionada */}
          {mesaSeleccionada && modoEdicion && (
            <div className="card-ideay p-3">
              <h6 className="fw-bold mb-3">Mesa seleccionada</h6>
              <p className="mb-1"><span className="text-muted">Número:</span> <strong>M{mesaSeleccionada.numero}</strong></p>
              <p className="mb-1"><span className="text-muted">Zona:</span> {mesaSeleccionada.zona === 'planta_baja' ? 'Planta Baja' : 'Planta Alta'}</p>
              <p className="mb-3">
                <span className="text-muted">Estado: </span>
                <span className={`badge ${mesas.find(m => m.id === mesaSeleccionada.id)?.disponible ? 'badge-publicado' : 'badge-expirado'}`}>
                  {mesas.find(m => m.id === mesaSeleccionada.id)?.disponible ? 'Disponible' : 'Reservada'}
                </span>
              </p>
              <button className="btn btn-sm btn-outline-danger w-100" style={{ borderRadius: 8 }} onClick={() => eliminarMesa(mesaSeleccionada.id)}>
                <i className="bi bi-trash me-1"></i>Eliminar mesa
              </button>
            </div>
          )}

          {!modoEdicion && (
            <div className="card-ideay p-3 text-center">
              <i className="bi bi-pencil-square" style={{ fontSize: 32, color: '#dee2e6' }}></i>
              <p className="text-muted mt-2" style={{ fontSize: 13 }}>Activá el modo edición para modificar las mesas, cambiar su estado o agregar nuevas.</p>
            </div>
          )}
        </div>
      </div>
    </LayoutAdmin>
  )
}
