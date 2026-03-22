import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const BASE = '/api'
const req = (method, path, body) =>
  fetch(BASE + path, {
    method,
    headers: { 'Content-Type':'application/json', Authorization:'Bearer '+localStorage.getItem('edu_token') },
    ...(body ? { body: JSON.stringify(body) } : {})
  }).then(async r => {
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Error')
    return data
  })

const ESTADO = { 0:'Pendiente', 1:'Aprobado', 2:'Rechazado' }
const ESTADO_COLOR = {
  0: { bg:'#fffbeb', color:'#92400e', border:'#fcd34d' },
  1: { bg:'#d1fae5', color:'#065f46', border:'#6ee7b7' },
  2: { bg:'#fee2e2', color:'#991b1b', border:'#fca5a5' },
}

export default function Admin({ toast }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab,         setTab]         = useState('pendientes')
  const [pendientes,  setPendientes]  = useState([])
  const [profesores,  setProfesores]  = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    if (!user || user.rol !== 'director') {
      navigate('/aulas')
      return
    }
    cargar()
  }, [user])

  async function cargar() {
    setLoading(true)
    try {
      const [p, a] = await Promise.all([
        req('GET', '/admin/pendientes'),
        req('GET', '/admin/profesores'),
      ])
      setPendientes(p)
      setProfesores(a)
    } catch (err) { toast(err.message, 'error') }
    finally { setLoading(false) }
  }

  async function aprobar(id, nombre) {
    try {
      await req('PUT', `/admin/aprobar/${id}`)
      toast(`✅ ${nombre} aprobado/a`, 'success')
      cargar()
    } catch (err) { toast(err.message, 'error') }
  }

  async function rechazar(id, nombre) {
    if (!confirm(`¿Rechazar la cuenta de ${nombre}?`)) return
    try {
      await req('PUT', `/admin/rechazar/${id}`)
      toast(`Cuenta de ${nombre} rechazada`, 'info')
      cargar()
    } catch (err) { toast(err.message, 'error') }
  }

  async function eliminar(id, nombre) {
    if (!confirm(`¿Eliminar permanentemente la cuenta de ${nombre}? Esta acción no se puede deshacer.`)) return
    try {
      await req('DELETE', `/admin/profesores/${id}`)
      toast(`Cuenta eliminada`, 'info')
      cargar()
    } catch (err) { toast(err.message, 'error') }
  }

  const aprobados  = profesores.filter(p => p.aprobado === 1)
  const rechazados = profesores.filter(p => p.aprobado === 2)

  if (loading) return <p style={{ color:'var(--text3)' }}>Cargando panel...</p>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:6 }}>
          <div style={{ width:46, height:46, borderRadius:12, background:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>⚙️</div>
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px' }}>Panel de Administración</h1>
            <p style={{ color:'var(--text3)', fontSize:14 }}>Gestión de cuentas de profesores</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginTop:20 }}>
          {[
            { label:'Pendientes', value:pendientes.length, color:'#f59e0b', pale:'#fffbeb', icon:'⏳' },
            { label:'Aprobados',  value:aprobados.length,  color:'var(--primary)', pale:'var(--primary-pale)', icon:'✅' },
            { label:'Rechazados', value:rechazados.length, color:'var(--red)', pale:'var(--red-pale)', icon:'❌' },
          ].map(s => (
            <div key={s.label} className="card" style={{ display:'flex', alignItems:'center', gap:16, padding:20 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:s.pale, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:28, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:13, color:'var(--text3)', marginTop:3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--white)', borderRadius:10, padding:5, border:'1.5px solid var(--border)', width:'fit-content' }}>
        {[
          { key:'pendientes', label:`⏳ Pendientes${pendientes.length > 0 ? ` (${pendientes.length})` : ''}` },
          { key:'aprobados',  label:`✅ Aprobados (${aprobados.length})`  },
          { key:'rechazados', label:`❌ Rechazados (${rechazados.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:'8px 18px', borderRadius:7, border:'none', cursor:'pointer',
            fontFamily:'Outfit,sans-serif', fontSize:13, fontWeight:700,
            background: tab===t.key ? 'var(--black)' : 'transparent',
            color: tab===t.key ? '#fff' : 'var(--text3)',
            transition:'all .18s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Pendientes ── */}
      {tab === 'pendientes' && (
        <div>
          {pendientes.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:'48px 24px', color:'var(--text3)' }}>
              <div style={{ fontSize:48, opacity:.3, marginBottom:12 }}>✅</div>
              <p style={{ fontSize:16, fontWeight:600 }}>No hay cuentas pendientes</p>
              <p style={{ fontSize:14, marginTop:6 }}>Todos los profesores han sido revisados.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {pendientes.map(p => (
                <div key={p.id} className="card" style={{ display:'flex', alignItems:'center', gap:16, padding:20 }}>
                  {/* Avatar */}
                  <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg,var(--primary),var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, color:'#fff', flexShrink:0 }}>
                    {p.nombre[0]}{p.apellidos[0]}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:16 }}>{p.nombre} {p.apellidos}</div>
                    <div style={{ fontSize:13, color:'var(--text3)', marginTop:2 }}>
                      ✉️ {p.email} &nbsp;·&nbsp; 📚 {p.asignatura}
                    </div>
                    <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>
                      🕐 Solicitud: {new Date(p.created_at).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>

                  {/* Estado badge */}
                  <span style={{ padding:'5px 13px', borderRadius:20, fontSize:12, fontWeight:700, background:'#fffbeb', color:'#92400e', border:'1px solid #fcd34d', flexShrink:0 }}>
                    ⏳ Pendiente
                  </span>

                  {/* Acciones */}
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button className="btn btn-green btn-sm" onClick={() => aprobar(p.id, p.nombre + ' ' + p.apellidos)}>
                      ✅ Aprobar
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => rechazar(p.id, p.nombre + ' ' + p.apellidos)}>
                      ❌ Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Aprobados ── */}
      {tab === 'aprobados' && (
        <div>
          {aprobados.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:48, color:'var(--text3)' }}>
              <div style={{ fontSize:48, opacity:.3, marginBottom:12 }}>👥</div>
              <p>No hay profesores aprobados todavía.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {aprobados.map(p => (
                <div key={p.id} className="card" style={{ display:'flex', alignItems:'center', gap:14, padding:18 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:'var(--primary-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:'var(--primary)', flexShrink:0 }}>
                    {p.nombre[0]}{p.apellidos[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{p.nombre} {p.apellidos}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>✉️ {p.email} · 📚 {p.asignatura}</div>
                  </div>
                  <span style={{ padding:'4px 11px', borderRadius:20, fontSize:11, fontWeight:700, background:'var(--green-pale)', color:'var(--primary-dark)', border:'1px solid #6ee7b7' }}>
                    ✅ Activo
                  </span>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => rechazar(p.id, p.nombre)}>Suspender</button>
                    <button className="btn btn-outline btn-sm" onClick={() => eliminar(p.id, p.nombre)} style={{ color:'var(--red)', borderColor:'#fecaca' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Rechazados ── */}
      {tab === 'rechazados' && (
        <div>
          {rechazados.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:48, color:'var(--text3)' }}>
              <div style={{ fontSize:48, opacity:.3, marginBottom:12 }}>🚫</div>
              <p>No hay cuentas rechazadas.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {rechazados.map(p => (
                <div key={p.id} className="card" style={{ display:'flex', alignItems:'center', gap:14, padding:18, opacity:.8 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:'var(--red-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:'var(--red)', flexShrink:0 }}>
                    {p.nombre[0]}{p.apellidos[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{p.nombre} {p.apellidos}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>✉️ {p.email} · 📚 {p.asignatura}</div>
                  </div>
                  <span style={{ padding:'4px 11px', borderRadius:20, fontSize:11, fontWeight:700, background:'var(--red-pale)', color:'var(--red)', border:'1px solid #fecaca' }}>
                    ❌ Rechazado
                  </span>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-green btn-sm" onClick={() => aprobar(p.id, p.nombre)}>Aprobar</button>
                    <button className="btn btn-outline btn-sm" onClick={() => eliminar(p.id, p.nombre)} style={{ color:'var(--red)', borderColor:'#fecaca' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}