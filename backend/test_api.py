"""
End-to-end test script for IMS Backend API.
Verifies all business rules from the technical assessment.
Run: python test_api.py
Requires: backend running at http://localhost:8000
"""

import requests
import sys

BASE = "http://localhost:8000"
passed = 0
failed = 0


def test(name, condition, detail=""):
    global passed, failed
    if condition:
        print(f"  [PASS] {name}")
        passed += 1
    else:
        print(f"  [FAIL] {name} -- {detail}")
        failed += 1


def main():
    global passed, failed

    print("\n" + "=" * 60)
    print("  IMS Backend — Business Rules Verification")
    print("=" * 60)

    # --------------------------------------------------
    # 1. Health Check
    # --------------------------------------------------
    print("\n>> Health Check")
    r = requests.get(f"{BASE}/")
    test("GET / returns healthy", r.status_code == 200 and r.json().get("status") == "healthy", f"status={r.status_code}")

    # --------------------------------------------------
    # 2. Product CRUD
    # --------------------------------------------------
    print("\n>> Product Management")

    # Create product
    p1 = requests.post(f"{BASE}/products", json={"name": "Wireless Mouse", "sku": "WM-001", "price": 25.99, "quantity_in_stock": 50})
    test("POST /products — create product", p1.status_code == 201, f"status={p1.status_code}")
    product1_id = p1.json().get("id") if p1.status_code == 201 else None

    p2 = requests.post(f"{BASE}/products", json={"name": "Bluetooth Speaker", "sku": "BS-002", "price": 45.00, "quantity_in_stock": 30})
    test("POST /products — create second product", p2.status_code == 201)
    product2_id = p2.json().get("id") if p2.status_code == 201 else None

    # Unique SKU enforcement
    dup = requests.post(f"{BASE}/products", json={"name": "Duplicate Mouse", "sku": "WM-001", "price": 10.0, "quantity_in_stock": 5})
    test("Unique SKU enforcement — duplicate returns 400", dup.status_code == 400, f"status={dup.status_code}")

    # Negative price validation
    neg_price = requests.post(f"{BASE}/products", json={"name": "Bad", "sku": "BAD-001", "price": -5, "quantity_in_stock": 0})
    test("Price >= 0 validation", neg_price.status_code == 422, f"status={neg_price.status_code}")

    # Negative quantity validation
    neg_qty = requests.post(f"{BASE}/products", json={"name": "Bad", "sku": "BAD-002", "price": 5, "quantity_in_stock": -1})
    test("Quantity >= 0 validation", neg_qty.status_code == 422, f"status={neg_qty.status_code}")

    # Get all products
    all_p = requests.get(f"{BASE}/products")
    test("GET /products — list all", all_p.status_code == 200 and len(all_p.json()) >= 2, f"count={len(all_p.json())}")

    # Get single product
    if product1_id:
        single = requests.get(f"{BASE}/products/{product1_id}")
        test("GET /products/:id — get by ID", single.status_code == 200 and single.json()["sku"] == "WM-001")

    # Update product
    if product1_id:
        upd = requests.put(f"{BASE}/products/{product1_id}", json={"price": 29.99})
        test("PUT /products/:id — update price", upd.status_code == 200 and upd.json()["price"] == 29.99, f"price={upd.json().get('price')}")

    # Get nonexistent
    r404 = requests.get(f"{BASE}/products/99999")
    test("GET /products/99999 — returns 404", r404.status_code == 404)

    # --------------------------------------------------
    # 3. Customer CRUD
    # --------------------------------------------------
    print("\n>> Customer Management")

    c1 = requests.post(f"{BASE}/customers", json={"name": "John Doe", "email": "john@example.com", "phone": "+1-555-0101"})
    test("POST /customers — create customer", c1.status_code == 201)
    customer1_id = c1.json().get("id") if c1.status_code == 201 else None

    # Unique email enforcement
    dup_email = requests.post(f"{BASE}/customers", json={"name": "John Again", "email": "john@example.com", "phone": "+1-555-0102"})
    test("Unique email enforcement — duplicate returns 400", dup_email.status_code == 400, f"status={dup_email.status_code}")

    # Invalid email validation
    bad_email = requests.post(f"{BASE}/customers", json={"name": "Bad", "email": "not-an-email", "phone": ""})
    test("Email format validation", bad_email.status_code == 422, f"status={bad_email.status_code}")

    # Get all
    all_c = requests.get(f"{BASE}/customers")
    test("GET /customers — list all", all_c.status_code == 200 and len(all_c.json()) >= 1)

    # Get single
    if customer1_id:
        single_c = requests.get(f"{BASE}/customers/{customer1_id}")
        test("GET /customers/:id — get by ID", single_c.status_code == 200)

    # --------------------------------------------------
    # 4. Order Management + Business Logic
    # --------------------------------------------------
    print("\n>> Order Management & Business Logic")

    if product1_id and product2_id and customer1_id:
        # Check stock before order
        stock_before_1 = requests.get(f"{BASE}/products/{product1_id}").json()["quantity_in_stock"]
        stock_before_2 = requests.get(f"{BASE}/products/{product2_id}").json()["quantity_in_stock"]

        # Create order with multiple items
        order_data = {
            "customer_id": customer1_id,
            "items": [
                {"product_id": product1_id, "quantity": 3},
                {"product_id": product2_id, "quantity": 2},
            ]
        }
        o1 = requests.post(f"{BASE}/orders", json=order_data)
        test("POST /orders — create multi-item order", o1.status_code == 201, f"status={o1.status_code}")
        order1_id = o1.json().get("id") if o1.status_code == 201 else None

        if o1.status_code == 201:
            order_resp = o1.json()
            # Backend calculates total: (29.99 * 3) + (45.00 * 2) = 89.97 + 90.00 = 179.97
            expected_total = round(29.99 * 3 + 45.00 * 2, 2)
            test("Total auto-calculated by backend", order_resp["total_amount"] == expected_total,
                 f"expected={expected_total}, got={order_resp['total_amount']}")

            test("Order includes customer_name", order_resp.get("customer_name") == "John Doe",
                 f"got={order_resp.get('customer_name')}")

            test("Order includes items array", isinstance(order_resp.get("items"), list) and len(order_resp["items"]) == 2,
                 f"items={order_resp.get('items')}")

        # Check stock reduced
        stock_after_1 = requests.get(f"{BASE}/products/{product1_id}").json()["quantity_in_stock"]
        stock_after_2 = requests.get(f"{BASE}/products/{product2_id}").json()["quantity_in_stock"]
        test("Stock auto-reduced for product 1", stock_after_1 == stock_before_1 - 3,
             f"before={stock_before_1}, after={stock_after_1}")
        test("Stock auto-reduced for product 2", stock_after_2 == stock_before_2 - 2,
             f"before={stock_before_2}, after={stock_after_2}")

        # Insufficient stock check
        bad_order = requests.post(f"{BASE}/orders", json={
            "customer_id": customer1_id,
            "items": [{"product_id": product1_id, "quantity": 99999}]
        })
        test("Insufficient stock returns 400", bad_order.status_code == 400, f"status={bad_order.status_code}")

        # Nonexistent customer
        bad_cust = requests.post(f"{BASE}/orders", json={
            "customer_id": 99999,
            "items": [{"product_id": product1_id, "quantity": 1}]
        })
        test("Nonexistent customer returns 404", bad_cust.status_code == 404, f"status={bad_cust.status_code}")

        # Nonexistent product in order
        bad_prod = requests.post(f"{BASE}/orders", json={
            "customer_id": customer1_id,
            "items": [{"product_id": 99999, "quantity": 1}]
        })
        test("Nonexistent product returns 404", bad_prod.status_code == 404, f"status={bad_prod.status_code}")

        # Get all orders
        all_o = requests.get(f"{BASE}/orders")
        test("GET /orders — list all", all_o.status_code == 200 and len(all_o.json()) >= 1)

        # Get order details
        if order1_id:
            detail = requests.get(f"{BASE}/orders/{order1_id}")
            test("GET /orders/:id — includes items", detail.status_code == 200 and len(detail.json().get("items", [])) == 2)

        # Delete order → stock restored
        if order1_id:
            del_o = requests.delete(f"{BASE}/orders/{order1_id}")
            test("DELETE /orders/:id — cancel order", del_o.status_code == 204, f"status={del_o.status_code}")

            stock_restored_1 = requests.get(f"{BASE}/products/{product1_id}").json()["quantity_in_stock"]
            stock_restored_2 = requests.get(f"{BASE}/products/{product2_id}").json()["quantity_in_stock"]
            test("Stock restored for product 1 after cancel", stock_restored_1 == stock_before_1,
                 f"expected={stock_before_1}, got={stock_restored_1}")
            test("Stock restored for product 2 after cancel", stock_restored_2 == stock_before_2,
                 f"expected={stock_before_2}, got={stock_restored_2}")

    # --------------------------------------------------
    # 5. Delete CRUD
    # --------------------------------------------------
    print("\n>> Delete Operations")

    if product1_id:
        d = requests.delete(f"{BASE}/products/{product1_id}")
        test("DELETE /products/:id — 204", d.status_code == 204)
        gone = requests.get(f"{BASE}/products/{product1_id}")
        test("Deleted product returns 404", gone.status_code == 404)

    if customer1_id:
        d = requests.delete(f"{BASE}/customers/{customer1_id}")
        test("DELETE /customers/:id — 204", d.status_code == 204)

    # Cleanup remaining test data
    if product2_id:
        requests.delete(f"{BASE}/products/{product2_id}")

    # --------------------------------------------------
    # Summary
    # --------------------------------------------------
    print("\n" + "=" * 60)
    total = passed + failed
    print(f"  Results: {passed}/{total} passed, {failed} failed")
    print("=" * 60 + "\n")

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
