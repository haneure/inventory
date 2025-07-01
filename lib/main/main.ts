import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import * as path from 'path'
import { createAppWindow } from './app'
import { getAppSettings, getCurrentDatabasePath, loadConfig, saveAppSettings, setCurrentDatabasePath } from './utils/config'
import { initializeExcelFile } from './utils/excel'

// Load config early to ensure it's available when other modules import it
loadConfig();

// Import server after config is loaded
import '../../app/server/server'

// Store reference to main window
let mainWindow: BrowserWindow | null = null;

// IPC handlers for database path management
ipcMain.handle('get-database-path', () => {
  return getCurrentDatabasePath();
});

ipcMain.handle('select-database-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Database Folder'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const selectedPath = path.join(result.filePaths[0], 'data.xlsx');
    setCurrentDatabasePath(selectedPath);
    return selectedPath;
  }
  return null;
});

ipcMain.handle('select-database-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    title: 'Select Database File',
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    setCurrentDatabasePath(result.filePaths[0]);
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('reset-database-path', () => {
  setCurrentDatabasePath(null);
  return true;
});

ipcMain.handle('refresh-database', () => {
  // Force re-initialization of the Excel file with new path
  try {
    initializeExcelFile();
    return true;
  } catch (error) {
    console.error('Error refreshing database:', error);
    return false;
  }
});

ipcMain.handle('open-database-location', () => {
  const customPath = getCurrentDatabasePath();
  
  if (customPath) {
    // Show file in folder
    shell.showItemInFolder(customPath);
  } else {
    // Open default location
    const defaultPath = path.join(app.getPath('userData'), 'database');
    shell.openPath(defaultPath);
  }
  return true;
});

ipcMain.handle('save-app-settings', (_, settings) => {
  try {
    saveAppSettings(settings);
    
    // Update window title if main window exists
    if (mainWindow && !mainWindow.isDestroyed()) {
      const appSettings = getAppSettings();
      mainWindow.setTitle(appSettings.appName || 'Inventoria');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving app settings:', error);
    return false;
  }
});

ipcMain.handle('get-app-settings', () => {
  try {
    return getAppSettings();
  } catch (error) {
    console.error('Error getting app settings:', error);
    return { appName: 'Inventoria' };
  }
});

// IPC handler to update window title
ipcMain.handle('update-window-title', (_, title) => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle(title || 'Inventoria');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating window title:', error);
    return false;
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // Create app window and store reference
  mainWindow = createAppWindow()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createAppWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
