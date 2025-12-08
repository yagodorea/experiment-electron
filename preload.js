const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  // Add more APIs here as needed
  // Example: send: (channel, data) => ipcRenderer.send(channel, data),
  // Example: receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});
