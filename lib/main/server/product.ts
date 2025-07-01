import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { generateBarcode } from '../utils/barcode';
import { appendToSheet, deleteRow, getImagesDir, getRowById, readSheet, updateRow } from '../utils/excel';
import { generateQRCode } from '../utils/qr';

const router = express.Router();

// Helper function to auto-generate QR code and barcode for a product
const generateCodesForProduct = async (product: any): Promise<{ qrCodePath: string; barcodePath: string }> => {
  const qrData = product.sku || product.id;
  const skuForFilename = (product.sku || product.id).replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize for filename
  
  // Create filenames and paths
  const qrFileName = `qr_${skuForFilename}.png`;
  const barcodeFileName = `barcode_${skuForFilename}.png`;
  const codesDir = getImagesDir();
  const qrFilePath = path.join(codesDir, qrFileName);
  const barcodePath = path.join(codesDir, barcodeFileName);
  
  // Generate both codes
  await generateQRCode(qrData, qrFilePath);
  await generateBarcode(qrData, barcodePath, { bcid: 'code128' });
  
  return { qrCodePath: qrFilePath, barcodePath };
};

// Get all products
router.get('/products', (_req, res) => {
  try {
    const products = readSheet('Products');
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// Get a single product by ID
router.get('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = getRowById('Products', id);
    
    if (product) {
      res.json({ success: true, data: product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// Add a new product
router.post('/products', async (req, res) => {
  try {
    const { name, category, price, stock, sku } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    // Generate SKU if not provided
    let generatedSku = sku;
    if (!generatedSku || generatedSku.trim() === '') {
      // Use initials from name (alphanumeric only, uppercase)
      const initials = name
        .split(/\s+/)
        .map(word => word[0])
        .join('')
        .replace(/[^A-Z0-9]/gi, '')
        .toUpperCase();

      // Get all products to check for existing SKUs
      const products = readSheet('Products');
      const baseSku = initials;
      let counter = 1;
      let uniqueSku = baseSku;
      while (products.some(p => (p.sku || '').toUpperCase() === uniqueSku)) {
        counter++;
        uniqueSku = `${baseSku}-${counter}`;
      }
      generatedSku = uniqueSku;
    }

    // Create new product
    const newProduct = {
      id: uuidv4(),
      name,
      category,
      price: price || 0,
      stock: stock || 0,
      sku: generatedSku,
      qrCodePath: '',
      barcodePath: '',
      barcodeType: 'code128',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to Excel first
    appendToSheet('Products', newProduct);

    // Auto-generate QR code and barcode
    try {
      const { qrCodePath, barcodePath } = await generateCodesForProduct(newProduct);
      
      // Update product with code paths
      updateRow('Products', newProduct.id, { 
        qrCodePath: qrCodePath, 
        barcodePath: barcodePath,
        barcodeType: 'code128'
      });
      
      // Get updated product for response
      const updatedProduct = getRowById('Products', newProduct.id);
      res.status(201).json({ success: true, data: updatedProduct });
    } catch (codeError) {
      console.error('Error generating codes:', codeError);
      // Return product without codes if generation fails
      res.status(201).json({ 
        success: true, 
        data: newProduct,
        warning: 'Product created but QR code/barcode generation failed'
      });
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Failed to add product' });
  }
});

// Update a product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, sku, qrCodePath } = req.body;
    
    // Check if product exists
    const existingProduct = getRowById('Products', id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Check if SKU changed
    const skuChanged = sku !== undefined && sku !== existingProduct.sku;
    
    // Update product data
    const updatedData = {
      ...(name && { name }),
      ...(category && { category }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(sku !== undefined && { sku }),
      ...(qrCodePath && { qrCodePath }),
      updatedAt: new Date().toISOString()
    };
    
    // Update in Excel first
    updateRow('Products', id, updatedData);
    
    // If SKU changed, regenerate QR code and barcode
    if (skuChanged) {
      try {
        // Clean up old files first
        if (existingProduct.qrCodePath && fs.existsSync(existingProduct.qrCodePath)) {
          fs.unlinkSync(existingProduct.qrCodePath);
        }
        if (existingProduct.barcodePath && fs.existsSync(existingProduct.barcodePath)) {
          fs.unlinkSync(existingProduct.barcodePath);
        }
        
        const productToUpdate = getRowById('Products', id);
        const { qrCodePath: newQrPath, barcodePath: newBarcodePath } = await generateCodesForProduct(productToUpdate);
        
        // Update with new code paths
        updateRow('Products', id, { 
          qrCodePath: newQrPath, 
          barcodePath: newBarcodePath,
          barcodeType: 'code128'
        });
      } catch (codeError) {
        console.error('Error regenerating codes after SKU change:', codeError);
        // Continue without failing the update
      }
    }
    
    // Get final updated product
    const updatedProduct = getRowById('Products', id);
    
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = getRowById('Products', id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete QR code and barcode files if they exist
    if (existingProduct.qrCodePath) {
      try {
        if (fs.existsSync(existingProduct.qrCodePath)) {
          fs.unlinkSync(existingProduct.qrCodePath);
        }
      } catch (err) {
        console.warn('Failed to delete QR code file:', err);
      }
    }

    if (existingProduct.barcodePath) {
      try {
        if (fs.existsSync(existingProduct.barcodePath)) {
          fs.unlinkSync(existingProduct.barcodePath);
        }
      } catch (err) {
        console.warn('Failed to delete barcode file:', err);
      }
    }

    // Delete from Excel
    deleteRow('Products', id);

    res.json({ success: true, message: 'Product, QR code, and barcode deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

export default router;