# 🗂️ App Pages & Folder Structure Plan

This document outlines the **screens/pages**, **folder structure**, and **core functionality** for the Windows Electron inventory app using Excel as a local database.

---

## 🖥️ App Pages (Renderer - React)

| Page / Component       | Purpose                                         |
|------------------------|-------------------------------------------------|
| `DashboardPage`        | View summary, total products, quick stats       |
| `ProductListPage`      | List all products with search/sort/filter       |
| `ProductFormPage`      | Add/Edit a product, auto-generate QR & code     |
| `ProductDetailPage`    | View product details, including QR code         |
| `CategoryPage`         | Manage product categories                       |
| `StorageListPage`      | View per-location stock (from `storage` table)  |
| `SettingsPage`         | QR save path, Excel file path, server port, etc |

> 💡 All pages are React components inside `src/renderer/pages/` and organized with routes.

---

## 📁 Recommended Folder Structure

├── public/
│ └── ... # Static files
├── qr-codes/ # Saved PNG QR code images
├── database/
│ └── data.xlsx # Excel file (acts as main DB)
├── src/
│ ├── main/ # Electron main process
│ │ ├── server/ # Express API routes & logic
│ │ │ ├── product.ts # Routes for product CRUD
│ │ │ ├── qr.ts # QR generation API
│ │ │ └── storage.ts # Routes for storage table
│ │ ├── utils/ # Excel & QR helper logic
│ │ │ ├── excel.ts # Read/write Excel sheets
│ │ │ └── qr.ts # QR code generator
│ │ └── index.ts # Electron + Express entry point
│ ├── preload/ # Electron preload logic
│ └── renderer/ # React UI
│ ├── pages/ # All pages (Dashboard, ProductForm, etc)
│ ├── components/ # Shared UI components
│ ├── hooks/ # React hooks (data fetching, etc)
│ ├── services/ # Fetch API wrappers (axios or fetch)
│ └── App.tsx # React entry point
├── vite.config.ts
├── electron.vite.config.ts
└── ...

---

## 📊 Excel File as Database

- File path: `database/data.xlsx`
- Tables:
  - `product`
  - `category`
  - `product_category` (many-to-many map)
  - `storage`

> ⚠️ Ensure the `database/` folder exists before reading/writing.

---

## 🛠️ Core Functions (Backend)

### 📁 `src/main/utils/excel.ts`
```ts
export function readSheet(sheetName: string): any[] { ... }
export function writeSheet(sheetName: string, data: any[]): void { ... }
export function appendToSheet(sheetName: string, row: any): void { ... }
export function updateRow(sheetName: string, id: string, newData: any): void { ... }
