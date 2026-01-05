const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { WebSocketServer } = require('ws');

let mainWindow;
let wss;

const WEBSOCKET_PORT = 8765;

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const windowWidth = 400;
  const windowHeight = 150;

  // Create the browser window as a transparent overlay
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
    // Allow clicks to pass through transparent areas
    // Note: On macOS, we need to handle this differently
  });

  // Make the window ignore mouse events (click-through)
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Set window level to be above other windows
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true);

  // Load the index.html of the app
  mainWindow.loadFile('index.html');

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const startWebSocketServer = () => {
  wss = new WebSocketServer({ port: WEBSOCKET_PORT });

  console.log(`WebSocket server started on ws://localhost:${WEBSOCKET_PORT}`);

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      const text = message.toString();
      console.log('Received:', text);

      // Send to renderer process
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('overlay-text', text);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  startWebSocketServer();

  // On macOS, re-create a window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up WebSocket server on quit
app.on('before-quit', () => {
  if (wss) {
    wss.close();
  }
});
