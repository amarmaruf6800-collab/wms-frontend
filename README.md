# 📦 ALG-WMS

> Full-stack Warehouse Management System for managing products, inventory, warehouses, orders, stock movements, and operational workflows.

ALG-WMS is a web-based warehouse management system designed to model practical warehouse operations from inventory receiving to picking, packing, shipping, returns, and reporting.

The application uses **React + Vite + Tailwind CSS** for the frontend and **Node.js + Express + Prisma** for the backend.

---

## 🌐 Live Demo

**Frontend:**  
https://alg-wms.vercel.app

> The live demo is intended for portfolio and demonstration purposes.

---

## 📸 Preview

![ALG-WMS Preview](./docs/preview.png)

---

## ✨ Features

### 📊 Dashboard

- Total active products
- Warehouse overview
- Total stock
- Low-stock monitoring
- Out-of-stock monitoring
- Operational summary

### 📦 Product Management

- Create products
- Edit products
- Product search
- Search by SKU or product name
- Minimum stock configuration
- Product activation/deactivation
- Product list refresh

### 🏭 Warehouse & Inventory

- Warehouse management
- Inventory lookup
- Inventory filtering
- Stock quantity tracking
- Stock movement history
- Warehouse-based inventory management

### 📥 Receiving

- Receive incoming stock
- Record receiving transactions
- Increase inventory through receiving workflow
- Track receiving operations

### 📤 Outbound & Picking

- Create outbound operations
- Picking workflow
- Stock availability validation
- Decrease inventory during outbound processing
- Track outbound transactions

### 📦 Packing & Shipping

- Packing workflow
- Shipping workflow
- Order fulfillment process
- Operational status tracking

### 🧾 Sales Orders

- Sales order management
- Order item management
- Order fulfillment workflow
- Integration with inventory operations

### 🔄 Stock Transfer

- Transfer stock between warehouse locations
- Record stock movement
- Maintain inventory consistency

### ↩️ Returns

- Return item management
- Return processing
- Inventory-related return workflow

### 👥 Customer Management

- Customer data management
- Customer-related order information

### 📋 Audit Trail

- Track important operational activities
- Maintain activity history for system operations

### 📈 Reports

- Inventory-related information
- Operational reporting
- Stock and warehouse data

### 🔐 Authentication

- User authentication
- JWT-based authentication
- Protected application routes
- Role-aware access

---

## 🧱 Architecture

```text
                         ALG-WMS

┌──────────────────────────────────────┐
│          React + Vite                │
│          Tailwind CSS                │
│                                      │
│ Dashboard • Products • Inventory     │
│ Receiving • Picking • Orders         │
│ Packing • Shipping • Reports         │
└──────────────────┬───────────────────┘
                   │
                   │ HTTPS / REST API
                   ▼
┌──────────────────────────────────────┐
│         Node.js + Express            │
│                                      │
│ JWT Authentication                   │
│ Product API                          │
│ Inventory API                        │
│ Receiving API                        │
│ Picking / Outbound API               │
│ Sales Order API                      │
│ Returns API                          │
└──────────────────┬───────────────────┘
                   │
                   │ Prisma ORM
                   ▼
┌──────────────────────────────────────┐
│             TiDB Cloud               │
│          MySQL-compatible             │
└──────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- JavaScript

### Backend

- Node.js
- Express.js
- Prisma
- JWT
- bcrypt

### Database

- TiDB Cloud
- MySQL-compatible SQL database

### Deployment

- Vercel
- Linux VPS
- PM2

---

## ☁️ Deployment

ALG-WMS is deployed using a separated frontend and backend architecture:

```text
Vercel
React + Vite
      │
      │ HTTPS
      ▼
Biznet Gio VPS
Node.js + Express
PM2
      │
      │ MySQL/TLS
      ▼
TiDB Cloud
```

The frontend uses API rewrite/proxy configuration to communicate with the backend deployment.

---

## 📁 Project Structure

```text
ALG-WMS
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   └── vercel.json
│
└── backend/
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── prisma/
    ├── index.js
    ├── package.json
    └── ...
```

---

## 🔑 API

The backend provides REST-style endpoints for the main warehouse workflows.

### Authentication

```text
POST /api/auth/login
```

### Products

```text
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Inventory

```text
GET /api/inventory
GET /api/inventory/movements
```

### Receiving

```text
POST /api/inventory/receive
```

### Outbound / Picking

```text
POST /api/inventory/pick
POST /api/inventory/outbound
```

> Endpoint details may evolve as the application continues to be developed.

---

## 🚀 Run Locally

### Backend

```bash
cd backend
npm install
```

Configure the required environment variables, then start the server:

```bash
npm run dev
```

or:

```bash
node index.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Do not commit production credentials, database passwords, JWT secrets, or private keys to GitHub.

Example backend configuration:

```env
PORT=5001
FRONTEND_URL=http://localhost:5173
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-secret
```

Use environment-specific values for local development and production deployment.

---

## 📌 Project Highlights

ALG-WMS demonstrates practical full-stack development through:

- Warehouse management workflows
- Inventory management
- Stock movement tracking
- Receiving and outbound processes
- Picking, packing, and shipping workflows
- Sales order management
- Stock transfer
- Returns
- Customer management
- JWT authentication
- REST API development
- Prisma ORM
- MySQL-compatible database integration
- Cloud database deployment
- VPS deployment with PM2
- Frontend deployment with Vercel

---

## 🎯 Operational Workflow

```text
Purchase / Incoming Stock
          ↓
      Receiving
          ↓
       Inventory
          ↓
     Sales Order
          ↓
       Picking
          ↓
       Packing
          ↓
      Shipping
          ↓
      Completed
```

Additional inventory workflows include stock transfers, adjustments, and returns.

---

## 👨‍💻 Author

**Amar**

Junior Web Developer | Full-Stack Enthusiast

Information Technology / Web Development
