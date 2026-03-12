'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const { initClient } = require('./services/oracleClient');

const app  = express();
const PORT = process.env.PORT || 3001;

// Oracle thick mode init
try {
  initClient();
} catch (err) {
  console.error('Oracle client init greška:', err.message);
  console.error('Provjeri Oracle Instant Client instalaciju i ORACLE_CLIENT_LIB env varijablu.');
}

app.use(cors());
app.use(express.json());

app.use('/api/auth',              require('./routes/authRoutes'));
app.use('/api/univerzalni-import', require('./modules/univerzalni-import/routes'));

const path = require('path');
const serverTxtPath = process.env.SERVER_TXT_PATH || path.join(__dirname, '..', 'server.txt');

// Servira React frontend build
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server pokrenut na http://0.0.0.0:${PORT}`);
  console.log(`Frontend: ${distPath}`);
  console.log(`server.txt: ${serverTxtPath}`);
});
