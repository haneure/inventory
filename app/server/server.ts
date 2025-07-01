import cors from 'cors';
import { BrowserWindow } from 'electron';
import express from 'express';
import fs from 'fs-extra';

// Import API routes
import categoryRouter from '../../lib/main/server/category';
import productRouter from '../../lib/main/server/product';
import qrRouter from '../../lib/main/server/qr';
import storageRouter from '../../lib/main/server/storage';

// Import Excel utility to initialize database
import { getImagesDir, initializeExcelFile } from '../../lib/main/utils/excel';

const mainWindow: BrowserWindow | null = null;

// Initialize Excel database
initializeExcelFile();

// Setup Express App
const api = express();
api.use(cors());
api.use(express.json());

// Ensure images directory exists (replaces old qr-codes folder)
const imagesFolder = getImagesDir();
fs.ensureDirSync(imagesFolder);

// Serve QR and barcode images as static files from the images directory
api.use('/images', express.static(imagesFolder));

// For backward compatibility, also serve from /qr-codes path
api.use('/qr-codes', express.static(imagesFolder));

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
