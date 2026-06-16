# IMS — Inventory & Order Management System

A full-stack Inventory & Order Management System for managing products, customers, and orders with inventory tracking.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Python (FastAPI) |
| Database | PostgreSQL |
| Containerization | Docker + Docker Compose |

## Features

- **Product Management** — CRUD operations with unique SKU, stock tracking
- **Customer Management** — CRUD with unique email validation
- **Order Management** — Multi-item orders with automatic stock reduction
- **Dashboard** — Summary cards, low stock alerts, recent orders
- **Business Logic** — Stock validation, auto-calculated totals, proper error handling

## Quick Start

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose installed

### Run with Docker Compose

```bash
# Clone the repo
git clone <repo-url>
cd ethara-assignment

# Start all services
docker-compose up --build

# Access the application:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
# Set DATABASE_URL environment variable to your PostgreSQL instance
uvicorn app.main:app --reload
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
│   │   ├── main.py          # FastAPI application
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
│   │   └── context/         # React Context (Toast)
│   ├── Dockerfile
│   └── nginx.conf
├── database/
│   └── init.sql
├── docker-compose.yml
├── .env
└── README.md
```

## Environment Variables

All configuration is in the root `.env` file:

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
