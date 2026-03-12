'use strict';

const oracledb = require('oracledb');
const { initClient } = require('./oracleClient');

async function callLoginProcedure(login, lozinka, connConfig) {
  initClient();

  let connection;
  try {
    connection = await oracledb.getConnection(connConfig);

    const sql = `
      BEGIN
        :ret := ITIFIN.FINDOZVOLE.LOGIN(
          p_login   => :p_login,
          p_lozinka => :p_lozinka,
          p_sifra   => :p_sifra,
          p_ime     => :p_ime,
          p_prezime => :p_prezime,
          p_pod     => :p_pod,
          p_org     => :p_org,
          p_jezik   => :p_jezik,
          p_grusr   => :p_grusr,
          p_output  => :p_output
        );
      END;
    `;

    const binds = {
      ret:       { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_login:   { dir: oracledb.BIND_IN,  type: oracledb.STRING, val: login },
      p_lozinka: { dir: oracledb.BIND_IN,  type: oracledb.STRING, val: lozinka },
      p_sifra:   { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_ime:     { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
      p_prezime: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
      p_pod:     { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_org:     { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_jezik:   { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_grusr:   { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_output:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    };

    const result = await connection.execute(sql, binds);
    const o = result.outBinds;

    return {
      returnCode: o.ret,
      sifra:      o.p_sifra,
      ime:        o.p_ime,
      prezime:    o.p_prezime,
      pod:        o.p_pod,
      org:        o.p_org,
      jezik:      o.p_jezik,
      grusr:      o.p_grusr,
      output:     o.p_output,
    };
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = { callLoginProcedure };
