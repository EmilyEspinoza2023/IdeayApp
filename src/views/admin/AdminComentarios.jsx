import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import LayoutAdmin from '../../components/admin/LayoutAdmin'

export default function AdminComentarios() {
  const { perfil } = useAuth()
  const [comentarios, setComentarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [respondiendoId, setRespondiendoId] = useState(null)
  const [textoRespuesta, setTextoRespuesta] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargarComentarios() }, [])

  async function cargarComentarios() {
    const { data } = await supabase
      .from('comentarios')
      .select('*, perfiles(nombre, apellido, foto_url), eventos(titulo)')
      .is('parent_id', null)
      .order('creado_en', { ascending: false })
    setComentarios(data || [])
  }

  async function eliminar(id) {
    await supabase.from('comentarios').delete().eq('id', id)
    setComentarios(prev => prev.filter(c => c.id !== id))
  }

  async function guardarRespuesta(e, id) {
    e.preventDefault()
    if (!textoRespuesta.trim()) return
    setGuardando(true)
    await supabase.from('comentarios').update({ respuesta_admin: textoRespuesta.trim() }).eq('id', id)
    setComentarios(prev => prev.map(c => c.id === id ? { ...c, respuesta_admin: textoRespuesta.trim() } : c))
    setRespondiendoId(null)
    setTextoRespuesta('')
    setGuardando(false)
  }

  async function eliminarRespuesta(id) {
    await supabase.from('comentarios').update({ respuesta_admin: null }).eq('id', id)
    setComentarios(prev => prev.map(c => c.id === id ? { ...c, respuesta_admin: null } : c))
  }

  function iniciales(p) {
    if (!p) return 'US'
    return `${p.nombre?.[0] || ''}${p.apellido?.[0] || ''}`.toUpperCase()
  }

  function formatRelativo(fecha) {
    const m = Math.floor((Date.now() - new Date(fecha)) / 60000)
    if (m < 60) return `hace ${m} min`
    if (m < 1440) return `hace ${Math.floor(m / 60)}h`
    return `hace ${Math.floor(m / 1440)} días`
  }

  const filtrados = comentarios.filter(c => {
    const q = busqueda.toLowerCase()
    return (
      c.perfiles?.nombre?.toLowerCase().includes(q) ||
      c.eventos?.titulo?.toLowerCase().includes(q) ||
      c.contenido?.toLowerCase().includes(q)
    )
  })

  return (
    <LayoutAdmin titulo="Comentarios">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Buscar por cliente, evento o contenido..."
          style={{ maxWidth: 320, borderRadius: 10 }}
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <small className="text-muted">{filtrados.length} comentario{filtrados.length !== 1 ? 's' : ''}</small>
      </div>

      <div className="d-flex flex-column gap-3">
        {filtrados.map(c => (
          <div key={c.id} className="card-ideay p-3">
            {/* Cabecera */}
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div className="d-flex align-items-center gap-2 flex-1 min-w-0">
                {c.perfiles?.foto_url
                  ? <img src={c.perfiles.foto_url} alt={c.perfiles.nombre} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 38, height: 38, background: 'var(--rojo)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      {iniciales(c.perfiles)}
                    </div>
                }
                <div className="min-w-0">
                  <p className="fw-semibold mb-0" style={{ fontSize: 13 }}>{c.perfiles?.nombre} {c.perfiles?.apellido}</p>
                  <p className="text-muted mb-0 text-truncate" style={{ fontSize: 11 }}>
                    <i className="bi bi-calendar-event me-1"></i>{c.eventos?.titulo || '—'}
                    <span className="mx-1">·</span>{formatRelativo(c.creado_en)}
                  </p>
                </div>
              </div>
              <div className="d-flex gap-2 align-items-center flex-shrink-0">
                {c.calificacion && (
                  <span style={{ color: '#ffc107', fontSize: 13 }}>
                    {'★'.repeat(c.calificacion)}<span style={{ color: '#ced4da' }}>{'★'.repeat(5 - c.calificacion)}</span>
                  </span>
                )}
                <button className="btn btn-sm btn-light" style={{ borderRadius: 8, color: '#dc3545' }} onClick={() => eliminar(c.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>

            {/* Contenido del comentario */}
            {c.contenido && (
              <p className="mb-2 mt-2 text-muted" style={{ fontSize: 13 }}>{c.contenido}</p>
            )}

            {/* Respuesta existente del admin */}
            {c.respuesta_admin && respondiendoId !== c.id && (
              <div className="p-2 rounded-3 d-flex gap-2 align-items-start mt-2" style={{ backgroundColor: 'var(--rojo-claro)' }}>
                {perfil?.foto_url
                  ? <img src={perfil.foto_url} alt={perfil.nombre} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 24, height: 24, background: 'var(--rojo)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 9, flexShrink: 0 }}>LQ</div>
                }
                <div className="flex-1">
                  <p className="mb-0 fw-semibold" style={{ fontSize: 11, color: 'var(--rojo)' }}>Tu respuesta</p>
                  <p className="mb-0" style={{ fontSize: 12 }}>{c.respuesta_admin}</p>
                </div>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm p-0" style={{ color: '#6c757d', lineHeight: 1 }}
                    onClick={() => { setRespondiendoId(c.id); setTextoRespuesta(c.respuesta_admin) }}>
                    <i className="bi bi-pencil" style={{ fontSize: 12 }}></i>
                  </button>
                  <button className="btn btn-sm p-0" style={{ color: '#dc3545', lineHeight: 1 }}
                    onClick={() => eliminarRespuesta(c.id)}>
                    <i className="bi bi-x-lg" style={{ fontSize: 12 }}></i>
                  </button>
                </div>
              </div>
            )}

            {/* Formulario de respuesta */}
            {respondiendoId === c.id ? (
              <form onSubmit={e => guardarRespuesta(e, c.id)} className="mt-2">
                <textarea className="form-control mb-2" rows={2} placeholder="Escribí tu respuesta como La Quinta..."
                  style={{ resize: 'none', fontSize: 13, borderRadius: 10 }}
                  value={textoRespuesta} onChange={e => setTextoRespuesta(e.target.value)} autoFocus />
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-sm fw-semibold" style={{ backgroundColor: 'var(--rojo)', color: '#fff', borderRadius: 8, fontSize: 12 }} disabled={guardando}>
                    {guardando ? <span className="spinner-border spinner-border-sm" /> : 'Publicar respuesta'}
                  </button>
                  <button type="button" className="btn btn-sm btn-light" style={{ borderRadius: 8, fontSize: 12 }}
                    onClick={() => { setRespondiendoId(null); setTextoRespuesta('') }}>Cancelar</button>
                </div>
              </form>
            ) : (
              !c.respuesta_admin && (
                <button className="btn btn-sm mt-2" style={{ fontSize: 12, color: 'var(--rojo)', padding: '4px 0' }}
                  onClick={() => { setRespondiendoId(c.id); setTextoRespuesta('') }}>
                  <i className="bi bi-reply me-1"></i>Responder como La Quinta
                </button>
              )
            )}
          </div>
        ))}

        {filtrados.length === 0 && (
          <div className="text-center text-muted py-5">
            <i className="bi bi-chat-square-text" style={{ fontSize: 40, color: '#dee2e6', display: 'block', marginBottom: 8 }}></i>
            No hay comentarios
          </div>
        )}
      </div>
    </LayoutAdmin>
  )
}
