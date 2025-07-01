import bwipjs from 'bwip-js';
import fs from 'fs-extra';

export interface BarcodeOptions {
  bcid: string; // Barcode type (e.g., 'code128', 'ean13', 'upca', etc.)
  text: string; // Text to encode
  scale: number; // Scaling factor
  height: number; // Height in millimeters
  includetext?: boolean; // Include human-readable text
  textxalign?: 'center' | 'left' | 'right'; // Text alignment
}

export async function generateBarcode(data: string, filePath: string, options?: Partial<BarcodeOptions>): Promise<void> {
  try {
    const defaultOptions: BarcodeOptions = {
      bcid: 'code128', // Default to Code 128
      text: data,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center'
    };

    const finalOptions = { ...defaultOptions, ...options, text: data };

    // Generate barcode as PNG buffer
    const pngBuffer = await bwipjs.toBuffer(finalOptions);
    
    // Write to file
    await fs.writeFile(filePath, pngBuffer);
  } catch (error) {
    console.error('Error generating barcode:', error);
    throw error;
  }
}

// Get available barcode types
export const getBarcodeTypes = () => {
  return [
    { value: 'code128', label: 'Code 128', description: 'Most versatile, supports all ASCII characters' },
    { value: 'code39', label: 'Code 39', description: 'Supports letters, numbers, and some symbols' },
    { value: 'ean13', label: 'EAN-13', description: '13-digit European Article Number' },
    { value: 'ean8', label: 'EAN-8', description: '8-digit European Article Number' },
    { value: 'upca', label: 'UPC-A', description: '12-digit Universal Product Code' },
    { value: 'upce', label: 'UPC-E', description: '8-digit Universal Product Code' },
    { value: 'interleaved2of5', label: 'Interleaved 2 of 5', description: 'Numeric only, high density' },
    { value: 'datamatrix', label: 'Data Matrix', description: '2D matrix barcode' }
  ];
};
