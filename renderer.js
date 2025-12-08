// This file is loaded by the HTML and runs in the renderer process
// It has access to the DOM and limited Node.js APIs through the preload script

document.addEventListener('DOMContentLoaded', () => {
  // Display system information
  if (window.electron) {
    document.getElementById('platform').textContent = window.electron.platform;
  }

  // Display version information
  document.getElementById('electron-version').textContent = process.versions.electron || 'N/A';
  document.getElementById('chrome-version').textContent = process.versions.chrome || 'N/A';
  document.getElementById('node-version').textContent = process.versions.node || 'N/A';

  // Add any additional renderer logic here
  console.log('Electron app initialized successfully!');
});
