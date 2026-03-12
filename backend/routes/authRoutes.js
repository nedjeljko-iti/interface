'use strict';

const express  = require('express');
const jwt      = require('jsonwebtoken');
const oracledb = require('oracledb');
const router   = express.Router();
const { callLoginProcedure }    = require('../services/authService');
const { fetchModuliInterface }  = require('../services/moduliService');
const { getServerList, getConnConfig } = require('../services/serverConfig');
const { initClient } = require('../services/oracleClient');

const JWT_SECRET = process.env.JWT_SECRET || 'interface-secret-key';

router.get('/servers', (req, res) => {
  try {
    res.json(getServerList());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { login, lozinka, serverId } = req.body || {};

  if (!login || !lozinka || !serverId) {
    return res.status(400).json({ error: 'Login, lozinka i server su obavezni.' });
  }

  let connConfig;
  try {
    connConfig = getConnConfig(serverId);
  } catch (err) {
    return res.status(400).json({ error: 'Odabrani server nije valjan.' });
  }

  let result;
  try {
    result = await callLoginProcedure(login.trim(), lozinka, connConfig);
  } catch (err) {
    console.error('Login Oracle greška:', err.message);
    return res.status(503).json({ error: `Oracle greška: ${err.message}` });
  }

  if (result.returnCode !== 0) {
    console.log(`Login neuspješan za "${login}" (${serverId}): returnCode=${result.returnCode}`);
    return res.status(401).json({ error: 'Pogrešno korisničko ime ili lozinka.' });
  }

  // Dohvati enableane module za ovo poduzeće
  let moduli = [];
  try {
    initClient();
    const conn = await oracledb.getConnection(connConfig);
    try {
      moduli = await fetchModuliInterface(conn, result.pod);
    } finally {
      await conn.close();
    }
  } catch (err) {
    console.warn('Ne mogu dohvatiti module (login nastavlja):', err.message);
  }

  const payload = {
    login:   login.trim(),
    serverId,
    sifra:   result.sifra,
    ime:     result.ime,
    prezime: result.prezime,
    pod:     result.pod,
    org:     result.org,
    grusr:   result.grusr,
    moduli,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

  res.json({
    token,
    login:   payload.login,
    ime:     payload.ime,
    prezime: payload.prezime,
    grusr:   payload.grusr,
  });
});

module.exports = router;
