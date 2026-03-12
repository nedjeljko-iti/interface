export default function Upute({ onClose }) {
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        <div style={s.header}>
          <span style={s.headerTitle}>Upute za import temeljnice</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={s.body}>

          <section style={s.section}>
            <h3 style={s.h3}>Što radi ovaj modul?</h3>
            <p style={s.p}>
              Učitava financijske stavke (temeljnicu) iz Excel datoteke i importira ih
              u Oracle bazu podataka pozivom procedure{' '}
              <code style={s.code}>ITIFIN.FININTERFACE.UNIVERZALNI_IMPORT_TEMELJNICA</code>.
            </p>
          </section>

          <section style={s.section}>
            <h3 style={s.h3}>Format Excel datoteke</h3>
            <p style={s.p}>
              Datoteka mora imati <strong>header u prvom retku</strong> i podatke od drugog retka nadalje.
              Stupci moraju biti u ovom redoslijedu:
            </p>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Kol.</th>
                  <th style={s.th}>Naziv</th>
                  <th style={s.th}>Tip</th>
                  <th style={s.th}>Napomena</th>
                </tr>
              </thead>
              <tbody>
                {KOLONE.map((k, i) => (
                  <tr key={i} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                    <td style={{ ...s.td, ...s.tdCenter }}>{k.kol}</td>
                    <td style={{ ...s.td, fontWeight: '600' }}>{k.naziv}</td>
                    <td style={{ ...s.td, color: '#64748b' }}>{k.tip}</td>
                    <td style={s.td}>{k.napomena}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section style={s.section}>
            <h3 style={s.h3}>Pravila i ograničenja</h3>
            <ul style={s.ul}>
              <li>Svi redovi s istim <strong>Br</strong> moraju imati isti <strong>Dat. knjiženja</strong></li>
              <li>Datumi se unose u formatu <code style={s.code}>dd.mm.yyyy</code></li>
              <li>Iznosi se unose s točkom kao decimalnim separatorom (npr. <code style={s.code}>1234.56</code>)</li>
              <li>Konto mora imati točno 6 znakova</li>
              <li>Polje <strong>Br</strong> je opcionalno — ako se ostavi prazno, procedura dodjeljuje broj automatski</li>
            </ul>
          </section>

          <section style={s.section}>
            <h3 style={s.h3}>Poruke nakon importa</h3>
            <table style={s.table}>
              <tbody>
                {PORUKE.map((p, i) => (
                  <tr key={i} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                    <td style={{ ...s.td, ...s.tdTag }}>
                      <span style={{ ...s.tag, background: p.boja }}>{p.kod}</span>
                    </td>
                    <td style={s.td}>{p.opis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

        </div>

        <div style={s.footer}>
          <a href="/primjer-temeljnica.xlsx" download style={s.downloadBtn}>⬇ Preuzmi primjer (xlsx)</a>
          <button style={s.footerBtn} onClick={onClose}>Zatvori</button>
        </div>

      </div>
    </div>
  );
}

const KOLONE = [
  { kol: 'A', naziv: 'Dat. knjiženja', tip: 'datum',   napomena: 'dd.mm.yyyy — mora biti isti za sve retke s istim Br' },
  { kol: 'B', naziv: 'Pod',            tip: 'integer',  napomena: 'Šifra poduzeća' },
  { kol: 'C', naziv: 'God',            tip: 'integer',  napomena: 'Godina knjiženja' },
  { kol: 'D', naziv: 'Org',            tip: 'integer',  napomena: 'Org. jedinica' },
  { kol: 'E', naziv: 'Dok',            tip: 'integer',  napomena: 'Vrsta dokumenta' },
  { kol: 'F', naziv: 'Br',             tip: 'integer',  napomena: 'Broj temeljnice — opcionalno, ako prazno auto-inkrement' },
  { kol: 'G', naziv: 'Opis',           tip: 'tekst',    napomena: 'Opis stavke' },
  { kol: 'H', naziv: 'Konto',          tip: 'tekst',    napomena: 'Točno 6 znakova' },
  { kol: 'I', naziv: 'Partner',        tip: 'integer',  napomena: '0 ako nema analitike' },
  { kol: 'J', naziv: 'Mj. troška',     tip: 'integer',  napomena: '0 ako nema' },
  { kol: 'K', naziv: 'Duguje',         tip: 'decimal',  napomena: '0 ako potražuje' },
  { kol: 'L', naziv: 'Potražuje',      tip: 'decimal',  napomena: '0 ako duguje' },
  { kol: 'M', naziv: 'Valuta',         tip: 'integer',  napomena: 'ID valute' },
  { kol: 'N', naziv: 'Iznos val.',     tip: 'decimal',  napomena: '0 ako nije devizno' },
  { kol: 'O', naziv: 'Dat. dokumenta', tip: 'datum',    napomena: 'dd.mm.yyyy' },
  { kol: 'P', naziv: 'Dat. dospijeća', tip: 'datum',    napomena: 'dd.mm.yyyy' },
];

const PORUKE = [
  { kod: 'Uspjeh',            boja: '#16a34a', opis: 'Temeljnica je uspješno importirana. Prikazuje se popis unesenih temeljnica s duguje/potražuje.' },
  { kod: 'Godina zatvorena',  boja: '#dc2626', opis: 'Godina u kojoj se pokušava knjižiti je zatvorena — import nije moguć.' },
  { kod: 'Nepostojeći konto', boja: '#dc2626', opis: 'Jedan od konta iz datoteke ne postoji u šifarniku. Poruka sadrži broj stavke i konto.' },
  { kod: 'Već importirano',   boja: '#d97706', opis: 'Ista kombinacija poduzeće/godina/org/dok/datum/opis već postoji u bazi.' },
  { kod: 'Greška',            boja: '#7c3aed', opis: 'Neočekivana Oracle greška — prikazuje se izvorni opis greške.' },
];

const s = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' },
  modal:      { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '780px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' },
  headerTitle:{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' },
  closeBtn:   { background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#94a3b8', padding: '4px 8px', borderRadius: '4px' },
  body:       { padding: '24px', overflowY: 'auto', maxHeight: '70vh', display: 'flex', flexDirection: 'column', gap: '28px' },
  footer:       { padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerBtn:    { padding: '8px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  downloadBtn:  { padding: '8px 18px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block' },
  section:    {},
  h3:         { margin: '0 0 12px', fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' },
  p:          { margin: '0 0 12px', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' },
  ul:         { margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' },
  code:       { background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace', color: '#0f172a' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th:         { background: '#334155', color: '#e2e8f0', padding: '7px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
  td:         { padding: '6px 10px', color: '#334155', borderBottom: '1px solid #f1f5f9' },
  tdCenter:   { textAlign: 'center', fontWeight: '700', color: '#2563eb', fontFamily: 'monospace', width: '50px' },
  tdTag:      { width: '150px' },
  trEven:     { background: '#fff' },
  trOdd:      { background: '#f8fafc' },
  tag:        { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', color: '#fff', fontSize: '0.78rem', fontWeight: '600' },
};
