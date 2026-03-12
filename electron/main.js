'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');

const isDev = !app.isPackaged;
const PORT  = 3000;

let serverProcess = null;

// Folder gdje se nalazi .exe (produkcija) ili root projekta (dev)
function getAppDir() {
  return isDev
    ? path.join(__dirname, '..')
    : path.dirname(process.execPath);
}

function waitForServer(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout;
    function check() {
      http.get(`http://127.0.0.1:${port}/`, () => {
        resolve();
      }).on('error', () => {
        if (Date.now() > deadline) {
          reject(new Error('Next.js server nije se pokrenuo na vrijeme.'));
        } else {
          setTimeout(check, 400);
        }
      });
    }
    check();
  });
}

function startNextServer() {
  const appDir = getAppDir();

  // U pakiranoj aplikaciji main.js je u resources/app/electron/
  // pa je server.js na resources/app/.next/standalone/server.js
  const serverScript = path.join(__dirname, '..', '.next', 'standalone', 'server.js');

  const env = {
    ...process.env,
    PORT:            String(PORT),
    HOSTNAME:        '127.0.0.1',
    NODE_ENV:        'production',
    SERVER_TXT_PATH: path.join(appDir, 'server.txt'),
  };

  serverProcess = fork(serverScript, [], { env });

  serverProcess.on('error', err => {
    console.error('Next.js server greška:', err);
  });

  return waitForServer(PORT);
}

async function createWindow() {
  const win = new BrowserWindow({
    width:  1400,
    height: 900,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
    title: 'Import temeljnica',
  });

  win.setMenuBarVisibility(false);

  // Ctrl+Shift+I otvara DevTools (i u produkciji, za debug)
  const { globalShortcut } = require('electron');
  app.whenReady().then(() => {
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      win.webContents.openDevTools();
    });
  });

  if (isDev) {
    await win.loadURL(`http://localhost:${PORT}`);
    win.webContents.openDevTools();
  } else {
    try {
      await startNextServer();
      await win.loadURL(`http://127.0.0.1:${PORT}`);
    } catch (err) {
      const appDir = getAppDir();
      const serverScript = path.join(__dirname, '..', '.next', 'standalone', 'server.js');
      const html = `
        <html><body style="font-family:monospace;padding:20px;background:#1e1e1e;color:#f44">
        <h2>Greška pri pokretanju servera</h2>
        <pre style="color:#fff;background:#333;padding:12px;border-radius:6px">${err.message}</pre>
        <h3 style="color:#aaa">Putanje (za provjeru):</h3>
        <pre style="color:#9cf;background:#333;padding:12px;border-radius:6px">
appDir:       ${appDir}
serverScript: ${serverScript}
server.txt:   ${path.join(appDir, 'server.txt')}
instantclient:${path.join(appDir, 'instantclient')}
        </pre>
        </body></html>`;
      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      win.webContents.openDevTools();
    }
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
