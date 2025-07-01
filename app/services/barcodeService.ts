import { apiService } from './api';

// Type definitions
export interface BarcodeResponse {
  success: boolean;
  data: {
    product: any;
    barcodePath: string;
    barcodeType: string;
  };
  message?: string;
}

export interface BarcodeType {
  value: string;
  label: string;
  description: string;
}

export interface BarcodeTypesResponse {
  success: boolean;
  data: BarcodeType[];
}

// Barcode service
export const barcodeService = {
  // Generate barcode for a product
  generateBarcode: async (productId: string, barcodeType: string = 'code128'): Promise<{ barcodePath: string; product: any; barcodeType: string } | null> => {
    try {
      const response = await apiService.post<BarcodeResponse>('/generate-barcode', { productId, barcodeType });
      return response.data;
    } catch (error) {
      console.error(`Error generating barcode for product ${productId}:`, error);
      return null;
    }
  },

  // Get barcode image URL
  getBarcodeUrl: (productId: string): string => {
    return `http://localhost:3000/api/barcode/${productId}`;
  },

  // Get available barcode types
  getBarcodeTypes: async (): Promise<BarcodeType[]> => {
    try {
      const response = await apiService.get<BarcodeTypesResponse>('/barcode-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching barcode types:', error);
      return [];
    }
  }
};
