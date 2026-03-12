'use strict';

const oracledb = require('oracledb');
const path = require('path');
const fs   = require('fs');

let initialized = false;

// Traži Oracle Instant Client:
// 1. ORACLE_CLIENT_LIB iz .env
// 2. instantclient/ pored server.js (direktno ili u podfoldera)
// 3. Sistemski PATH
function findLibDir() {
  if (process.env.ORACLE_CLIENT_LIB) return path.resolve(process.env.ORACLE_CLIENT_LIB);

  // server.js je u backend/, oracleClient.js u backend/services/
  const serverDir = path.join(__dirname, '..');
  const base = path.join(serverDir, 'instantclient');

  if (!fs.existsSync(base)) return null;

  // oci.dll direktno u instantclient/
  if (fs.existsSync(path.join(base, 'oci.dll'))) return base;

  // oci.dll u podfoldera (npr. instantclient/instantclient_23_0/)
  for (const entry of fs.readdirSync(base)) {
    const sub = path.join(base, entry);
    if (fs.statSync(sub).isDirectory() && fs.existsSync(path.join(sub, 'oci.dll'))) {
      return sub;
    }
  }

  return null;
}

function initClient() {
  if (initialized) return;

  const libDir = findLibDir();

  if (libDir) {
    process.env.PATH = `${libDir};${process.env.PATH || ''}`;
    oracledb.initOracleClient({ libDir });
  } else {
    oracledb.initOracleClient();
  }

  initialized = true;
}

module.exports = { initClient };
