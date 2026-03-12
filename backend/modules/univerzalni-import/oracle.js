'use strict';

const oracledb = require('oracledb');
const { initClient } = require('../../services/oracleClient');

async function callImportProcedure(clobs, username, connConfig) {
  initClient();

  let connection;
  try {
    connection = await oracledb.getConnection(connConfig);
    await connection.execute("ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '.,'");

    const sql = `
      BEGIN
        :ret := itifin.fininterface.Univerzalni_Import_Temeljnica(
          p_datum   => :p_datum,
          p_pod     => :p_pod,
          p_god     => :p_god,
          p_org     => :p_org,
          p_dok     => :p_dok,
          p_br      => :p_br,
          p_opis    => :p_opis,
          p_konta   => :p_konta,
          p_ana     => :p_ana,
          p_mjtk    => :p_mjtk,
          p_iznosd  => :p_iznosd,
          p_iznosp  => :p_iznosp,
          p_val     => :p_val,
          p_iznval  => :p_iznval,
          p_datdok  => :p_datdok,
          p_datdosp => :p_datdosp,
          p_tko     => :p_tko,
          p_info    => :p_info
        );
      END;
    `;

    const binds = {
      ret:       { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_info:    { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 },
      p_tko:     { dir: oracledb.BIND_IN,  type: oracledb.STRING, val: username || '0' },
      p_datum:   { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_datum },
      p_pod:     { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_pod },
      p_god:     { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_god },
      p_org:     { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_org },
      p_dok:     { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_dok },
      p_br:      { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_br },
      p_opis:    { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_opis },
      p_konta:   { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_konta },
      p_ana:     { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_ana },
      p_mjtk:    { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_mjtk },
      p_iznosd:  { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_iznosd },
      p_iznosp:  { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_iznosp },
      p_val:     { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_val },
      p_iznval:  { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_iznval },
      p_datdok:  { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_datdok },
      p_datdosp: { dir: oracledb.BIND_IN,  type: oracledb.CLOB,   val: clobs.p_datdosp },
    };

    for (const [k, v] of Object.entries(clobs)) {
      const preview = v.split('|').slice(0, 5).join(' | ');
      console.log(`${k.padEnd(10)}: ${preview}`);
    }

    const result = await connection.execute(sql, binds, { autoCommit: true });

    return {
      returnCode: result.outBinds.ret,
      info:       result.outBinds.p_info,
    };
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { callImportProcedure };
