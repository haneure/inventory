import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readSheet, appendToSheet, updateRow, deleteRow, getRowById } from '../utils/excel';

const router = express.Router();

// Get all products
router.get('/products', (req, res) => {
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
router.post('/products', (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    
    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }
    
    // Create new product
    const newProduct = {
      id: uuidv4(),
      name,
      category,
      price: price || 0,
      stock: stock || 0,
      qrCodePath: '', // Will be updated later with QR code
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to Excel
    appendToSheet('Products', newProduct);
    
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Failed to add product' });
  }
});

// Update a product
router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, qrCodePath } = req.body;
    
    // Check if product exists
    const existingProduct = getRowById('Products', id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Update product data
    const updatedData = {
      ...(name && { name }),
      ...(category && { category }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(qrCodePath && { qrCodePath }),
      updatedAt: new Date().toISOString()
    };
    
    // Update in Excel
    updateRow('Products', id, updatedData);
    
    // Get updated product
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
    
    // Delete from Excel
    deleteRow('Products', id);
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

export default router;