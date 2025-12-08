# Electron Mac Application

A modern, secure Electron application optimized for macOS with a beautiful UI and best practices built-in.

## Features

- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 🔒 **Secure** - Context isolation and CSP enabled by default
- 🍎 **Mac Optimized** - Native title bar styling and traffic light controls
- ⚡ **Fast** - Lightweight and responsive
- 🛠️ **Developer Friendly** - Hot reload support and DevTools in development mode

## Project Structure

```
experiment-electron/
├── main.js          # Main process (handles app lifecycle and windows)
├── preload.js       # Secure bridge between main and renderer processes
├── index.html       # Application UI
├── styles.css       # Styling
├── renderer.js      # Renderer process logic
├── package.json     # Project configuration
└── .gitignore       # Git ignore rules
```

## Prerequisites

- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- macOS (for best experience)

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd experiment-electron
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Production Mode
```bash
npm start
```

### Development Mode (with DevTools)
```bash
npm run dev
```

## Development

### Main Process (`main.js`)
The main process manages the application lifecycle and creates browser windows. It handles:
- Window creation and management
- macOS-specific behaviors (dock, menu bar)
- Native features and system integration

### Preload Script (`preload.js`)
Acts as a secure bridge between the main and renderer processes. Use this to expose controlled APIs to the renderer.

### Renderer Process (`index.html`, `renderer.js`, `styles.css`)
The renderer process handles the UI. It runs in a sandboxed environment with:
- Context isolation enabled
- Node integration disabled (for security)
- Access to APIs only through the preload script

## Security Features

This application follows Electron security best practices:

1. **Context Isolation** - Enabled to prevent renderer process from accessing Node.js directly
2. **Node Integration Disabled** - Renderer processes don't have direct Node.js access
3. **Content Security Policy** - Restricts resource loading to prevent XSS attacks
4. **Preload Script** - Controlled API exposure between processes

## Building for Distribution

To package your application for distribution, you can use tools like:

- [electron-builder](https://www.electron.build/)
- [electron-forge](https://www.electronforge.io/)

Example with electron-builder:

```bash
npm install --save-dev electron-builder
```

Add to `package.json`:
```json
"scripts": {
  "build": "electron-builder --mac"
}
```

## Customization

### Changing the Window Size
Edit `main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1200,  // Change this
  height: 800,  // Change this
  // ...
});
```

### Modifying the UI
- Edit `index.html` for structure
- Edit `styles.css` for styling
- Edit `renderer.js` for behavior

### Adding IPC Communication
To communicate between main and renderer processes:

1. In `preload.js`, expose an API:
```javascript
contextBridge.exposeInMainWorld('myAPI', {
  doSomething: () => ipcRenderer.send('do-something')
});
```

2. In `main.js`, handle the event:
```javascript
ipcMain.on('do-something', (event) => {
  // Handle the event
});
```

3. In `renderer.js`, use the API:
```javascript
window.myAPI.doSomething();
```

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Security Guidelines](https://www.electronjs.org/docs/tutorial/security)
- [Awesome Electron](https://github.com/sindresorhus/awesome-electron)

## License

ISC

## Contributing

Feel free to open issues or submit pull requests!
