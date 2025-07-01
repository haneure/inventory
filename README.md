# 🧾 Inventoria (Electron + React + Excel + QR Code)

This is a cross-platform **inventory management application** designed for **offline, LAN-based usage**. It consists of a **Windows desktop app** built with Electron + React + Express, and a **mobile client** (Android) that connects over the local network.

---

## ⚙️ Tech Stack

| Layer             | Tech Used                                 |
|-------------------|-------------------------------------------|
| Desktop UI        | Electron + React + Vite + TypeScript      |
| Local API Server  | Express.js (Node.js, runs inside Electron)|
| Excel File Access | `xlsx` Node.js package                    |
| QR Code Generator | `qrcode` Node.js package                  |
| File Storage      | Local PNG files (`qr-codes/`)             |
| Android Client    | Flutter or native (Kotlin/Java) app       |

---

## 🔄 App Flow Summary

### 1. 🖥 Windows App (Main Application)

- Acts as the **central hub** of the system.
- Hosts:
  - A GUI for adding/editing products
  - A **local Express server** for handling API requests
- Uses **Excel** as the primary data storage (no SQL DB involved).
- Generates and saves **QR code images locally**, and saves the file path to Excel.
- CRUD Product in the app

### 2. 📱 Android App (Client)

- A lightweight client that connects to the Windows app **via LAN**.
- Performs **QR code scans** and sends HTTP requests to the Windows app.
- Cannot function without a connection to the Windows app (no offline mode).

---

## 🗃️ Data Flow

```text
         Local Network (WiFi / LAN)
        ┌─────────────────────────────┐
        │                             │
        │     📱 Android App          │
        │   - Connects via HTTP API   │
        │   - Scans QR and sends code │
        │                             │
        └────────────┬────────────────┘
                     │ HTTP (Port 3000)
                     ▼
        ┌─────────────────────────────┐
        │     🖥 Windows App (Electron)│
        │   - React UI for admin      │
        │   - Express.js server       │
        │   - Excel as DB (xlsx)      │
        │   - QR code saved as .png   │
        └─────────────────────────────┘
