const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

let mainWindow;
let setupWindow;
let ws;
const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

const loadConfig = () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load config:', e);
  }
  return { audioWebSocketUrl: 'ws://localhost:8000/sessions/b4f6617c-1ac2-4f61-b570-1c08c1118e1c/audio' };
};

const saveConfig = (config) => {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error('Failed to save config:', e);
  }
};

const createSetupWindow = () => {
  setupWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    resizable: false,
    show: false
  });

  setupWindow.loadFile('setup.html');

  setupWindow.once('ready-to-show', () => {
    setupWindow.show();
  });

  setupWindow.on('closed', () => {
    setupWindow = null;
  });
};

const createOverlayWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const windowWidth = 400;
  const windowHeight = 150;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: screenWidth - windowWidth - 20,
    y: screenHeight - windowHeight - 20,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: false,
  });

  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true);

  mainWindow.loadFile('overlay.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const connectWebSocket = (webSocketUrl) => {
  console.log('Connecting to WebSocket:', webSocketUrl);
  ws = new WebSocket(webSocketUrl);

  ws.on('open', () => {
    console.log('WebSocket connected to', webSocketUrl);
    // Notify renderer that connection is ready
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('websocket-ready');
    }
  });

  ws.on('message', (message) => {
    // Text messages are overlay text
    const text = message.toString();
    console.log('Received data:', text);
    try {
        const data = JSON.parse(text);
        if (mainWindow && !mainWindow.isDestroyed()) {
          if (data.type === 'transcription') {
              mainWindow.webContents.send('overlay-text', data.text);
          }
        }
    } catch (err) {
        console.log(`Error printing response: ${err.message}`);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
};

// IPC handlers
ipcMain.handle('get-config', () => {
  return loadConfig();
});

ipcMain.handle('start-streaming', (_event, { deviceId, webSocketUrl }) => {
  const config = loadConfig();
  config.audioWebSocketUrl = webSocketUrl;
  config.selectedDeviceId = deviceId;
  saveConfig(config);

  // Close setup window and open overlay
  if (setupWindow) {
    setupWindow.close();
  }

  createOverlayWindow();
  connectWebSocket(webSocketUrl);

  // Send config to overlay for audio streaming after renderer is ready
  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.send('start-audio-capture', { deviceId });
  });
});

// IPC handler to send audio data through the main process WebSocket
ipcMain.on('send-audio', (_event, audioData) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(audioData);
  }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createSetupWindow();

  // On macOS, re-create a window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createSetupWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up WebSocket on quit
app.on('before-quit', () => {
  if (ws) {
    ws.close();
  }
});
