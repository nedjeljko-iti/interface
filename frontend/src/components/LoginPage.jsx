import { useState, useEffect } from 'react';
import { setToken } from '../auth';

const API = '';

export default function LoginPage({ onLogin }) {
  const [servers,  setServers]  = useState([]);
  const [serverId, setServerId] = useState('');
  const [login,    setLogin]    = useState('');
  const [lozinka,  setLozinka]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    fetch(`${API}/api/auth/servers`)
      .then(r => r.json())
      .then(data => {
        setServers(data);
        if (data.length > 0) setServerId(data[0].id);
      })
      .catch(() => setError('Ne mogu dohvatiti listu servera.'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ login: login.trim(), lozinka, serverId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Greška ${res.status}`);
        return;
      }
      setToken(data.token);
      onLogin();
    } catch (err) {
      setError(`Greška: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !loading && !!login && !!lozinka && !!serverId;

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div style={s.topbarInner}>
          <span style={s.topbarLogo}>⬡</span>
          <span style={s.topbarTitle}>Import temeljnica</span>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Prijava</h2>

          <form onSubmit={handleSubmit} style={s.form}>

            <div style={s.field}>
              <label style={s.label}>Server</label>
              <select
                style={s.select}
                value={serverId}
                onChange={e => setServerId(e.target.value)}
                disabled={loading || servers.length === 0}
              >
                {servers.length === 0 && (
                  <option value="">Učitavam…</option>
                )}
                {servers.map(srv => (
                  <option key={srv.id} value={srv.id}>{srv.naziv}</option>
                ))}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Korisničko ime</label>
              <input
                style={s.input}
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value)}
                autoFocus
                autoComplete="username"
                maxLength={10}
                disabled={loading}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Lozinka</label>
              <input
                style={s.input}
                type="password"
                value={lozinka}
                onChange={e => setLozinka(e.target.value)}
                autoComplete="current-password"
                maxLength={8}
                disabled={loading}
              />
            </div>

            {error && (
              <div style={s.errorBox}>{error}</div>
            )}

            <button type="submit" disabled={!canSubmit} style={{
              ...s.submitBtn,
              ...(!canSubmit ? s.submitBtnDisabled : s.submitBtnActive),
            }}>
              {loading ? 'Prijava…' : 'Prijava'}
            </button>
          </form>
        </div>
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
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
  topbarInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 28px',
    height: '56px',
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
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '60px 24px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    padding: '36px 40px',
    width: '100%',
    maxWidth: '380px',
  },
  cardTitle: {
    margin: '0 0 28px',
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
  },
  input: {
    padding: '9px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.95rem',
    color: '#1e293b',
    outline: 'none',
  },
  select: {
    padding: '9px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.95rem',
    color: '#1e293b',
    background: '#fff',
    outline: 'none',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderLeft: '4px solid #ef4444',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#7f1d1d',
    fontSize: '0.88rem',
  },
  submitBtn: {
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
  submitBtnActive: {
    background: '#2563eb',
    color: '#fff',
    boxShadow: '0 2px 6px rgba(37,99,235,0.35)',
  },
  submitBtnDisabled: {
    background: '#e2e8f0',
    color: '#94a3b8',
    cursor: 'not-allowed',
  },
};
