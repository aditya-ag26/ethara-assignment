# IMS — Inventory & Order Management System

A full-stack Inventory & Order Management System for managing products, customers, and orders with real-time inventory tracking. Built with Indian locale defaults (₹ INR currency, en-IN date format).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Python (FastAPI) |
| Database | PostgreSQL 16 |
| Containerization | Docker + Docker Compose |
| Deployment | Render (Backend) + Vercel (Frontend) |

## Features

- **Product Management** — CRUD operations with unique SKU, stock tracking, ₹ pricing
- **Customer Management** — CRUD with unique email validation, Indian phone format
- **Order Management** — Multi-item orders with automatic stock reduction
- **Dashboard** — Summary cards, low stock alerts, recent orders
- **Business Logic** — Stock validation, auto-calculated totals, proper error handling

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Run with Docker Compose

```bash
# 1. Clone the repo
git clone <repo-url>
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
# Start PostgreSQL locally or via Docker
# Create user and database:
psql -U postgres -c "CREATE USER ims_user WITH PASSWORD 'ims_password_2024';"
psql -U postgres -c "CREATE DATABASE ims_db OWNER ims_user;"
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
set DATABASE_URL=postgresql://ims_user:ims_password_2024@localhost:5432/ims_db
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

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
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel/Delete order |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application + startup
│   │   ├── database.py      # DB engine & session
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic validation
│   │   └── routers/
│   │       ├── products.py  # Product endpoints
│   │       ├── customers.py # Customer endpoints
│   │       └── orders.py    # Order endpoints
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # React page components
│   │   ├── components/      # Shared UI components
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Formatting utilities (₹ INR)
│   │   └── context/         # React Context (Toast)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vercel.json
├── database/
│   └── init.sql
├── docker-compose.yml
├── render.yaml              # Render deployment blueprint
├── .env.example
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `ims_user` |
| `POSTGRES_PASSWORD` | Database password | `ims_password_2024` |
| `POSTGRES_DB` | Database name | `ims_db` |
| `DATABASE_URL` | Full connection string | Auto-composed |
| `BACKEND_PORT` | Backend port | `8000` |
| `VITE_API_URL` | Frontend API URL | _(empty for proxy)_ |

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders cannot be placed if inventory is insufficient
- Creating an order automatically reduces available stock
- Cancelling an order restores stock
- Total order amount is calculated automatically by the backend

## Deployment

### Backend — Render (Free)
1. Push repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo — Render auto-detects `render.yaml`
4. Render creates PostgreSQL + Backend automatically
5. Note your backend URL (e.g. `https://ims-backend-xxxx.onrender.com`)

### Frontend — Vercel (Free)
1. Go to [vercel.com](https://vercel.com) → Import Project
2. Set **Root Directory** to `frontend`
3. Set environment variable: `VITE_API_URL` = your Render backend URL
4. Deploy

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
