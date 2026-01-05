// Overlay renderer - displays text and streams audio via main process

let audioContext;
let mediaStream;
let processor;

const startAudioCapture = async (deviceId) => {
  console.log('startAudioCapture called with deviceId:', deviceId);
  try {
    // Get audio stream from selected device
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: deviceId },
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });

    // Create audio context
    audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(mediaStream);

    // Use ScriptProcessorNode to get raw PCM data
    // Buffer size of 4096 samples at 16kHz = 256ms chunks
    processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      // Convert Float32Array to Int16Array for PCM
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      // Send audio via IPC to main process
      window.electron.sendAudio(pcmData.buffer);
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    console.log('Audio capture started');
  } catch (err) {
    console.error('Failed to start audio capture:', err);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const overlayText = document.getElementById('overlay-text');

  if (window.electron) {
    // Handle overlay text display
    window.electron.onOverlayText((text) => {
      overlayText.textContent = text;
      overlayText.classList.add('visible');
    });

    // Handle audio capture start
    window.electron.onStartAudioCapture(({ deviceId }) => {
      startAudioCapture(deviceId);
    });
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (processor) {
    processor.disconnect();
  }
  if (audioContext) {
    audioContext.close();
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }
});
