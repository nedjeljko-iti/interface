'use strict';

const express  = require('express');
const multer   = require('multer');
const router   = express.Router();
const auth     = require('../../middleware/auth');
const { parseCSV, parseExcel, buildClobParams, buildRowsJson, validateDatkPerBr } = require('./parser');
const { callImportProcedure } = require('./oracle');
const { getConnConfig }       = require('../../services/serverConfig');

const upload = multer({ storage: multer.memoryStorage() });

function parseFile(file) {
  const name = (file.originalname || '').toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return parseExcel(file.buffer);
  }
  return parseCSV(file.buffer);
}

router.post('/preview', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fajl nije priložen.' });
  }
  try {
    const rows = parseFile(req.file);
    validateDatkPerBr(rows);
    res.json({ rows: buildRowsJson(rows) });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.post('/import', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fajl nije priložen.' });
  }

  let rows;
  try {
    rows = parseFile(req.file);
    validateDatkPerBr(rows);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }

  const { clobs, rowCount } = buildClobParams(rows);

  let connConfig;
  try {
    connConfig = getConnConfig(req.user.serverId);
  } catch (err) {
    return res.status(400).json({ error: 'Nevaljan server u tokenu.' });
  }

  let result;
  try {
    result = await callImportProcedure(clobs, req.user.login, connConfig);
  } catch (err) {
    console.error('Import Oracle greška:', err.message);
    return res.status(503).json({ error: `Oracle greška: ${err.message}` });
  }

  const { returnCode, info } = result;

  const messages = {
    0:   `Uspješno importirano ${rowCount} stavki.`,
    1:   'Greška: Godina je zatvorena.',
    2:   `Greška: Nepostojeći konto. ${info || ''}`,
    3:   `Greška: Već importirano. ${info || ''}`,
    '-1': `Nepoznata greška / ${info || ''}`,
  };

  const message = messages[String(returnCode)] ?? `Povratni kod: ${returnCode}`;
  const success = returnCode === 0;

  res.json({ success, returnCode, rowCount, message, info: info || '' });
});

module.exports = router;
