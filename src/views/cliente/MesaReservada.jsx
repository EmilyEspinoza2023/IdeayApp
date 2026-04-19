import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function MesaReservada() {
  const navigate = useNavigate()
  const location = useLocation()
  const { reserva, mesa, evento } = location.state || {}
  const [segundos, setSegundos] = useState(30 * 60)

  useEffect(() => {
    const timer = setInterval(() => setSegundos(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  const min = String(Math.floor(segundos / 60)).padStart(2, '0')
  const seg = String(segundos % 60).padStart(2, '0')

  return (
    <div className="d-flex flex-column align-items-center justify-content-center px-3 py-5"
      style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Icono éxito */}
      <div className="d-flex align-items-center justify-content-center rounded-circle mb-4"
        style={{ width: 72, height: 72, backgroundColor: '#dcfce7' }}>
        <i className="bi bi-check-lg" style={{ fontSize: 32, color: '#16a34a' }}></i>
      </div>

      <h4 className="fw-bold mb-1">¡Mesa Reservada!</h4>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>Tu reserva está confirmada</p>

      {/* Detalle reserva */}
      <div className="card-ideay p-4 w-100 mb-4" style={{ maxWidth: 420 }}>
        <p className="fw-semibold mb-3" style={{ fontSize: 11, color: 'var(--rojo)', textTransform: 'uppercase', letterSpacing: 1 }}>Reserva</p>
        <p className="fw-bold mb-3" style={{ fontSize: 16 }}>Mesa M{mesa?.numero} — {evento?.titulo}</p>

        <div className="d-flex flex-column gap-2 mb-4">
          <div className="d-flex align-items-center gap-2 text-muted">
            <i className="bi bi-calendar-event" style={{ color: 'var(--rojo)', fontSize: 14 }}></i>
            <small>
              {evento?.fecha
                ? new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long' })
                : ''
              } · {evento?.hora?.slice(0, 5)}
            </small>
          </div>
          <div className="d-flex align-items-center gap-2 text-muted">
            <i className="bi bi-people-fill" style={{ color: 'var(--rojo)', fontSize: 14 }}></i>
            <small>{mesa?.capacidad} personas</small>
          </div>
        </div>

        {/* Countdown */}
        <div className="d-flex align-items-center justify-content-center gap-2 rounded-3 py-3"
          style={{ backgroundColor: 'var(--rojo-claro)', color: 'var(--rojo)' }}>
          <i className="bi bi-clock-fill" style={{ fontSize: 18 }}></i>
          <span className="fw-bold" style={{ fontSize: 26, fontVariantNumeric: 'tabular-nums' }}>{min}:{seg}</span>
        </div>
        <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: 12 }}>
          Si no llegás a tiempo, la mesa será liberada.
        </p>
      </div>

      {/* Acciones */}
      <div className="d-flex flex-column gap-3 w-100" style={{ maxWidth: 420 }}>
        <button className="btn py-3 text-white fw-semibold"
          style={{ backgroundColor: 'var(--rojo)', borderRadius: 12 }}
          onClick={() => navigate('/reservas')}>
          Ver Mis Reservas
        </button>
        <button className="btn py-3 fw-semibold"
          style={{ border: '2px solid var(--rojo)', color: 'var(--rojo)', borderRadius: 12 }}
          onClick={() => navigate('/inicio')}>
          Volver al Inicio
        </button>
      </div>
    </div>
  )
}
