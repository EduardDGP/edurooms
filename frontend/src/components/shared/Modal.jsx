export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position:'fixed', inset:0, background:'rgba(15,23,42,.5)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:1000, backdropFilter:'blur(4px)',
      }}
    >
      <div style={{
        background:'#fff', borderRadius:20, padding:32,
        width:480, maxWidth:'94vw',
        boxShadow:'0 8px 32px rgba(0,0,0,.15)',
        animation:'modalIn .2s ease',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:'var(--text)' }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text3)', lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  )
}
