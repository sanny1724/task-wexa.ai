# StockFlow MVP (v0.1)

StockFlow is a premium, minimal SaaS multi-tenant inventory management platform designed to help organizations track catalogs, monitor aggregate stock counts, and receive real-time low-stock alerts with strict tenant isolation.

---

## 🔗 Live Deployments & Repository
- **Live Frontend Web Client:** [https://taskwexaai.netlify.app/](https://taskwexaai.netlify.app/)
- **Live Backend REST API:** [https://task-wexa-ai.onrender.com/](https://task-wexa-ai.onrender.com/)
- **GitHub Repository:** [https://github.com/sanny1724/task-wexa.ai](https://github.com/sanny1724/task-wexa.ai)

---

## 🚀 Core Features

- **Multi-Tenant Registration**: Sign up registers a new tenant Organization and binds the user as its administrator.
- **Strict Tenant Isolation**: All REST API queries are scoped dynamically by the authenticated user's `organizationId` decoded from the JWT token. Users can never view, update, or delete products belonging to another tenant.
- **Product Catalog CRUD**: Complete inventory management with Name, SKU, Description, Quantity, Cost Price, Selling Price, and Low-Stock Threshold fields.
- **Dynamic KPI Dashboard**: Instant aggregates for:
  - **Total Products** (unique catalog SKUs).
  - **Total Inventory Units** (aggregate items in stock).
  - **Low Stock Count** (items below custom limit or organization default threshold).
- **Custom Delete Confirmation**: Prevention of accidental catalog deletions via custom warning modals.
- **Zero-Setup Seeding**: Pre-loaded mock tenant and inventory data to facilitate immediate testing.
- **Premium Glassmorphic Dark UI**: Modern dark theme with HSL colors, responsive grids, hover scales, and animated toast feedback.

---

## 🛠️ Technology Stack

### Frontend
- **React (Vite)**
- **React Router** (SPA routing and protected routes)
- **Axios** (API requests with automatic token headers)
- **Tailwind CSS v4** (Utility styles compiled via Vite CSS injection)
- **React Hook Form** (Client-side validation)
- **React Toastify** (Dynamic UI status notifications)
- **Lucide React** (Modern line icons)

### Backend
- **Node.js + Express** (Modular routers)
- **Prisma ORM** (Database client and schema definitions)
- **PostgreSQL** (Production data persistence)
- **JWT Authentication** (JSON Web Tokens signed for 24h sessions)
- **bcrypt** (Secure password hashing)

---

## 📁 Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma  # Prisma schema definitions (PostgreSQL)
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js    # JWT verification middleware
│   │   ├── routes/
│   │   │   ├── auth.js    # signup and login endpoints
│   │   │   ├── products.js # tenant-scoped product CRUD routes
│   │   │   ├── dashboard.js# aggregate KPIs and warnings
│   │   │   └── settings.js # organization metadata settings
│   │   ├── prisma.js      # Global Prisma client exporter
│   │   ├── seed.js        # DB seeding script
│   │   └── server.js      # Express server entry point & CORS configuration
│   ├── package.json       # Express server configurations
│   └── .env               # Backend environment secrets
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx # Workspace layout (sidebar + footer)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx # KPI cards & stock alerts
│   │   │   ├── Login.jsx  # Toggleable auth form & validations
│   │   │   ├── Products.jsx # Searchable CRUD table and modals
│   │   │   └── Settings.jsx # Org metadata managers
│   │   ├── api.js         # Axios interceptor config
│   │   ├── App.jsx        # Routing coordinator
│   │   ├── index.css      # Custom styling & Tailwind imports
│   │   └── main.jsx       # App mounting
│   ├── package.json       # React client configurations
│   └── vite.config.js     # Vite builder & Tailwind v4 plugin
├── render.yaml            # Render blueprint for backend/Postgres
├── netlify.toml           # Netlify SPA build instructions
└── README.md              # Project documentation
```

---

## 🔑 Demo Seed Credentials

The database contains a preloaded demo organization and products:
- **Email Address:** `demo@example.com`
- **Password:** `password123`

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** or **SQLite** (change the `provider` in `backend/prisma/schema.prisma` if running locally without Postgres).

### Step 1: Configure Environment Variables
Copy and rename the environment config file inside `backend/` as `.env`:
```env
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_here
DATABASE_URL="postgresql://user:password@localhost:5432/stockflow"
```

### Step 2: Spin Up the Backend API
1. Navigate to the `backend/` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Apply the database schemas and generate Prisma Client:
   ```bash
   npx prisma db push
   ```
3. Start the Express API server:
   ```bash
   npm run dev
   ```
The API server will listen on `http://localhost:3001` and automatically seed the database if empty.

### Step 3: Spin Up the Frontend Client
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Boot the Vite React client:
   ```bash
   npm run dev
   ```
The web app dashboard will open at `http://localhost:5173/`.

---

## ☁️ Cloud Deployment

### Backend (Render Blueprint)
We provide a `render.yaml` blueprint. Import this repository under **Render > Blueprints** to deploy:
- A free **PostgreSQL Database** (`stockflow-db`).
- A live **Node.js Web Service** (`stockflow-backend`), which automatically connects to the Postgres database, runs database schema migrations, and seeds the default tenant.

### Frontend (Netlify)
Import the repository on **Netlify**. Netlify will use `netlify.toml` automatically:
- **Build Command:** `npm run build`
- **Publish Directory:** `frontend/dist`
- Configure `VITE_API_URL` in the Netlify environment settings pointing to your live Render Web Service URL.
