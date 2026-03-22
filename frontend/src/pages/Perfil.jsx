import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getPerfil, subirFoto } from '../api/client'

export default function Perfil({ toast }) {
  const { user, refreshUser } = useAuth()
  const [perfil,   setPerfil]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try { setPerfil(await getPerfil()) }
    catch (err) { toast(err.message, 'error') }
    finally { setLoading(false) }
  }

  async function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setSubiendo(true)
    try {
      await subirFoto(file)
      await refreshUser()
      await cargar()
      toast('Foto actualizada 📷', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSubiendo(false)
    }
  }

  if (loading || !perfil) return <p style={{ color:'var(--text3)' }}>Cargando perfil...</p>

  const initials = perfil.nombre[0] + perfil.apellidos[0]
  const fecha    = new Date(perfil.created_at).toLocaleDateString('es-ES', { day:'2-digit',month:'long',year:'numeric' })

  return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      <h1 style={{ fontSize:26,fontWeight:800,letterSpacing:'-0.5px',marginBottom:24 }}>Mi Perfil</h1>

      <div className="card">
        {/* Foto + nombre */}
        <div style={{ display:'flex',alignItems:'center',gap:28,marginBottom:32 }}>
          <div
            className="avatar avatar-lg"
            style={{ cursor:'pointer', position:'relative' }}
            onClick={() => fileRef.current?.click()}
            title="Cambiar foto"
          >
            {perfil.foto
              ? <img src={perfil.foto} alt="foto" />
              : <span style={{ fontSize:36,fontWeight:800 }}>{initials}</span>
            }
            {/* Overlay */}
            <div style={{
              position:'absolute',inset:0,background:'rgba(0,0,0,.45)',borderRadius:'50%',
              display:'flex',alignItems:'center',justifyContent:'center',
              opacity:0,transition:'opacity .2s',fontSize:20,
            }}
              onMouseEnter={e => e.currentTarget.style.opacity=1}
              onMouseLeave={e => e.currentTarget.style.opacity=0}
            >📷</div>
          </div>

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={handleFoto} />

          <div>
            <div style={{ fontSize:26,fontWeight:800,letterSpacing:'-0.5px' }}>{perfil.nombre} {perfil.apellidos}</div>
            <div style={{
              display:'inline-flex',alignItems:'center',gap:5,
              background:'var(--primary-pale)',color:'var(--primary)',
              padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:700,marginTop:6,
            }}>👨‍🏫 Profesor/a</div>
            <div style={{ marginTop:10,fontSize:13,color:'var(--text3)' }}>
              {subiendo ? '⏳ Subiendo foto...' : 'Haz clic en la foto para cambiarla'}
            </div>
          </div>
        </div>

        {/* Línea separadora */}
        <div style={{ fontWeight:700,fontSize:15,marginBottom:18,paddingBottom:12,borderBottom:'1px solid var(--border)' }}>
          Información de la cuenta
        </div>

        {/* Campos */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18 }}>
          {[
            { label:'Nombre',     value: perfil.nombre },
            { label:'Apellidos',  value: perfil.apellidos },
            { label:'Correo electrónico', value: perfil.email },
            { label:'Asignatura', value: perfil.asignatura },
            { label:'Cuenta creada',      value: fecha },
            { label:'Reservas realizadas',value: perfil.total_reservas + ' reserva' + (perfil.total_reservas!==1?'s':'') },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.8px',color:'var(--text3)',marginBottom:6,display:'block' }}>
                {f.label}
              </label>
              <div style={{
                fontSize:15,fontWeight:500,color:'var(--text)',
                padding:'10px 12px',background:'var(--surface)',
                border:'1.5px solid var(--border)',borderRadius:8,
              }}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
