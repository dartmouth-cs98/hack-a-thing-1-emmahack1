// adapted from https://www.freecodecamp.org/news/building-an-electron-application-with-create-react-app-97945861647c/
const { app, BrowserWindow, Menu, Tray, ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');

let mainWindow
function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
    width: 500,
    height: 1000,
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
const getDataForTray = () => {
  return new Promise((resolve, reject) => {
    const menu = [];
    if(fs.existsSync('./hack-a-thing-locations')) {
      let data = fs.readFileSync('./hack-a-thing-locations', 'utf8').split('\n')
      
      data.forEach((location) => {
        if (location !== '') {
          let [name, cases, deaths] = location.split(',');
              menu.splice(0,0,{label:`${name}: ${cases} cases, ${deaths} deaths`});
          }
      })
      resolve(menu);
    } else {
      console.log("File Doesn't Exist. Creating new file.")
      fs.writeFile('./hack-a-thing-locations', '', (err) => {
          if(err) console.log(err)
      })
    }
    resolve(menu);
  });
}
const setUpTray = (tray) => {
  getDataForTray().then((returnMenu) => {
    let menu = returnMenu;
    menu.push({label: 'Hide Window', click() { mainWindow.hide(); }});
    menu.push({label: 'Show Window', click() { mainWindow.show(); }});
    menu.push({label: 'Quit', click() { app.quit(); }});
    const contextMenu = Menu.buildFromTemplate(menu);
    tray.setToolTip('Covid 19 is still happening')
    tray.setContextMenu(contextMenu)
  });
}

app.whenReady().then(() => {
    createWindow()
    tray = new Tray(path.join(__dirname, '/assets/tinyIcon.png'))
    setUpTray(tray);

    ipcMain.on('UPDATED', (event, data) => {
      setUpTray(tray);
    });
    
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
  