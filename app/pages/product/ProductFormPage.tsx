import { ArrowLeft, Package, Save } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/button'
// import { Product } from '../../services/productService'
import {
  useAddProductMutation,
  useGetCategoriesQuery,
  useGetProductQuery,
  useGetProductsQuery,
  useGetStorageLocationsQuery,
  useUpdateProductMutation,
} from '../../store/api/apiSlice'

interface ProductFormData {
  name: string
  category: string
  price: number
  stock: number
  sku: string
  description: string
  location: string
}

// Helper to generate SKU from name
function generateSkuFromName(name: string, products: any[]): string {
  if (!name) return ''
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
  const baseSku = initials
  let counter = 1
  let uniqueSku = baseSku
  while (products.some((p) => (p.sku || '').toUpperCase() === uniqueSku)) {
    counter++
    uniqueSku = `${baseSku}-${counter}`
  }
  return uniqueSku
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    sku: '',
    description: '',
    location: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skuManuallySet, setSkuManuallySet] = useState(false)

  // RTK Query hooks
  const { data: product, isLoading: productLoading } = useGetProductQuery(id!, { skip: !isEditMode })
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery()
  const { data: storageLocations = [], isLoading: storageLoading } = useGetStorageLocationsQuery()
  const { data: products = [] } = useGetProductsQuery()
  const [addProduct] = useAddProductMutation()
  const [updateProduct] = useUpdateProductMutation()

  const isLoading = isEditMode ? productLoading : categoriesLoading || storageLoading

  // Set form data when product data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        sku: product.sku || '',
        description: product.description || '',
        location: product.location || '',
      })
      setSkuManuallySet(true)
    }
  }, [isEditMode, product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (name === 'sku') {
      setSkuManuallySet(value.trim() !== '')
    }
    // Handle numeric inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category) {
      setError('Name and Category are required fields.')
      return
    }

    try {
      setSaving(true)

      if (isEditMode && id) {
        // Update existing product
        await updateProduct({
          id,
          product: {
            name: formData.name,
            category: formData.category,
            price: formData.price,
            stock: formData.stock,
            sku: formData.sku || undefined,
            description: formData.description || undefined,
            location: formData.location || undefined,
          },
        }).unwrap()
      } else {
        // Create new product
        await addProduct({
          name: formData.name,
          category: formData.category,
          price: formData.price,
          stock: formData.stock,
          sku: formData.sku || undefined,
          description: formData.description || undefined,
          location: formData.location || undefined,
        }).unwrap()
      }

      // Navigate back to products list
      navigate('/products')
    } catch (err) {
      console.error('Error saving product:', err)
      setError('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Product Details
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Product Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sku" className="text-sm font-medium">
                    SKU
                  </label>
                  <input
                    id="sku"
                    name="sku"
                    type="text"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder={!skuManuallySet ? generateSkuFromName(formData.name, products) : ''}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {!skuManuallySet && formData.name && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Suggested SKU: <span className="font-mono">{generateSkuFromName(formData.name, products)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Price (IDR) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
                      Rp.
                    </span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full pl-12 pr-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  {formData.price > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {formData.price.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Information & Image Upload */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Inventory Details</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="stock" className="text-sm font-medium">
                    Quantity <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Storage Location
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a location</option>
                    {storageLocations.map((location) => (
                      <option key={location.id} value={location.name}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" asChild>
            <Link to="/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </form>
    </div>
  )
}
