// Overlay renderer - displays text received via WebSocket

document.addEventListener('DOMContentLoaded', () => {
  const overlayText = document.getElementById('overlay-text');

  if (window.electron && window.electron.onOverlayText) {
    window.electron.onOverlayText((text) => {
      overlayText.textContent = text;
      overlayText.classList.add('visible');
    });
  }
});
