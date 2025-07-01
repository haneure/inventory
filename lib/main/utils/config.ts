import { app } from 'electron';
import * as fs from 'fs-extra';
import * as path from 'path';

// Database path management
let customDatabasePath: string | null = null;

// App settings
let appSettings = {
  appName: 'Inventoria'
};

// Store database path in user data
const getConfigPath = () => {
  return path.join(app.getPath('userData'), 'config.json');
};

export const loadConfig = () => {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const config = fs.readJsonSync(configPath);
      customDatabasePath = config.databasePath || null;
      appSettings = { ...appSettings, ...config.appSettings };
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
};

export const saveConfig = () => {
  try {
    const configPath = getConfigPath();
    fs.ensureDirSync(path.dirname(configPath));
    fs.writeJsonSync(configPath, { 
      databasePath: customDatabasePath,
      appSettings: appSettings
    });
  } catch (error) {
    console.error('Error saving config:', error);
  }
};

export const getCurrentDatabasePath = () => {
  return customDatabasePath;
};

export const setCurrentDatabasePath = (path: string | null) => {
  customDatabasePath = path;
  saveConfig();
};

export const getAppSettings = () => {
  return appSettings;
};

export const saveAppSettings = (settings: any) => {
  appSettings = { ...appSettings, ...settings };
  saveConfig();
};
