import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Tag, 
  Archive, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { productService, Product } from '../services/productService';
import { categoryService, Category } from '../services/categoryService';
import { storageService, Storage } from '../services/storageService';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storageLocations, setStorageLocations] = useState<Storage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData, storageData] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getAllCategories(),
          storageService.getAllStorageLocations()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
        setStorageLocations(storageData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate low stock items (less than 10 in stock)
  const lowStockItems = products.filter(product => product.stock < 10);

  // Generate mock recent activity (this would normally come from a dedicated activity log)
  const recentActivity = products.slice(0, 5).map((product, index) => ({
    id: index,
    type: index % 3 === 0 ? 'update' : index % 2 === 0 ? 'add' : 'edit',
    productName: product.name,
    details: index % 3 === 0 
      ? `stock updated to ${product.stock} units` 
      : index % 2 === 0 
      ? 'added to inventory' 
      : 'information updated',
    time: `${index + 1}h ago`
  }));

  if (loading) {
    return <div className="flex justify-center p-8">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Reports
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <h3 className="text-2xl font-bold mt-1">{products.length}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Link to="/products" className="text-primary flex items-center">
              <LinkIcon className="mr-1 h-3 w-3" />
              View all products
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <h3 className="text-2xl font-bold mt-1">{categories.length}</h3>
            </div>
            <div className="bg-secondary/10 p-2 rounded-full">
              <Tag className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Link to="/categories" className="text-secondary flex items-center">
              <LinkIcon className="mr-1 h-3 w-3" />
              View all categories
            </Link>
          </div>
        </div>

        {/* Storage Locations */}
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Storage Locations</p>
              <h3 className="text-2xl font-bold mt-1">{storageLocations.length}</h3>
            </div>
            <div className="bg-accent/10 p-2 rounded-full">
              <Archive className="h-5 w-5 text-accent-foreground" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Link to="/storage" className="text-accent-foreground flex items-center">
              <LinkIcon className="mr-1 h-3 w-3" />
              View all locations
            </Link>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <h3 className="text-2xl font-bold mt-1">{lowStockItems.length}</h3>
            </div>
            <div className="bg-destructive/10 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {lowStockItems.length > 0 ? (
              <Badge variant="destructive" className="flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                {lowStockItems.length} items need restocking
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center">
                <TrendingDown className="mr-1 h-3 w-3" />
                All items in stock
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity and Low Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center p-4">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.type === 'update' ? 'bg-yellow-100 text-yellow-700' : 
                    item.type === 'add' ? 'bg-green-100 text-green-700' : 
                    'bg-blue-100 text-blue-700'
                  } mr-3`}>
                    {item.type === 'update' ? '🔄' : item.type === 'add' ? '➕' : '✏️'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {item.type === 'update' ? 'Stock Updated' : 
                      item.type === 'add' ? 'New Product Added' : 
                      'Product Edited'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.productName} {item.details}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/products">View All Products</Link>
            </Button>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Low Stock Items</h2>
          {lowStockItems.length === 0 ? (
            <p className="text-muted-foreground text-center p-4">All items have sufficient stock</p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-secondary/10 rounded-md flex items-center justify-center mr-3">
                      <Package className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku || 'No SKU'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={product.stock < 5 ? "destructive" : "secondary"} className="mr-2">
                      {product.stock} left
                    </Badge>
                    <Link to={`/products/edit/${product.id}`}>
                      <Button variant="outline" size="sm">
                        Restock
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div className="mt-4">
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/products">View All Low Stock</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}