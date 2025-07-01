import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import { app } from 'electron';
import { generateQRCode } from '../utils/qr';
import { getRowById, updateRow } from '../utils/excel';

const router = express.Router();

// Ensure QR code directory exists
const getQrCodeDir = (): string => {
  if (process.env.NODE_ENV === 'development') {
    const devPath = path.join(process.cwd(), 'qr-codes');
    fs.ensureDirSync(devPath);
    return devPath;
  } else {
    const userDataPath = app.getPath('userData');
    const qrCodeDir = path.join(userDataPath, 'qr-codes');
    fs.ensureDirSync(qrCodeDir);
    return qrCodeDir;
  }
};

// Generate QR code for a product
router.post('/generate-qr', async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    
    // Get product from Excel
    const product = getRowById('Products', productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Create QR code data
    const qrData = JSON.stringify({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      // Include any other relevant data
    });
    
    // Create filename and path for QR code
    const qrFileName = `product_${product.id}.png`;
    const qrCodeDir = getQrCodeDir();
    const qrFilePath = path.join(qrCodeDir, qrFileName);
    
    // Generate QR code
    await generateQRCode(qrData, qrFilePath);
    
    // Update product in Excel with QR code path
    updateRow('Products', productId, { qrCodePath: qrFilePath });
    
    // Get updated product
    const updatedProduct = getRowById('Products', productId);
    
    res.json({
      success: true,
      data: {
        product: updatedProduct,
        qrCodePath: qrFilePath
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR code' });
  }
});

// Get QR code for a product
router.get('/qr/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get product from Excel
    const product = getRowById('Products', productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (!product.qrCodePath || !fs.existsSync(product.qrCodePath)) {
      return res.status(404).json({ success: false, message: 'QR code not found for this product' });
    }
    
    // Send the QR code image
    res.sendFile(product.qrCodePath);
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch QR code' });
  }
});

export default router;