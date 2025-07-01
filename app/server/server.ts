import { app, BrowserWindow } from 'electron';
import path from 'path';
import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';

// Import API routes
import productRouter from '../../lib/main/server/product';
import categoryRouter from '../../lib/main/server/category';
import storageRouter from '../../lib/main/server/storage';
import qrRouter from '../../lib/main/server/qr';

// Import Excel utility to initialize database
import { initializeExcelFile } from '../../lib/main/utils/excel';

let mainWindow: BrowserWindow | null = null;

// Initialize Excel database
initializeExcelFile();

// Setup Express App
const api = express();
api.use(cors());
api.use(express.json());

// Ensure QR code directory exists
const qrFolder = path.join(process.env.NODE_ENV === 'development' ? process.cwd() : app.getPath('userData'), 'qr-codes');
fs.ensureDirSync(qrFolder);

// Serve QR images as static files
api.use('/qr-codes', express.static(qrFolder));

// Register API routes
api.use('/api', productRouter);
api.use('/api', categoryRouter);
api.use('/api', storageRouter);
api.use('/api', qrRouter);

// Basic health check endpoint
api.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Launch Express server
const PORT = 3000;
api.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

// const createWindow = async () => {
//   mainWindow = new BrowserWindow({
//     width: 1000,
//     height: 700,
//     webPreferences: {
//       preload: path.join(__dirname, '../preload/index.js'),
//     },
//   });

//   if (process.env.VITE_DEV_SERVER_URL) {
//     mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
//   } else {
//     mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
//   }
// };

// app.whenReady().then(createWindow);

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });
