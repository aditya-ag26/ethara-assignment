# IMS — Inventory & Order Management System

A production-ready, full-stack Inventory & Order Management System for managing products, customers, and orders with real-time inventory tracking. Built with Indian locale defaults (₹ INR currency, en-IN date format).

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://ethara-assignment-three.vercel.app](https://ethara-assignment-three.vercel.app) |
| **Backend API** | [https://ims-backend-xiyx.onrender.com](https://ims-backend-xiyx.onrender.com) |
| **API Docs** | [https://ims-backend-xiyx.onrender.com/docs](https://ims-backend-xiyx.onrender.com/docs) |
| **Docker Hub** | [adityaagarwal2026/ims-backend](https://hub.docker.com/r/adityaagarwal2026/ims-backend) |

**Demo Login:** Email: `admin@ims.com` · Password: `admin123`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite) + Tailwind CSS |
| Backend | Python 3.11 (FastAPI) |
| Database | PostgreSQL 16 |
| Containerization | Docker + Docker Compose |
| Deployment | Render (Backend + DB) · Vercel (Frontend) |

## Features

- **Product Management** — CRUD with unique SKU, stock tracking, ₹ pricing
- **Customer Management** — CRUD with unique email validation, Indian phone format
- **Order Management** — Multi-item orders with automatic stock reduction/restoration
- **Dashboard** — Summary cards, low stock alerts, recent orders
- **Authentication** — Login page with session-based auth guard on all routes
- **Business Logic** — Stock validation, auto-calculated totals, proper HTTP status codes

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Run with Docker Compose

```bash
# 1. Clone the repo
git clone https://github.com/aditya-ag26/ethara-assignment.git
cd ethara-assignment

# 2. Copy env template and customise
cp .env.example .env

# 3. Build and start all services
docker-compose up --build

# 4. Access the application:
#    Frontend:  http://localhost:3000
#    Backend:   http://localhost:8000
#    API Docs:  http://localhost:8000/docs
```

### Stop & Clean Up

```bash
# Stop services (keep data)
docker-compose down

# Stop services AND delete database volume
docker-compose down -v
```

### Local Development (without Docker)

**Database:**
```bash
# Start PostgreSQL locally
# Create user and database:
psql -U postgres -c "CREATE USER ims_user WITH PASSWORD 'ims_password_2024';"
psql -U postgres -c "CREATE DATABASE ims_db OWNER ims_user;"
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL=postgresql://ims_user:ims_password_2024@localhost:5432/ims_db
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create a new product |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create a new customer |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create a new order |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order details with items |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI application + startup
│   │   ├── database.py        # DB engine & session
│   │   ├── models.py          # SQLAlchemy ORM models
│   │   ├── schemas.py         # Pydantic validation schemas
│   │   └── routers/
│   │       ├── products.py    # Product CRUD endpoints
│   │       ├── customers.py   # Customer CRUD endpoints
│   │       └── orders.py      # Order endpoints + business logic
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── test_api.py            # Python test suite
│   └── test_api.ps1           # PowerShell test suite
├── frontend/
│   ├── src/
│   │   ├── pages/             # Login, Dashboard, Products, Customers, Orders, Settings
│   │   ├── components/
│   │   │   ├── Layout/        # AppLayout, Sidebar, TopNav
│   │   │   ├── UI/            # Modal, ConfirmDialog, Pagination
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/          # Axios API service layer
│   │   ├── context/           # AuthContext, ToastContext
│   │   └── utils/             # Currency & date formatting (₹ INR)
│   ├── Dockerfile
│   ├── nginx.conf             # Nginx reverse proxy config
│   └── vercel.json            # Vercel deployment config
├── database/
│   └── init.sql               # DB initialization script
├── docker-compose.yml         # Service orchestration
├── render.yaml                # Render deployment blueprint
├── .env.example               # Environment variable template
├── .gitignore
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `ims_user` |
| `POSTGRES_PASSWORD` | Database password | `ims_password_2024` |
| `POSTGRES_DB` | Database name | `ims_db` |
| `DATABASE_URL` | Full PostgreSQL connection string | `postgresql://ims_user:...@db:5432/ims_db` |
| `BACKEND_PORT` | Backend server port | `8000` |
| `VITE_API_URL` | Backend URL for frontend (production) | `https://ims-backend-xiyx.onrender.com` |

> **Note:** No hardcoded credentials — all sensitive values are loaded from environment variables.

## Business Rules

- Product SKU must be unique (enforced via DB constraint)
- Customer email must be unique (enforced via DB constraint)
- Product price and quantity cannot be negative (Pydantic + DB CHECK constraints)
- Orders cannot be placed if inventory is insufficient (explicit stock check)
- Creating an order automatically reduces available stock
- Cancelling an order automatically restores stock
- Total order amount is calculated server-side (not from client input)
- Proper HTTP status codes: 201 (Created), 204 (No Content), 400 (Bad Request), 404 (Not Found), 422 (Validation Error)

## Deployment

### Backend — Render (Free Tier)
1. Push repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo — Render auto-detects `render.yaml`
4. Render creates PostgreSQL + Backend automatically
5. Note your backend URL

### Frontend — Vercel (Free Tier)
1. Go to [vercel.com](https://vercel.com) → Import Project
2. Set **Root Directory** to `frontend`
3. Set environment variable: `VITE_API_URL` = your Render backend URL
4. Deploy

### Docker Hub
```bash
docker tag etharaassignment-backend:latest adityaagarwal2026/ims-backend:latest
docker push adityaagarwal2026/ims-backend:latest
```

## Docker Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend    │────▶│ PostgreSQL  │
│ nginx:alpine│     │ python:3.11  │     │   16-alpine │
│   :3000     │     │   :8000      │     │   :5432     │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                          [pgdata volume]
```

## Testing

### API Test Suite (32 tests)
```bash
# PowerShell
powershell -ExecutionPolicy Bypass -File backend/test_api.ps1

# Python
cd backend && python test_api.py
```

Tests cover: CRUD operations, unique constraint enforcement, stock validation, order total calculation, stock reduction/restoration on order create/cancel, proper HTTP status codes.
