'use strict';

const path = require('path');
const fs   = require('fs');

/*
  Format SERVER.TXT (dokumentiran u untPrijava.pas):

    Linija 1: A ili H   (A = IP adresa, H = hostname)
    Linija 2: IP adresa ili hostname Oracle servera
    Linija 3: Oracle service name (prazan = "ORACLE")
    Linija 4: Naziv konekcije (prikazuje se u dropdownu)
    Linija 5: oracle_user:oracle_password  (u originalnom sustavu nekorišteno)

  Višestruki serveri odvojeni su praznim retkom.
  Redni broj u fajlu (0, 1, 2…) koristi se kao interni ID.
*/

let cache = null;

function getFilePath() {
  return process.env.SERVER_TXT_PATH
    || path.join(__dirname, '..', '..', 'server.txt');
}

function parse(content) {
  const servers = [];

  // Razdvajamo po praznim redovima → blokovi
  const blocks = content
    .split(/\r?\n\s*\r?\n/)
    .map(b => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map(l => l.trim());
    if (lines.length < 4) continue;

    const type    = lines[0].toUpperCase();   // A ili H
    const host    = lines[1];
    const service = lines[2] || 'ORACLE';
    const naziv   = lines[3];
    const creds   = lines[4] || '';

    // Ako linija 5 nije popunjena, koriste se ORACLE_USER/ORACLE_PASSWORD iz .env
    const colonIdx = creds.indexOf(':');
    const user     = (colonIdx >= 0 ? creds.slice(0, colonIdx) : creds)
                     || process.env.ORACLE_USER || 'itifin';
    const password = (colonIdx >= 0 ? creds.slice(colonIdx + 1) : '')
                     || process.env.ORACLE_PASSWORD || 'ora1806';

    servers.push({ type, host, service, naziv, user, password });
  }

  return servers;
}

function load() {
  if (cache) return cache;
  const filePath = getFilePath();
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Ne mogu pročitati ${filePath}: ${err.message}`);
  }
  cache = parse(content);
  if (cache.length === 0) {
    throw new Error(`server.txt je prazan ili neispravan: ${filePath}`);
  }
  return cache;
}

// Vraća samo ID + naziv za frontend dropdown
function getServerList() {
  return load().map((s, i) => ({ id: String(i), naziv: s.naziv }));
}

// Vraća oracledb connConfig za dani ID (redni broj)
function getConnConfig(id) {
  const servers = load();
  const idx = parseInt(id, 10);
  if (isNaN(idx) || idx < 0 || idx >= servers.length) {
    throw new Error(`Nepoznati server ID: "${id}"`);
  }
  const s = servers[idx];
  return {
    user:          s.user,
    password:      s.password,
    connectString: `${s.host}:1521/${s.service}`,
  };
}

module.exports = { getServerList, getConnConfig, getFilePath };
