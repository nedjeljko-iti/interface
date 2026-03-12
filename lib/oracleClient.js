'use strict';

const oracledb = require('oracledb');

let initialized = false;

function initClient() {
  if (initialized) return;

  const libDir = process.env.ORACLE_CLIENT_LIB;

  if (libDir) {
    // Eksplicitna putanja (dev ili ako je postavljena sistemski)
    process.env.PATH = `${libDir};${process.env.PATH || ''}`;
    oracledb.initOracleClient({ libDir });
  } else {
    // Bez putanje — traži Oracle client u sistemskom PATH-u
    oracledb.initOracleClient();
  }

  initialized = true;
}

module.exports = { initClient };
