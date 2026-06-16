$ErrorActionPreference = "Continue"
$BASE = "http://localhost:8001"
$pass = 0; $fail = 0

function Test-API($name, $condition, $detail) {
    if ($condition) { Write-Output "  [PASS] $name"; $script:pass++ }
    else { Write-Output "  [FAIL] $name -- $detail"; $script:fail++ }
}

function Invoke-API($method, $path, $body) {
    try {
        $params = @{ Uri = "$BASE$path"; Method = $method; ContentType = "application/json"; UseBasicParsing = $true }
        if ($body) { $params.Body = ($body | ConvertTo-Json -Depth 5) }
        $r = Invoke-WebRequest @params
        return @{ Status = $r.StatusCode; Body = ($r.Content | ConvertFrom-Json) }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $content = ""
        try { $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $content = $reader.ReadToEnd() } catch {}
        return @{ Status = $status; Body = ($content | ConvertFrom-Json -ErrorAction SilentlyContinue) }
    }
}

Write-Output "`n============================================================"
Write-Output "  IMS Backend -- Business Rules Verification"
Write-Output "============================================================"

# 1. Health Check
Write-Output "`n>> Health Check"
$r = Invoke-API "GET" "/"
Test-API "GET / returns healthy" ($r.Status -eq 200 -and $r.Body.status -eq "healthy") "status=$($r.Status)"

# 2. Product CRUD
Write-Output "`n>> Product Management"
$r = Invoke-API "POST" "/products" @{name="Wireless Mouse";sku="WM-001";price=25.99;quantity_in_stock=50}
Test-API "POST /products -- create product" ($r.Status -eq 201) "status=$($r.Status)"
$p1id = $r.Body.id

$r = Invoke-API "POST" "/products" @{name="Bluetooth Speaker";sku="BS-002";price=45.00;quantity_in_stock=30}
Test-API "POST /products -- create second product" ($r.Status -eq 201) "status=$($r.Status)"
$p2id = $r.Body.id

$r = Invoke-API "POST" "/products" @{name="Duplicate";sku="WM-001";price=10;quantity_in_stock=5}
Test-API "Unique SKU enforcement -- returns 400" ($r.Status -eq 400) "status=$($r.Status)"

$r = Invoke-API "POST" "/products" @{name="Bad";sku="BAD-001";price=-5;quantity_in_stock=0}
Test-API "Price >= 0 validation -- returns 422" ($r.Status -eq 422) "status=$($r.Status)"

$r = Invoke-API "POST" "/products" @{name="Bad";sku="BAD-002";price=5;quantity_in_stock=-1}
Test-API "Quantity >= 0 validation -- returns 422" ($r.Status -eq 422) "status=$($r.Status)"

$r = Invoke-API "GET" "/products"
Test-API "GET /products -- list all" ($r.Status -eq 200 -and $r.Body.Count -ge 2) "count=$($r.Body.Count)"

$r = Invoke-API "GET" "/products/$p1id"
Test-API "GET /products/:id -- get by ID" ($r.Status -eq 200 -and $r.Body.sku -eq "WM-001") ""

$r = Invoke-API "PUT" "/products/$p1id" @{price=29.99}
Test-API "PUT /products/:id -- update price" ($r.Status -eq 200 -and $r.Body.price -eq 29.99) "price=$($r.Body.price)"

$r = Invoke-API "GET" "/products/99999"
Test-API "GET /products/99999 -- returns 404" ($r.Status -eq 404) "status=$($r.Status)"

# 3. Customer CRUD
Write-Output "`n>> Customer Management"
$r = Invoke-API "POST" "/customers" @{name="John Doe";email="john@example.com";phone="+1-555-0101"}
Test-API "POST /customers -- create customer" ($r.Status -eq 201) "status=$($r.Status)"
$c1id = $r.Body.id

$r = Invoke-API "POST" "/customers" @{name="John Again";email="john@example.com";phone="+1-555-0102"}
Test-API "Unique email enforcement -- returns 400" ($r.Status -eq 400) "status=$($r.Status)"

$r = Invoke-API "POST" "/customers" @{name="Bad";email="not-an-email";phone=""}
Test-API "Email format validation -- returns 422" ($r.Status -eq 422) "status=$($r.Status)"

$r = Invoke-API "GET" "/customers"
Test-API "GET /customers -- list all" ($r.Status -eq 200 -and $r.Body.Count -ge 1) "count=$($r.Body.Count)"

