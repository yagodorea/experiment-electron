const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,

  // Setup page APIs
  getConfig: () => ipcRenderer.invoke('get-config'),
  startStreaming: (options) => ipcRenderer.invoke('start-streaming', options),

  // Overlay page APIs
  onOverlayText: (callback) => {
    ipcRenderer.on('overlay-text', (_event, text) => callback(text));
  },
  onStartAudioCapture: (callback) => {
    ipcRenderer.on('start-audio-capture', (_event, config) => callback(config));
  },
  sendAudio: (audioData) => {
    ipcRenderer.send('send-audio', audioData);
  }
});
