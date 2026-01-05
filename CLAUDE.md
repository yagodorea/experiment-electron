# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` - Run the Electron app
- `npm install` - Install dependencies

## Architecture

Audio overlay application for macOS with two-window flow:

### Startup Flow
1. **Setup Window** (`setup.html`, `setup.js`, `setup.css`) - Device selection dialog
   - Lists available audio input devices
   - Configures WebSocket URL for audio streaming
   - Config persisted to `~/Library/Application Support/experiment-electron/config.json`

2. **Overlay Window** (`overlay.html`, `renderer.js`, `styles.css`) - Transparent corner overlay
   - Always-on-top, click-through, bottom-right corner
   - Displays text received via WebSocket server (port 8765)
   - Streams audio as raw PCM (16kHz, mono, Int16) to configured WebSocket

### Main Process (`main.js`)
- Manages both setup and overlay windows
- Runs WebSocket server on port 8765 for receiving overlay text
- Handles config persistence via IPC

### Preload Script (`preload.js`)
Exposes via `window.electron`:
- `getConfig()` / `startStreaming()` - Setup page
- `onOverlayText()` / `onStartAudioCapture()` - Overlay page

## Audio Format

Streams to WebSocket as binary Int16Array (little-endian):
- Sample rate: 16000 Hz
- Channels: 1 (mono)
- Chunk size: 4096 samples (~256ms)
