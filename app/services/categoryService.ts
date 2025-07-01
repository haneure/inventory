import { apiService } from './api';

// Type definitions
export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  data: Category | Category[];
  message?: string;
}

// Category service with CRUD operations
export const categoryService = {
  // Get all categories
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiService.get<CategoryResponse>('/categories');
      return response.data as Category[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get a single category by ID
  getCategoryById: async (id: string): Promise<Category | null> => {
    try {
      const response = await apiService.get<CategoryResponse>(`/categories/${id}`);
      return response.data as Category;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return null;
    }
  },

  // Create a new category
  createCategory: async (name: string): Promise<Category | null> => {
    try {
      const response = await apiService.post<CategoryResponse>('/categories', { name });
      return response.data as Category;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  },

  // Update an existing category
  updateCategory: async (id: string, name: string): Promise<Category | null> => {
    try {
      const response = await apiService.put<CategoryResponse>(`/categories/${id}`, { name });
      return response.data as Category;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      return null;
    }
  },

  // Delete a category
  deleteCategory: async (id: string): Promise<boolean> => {
    try {
      const response = await apiService.delete<{ success: boolean }>(`/categories/${id}`);
      return response.success;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      return false;
    }
  }
};