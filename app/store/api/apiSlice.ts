import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Category, CategoryResponse } from '../../services/categoryService';
import { Product, ProductResponse } from '../../services/productService';
import { Storage, StorageResponse } from '../../services/storageService';

// Base API configuration
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api' }),
  tagTypes: ['Product', 'Category', 'Storage'],
  endpoints: (builder) => ({
    // Product endpoints
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      transformResponse: (response: ProductResponse) => response.data as Product[],
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: ProductResponse) => response.data as Product,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    addProduct: builder.mutation<Product, Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'qrCodePath'>>({
      query: (product) => ({
        url: '/products',
        method: 'POST',
        body: product,
      }),
      transformResponse: (response: ProductResponse) => response.data as Product,
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: string; product: Partial<Product> }>({
      query: ({ id, product }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: product,
      }),
      transformResponse: (response: ProductResponse) => response.data as Product,
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, 'Product'],
    }),
    deleteProduct: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean }) => response.success,
      invalidatesTags: ['Product'],
    }),
    generateQRCode: builder.mutation<string, string>({
      query: (productId) => ({
        url: '/generate-qr',
        method: 'POST',
        body: { productId },
      }),
      transformResponse: (response: { success: boolean; data: { qrCodePath: string } }) => response.data.qrCodePath,
      invalidatesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    generateBarcode: builder.mutation<string, { productId: string; barcodeType?: string }>({
      query: ({ productId, barcodeType = 'code128' }) => ({
        url: '/generate-barcode',
        method: 'POST',
        body: { productId, barcodeType },
      }),
      transformResponse: (response: { success: boolean; data: { barcodePath: string } }) => response.data.barcodePath,
      invalidatesTags: (result, error, args) => [{ type: 'Product', id: args.productId }],
    }),
    getBarcodeTypes: builder.query<{ value: string; label: string; description: string }[], void>({
      query: () => '/barcode-types',
      transformResponse: (response: { success: boolean; data: any[] }) => response.data,
    }),

    // Category endpoints
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      transformResponse: (response: CategoryResponse) => response.data as Category[],
      providesTags: ['Category'],
    }),
    getCategory: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      transformResponse: (response: CategoryResponse) => response.data as Category,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
    addCategory: builder.mutation<Category, { name: string }>({
      query: (category) => ({
        url: '/categories',
        method: 'POST',
        body: category,
      }),
      transformResponse: (response: CategoryResponse) => response.data as Category,
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: { name },
      }),
      transformResponse: (response: CategoryResponse) => response.data as Category,
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category'],
    }),
    deleteCategory: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean }) => response.success,
      invalidatesTags: ['Category'],
    }),

    // Storage endpoints
    getStorageLocations: builder.query<Storage[], void>({
      query: () => '/storage',
      transformResponse: (response: StorageResponse) => response.data as Storage[],
      providesTags: ['Storage'],
    }),
    getStorageLocation: builder.query<Storage, string>({
      query: (id) => `/storage/${id}`,
      transformResponse: (response: StorageResponse) => response.data as Storage,
      providesTags: (result, error, id) => [{ type: 'Storage', id }],
    }),
    addStorageLocation: builder.mutation<Storage, { name: string; location: string }>({
      query: (storage) => ({
        url: '/storage',
        method: 'POST',
        body: storage,
      }),
      transformResponse: (response: StorageResponse) => response.data as Storage,
      invalidatesTags: ['Storage'],
    }),
    updateStorageLocation: builder.mutation<Storage, { id: string; storage: { name?: string; location?: string } }>({
      query: ({ id, storage }) => ({
        url: `/storage/${id}`,
        method: 'PUT',
        body: storage,
      }),
      transformResponse: (response: StorageResponse) => response.data as Storage,
      invalidatesTags: (result, error, { id }) => [{ type: 'Storage', id }, 'Storage'],
    }),
    deleteStorageLocation: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/storage/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean }) => response.success,
      invalidatesTags: ['Storage'],
    }),
  }),
});

// Export the auto-generated hooks for each endpoint
export const {
  useGetProductsQuery,
  useGetProductQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGenerateQRCodeMutation,
  useGenerateBarcodeMutation,
  useGetBarcodeTypesQuery,
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetStorageLocationsQuery,
  useGetStorageLocationQuery,
  useAddStorageLocationMutation,
  useUpdateStorageLocationMutation,
  useDeleteStorageLocationMutation,
} = apiSlice;