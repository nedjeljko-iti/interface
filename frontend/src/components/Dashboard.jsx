import { getUser } from '../auth';
import { MODULI_REGISTRY } from '../modules/registry';

export default function Dashboard({ onSelectModule, onLogout }) {
  const user    = getUser();
  const moduli  = user?.moduli ?? [];

  const enabledModuli = moduli
    .map(id => ({ id, ...MODULI_REGISTRY[id] }))
    .filter(m => m.naziv); // preskači nepoznate ID-eve

  return (
    <div style={s.page}>

      {/* ── Top bar ── */}
      <div style={s.topbar}>
        <div style={s.topbarInner}>
          <div style={s.topbarLeft}>
            <span style={s.topbarLogo}>⬡</span>
            <span style={s.topbarTitle}>Interface</span>
          </div>
          <div style={s.topbarRight}>
            {user && (
              <span style={s.topbarUser}>{user.ime} {user.prezime}</span>
            )}
            <button style={s.logoutBtn} onClick={onLogout}>Odjava</button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={s.content}>

        {enabledModuli.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🔒</div>
            <p style={s.emptyTitle}>Nema dostupnih modula</p>
            <p style={s.emptyHint}>
              Korisnik nema dodijeljene module (PARAM_INTERFACE).
            </p>
          </div>
        ) : (
          <div style={s.grid}>
            {enabledModuli.map(m => (
              <button key={m.id} style={s.tile} onClick={() => onSelectModule(m.id)}>
                <span style={s.tileLabel}>{m.naziv}</span>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    fontFamily: 'system-ui, sans-serif',
  },

  topbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
  topbarInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    height: '56px',
    gap: '16px',
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  topbarLogo: {
    fontSize: '1.4rem',
    color: '#93c5fd',
  },
  topbarTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: '1.1rem',
    letterSpacing: '0.01em',
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  topbarUser: {
    color: '#bfdbfe',
    fontSize: '0.88rem',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    padding: '6px 14px',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },

  content: {
    padding: '40px 28px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    maxWidth: '900px',
  },
  tile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '28px 20px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    transition: 'box-shadow 0.15s, border-color 0.15s',
  },
  tileLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.4',
  },

  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#64748b',
    margin: '0 0 8px',
  },
  emptyHint: {
    fontSize: '0.9rem',
    margin: 0,
  },
};
