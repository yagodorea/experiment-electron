# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` - Run the Electron app in production mode
- `npm run dev` - Run with DevTools open (sets NODE_ENV=development)
- `npm install` - Install dependencies

## Architecture

This is a macOS-optimized Electron application following the standard three-process architecture:

### Main Process (`main.js`)
- Creates and manages BrowserWindow instances
- Handles app lifecycle events (ready, activate, window-all-closed)
- macOS-specific: Uses `hiddenInset` title bar style with custom traffic light positioning

### Preload Script (`preload.js`)
- Secure bridge between main and renderer processes
- Uses `contextBridge.exposeInMainWorld()` to expose APIs
- Currently exposes `window.electron.platform`

### Renderer Process (`renderer.js`, `index.html`, `styles.css`)
- Runs in sandboxed browser context
- Accesses Node.js APIs only through preload-exposed interfaces
- Context isolation and disabled node integration for security

## IPC Pattern

To add main-renderer communication:
1. Expose method in `preload.js` via `contextBridge.exposeInMainWorld()`
2. Handle in `main.js` with `ipcMain.on()` or `ipcMain.handle()`
3. Call from renderer via `window.electron.<method>()`
