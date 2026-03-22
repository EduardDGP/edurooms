import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Layout({ toast }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isDirector = user?.rol === 'director'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user ? user.nombre[0] + user.apellidos[0] : '?'
  const fotoSrc  = user?.foto ? user.foto : null

  const navLinks = [
    { to:'/aulas',   icon:'🏛️', label:'Aulas'   },
    { to:'/alumnos', icon:'👥', label:'Alumnos' },
    { to:'/social',  icon:'💬', label:'Social'  },
    { to:'/perfil',  icon:'👤', label:'Perfil'  },
  ]
  if (isDirector) navLinks.push({ to:'/admin', icon:'⚙️', label:'Admin' })

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav style={{
        height: 64,
        background: 'var(--black)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        gap: 8,
        flexShrink: 0,
        boxShadow: '0 2px 16px rgba(0,0,0,.3)',
        zIndex: 100,
      }}>
        {/* Logo */}
        <NavLink to="/aulas" style={{ textDecoration:'none', marginRight:16, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{
            width:34, height:34, borderRadius:9, background:'var(--primary)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:17, fontWeight:800, color:'#fff', flexShrink:0,
          }}>E</div>
          <span style={{ fontFamily:'Outfit,sans-serif', fontSize:20, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
            Edu<span style={{ color:'var(--accent)' }}>Rooms</span>
          </span>
        </NavLink>

        {/* Nav links */}
        <div style={{ display:'flex', gap:2, flex:1 }}>
          {navLinks.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:6,
              padding:'8px 16px', borderRadius:8, textDecoration:'none',
              fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:600,
              background: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
              transition:'all .18s',
            })}
            onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.color='#fff' }}}
            onMouseLeave={e => { if (!e.currentTarget.getAttribute('aria-current')) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,.6)' }}}
            >
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </div>

        {/* Badge director */}
        {isDirector && (
          <div style={{ padding:'4px 12px', borderRadius:20, background:'var(--primary)', color:'#fff', fontSize:11, fontWeight:800, letterSpacing:'.5px', marginRight:10 }}>
            DIRECTOR
          </div>
        )}

        {/* User chip */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <NavLink to="/perfil" style={{ display:'flex', alignItems:'center', gap:9,
            padding:'6px 14px 6px 8px', background:'rgba(255,255,255,.08)',
            borderRadius:50, border:'1px solid rgba(255,255,255,.15)', textDecoration:'none',
            transition:'all .18s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.15)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.08)'}
          >
            <div className="avatar avatar-sm">
              {fotoSrc ? <img src={fotoSrc} alt="" /> : initials}
            </div>
            <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,.9)' }}>{user?.nombre}</span>
          </NavLink>
          <button onClick={handleLogout} style={{
            background:'transparent', border:'1.5px solid rgba(255,255,255,.2)',
            color:'rgba(255,255,255,.7)', padding:'7px 14px', borderRadius:8,
            fontFamily:'Outfit,sans-serif', fontSize:13, fontWeight:600, cursor:'pointer',
            transition:'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.1)'; e.currentTarget.style.color='#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,.7)' }}
          >Salir</button>
        </div>
      </nav>

      {/* ── Contenido ───────────────────────────────────── */}
      <main style={{ flex:1, overflowY:'auto', padding:32, maxWidth:1200, width:'100%', margin:'0 auto', paddingLeft:32, paddingRight:32 }}>
        <Outlet />
      </main>
    </div>
  )
}