import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import LayoutAdmin from '../../components/admin/LayoutAdmin'

export default function AdminStats() {
  const [periodo, setPeriodo] = useState('Semanal')
  const [stats, setStats] = useState({ ingresos: 0, usuarios: 0, crecimiento: 0 })
  const periodos = ['Semanal', 'Mensual', 'Anual']

  useEffect(() => { cargarStats() }, [periodo])

  async function cargarStats() {
    const [{ count: usuarios }, { data: entradas }] = await Promise.all([
      supabase.from('perfiles').select('*', { count: 'exact', head: true }).eq('rol', 'cliente'),
      supabase.from('entradas').select('total').eq('estado', 'pagado'),
    ])
    const ingresos = entradas?.reduce((sum, e) => sum + Number(e.total), 0) || 0
    setStats({ ingresos, usuarios: usuarios || 0, crecimiento: 28 })
  }

  const barras = [
    { label: 'Halloween', altura: 85, ingresos: 35000 },
    { label: 'Cowboy', altura: 65, ingresos: 27000 },
    { label: 'Karaoke', altura: 50, ingresos: 18000 },
    { label: 'Noche 80s', altura: 35, ingresos: 12000 },
    { label: 'Reggaeton', altura: 55, ingresos: 22000 },
  ]

  const linea = [20, 35, 25, 45, 40, 60, 55, 70, 65, 80, 75, 90]

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  return (
    <LayoutAdmin titulo="Estadísticas">
      {/* Selector de periodo */}
      <div className="d-flex gap-1 bg-white rounded-3 p-1 mb-4 d-inline-flex" style={{ border: '1px solid #e9ecef' }}>
        {periodos.map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            className="btn btn-sm"
            style={{ borderRadius: 8, backgroundColor: periodo === p ? 'var(--rojo)' : 'transparent', color: periodo === p ? '#fff' : '#6c757d', padding: '6px 20px' }}>
            {p}
          </button>
        ))}
      </div>

      <div className="row g-4">
        {/* KPIs */}
        <div className="col-12">
          <div className="row g-3">
            {[
              { label: 'Ingresos Totales', valor: `C$${(stats.ingresos / 1000).toFixed(1)}K`, icon: 'bi-currency-dollar', color: '#e8f5e9', ic: '#198754' },
              { label: 'Usuarios Registrados', valor: stats.usuarios, icon: 'bi-people', color: '#e3f2fd', ic: '#0d6efd' },
              { label: 'Crecimiento', valor: `+${stats.crecimiento}`, icon: 'bi-graph-up-arrow', color: '#e8f5e9', ic: '#198754' },
              { label: 'Ocupación Promedio', valor: '75%', icon: 'bi-bar-chart', color: '#fff3cd', ic: '#856404' },
            ].map(({ label, valor, icon, color, ic }) => (
              <div key={label} className="col-md-3 col-6">
                <div className="card-ideay p-3">
                  <div style={{ width: 36, height: 36, backgroundColor: color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <i className={`bi ${icon}`} style={{ color: ic, fontSize: 18 }}></i>
                  </div>
                  <h4 className="fw-bold mb-0">{valor}</h4>
                  <small className="text-muted">{label}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de barras — ingresos por evento */}
        <div className="col-lg-7">
          <div className="card-ideay p-4">
            <h6 className="fw-bold mb-4">Ingresos por Evento</h6>
            <div className="d-flex align-items-end gap-3" style={{ height: 160 }}>
              {barras.map(({ label, altura, ingresos }) => (
                <div key={label} className="flex-fill d-flex flex-column align-items-center gap-1">
                  <small className="text-muted" style={{ fontSize: 9 }}>C${(ingresos / 1000).toFixed(0)}K</small>
                  <div className="w-100 rounded-top" style={{ height: `${altura}%`, backgroundColor: altura === 85 ? 'var(--rojo)' : '#f8d7da', transition: 'height .3s' }} />
                  <small style={{ fontSize: 9, color: '#999', textAlign: 'center', lineHeight: 1.2 }}>{label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ocupación donut + Usuarios */}
        <div className="col-lg-5">
          <div className="row g-3 h-100">
            <div className="col-12">
              <div className="card-ideay p-4 text-center">
                <h6 className="fw-bold mb-3">Ocupación Promedio</h6>
                <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 12px' }}>
                  <svg viewBox="0 0 36 36" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f8d7da" strokeWidth="4" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="var(--rojo)" strokeWidth="4"
                      strokeDasharray={`${75 * 0.879} 87.9`} strokeLinecap="round" />
                  </svg>
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontWeight: 700, fontSize: 18 }}>75%</span>
                </div>
                <small className="text-muted">Promedio de ocupación por evento</small>
              </div>
            </div>
            <div className="col-12">
              <div className="card-ideay p-4">
                <h6 className="fw-bold mb-2">Nuevos usuarios</h6>
                <h3 className="fw-bold mb-0">{stats.usuarios}</h3>
                <p className="text-muted small mb-2">Registrados en total</p>
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-arrow-up-right" style={{ color: '#198754' }}></i>
                  <small style={{ color: '#198754' }}>+{stats.crecimiento} esta semana</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tendencia de ventas */}
        <div className="col-12">
          <div className="card-ideay p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0">Tendencia de Ventas</h6>
              <span className="badge" style={{ backgroundColor: 'var(--rojo-claro)', color: 'var(--rojo)' }}>
                C${(stats.ingresos / 1000).toFixed(1)}K total
              </span>
            </div>
            <div style={{ position: 'relative', height: 100 }}>
              <svg viewBox="0 0 300 80" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                <polyline
                  points={linea.map((y, i) => `${(i / (linea.length - 1)) * 300},${80 - (y / 100) * 70}`).join(' ')}
                  fill="none" stroke="var(--rojo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline
                  points={[...linea.map((y, i) => `${(i / (linea.length - 1)) * 300},${80 - (y / 100) * 70}`), '300,80', '0,80'].join(' ')}
                  fill="rgba(139,26,26,0.08)" stroke="none" />
              </svg>
            </div>
            <div className="d-flex justify-content-between mt-1">
              {meses.map(m => <small key={m} style={{ fontSize: 9, color: '#aaa' }}>{m}</small>)}
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  )
}
