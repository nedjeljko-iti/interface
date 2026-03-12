'use strict';

const XLSX = require('xlsx');

function normalizeDecimalOracle(value) {
  const trimmed = value.trim();
  if (trimmed === '') return '0';
  if (trimmed.includes(',')) {
    return trimmed.replace(/\./g, '').replace(',', '.');
  }
  return trimmed;
}

function normalizeDecimalJS(value) {
  return normalizeDecimalOracle(value);
}

function normalizeDate(value) {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  const parts = trimmed.split('.');
  if (parts.length !== 3) return trimmed;
  const [d, m, y] = parts;
  return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`;
}

function normalizeInt(value) {
  const trimmed = value.trim();
  if (trimmed === '') return '0';
  return trimmed;
}

function splitCSVLine(line) {
  const cols = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ';' && !inQuote) {
      cols.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cols.push(cur);
  return cols;
}

function parseCSV(buffer) {
  const text = buffer.toString('utf8');
  const lines = text.split(/\r?\n/);
  const dataLines = lines.slice(1).filter(l => l.trim() !== '');

  if (dataLines.length === 0) {
    throw new Error('CSV fajl ne sadrži podatke (samo header ili prazan fajl).');
  }

  return dataLines.map((line, idx) => {
    const cols = splitCSVLine(line);
    if (cols.length < 16) {
      throw new Error(`Red ${idx + 2}: premalo kolona (${cols.length}, očekivano 16).`);
    }
    return cols;
  });
}

function excelCellToString(val) {
  if (val instanceof Date) {
    const d = String(val.getDate()).padStart(2, '0');
    const m = String(val.getMonth() + 1).padStart(2, '0');
    return `${d}.${m}.${val.getFullYear()}`;
  }
  if (val == null) return '';
  return String(val);
}

function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });

  const dataRows = data.slice(1).filter(r => r.some(c => excelCellToString(c).trim() !== ''));

  if (dataRows.length === 0) {
    throw new Error('Excel fajl ne sadrži podatke (samo header ili prazan fajl).');
  }

  return dataRows.map((row, idx) => {
    const cols = row.map(excelCellToString);
    if (cols.length < 16) {
      throw new Error(`Red ${idx + 2}: premalo kolona (${cols.length}, očekivano 16).`);
    }
    return cols;
  });
}

function buildClobParams(rows) {
  const params = {
    p_datum:  [], p_pod:    [], p_god:    [], p_org:    [],
    p_dok:    [], p_br:     [], p_opis:   [], p_konta:  [],
    p_ana:    [], p_mjtk:   [], p_iznosd: [], p_iznosp: [],
    p_val:    [], p_iznval: [], p_datdok: [], p_datdosp:[],
  };

  for (let i = 0; i < rows.length; i++) {
    const cols   = rows[i];
    const rowNum = i + 2;
    const iznosd = normalizeDecimalOracle(cols[10]);
    const iznosp = normalizeDecimalOracle(cols[11]);
    const iznval = normalizeDecimalOracle(cols[13]);

    for (const [name, val] of [['iznosd', iznosd], ['iznosp', iznosp], ['iznval', iznval]]) {
      if (isNaN(parseFloat(val)) || !/^-?\d*\.?\d*$/.test(val)) {
        throw new Error(`Red ${rowNum}, kolona ${name}: nevažeći broj "${val}"`);
      }
    }

    params.p_datum.push(normalizeDate(cols[0]));
    params.p_pod.push(normalizeInt(cols[1]));
    params.p_god.push(normalizeInt(cols[2]));
    params.p_org.push(normalizeInt(cols[3]));
    params.p_dok.push(normalizeInt(cols[4]));
    params.p_br.push(normalizeInt(cols[5]));
    params.p_opis.push(cols[6].trim());
    params.p_konta.push(cols[7].trim());
    params.p_ana.push(normalizeInt(cols[8]));
    params.p_mjtk.push(normalizeInt(cols[9]));
    params.p_iznosd.push(iznosd);
    params.p_iznosp.push(iznosp);
    params.p_val.push(normalizeInt(cols[12]));
    params.p_iznval.push(iznval);
    params.p_datdok.push(normalizeDate(cols[14]));
    params.p_datdosp.push(normalizeDate(cols[15]));
  }

  const joined = {};
  for (const [key, arr] of Object.entries(params)) {
    joined[key] = arr.join('|');
  }
  return { clobs: joined, rowCount: rows.length };
}

function buildRowsJson(rows) {
  return rows.map(cols => ({
    datk:    normalizeDate(cols[0]),
    pod:     normalizeInt(cols[1]),
    god:     normalizeInt(cols[2]),
    org:     normalizeInt(cols[3]),
    dok:     normalizeInt(cols[4]),
    br:      normalizeInt(cols[5]),
    opis:    cols[6].trim(),
    konto:   cols[7].trim(),
    ana:     normalizeInt(cols[8]),
    mjtk:    normalizeInt(cols[9]),
    iznosd:  normalizeDecimalJS(cols[10]),
    iznosp:  normalizeDecimalJS(cols[11]),
    val:     normalizeInt(cols[12]),
    iznval:  normalizeDecimalJS(cols[13]),
    datdok:  normalizeDate(cols[14]),
    datdosp: normalizeDate(cols[15]),
  }));
}

// Validira da svi redovi s istim br imaju isti datk.
// Baca grešku s popisom problematičnih redova.
function validateDatkPerBr(rows) {
  const brDatk = new Map(); // br → { datk, redak }

  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const cols   = rows[i];
    const br     = normalizeInt(cols[5]);
    const datk   = normalizeDate(cols[0]);
    const redak  = i + 2; // +2 jer je red 1 header

    if (!brDatk.has(br)) {
      brDatk.set(br, { datk, redak });
    } else if (brDatk.get(br).datk !== datk) {
      const prvi = brDatk.get(br);
      errors.push(
        `Br ${br}: red ${prvi.redak} ima datk=${prvi.datk}, red ${redak} ima datk=${datk}`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Različiti datumi knjiženja za isti broj temeljnice:\n${errors.join('\n')}`
    );
  }
}

module.exports = { parseCSV, parseExcel, buildClobParams, buildRowsJson, validateDatkPerBr };
