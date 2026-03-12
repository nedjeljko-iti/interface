import { useState, useRef } from 'react';
import { getToken, removeToken, getUser } from '../../auth';
import Upute from './Upute';

const API = '/api/univerzalni-import';

function InfoTable({ info }) {
  const lines = info.split(/\r?\n|\r/).map(l => l.trim()).filter(Boolean);
  const parsed = lines.map(line => {
    const m = line.match(/^(.+?)\s*\(\s*Duguje:([\d.,]+)\s*Potražuje:([\d.,]+)\s*\)$/);
    if (!m) return { raw: line };
    return { id: m[1].trim(), duguje: parseFloat(m[2]), potrazuje: parseFloat(m[3]) };
  });
  const fmt = n => n.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <table style={{ marginTop: '12px', borderCollapse: 'collapse', fontSize: '0.88rem', width: '100%', borderRadius: '6px', overflow: 'hidden' }}>
      <thead>
        <tr style={{ background: 'rgba(255,255,255,0.15)' }}>
          <th style={infoTh}>Temeljnica</th>
          <th style={{ ...infoTh, textAlign: 'right' }}>Duguje</th>
          <th style={{ ...infoTh, textAlign: 'right' }}>Potražuje</th>
          <th style={{ ...infoTh, textAlign: 'right' }}>Razlika</th>
        </tr>
      </thead>
      <tbody>
        {parsed.map((r, i) =>
          r.id ? (
            <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
              <td style={infoTd}>{r.id}</td>
              <td style={{ ...infoTd, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(r.duguje)}</td>
              <td style={{ ...infoTd, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(r.potrazuje)}</td>
              <td style={{
                ...infoTd, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                fontWeight: '600',
                color: Math.abs(r.duguje - r.potrazuje) < 0.01 ? 'rgba(255,255,255,0.7)' : '#fca5a5',
              }}>
                {fmt(r.duguje - r.potrazuje)}
              </td>
            </tr>
          ) : (
            <tr key={i}><td colSpan={4} style={infoTd}>{r.raw}</td></tr>
          )
        )}
      </tbody>
    </table>
  );
}

const infoTh = { padding: '6px 12px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.2)' };
const infoTd = { padding: '5px 12px', whiteSpace: 'nowrap' };

const COLUMNS = [
  { key: 'datk',    label: 'Dat. knjiženja' },
  { key: 'pod',     label: 'Pod' },
  { key: 'god',     label: 'God' },
  { key: 'org',     label: 'Org' },
  { key: 'dok',     label: 'Dok' },
  { key: 'br',      label: 'Br' },
  { key: 'opis',    label: 'Opis' },
  { key: 'konto',   label: 'Konto' },
  { key: 'ana',     label: 'Partner' },
  { key: 'mjtk',    label: 'Mj. troška' },
  { key: 'iznosd',  label: 'Duguje' },
  { key: 'iznosp',  label: 'Potražuje' },
  { key: 'val',     label: 'Val' },
  { key: 'iznval',  label: 'Iznos val.' },
  { key: 'datdok',  label: 'Dat. dok.' },
  { key: 'datdosp', label: 'Dat. dosp.' },
];

const NUMERIC_KEYS = new Set(['pod','god','org','dok','br','ana','mjtk','val','iznosd','iznosp','iznval']);
const STATUS = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };

