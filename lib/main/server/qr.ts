import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { generateBarcode, getBarcodeTypes } from '../utils/barcode';
import { getImagesDir, getRowById, updateRow } from '../utils/excel';
import { generateQRCode } from '../utils/qr';

const router = express.Router();

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
    
    // Use SKU as QR code data
    const qrData = product.sku || product.id;
    const skuForFilename = (product.sku || product.id).replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize for filename
    
    // Create filename and path for QR code
    const qrFileName = `qr_${skuForFilename}.png`;
    const qrCodeDir = getImagesDir();
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

// Generate barcode for a product
router.post('/generate-barcode', async (req, res) => {
  try {
    const { productId, barcodeType = 'code128' } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    
    // Get product from Excel
    const product = getRowById('Products', productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Use SKU as barcode data
    const barcodeData = product.sku || product.id;
    const skuForFilename = (product.sku || product.id).replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize for filename
    
    // Create filename and path for barcode
    const barcodeFileName = `barcode_${skuForFilename}.png`;
    const qrCodeDir = getImagesDir(); // Reuse the same directory
    const barcodePath = path.join(qrCodeDir, barcodeFileName);
    
    // Generate barcode with specified type
    await generateBarcode(barcodeData, barcodePath, { bcid: barcodeType });
    
    // Update product in Excel with barcode path
    updateRow('Products', productId, { barcodePath: barcodePath, barcodeType: barcodeType });
    
    // Get updated product
    const updatedProduct = getRowById('Products', productId);
    
    res.json({
      success: true,
      data: {
        product: updatedProduct,
        barcodePath: barcodePath,
        barcodeType: barcodeType
      }
    });
  } catch (error) {
    console.error('Error generating barcode:', error);
    res.status(500).json({ success: false, message: 'Failed to generate barcode' });
  }
});

// Get barcode for a product
router.get('/barcode/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get product from Excel
    const product = getRowById('Products', productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (!product.barcodePath || !fs.existsSync(product.barcodePath)) {
      return res.status(404).json({ success: false, message: 'Barcode not found for this product' });
    }
    
    // Send the barcode image
    res.sendFile(product.barcodePath);
  } catch (error) {
    console.error('Error fetching barcode:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch barcode' });
  }
});

// Get available barcode types
router.get('/barcode-types', (_req, res) => {
  try {
    const types = getBarcodeTypes();
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error fetching barcode types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch barcode types' });
  }
});

export default router;