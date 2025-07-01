import {
  ArrowLeft,
  Barcode,
  CircleDollarSign,
  ClipboardList,
  Edit,
  Package,
  Printer,
  QrCode,
  Tag,
  Trash2,
} from 'lucide-react'
import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { barcodeService } from '../../services/barcodeService'
import { qrCodeService } from '../../services/qrCodeService'
import {
  useDeleteProductMutation,
  useGenerateBarcodeMutation,
  useGenerateQRCodeMutation,
  useGetProductQuery,
} from '../../store/api/apiSlice'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'qr' | 'barcode'>('qr')

  // Use RTK Query hooks
  const { data: product, isLoading, isError } = useGetProductQuery(id!)
  const [deleteProduct] = useDeleteProductMutation()
  const [generateQRCode] = useGenerateQRCodeMutation()
  const [generateBarcode] = useGenerateBarcodeMutation()

  const handleGenerateQRCode = async () => {
    if (!id) return

    try {
      await generateQRCode(id)
    } catch (err) {
      setError('Failed to generate QR code')
      console.error('Error generating QR code:', err)
    }
  }

  const handleGenerateBarcode = async () => {
    if (!id) return

    try {
      await generateBarcode({ productId: id, barcodeType: 'code128' })
    } catch (err) {
      setError('Failed to generate barcode')
      console.error('Error generating barcode:', err)
    }
  }

  const handleDeleteProduct = async () => {
    if (!id) return

    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const success = await deleteProduct(id).unwrap()
        if (success) {
          // Navigate back to product list
          window.location.href = '/products'
        } else {
          setError('Failed to delete product')
        }
      } catch (err) {
        setError('Error deleting product')
        console.error('Error deleting product:', err)
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading product details...</div>
  }

  if (isError || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Product Not Found</h1>
        </div>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error || 'The requested product could not be found.'}
        </div>
        <Button asChild>
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    )
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
          <h1 className="text-2xl font-bold">Product Details</h1>
          <Badge variant="secondary" className="ml-2">
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/products/edit/${product.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteProduct}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Product Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Product Name</p>
                <p className="font-medium">{product.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-medium">{product.sku || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium flex items-center">
                  <Tag className="mr-1 h-3 w-3" />
                  {product.category}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium flex items-center">
                  <CircleDollarSign className="mr-1 h-3 w-3" />
                  {product.price > 0
                    ? product.price.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      })
                    : '-'}
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{product.description || 'No description available.'}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Inventory Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{product.stock}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{product.location || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Generation Section */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab('qr')}
                className={`px-4 py-2 rounded-md transition-colors flex items-center ${
                  activeTab === 'qr'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <QrCode className="mr-2 h-4 w-4" />
                QR Code
              </button>
              <button
                onClick={() => setActiveTab('barcode')}
                className={`px-4 py-2 rounded-md transition-colors flex items-center ${
                  activeTab === 'barcode'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Barcode className="mr-2 h-4 w-4" />
                Barcode
              </button>
            </div>
          </div>

          {activeTab === 'qr' ? (
            <div className="flex flex-col items-center justify-center">
              {product.qrCodePath ? (
                <>
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <img
                      src={qrCodeService.getQRCodeUrl(product.id)}
                      alt="Product QR Code"
                      className="w-48 h-48 object-cover"
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(qrCodeService.getQRCodeUrl(product.id), '_blank')}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Download QR Code
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.print()}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print QR Code
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">No QR code generated yet</p>
                  <Button onClick={handleGenerateQRCode}>
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              {product.barcodePath ? (
                <>
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <img
                      src={barcodeService.getBarcodeUrl(product.id)}
                      alt="Product Barcode"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(barcodeService.getBarcodeUrl(product.id), '_blank')}
                    >
                      <Barcode className="mr-2 h-4 w-4" />
                      Download Barcode
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.print()}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print Barcode
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">No barcode generated yet</p>
                  <p className="text-sm text-muted-foreground">Code 128 format will be used</p>

                  <Button onClick={handleGenerateBarcode}>
                    <Barcode className="mr-2 h-4 w-4" />
                    Generate Barcode
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
