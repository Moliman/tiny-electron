const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');

const url = require('url');
const path = require('path');
const fs = require('fs');
const beautify = require('js-beautify').html;
const isDev = process.mainModule.filename.indexOf('app.asar') === -1;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  mainWindow.removeMenu();
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('call-load', (event, arg) => load());
ipcMain.on('call-save', (event, arg) => save(arg));
ipcMain.on('call-saveAs', (event, arg) => saveas(arg));
ipcMain.on('call-quit', (event, arg) => app.quit());


// TINY MCE-SCRIPT

let filename;
let working_directory;

function load() {
  dialog.showOpenDialog({ properties: ["openFile"], defaultPath: working_directory }, function (file) {
    fs.readFile(file[0], 'utf8', (err, data) => {
      if (err) throw err;
      change_working_directory(file[0]);
      mainWindow.webContents.send('new-file', data);
    });
  });
}

function save(output) {
  if (filename == null) {
    saveas(output);
  } else {
    var fullpath = path.join(working_directory, filename);
    fs.writeFile(fullpath, beautify(output, { indent_size: 2 }), (err) => {
      if (err) throw err;
    });
  }
}

function saveas(output) {
  var options = {
    filters: [
      { name: 'html', extensions: ['htm', 'html'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    defaultPath: working_directory
  };
  dialog.showSaveDialog(options, function (file) {
    if (!file) return;
    change_working_directory(path.dirname(file));
    filename = path.basename(file);
    save(output);
  });
}

function change_working_directory(new_path) {
  working_directory = path.dirname(new_path);
  mainWindow.webContents.send('change-cwd', working_directory);
}