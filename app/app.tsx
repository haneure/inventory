import React from 'react'
import { Provider } from 'react-redux'
import { createHashRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Layout } from './components/ui/Layout'
import CategoryPage from './pages/CategoryPage'
import DashboardPage from './pages/DashboardPage'
import { ProductDetailPage, ProductFormPage, ProductListPage } from './pages/product'
import SettingsPage from './pages/SettingsPage'
import StorageListPage from './pages/StorageListPage'
import { store } from './store/store'

// Wrap the children in the Layout component
const AppLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

const router = createHashRouter([
  {
    // Parent route with layout
    path: '/',
    element: <AppLayout />,
    // Child routes that will be rendered within the layout
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/new', element: <ProductFormPage /> },
      { path: 'products/edit/:id', element: <ProductFormPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'categories', element: <CategoryPage /> },
      { path: 'storage', element: <StorageListPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}
