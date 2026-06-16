from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models import Order, OrderItem, Product, Customer
from app.schemas import OrderCreate, OrderResponse, OrderItemResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order.
    Business rules:
    - Customer must exist
    - All products must exist
    - Sufficient stock must be available for each item
    - Stock is automatically reduced upon order creation
    - Total amount is calculated by the backend
    """
    # Validate customer
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_data.customer_id} not found"
        )

    # Validate products and check stock
    total_amount = 0.0
    order_items = []

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found"
            )

        if product.quantity_in_stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity_in_stock}, Requested: {item.quantity}"
            )

        subtotal = product.price * item.quantity
        total_amount += subtotal

        order_items.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "price": product.price,
        })

    # Create the order
    db_order = Order(
        customer_id=order_data.customer_id,
        total_amount=round(total_amount, 2),
        status="pending",
    )
    db.add(db_order)
    db.flush()  # Get the order ID without committing

    # Create order items and reduce stock
    for item_data in order_items:
        db_item = OrderItem(order_id=db_order.id, **item_data)
        db.add(db_item)

        # Reduce stock
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.quantity_in_stock -= item_data["quantity"]

    db.commit()
    db.refresh(db_order)

    # Build response with customer name and item details
    return _build_order_response(db_order, db)


@router.get("", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    """Retrieve all orders with customer names."""
    orders = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .order_by(Order.id.desc())
        .all()
    )
    return [_build_order_response(o, db) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve order details by ID, including items."""
    order = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return _build_order_response(order, db)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """
    Cancel/Delete an order.
    Stock is restored for each item in the order.
    """
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Restore stock for each item
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()
    return None


def _build_order_response(order: Order, db: Session) -> OrderResponse:
    """Build an OrderResponse with customer_name and product_name populated."""
    customer_name = order.customer.name if order.customer else None

    items = []
    for item in order.items:
        product_name = item.product.name if item.product else None
        items.append(OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=product_name,
            quantity=item.quantity,
            price=item.price,
        ))

    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=customer_name,
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        items=items,
    )
