import { apiService } from './api';

// Type definitions
export interface Storage {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageResponse {
  success: boolean;
  data: Storage | Storage[];
  message?: string;
}

// Storage service with CRUD operations
export const storageService = {
  // Get all storage locations
  getAllStorageLocations: async (): Promise<Storage[]> => {
    try {
      const response = await apiService.get<StorageResponse>('/storage');
      return response.data as Storage[];
    } catch (error) {
      console.error('Error fetching storage locations:', error);
      return [];
    }
  },

  // Get a single storage location by ID
  getStorageLocationById: async (id: string): Promise<Storage | null> => {
    try {
      const response = await apiService.get<StorageResponse>(`/storage/${id}`);
      return response.data as Storage;
    } catch (error) {
      console.error(`Error fetching storage location ${id}:`, error);
      return null;
    }
  },

  // Create a new storage location
  createStorageLocation: async (name: string, location: string): Promise<Storage | null> => {
    try {
      const response = await apiService.post<StorageResponse>('/storage', { name, location });
      return response.data as Storage;
    } catch (error) {
      console.error('Error creating storage location:', error);
      return null;
    }
  },

  // Update an existing storage location
  updateStorageLocation: async (id: string, data: Partial<Storage>): Promise<Storage | null> => {
    try {
      const response = await apiService.put<StorageResponse>(`/storage/${id}`, data);
      return response.data as Storage;
    } catch (error) {
      console.error(`Error updating storage location ${id}:`, error);
      return null;
    }
  },

  // Delete a storage location
  deleteStorageLocation: async (id: string): Promise<boolean> => {
    try {
      const response = await apiService.delete<{ success: boolean }>(`/storage/${id}`);
      return response.success;
    } catch (error) {
      console.error(`Error deleting storage location ${id}:`, error);
      return false;
    }
  }
};