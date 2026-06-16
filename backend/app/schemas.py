from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re


# ===========================
# Product Schemas
# ===========================

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    sku: str = Field(..., min_length=1, max_length=100, description="Unique SKU/code")
    price: float = Field(..., ge=0, description="Product price")
    quantity_in_stock: int = Field(..., ge=0, description="Quantity in stock")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, ge=0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)


class ProductResponse(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===========================
# Customer Schemas
# ===========================

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name")
    email: str = Field(..., min_length=1, max_length=255, description="Email address")
    phone: Optional[str] = Field(None, max_length=50, description="Phone number")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email address")
        return v.lower()


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===========================
# Order Schemas
# ===========================

class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0, description="Quantity to order")


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    price: float

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0)
    items: List[OrderItemCreate] = Field(..., min_length=1, description="At least one item required")


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    total_amount: float
    status: str
    created_at: Optional[datetime] = None
    items: Optional[List[OrderItemResponse]] = None

    class Config:
        from_attributes = True
