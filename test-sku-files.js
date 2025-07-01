// Test script to verify QR code and barcode generation
const { readSheet, getImagesDir } = require('./lib/main/utils/excel.ts');
const fs = require('fs');
const path = require('path');

console.log('Testing QR code and barcode generation...');

// Get images directory
const imagesDir = getImagesDir();
console.log('Images directory:', imagesDir);

// Check if images directory exists
if (fs.existsSync(imagesDir)) {
  console.log('Images directory exists');
  
  // List files in images directory
  const files = fs.readdirSync(imagesDir);
  console.log('Files in images directory:', files);
} else {
  console.log('Images directory does not exist yet');
}

// Test product creation via API
const testCreateProduct = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Product for SKU',
        category: 'Electronics',
        price: 99.99,
        stock: 10,
        sku: 'TEST-SKU-001'
      }),
    });
    
    const result = await response.json();
    console.log('Product creation result:', result);
    
    // Check files again
    setTimeout(() => {
      const files = fs.readdirSync(imagesDir);
      console.log('Files after product creation:', files);
      
      // Look for SKU-based files
      const qrFile = files.find(f => f.includes('qr_TEST-SKU-001'));
      const barcodeFile = files.find(f => f.includes('barcode_TEST-SKU-001'));
      
      console.log('QR code file found:', qrFile);
      console.log('Barcode file found:', barcodeFile);
    }, 1000);
    
  } catch (error) {
    console.error('Error testing product creation:', error);
  }
};

// Wait for server to be ready, then test
setTimeout(testCreateProduct, 3000);
