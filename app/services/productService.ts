import { apiService } from './api';

// Type definitions
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  qrCodePath?: string;
  barcodePath?: string;
  barcodeType?: string;
  description?: string;
  sku?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  success: boolean;
  data: Product | Product[];
  message?: string;
}

// Product service with CRUD operations
export const productService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await apiService.get<ProductResponse>('/products');
      return response.data as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get a single product by ID
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await apiService.get<ProductResponse>(`/products/${id}`);
      return response.data as Product;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  },

  // Create a new product
  createProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'qrCodePath'>): Promise<Product | null> => {
    try {
      const response = await apiService.post<ProductResponse>('/products', product);
      return response.data as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  },

  // Update an existing product
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product | null> => {
    try {
      const response = await apiService.put<ProductResponse>(`/products/${id}`, product);
      return response.data as Product;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      return null;
    }
  },

  // Delete a product
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      const response = await apiService.delete<{ success: boolean }>(`/products/${id}`);
      return response.success;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      return false;
    }
  },

  // Generate QR code for a product
  generateQRCode: async (productId: string): Promise<string | null> => {
    try {
      const response = await apiService.post<{ success: boolean; data: { qrCodePath: string } }>('/generate-qr', { productId });
      return response.data.qrCodePath;
    } catch (error) {
      console.error(`Error generating QR code for product ${productId}:`, error);
      return null;
    }
  },

  // Generate barcode for a product
  generateBarcode: async (productId: string, barcodeType: string = 'code128'): Promise<string | null> => {
    try {
      const response = await apiService.post<{ success: boolean; data: { barcodePath: string } }>('/generate-barcode', { productId, barcodeType });
      return response.data.barcodePath;
    } catch (error) {
      console.error(`Error generating barcode for product ${productId}:`, error);
      return null;
    }
  }
};