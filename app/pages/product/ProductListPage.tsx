import { ArrowUpDown, Barcode, Edit, Eye, Filter, Plus, QrCode, Search, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import {
  useDeleteProductMutation,
  useGenerateBarcodeMutation,
  useGenerateQRCodeMutation,
  useGetProductsQuery,
} from '../../store/api/apiSlice'

export default function ProductListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  // Use RTK Query hooks
  const { data: products = [], isLoading, error } = useGetProductsQuery()
  const [deleteProduct] = useDeleteProductMutation()
  const [generateQRCode] = useGenerateQRCodeMutation()
  const [generateBarcode] = useGenerateBarcodeMutation()

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle product deletion
  const handleDeleteProduct = async (id: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id)
        // RTK Query will automatically update the cache
      } catch (err) {
        console.error('Error deleting product:', err)
      }
    }
  }

  // Handle QR code generation
  const handleGenerateQRCode = async (id: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    try {
      const qrCodePath = await generateQRCode(id)
      if (qrCodePath) {
        // Navigate to product detail page to view the QR code
        navigate(`/products/${id}`)
      }
    } catch (err) {
      console.error('Error generating QR code:', err)
    }
  }

  // Handle barcode generation
  const handleGenerateBarcode = async (id: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    try {
      const barcodePath = await generateBarcode({ productId: id, barcodeType: 'code128' })
      if (barcodePath) {
        // Navigate to product detail page to view the barcode
        navigate(`/products/${id}`)
      }
    } catch (err) {
      console.error('Error generating barcode:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Error message */}
      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error.toString()}</div>}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <p>Loading products...</p>
        </div>
      ) : (
        /* Products Table using shadcn/ui Table */
        <div className="border border-border rounded-lg overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No products found. {searchTerm ? 'Try a different search term.' : 'Add your first product!'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center">
                      Product
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      SKU
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Category
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Quantity
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Price
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.sku || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {product.stock}
                        {product.stock < 10 && (
                          <Badge variant="destructive" className="ml-2">
                            Low
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.price > 0
                        ? product.price.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/products/${product.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/products/edit/${product.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleGenerateQRCode(product.id, e)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleGenerateBarcode(product.id, e)}
                        >
                          <Barcode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => handleDeleteProduct(product.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{filteredProducts.length}</span> of{' '}
                <span className="font-medium">{products.length}</span> products
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
