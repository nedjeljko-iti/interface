'use strict';

const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

async function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
    title: 'Import temeljnica',
  });

  win.setMenuBarVisibility(false);

  if (isDev) {
    await win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // U pakiranoj aplikaciji: electron/ je u resources/app/electron/
    // a dist/ je u resources/app/dist/
    await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.webContents.openDevTools();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
