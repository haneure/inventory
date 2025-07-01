import React from 'react';
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ProductListPage from './pages/ProductListPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import StorageListPage from './pages/StorageListPage';
import SettingsPage from './pages/SettingsPage';
import { Layout } from './components/ui/Layout';
import { Provider } from 'react-redux';
import { store } from './store/store';

// Wrap the children in the Layout component
const AppLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

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
  }
]);

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