$r = Invoke-API "GET" "/customers/$c1id"
Test-API "GET /customers/:id -- get by ID" ($r.Status -eq 200) "status=$($r.Status)"

# 4. Order Management & Business Logic
Write-Output "`n>> Order Management and Business Logic"
$stock1before = (Invoke-API "GET" "/products/$p1id").Body.quantity_in_stock
$stock2before = (Invoke-API "GET" "/products/$p2id").Body.quantity_in_stock

$orderData = @{customer_id=$c1id; items=@(@{product_id=$p1id;quantity=3},@{product_id=$p2id;quantity=2})}
$r = Invoke-API "POST" "/orders" $orderData
Test-API "POST /orders -- create multi-item order" ($r.Status -eq 201) "status=$($r.Status)"
$o1id = $r.Body.id

$expectedTotal = [math]::Round(29.99 * 3 + 45.00 * 2, 2)
Test-API "Total auto-calculated by backend" ($r.Body.total_amount -eq $expectedTotal) "expected=$expectedTotal, got=$($r.Body.total_amount)"
Test-API "Order includes customer_name" ($r.Body.customer_name -eq "John Doe") "got=$($r.Body.customer_name)"
Test-API "Order includes items array" ($r.Body.items.Count -eq 2) "items=$($r.Body.items.Count)"

$stock1after = (Invoke-API "GET" "/products/$p1id").Body.quantity_in_stock
$stock2after = (Invoke-API "GET" "/products/$p2id").Body.quantity_in_stock
Test-API "Stock auto-reduced for product 1" ($stock1after -eq ($stock1before - 3)) "before=$stock1before, after=$stock1after"
Test-API "Stock auto-reduced for product 2" ($stock2after -eq ($stock2before - 2)) "before=$stock2before, after=$stock2after"

$r = Invoke-API "POST" "/orders" @{customer_id=$c1id;items=@(@{product_id=$p1id;quantity=99999})}
Test-API "Insufficient stock returns 400" ($r.Status -eq 400) "status=$($r.Status)"

$r = Invoke-API "POST" "/orders" @{customer_id=99999;items=@(@{product_id=$p1id;quantity=1})}
Test-API "Nonexistent customer returns 404" ($r.Status -eq 404) "status=$($r.Status)"

$r = Invoke-API "POST" "/orders" @{customer_id=$c1id;items=@(@{product_id=99999;quantity=1})}
Test-API "Nonexistent product in order returns 404" ($r.Status -eq 404) "status=$($r.Status)"

$r = Invoke-API "GET" "/orders"
Test-API "GET /orders -- list all" ($r.Status -eq 200 -and $r.Body.Count -ge 1) "count=$($r.Body.Count)"

$r = Invoke-API "GET" "/orders/$o1id"
Test-API "GET /orders/:id -- includes items" ($r.Status -eq 200 -and $r.Body.items.Count -eq 2) "items=$($r.Body.items.Count)"

# Delete order -> stock restored
$r = Invoke-API "DELETE" "/orders/$o1id"
Test-API "DELETE /orders/:id -- cancel order returns 204" ($r.Status -eq 204) "status=$($r.Status)"

$stock1restored = (Invoke-API "GET" "/products/$p1id").Body.quantity_in_stock
$stock2restored = (Invoke-API "GET" "/products/$p2id").Body.quantity_in_stock
Test-API "Stock restored for product 1 after cancel" ($stock1restored -eq $stock1before) "expected=$stock1before, got=$stock1restored"
Test-API "Stock restored for product 2 after cancel" ($stock2restored -eq $stock2before) "expected=$stock2before, got=$stock2restored"

# 5. Delete Operations
Write-Output "`n>> Delete Operations"
$r = Invoke-API "DELETE" "/products/$p1id"
Test-API "DELETE /products/:id -- returns 204" ($r.Status -eq 204) "status=$($r.Status)"
$r = Invoke-API "GET" "/products/$p1id"
Test-API "Deleted product returns 404" ($r.Status -eq 404) "status=$($r.Status)"

$r = Invoke-API "DELETE" "/customers/$c1id"
Test-API "DELETE /customers/:id -- returns 204" ($r.Status -eq 204) "status=$($r.Status)"

# Cleanup
Invoke-API "DELETE" "/products/$p2id" | Out-Null

# Summary
Write-Output "`n============================================================"
$total = $pass + $fail
Write-Output "  Results: $pass/$total passed, $fail failed"
Write-Output "============================================================`n"
