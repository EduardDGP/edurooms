import { useState, useEffect } from 'react'
import { getHistorialReservas } from '../../api/client'

const EMOJIS = { Informática:'💻','Laboratorio de Física':'⚗️','Laboratorio de Biología':'🧬','Laboratorio de Química':'🧪','Taller de Tecnología':'🔧','Sala de Robótica':'🤖' }

export default function HistorialReservas({ toast }) {
  const [reservas,  setReservas]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filtroAula,setFiltroAula]= useState('')
  const [open,      setOpen]      = useState(false)

  useEffect(() => { if (open) cargar() }, [open])

  async function cargar() {
    setLoading(true)
    try { setReservas(await getHistorialReservas()) }
    catch (err) { toast(err.message, 'error') }
    finally { setLoading(false) }
  }

  // Agrupar por fecha
  const filtradas = filtroAula
    ? reservas.filter(r => r.aula_nombre.toLowerCase().includes(filtroAula.toLowerCase()))
    : reservas

  const porFecha = filtradas.reduce((acc, r) => {
    if (!acc[r.fecha]) acc[r.fecha] = []
    acc[r.fecha].push(r)
    return acc
  }, {})

  const fechas = Object.keys(porFecha).sort((a, b) => b.localeCompare(a))

  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '13px 20px',
          background: open ? 'var(--primary-pale)' : 'var(--surface)',
          border: '1.5px solid', borderColor: open ? 'var(--primary-l)' : 'var(--border)',
          borderRadius: 10, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700,
          color: open ? 'var(--primary)' : 'var(--text)',
          transition: 'all .2s',
        }}
      >
        <span>📋 Historial de reservas anteriores</span>
        <span style={{ fontSize: 18, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>⌄</span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          {/* Filtro */}
          <input
            type="text"
            placeholder="Filtrar por aula..."
            value={filtroAula}
            onChange={e => setFiltroAula(e.target.value)}
            style={{ marginBottom: 16, padding: '9px 14px', borderRadius: 8, border: '1.5px solid var(--border)', width: '100%', fontFamily: 'Outfit, sans-serif', fontSize: 14 }}
          />

          {loading ? (
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>Cargando historial...</p>
          ) : fechas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>
              <div style={{ fontSize: 36, opacity: .4, marginBottom: 10 }}>📋</div>
              <p>No hay reservas anteriores registradas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {fechas.map(fecha => {
                const label = new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })
                return (
                  <div key={fecha}>
                    {/* Fecha cabecera */}
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: 'var(--text3)',
                      textTransform: 'uppercase', letterSpacing: '.8px',
                      marginBottom: 8, paddingBottom: 6,
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {label}
                    </div>

                    {/* Reservas de ese día */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {porFecha[fecha].sort((a, b) => a.franja_orden - b.franja_orden).map(r => (
                        <div key={r.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 8,
                          background: 'var(--white)', border: '1px solid var(--border)',
                          fontSize: 13,
                        }}>
                          <span style={{ fontSize: 18, flexShrink: 0 }}>{EMOJIS[r.aula_tipo] || '🏫'}</span>
                          <span style={{ fontWeight: 700, width: 130, flexShrink: 0, color: 'var(--text)' }}>{r.aula_nombre}</span>
                          <span style={{
                            background: 'var(--primary-pale)', color: 'var(--primary)',
                            padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            flexShrink: 0,
                          }}>{r.franja_label}</span>
                          <span style={{ fontFamily: 'Fira Code, monospace', color: 'var(--text3)', fontSize: 11, flexShrink: 0 }}>
                            {r.hora_inicio}–{r.hora_fin}
                          </span>
                          <span style={{ flex: 1, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.asignatura}
                          </span>
                          <span style={{ color: 'var(--text3)', fontSize: 12, flexShrink: 0 }}>
                            {r.prof_nombre} {r.prof_apellidos}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}