// adapted from https://www.freecodecamp.org/news/building-an-electron-application-with-create-react-app-97945861647c/
const { app, BrowserWindow, Menu, Tray} = require('electron');
const path = require('path');
const url = require('url');
let mainWindow
function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true
    }    
});
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/index.html'),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(startUrl);

}
let tray = null;
app.whenReady().then(() => {
    createWindow()
    tray = new Tray( path.join(__dirname, '/assets/tinyIcon.png'))
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      { label: 'Item4', type: 'radio' }
    ])
    tray.setToolTip('Covid 19 is still happening')
    tray.setContextMenu(contextMenu)
    
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })
  