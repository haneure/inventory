import { apiService } from './api';

// Type definitions
export interface QRCodeResponse {
  success: boolean;
  data: {
    product: any;
    qrCodePath: string;
  };
  message?: string;
}

// QR code service
export const qrCodeService = {
  // Generate QR code for a product
  generateQRCode: async (productId: string): Promise<{ qrCodePath: string; product: any } | null> => {
    try {
      const response = await apiService.post<QRCodeResponse>('/generate-qr', { productId });
      return response.data;
    } catch (error) {
      console.error(`Error generating QR code for product ${productId}:`, error);
      return null;
    }
  },

  // Get QR code image URL
  getQRCodeUrl: (productId: string): string => {
    return `http://localhost:3000/api/qr/${productId}`;
  }
};