export default function UniverzalniImport({ onLogout, onBack }) {
  const user = getUser();
  const [showUpute,    setShowUpute]    = useState(false);
  const [file,         setFile]         = useState(null);
  const [rows,         setRows]         = useState(null);
  const [previewErr,   setPreviewErr]   = useState(null);
  const [previewing,   setPreviewing]   = useState(false);
  const [importStatus, setImportStatus] = useState(STATUS.IDLE);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef(null);

  async function handleFileChange(e) {
    const f = e.target.files[0] ?? null;
    setFile(f);
    setRows(null);
    setPreviewErr(null);
    setImportStatus(STATUS.IDLE);
    setImportResult(null);
    if (!f) return;
    setPreviewing(true);
    const fd = new FormData();
    fd.append('file', f);
    try {
      const res  = await fetch(`${API}/preview`, { method: 'POST', body: fd, headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await res.json();
      if (!res.ok) setPreviewErr(data.error ?? `HTTP ${res.status}`);
      else setRows(data.rows);
    } catch (err) {
      setPreviewErr(`Greška: ${err.message}`);
    } finally {
      setPreviewing(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setImportStatus(STATUS.LOADING);
    setImportResult(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res  = await fetch(`${API}/import`, { method: 'POST', body: fd, headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await res.json();
      if (!res.ok) {
        setImportStatus(STATUS.ERROR);
        setImportResult({ error: data.error ?? `HTTP ${res.status}` });
        return;
      }
      setImportStatus(data.success ? STATUS.SUCCESS : STATUS.ERROR);
      setImportResult(data);
    } catch (err) {
      setImportStatus(STATUS.ERROR);
      setImportResult({ error: `Greška: ${err.message}` });
    }
  }

  const fmt = n => n.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totals = rows ? {
    iznosd: rows.reduce((s, r) => s + (parseFloat(r.iznosd) || 0), 0),
    iznosp: rows.reduce((s, r) => s + (parseFloat(r.iznosp) || 0), 0),
    iznval: rows.reduce((s, r) => s + (parseFloat(r.iznval) || 0), 0),
  } : null;

  const canImport = rows && rows.length > 0
    && importStatus !== STATUS.LOADING
    && importStatus !== STATUS.SUCCESS;

  return (
    <div style={s.page}>
      {showUpute && <Upute onClose={() => setShowUpute(false)} />}
      <div style={s.topbar}>
        <div style={s.topbarInner}>
          <div style={s.topbarLeft}>
            <button style={s.backBtn} onClick={onBack}>← Natrag</button>
            <span style={s.topbarLogo}>⬡</span>
            <span style={s.topbarTitle}>Univerzalni import temeljnica</span>
          </div>
          <div style={s.topbarRight}>
            <button style={s.upujeBtn} onClick={() => setShowUpute(true)}>? Upute</button>
            {previewing && <span style={s.topbarHint}>Učitavam…</span>}
            {file && !previewing && (
              <span style={s.topbarFile}>📄 {file.name}</span>
            )}
            <label style={s.pickBtn}>
              Odaberi datoteku
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls"
                onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {user && (
              <span style={s.topbarUser}>{user.ime} {user.prezime}</span>
            )}
            <button style={s.logoutBtn} onClick={() => { removeToken(); onLogout(); }}>
              Odjava
            </button>
          </div>
        </div>
      </div>

      <div style={s.content}>

        {!rows && !previewErr && !previewing && (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>📂</div>
            <p style={s.emptyTitle}>Odaberite datoteku za import</p>
            <p style={s.emptyHint}>Podržani formati: Excel (.xlsx) i CSV (.csv)</p>
          </div>
        )}

        {previewErr && (
          <div style={s.alertError}>
            <strong>Greška pri učitavanju:</strong> {previewErr}
          </div>
        )}

        {rows && (
          <div style={s.gridSection}>
            <div style={s.gridHeader}>
              <span style={s.gridCount}>{rows.length} redova</span>
              {importStatus !== STATUS.SUCCESS && (
                <button onClick={handleImport} disabled={!canImport}
                  style={{ ...s.importBtn, ...(canImport ? s.importBtnActive : s.importBtnDisabled) }}>
                  {importStatus === STATUS.LOADING ? '⏳ Importira se…' : `↑ Importiraj ${rows.length} redova`}
                </button>
              )}
            </div>

            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, ...s.thSeq }}>#</th>
                    {COLUMNS.map(c => (
                      <th key={c.key} style={{ ...s.th, ...(NUMERIC_KEYS.has(c.key) ? s.thR : {}) }}>
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                      <td style={{ ...s.td, ...s.tdSeq }}>{i + 1}</td>
                      {COLUMNS.map(c => (
                        <td key={c.key} style={{ ...s.td, ...(NUMERIC_KEYS.has(c.key) ? s.tdR : {}) }}>
                          {row[c.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={s.tfoot} />
                    {COLUMNS.map(c => {
                      const isSum = c.key === 'iznosd' || c.key === 'iznosp' || c.key === 'iznval';
                      return (
                        <td key={c.key} style={{ ...s.tfoot, ...(isSum ? s.tfootSum : {}) }}>
                          {isSum ? fmt(totals[c.key]) : ''}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {importResult && (
          <div style={{ ...s.resultBox, ...(importStatus === STATUS.SUCCESS ? s.resultOk : s.resultFail) }}>
            {importResult.error ? (
              <p style={s.resultTitle}>✗ {importResult.error}</p>
            ) : (
              <>
                <p style={s.resultTitle}>
                  {importStatus === STATUS.SUCCESS ? '✓ ' : '✗ '}
                  {importResult.message}
                </p>
                {importResult.info && <InfoTable info={importResult.info} />}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' },
  backBtn:    { padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' },
  topbar:     { position: 'sticky', top: 0, zIndex: 100, background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' },
  topbarInner:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '56px', gap: '16px' },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  topbarLogo: { fontSize: '1.4rem', color: '#93c5fd' },
  topbarTitle:{ color: '#fff', fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.01em' },
  topbarRight:{ display: 'flex', alignItems: 'center', gap: '12px' },
  topbarHint: { color: '#93c5fd', fontSize: '0.88rem', fontStyle: 'italic' },
  topbarFile: { color: '#bfdbfe', fontSize: '0.88rem', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  pickBtn:    { padding: '7px 18px', background: '#fff', color: '#1e3a5f', borderRadius: '6px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', whiteSpace: 'nowrap', userSelect: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' },
  topbarUser: { color: '#bfdbfe', fontSize: '0.88rem', whiteSpace: 'nowrap' },
  upujeBtn:   { padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' },
  logoutBtn:  { padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' },
  content:    { padding: '24px 28px' },
  emptyState: { textAlign: 'center', padding: '80px 24px', color: '#94a3b8' },
  emptyIcon:  { fontSize: '3.5rem', marginBottom: '16px' },
  emptyTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#64748b', margin: '0 0 8px' },
  emptyHint:  { fontSize: '0.9rem', margin: 0 },
  alertError: { background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '14px 18px', color: '#7f1d1d', fontSize: '0.92rem' },
  gridSection:{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
  gridHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' },
  gridCount:  { fontSize: '0.88rem', color: '#64748b', fontWeight: '500' },
  importBtn:  { padding: '8px 22px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  importBtnActive:   { background: '#16a34a', color: '#fff', boxShadow: '0 2px 4px rgba(22,163,74,0.3)' },
  importBtnDisabled: { background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' },
  tableWrap:  { overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' },
  table:      { borderCollapse: 'collapse', width: '100%', fontSize: '0.82rem', whiteSpace: 'nowrap' },
  th:         { position: 'sticky', top: 0, background: '#334155', color: '#e2e8f0', padding: '8px 12px', textAlign: 'left', fontWeight: '600', borderRight: '1px solid #475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 1 },
  thR:        { textAlign: 'right' },
  thSeq:      { textAlign: 'right', minWidth: '40px', color: '#94a3b8' },
  td:         { padding: '5px 12px', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', color: '#1e293b' },
  tdR:        { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  tdSeq:      { textAlign: 'right', color: '#cbd5e1', fontSize: '0.75rem' },
  trEven:     { background: '#fff' },
  trOdd:      { background: '#f8fafc' },
  tfoot:      { padding: '6px 12px', background: '#1e293b', color: '#94a3b8', borderRight: '1px solid #334155', fontSize: '0.82rem', whiteSpace: 'nowrap', position: 'sticky', bottom: 0 },
  tfootSum:   { textAlign: 'right', fontWeight: '700', color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' },
  resultBox:  { marginTop: '20px', padding: '16px 20px', borderRadius: '10px', fontSize: '0.92rem' },
  resultOk:   { background: 'linear-gradient(135deg, #14532d, #166534)', color: '#dcfce7', boxShadow: '0 2px 8px rgba(22,101,52,0.3)' },
  resultFail: { background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', color: '#fee2e2', boxShadow: '0 2px 8px rgba(153,27,27,0.3)' },
  resultTitle:{ fontWeight: '700', fontSize: '1rem', margin: '0 0 4px' },
};
