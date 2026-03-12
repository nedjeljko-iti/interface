export default function Placeholder({ naziv, onLogout, onBack }) {
  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div style={s.topbarInner}>
          <div style={s.left}>
            <button style={s.backBtn} onClick={onBack}>← Natrag</button>
            <span style={s.logo}>⬡</span>
            <span style={s.title}>{naziv}</span>
          </div>
          <button style={s.logoutBtn} onClick={onLogout}>Odjava</button>
        </div>
      </div>
      <div style={s.body}>
        <div style={s.card}>
          <div style={s.icon}>🚧</div>
          <p style={s.cardTitle}>Nije implementirano</p>
          <p style={s.hint}>Ovaj modul još nije dostupan u novom interfaceu.</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' },
  topbar:     { position: 'sticky', top: 0, zIndex: 100, background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' },
  topbarInner:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '56px' },
  left:       { display: 'flex', alignItems: 'center', gap: '12px' },
  backBtn:    { padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  logo:       { fontSize: '1.4rem', color: '#93c5fd' },
  title:      { color: '#fff', fontWeight: '700', fontSize: '1.1rem' },
  logoutBtn:  { padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  body:       { display: 'flex', justifyContent: 'center', padding: '80px 24px' },
  card:       { textAlign: 'center', color: '#94a3b8' },
  icon:       { fontSize: '3rem', marginBottom: '16px' },
  cardTitle:  { fontSize: '1.1rem', fontWeight: '600', color: '#64748b', margin: '0 0 8px' },
  hint:       { fontSize: '0.9rem', margin: 0 },
};
