'use strict';

/**
 * Parses CSV buffer (semicolon-delimited, 16 columns, optional Windows-1250 encoding).
 *
 * CSV column order → Oracle parameter mapping:
 *  0  datum knjiženja → p_datum
 *  1  Pod             → p_pod
 *  2  God.            → p_god
 *  3  Org.            → p_org
 *  4  Dok.            → p_dok
 *  5  Br              → p_br
 *  6  Opis            → p_opis
 *  7  Konto           → p_konta
 *  8  Partner         → p_ana
 *  9  Mjt             → p_mjtk
 * 10  Duguje          → p_iznosd
 * 11  Potražuje       → p_iznosp
 * 12  Valuta          → p_val
 * 13  Valutni iznos   → p_iznval
 * 14  Dat. dokumenta  → p_datdok
 * 15  datum dosp      → p_datdosp
 */

function normalizeDecimal(value) {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === null) return '0';
  // European format: 1.234.567,89 → ukloni točke (tisućice), zamijeni zarez s točkom
  return trimmed.replace(/\./g, '').replace(',', '.');
}

function normalizeDate(value) {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  // dd.mm.yyyy or d.m.yyyy → pad to dd.mm.yyyy
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

// Parsira jedan CSV red s podrškom za quoted polja (delimiter ;)
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
  // Try UTF-8 first; if Croatian chars look wrong the caller can retry with iconv-lite
  const text = buffer.toString('utf8');

  const lines = text.split(/\r?\n/);
  // Skip header (line 0) and filter empty lines
  const dataLines = lines.slice(1).filter(l => l.trim() !== '');

  if (dataLines.length === 0) {
    throw new Error('CSV fajl ne sadrži podatke (samo header ili prazan fajl).');
  }

  const rows = dataLines.map((line, idx) => {
    const cols = splitCSVLine(line);
    if (cols.length < 16) {
      throw new Error(`Red ${idx + 2}: premalo kolona (${cols.length}, očekivano 16).`);
    }
    return cols;
  });

  return rows;
}

function buildClobParams(rows) {
  const params = {
    p_datum:  [],
    p_pod:    [],
    p_god:    [],
    p_org:    [],
    p_dok:    [],
    p_br:     [],
    p_opis:   [],
    p_konta:  [],
    p_ana:    [],
    p_mjtk:   [],
    p_iznosd: [],
    p_iznosp: [],
    p_val:    [],
    p_iznval: [],
    p_datdok: [],
    p_datdosp:[],
  };

  for (const cols of rows) {
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
    params.p_iznosd.push(normalizeDecimal(cols[10]));
    params.p_iznosp.push(normalizeDecimal(cols[11]));
    params.p_val.push(normalizeInt(cols[12]));
    params.p_iznval.push(normalizeDecimal(cols[13]));
    params.p_datdok.push(normalizeDate(cols[14]));
    params.p_datdosp.push(normalizeDate(cols[15]));
  }

  // Join each array with pipe delimiter
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
    iznosd:  normalizeDecimal(cols[10]),
    iznosp:  normalizeDecimal(cols[11]),
    val:     normalizeInt(cols[12]),
    iznval:  normalizeDecimal(cols[13]),
    datdok:  normalizeDate(cols[14]),
    datdosp: normalizeDate(cols[15]),
  }));
}

module.exports = { parseCSV, buildClobParams, buildRowsJson };
