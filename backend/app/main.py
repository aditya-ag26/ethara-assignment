import time
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import products, customers, orders


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup with retry logic for Docker startup ordering."""
    max_retries = 10
    for attempt in range(max_retries):
        try:
            Base.metadata.create_all(bind=engine)
            print("✅ Database tables created successfully")
            break
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"⏳ Waiting for database... (attempt {attempt + 1}/{max_retries})")
                time.sleep(2)
            else:
                print(f"❌ Could not connect to database: {e}")
                raise
    yield


app = FastAPI(
    title="IMS — Inventory Management System",
    description="Backend API for managing products, customers, and orders",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "IMS Backend API"}
