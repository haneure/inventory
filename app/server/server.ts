import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'

let mainWindow: BrowserWindow | null = null

// Setup Express App
const api = express()
api.use(cors())
api.use(express.json())

// Serve QR images
const qrFolder = path.join(__dirname, 'qr-codes')
if (!fs.existsSync(qrFolder)) fs.mkdirSync(qrFolder)

api.use('/qr-codes', express.static(qrFolder))

// Example endpoint: generate QR and save image
api.post('/generate-qr', async (req, res) => {
  const { code } = req.body
  if (!code) return res.status(400).send('Missing code')

  const filePath = path.join(qrFolder, `${code}.png`)
  await QRCode.toFile(filePath, code)

  // Optional: Save path to Excel here if needed

  res.json({ path: `/qr-codes/${code}.png` })
})

// Launch Express server
api.listen(3000, () => {
  console.log('API server running on http://localhost:3000')
})

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
