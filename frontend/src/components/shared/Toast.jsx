export default function Toast({ toasts }) {
  const icons = { success:'✅', error:'❌', info:'ℹ️' }
  const colors = {
    success: '#064e3b',
    error:   '#7f1d1d',
    info:    '#1e3a5f',
  }

  return (
    <div style={{ position:'fixed', bottom:24, right:24, display:'flex', flexDirection:'column', gap:10, zIndex:9999 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display:'flex', alignItems:'center', gap:10,
          background: colors[t.type] || colors.info,
          color:'#fff', padding:'12px 18px', borderRadius:10,
          fontSize:14, fontWeight:500, maxWidth:320,
          boxShadow:'0 8px 32px rgba(0,0,0,.2)',
          animation:'slideIn .3s ease',
        }}>
          <span>{icons[t.type] || '💬'}</span>
          <span>{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  )
}
