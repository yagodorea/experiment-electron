// Setup page - audio device selection and WebSocket configuration

document.addEventListener('DOMContentLoaded', async () => {
  const audioDeviceSelect = document.getElementById('audio-device');
  const webSocketUrlInput = document.getElementById('websocket-url');
  const startBtn = document.getElementById('start-btn');

  // Load saved config
  const config = await window.electron.getConfig();
  webSocketUrlInput.value = config.audioWebSocketUrl || 'ws://localhost:8766';

  // Get audio devices
  try {
    // Request microphone permission first
    await navigator.mediaDevices.getUserMedia({ audio: true });

    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(d => d.kind === 'audioinput');

    audioDeviceSelect.innerHTML = '';

    if (audioInputs.length === 0) {
      audioDeviceSelect.innerHTML = '<option value="">No audio devices found</option>';
    } else {
      audioInputs.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label || `Microphone ${index + 1}`;
        if (device.deviceId === config.selectedDeviceId) {
          option.selected = true;
        }
        audioDeviceSelect.appendChild(option);
      });
      startBtn.disabled = false;
    }
  } catch (err) {
    console.error('Failed to get audio devices:', err);
    audioDeviceSelect.innerHTML = '<option value="">Microphone access denied</option>';
  }

  // Handle start button
  startBtn.addEventListener('click', () => {
    const deviceId = audioDeviceSelect.value;
    const webSocketUrl = webSocketUrlInput.value.trim();

    if (!deviceId || !webSocketUrl) {
      return;
    }

    window.electron.startStreaming({ deviceId, webSocketUrl });
  });
});
