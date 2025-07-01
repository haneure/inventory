import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const testProductCreation = async () => {
  try {
    console.log('Testing product creation...');
    
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Product SKU',
        category: 'Electronics',
        price: 99.99,
        stock: 10,
        sku: 'TEST-SKU-001'
      }),
    });
    
    const result = await response.json();
    console.log('Product creation result:', JSON.stringify(result, null, 2));
    
    // Check the images directory
    const imagesDir = path.join(process.cwd(), 'images');
    console.log('Checking images directory:', imagesDir);
    
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      console.log('Files in images directory:', files);
      
      // Look for SKU-based files
      const qrFile = files.find(f => f.includes('qr_TEST-SKU-001'));
      const barcodeFile = files.find(f => f.includes('barcode_TEST-SKU-001'));
      
      console.log('QR code file found:', qrFile);
      console.log('Barcode file found:', barcodeFile);
    } else {
      console.log('Images directory does not exist');
    }
    
  } catch (error) {
    console.error('Error testing product creation:', error);
  }
};

testProductCreation();
