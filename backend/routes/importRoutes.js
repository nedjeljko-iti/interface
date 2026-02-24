'use strict';

const express = require('express');
const multer  = require('multer');
const { parseCSV, buildClobParams, buildRowsJson } = require('../services/csvParser');
const { callImportProcedure }          = require('../services/oracleService');

const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage() });

const RETURN_MESSAGES = {
   0: 'Uspješno uvezeno',
   1: 'Godina je zatvorena',
   2: 'Nepostojeći konto',
   3: 'Već importirano',
  '-1': 'Nepoznata greška',
};

router.post('/preview', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Niste uploadali fajl.' });
  }
  let rows;
  try {
    rows = parseCSV(req.file.buffer);
  } catch (err) {
    return res.status(422).json({ error: `Greška pri parsiranju: ${err.message}` });
  }
  return res.json({ rows: buildRowsJson(rows) });
});

router.post('/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Niste uploadali fajl.' });
  }

  let rows;
  try {
    rows = parseCSV(req.file.buffer);
  } catch (err) {
    return res.status(422).json({ error: `Greška pri parsiranju CSV-a: ${err.message}` });
  }

  const { clobs, rowCount } = buildClobParams(rows);

  let result;
  try {
    result = await callImportProcedure(clobs, req.body.username);
  } catch (err) {
    return res.status(500).json({ error: `Greška pri pozivu Oracle procedure: ${err.message}` });
  }

  const { returnCode, info } = result;
  const success = returnCode === 0;
  const message = RETURN_MESSAGES[returnCode] ?? `Neočekivani povratni kod: ${returnCode}`;

  return res.json({
    success,
    returnCode,
    rowCount,
    message,
    info,
  });
});

module.exports = router;
