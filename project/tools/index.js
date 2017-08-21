const {app, BrowserWindow, dialog, Menu, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600});

  const template = [
    {
      label: '文件',
      submenu: [
        // {
        //   type: 'separator'
        // },
        {
          label: '退出',
          role: 'quit',
        }
      ]
    },
    {
      label: 'ftp',
      submenu: [
        {
          label: '新建站点',
          click() {
            let inputWin = new BrowserWindow({
              parent: win, 
              modal: true,
              minimizable: false,
              maximizable: false, 
              width: 500, 
              height: 600
            });
            // inputWin.setMenu(null);
            inputWin.loadURL(url.format({
              pathname: path.join(__dirname, 'site.html'),
              protocol: 'file:',
              slashes: true
            }));
            // inputWin.webContents.openDevTools();
          }
        },
        {
          label: '新建任务',
          click() {
            let taskWin = new BrowserWindow({
              parent: win, 
              modal: true,
              minimizable: false,
              maximizable: false,
              width: 500, 
              height: 600
            });
            // taskWin.setMenu(null);
            taskWin.loadURL(url.format({
              pathname: path.join(__dirname, 'task.html'),
              protocol: 'file:',
              slashes: true
            }));
            // taskWin.webContents.openDevTools();
          }
        }
      ],
    },
    {
      label: '工具',
      submenu: [
        {
          label: '图片压缩',
          click() {
            let taskWin = new BrowserWindow({
              parent: win, 
              modal: true,
              // minimizable: false,
              // maximizable: false, 
              width: 800, 
              height: 600
            });
            // taskWin.setMenu(null);
            taskWin.loadURL(url.format({
              pathname: path.join(__dirname, 'img-min.html'),
              protocol: 'file:',
              slashes: true
            }));
            // taskWin.webContents.openDevTools();
          },
        },
        {
          label: 'JSON格式化',
          click() {
            let taskWin = new BrowserWindow({
              parent: win, 
              modal: true,
              // minimizable: false,
              // maximizable: false, 
              width: 800, 
              height: 600
            });
            // taskWin.setMenu(null);
            taskWin.loadURL(url.format({
              pathname: path.join(__dirname, 'json-formatter.html'),
              protocol: 'file:',
              slashes: true
            }));
            // taskWin.webContents.openDevTools();
          }
        }
      ]
    },
    {
      label: '开发',
      submenu: [
        {
          label: '控制台',
          role: 'toggledevtools',
        },
        {
          label: '刷新',
          role: 'reload',
        }
      ]
    }

  ];

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // win.webContents.openDevTools();

  // console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}))

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.