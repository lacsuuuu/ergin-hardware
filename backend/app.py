import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# ==========================================
# CONFIGURATION & SETUP
# ==========================================
load_dotenv()
app = Flask(__name__)
CORS(app)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY. Check your .env file!")

supabase: Client = create_client(url, key)

# ==========================================
# SUPPLIER MANAGEMENT
# ==========================================
@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    # Retrieves all records from the supplier table
    try:
        response = supabase.table('supplier').select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- GET SUPPLIERS ERROR ---", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/suppliers', methods=['POST'])
def add_supplier():
    # Inserts a new supplier record into the database
    try:
        data = request.json
        mapped_data = {
            "product_name": data.get("name"),
            "category": data.get("category"),
            "stock": 0,         
            "retail_price": data.get("retail_price"),
            "selling_price": data.get("selling_price")
        }
        
        response = supabase.table('supplier').insert(mapped_data).execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- ADD SUPPLIER ERROR ---", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/suppliers/<int:supplier_id>', methods=['PUT'])
def update_supplier(supplier_id):
    # Updates an existing supplier's details
    try:
        data = request.json
            
        # Map the incoming React data to your database columns
        mapped_data = {
            "supplier_name": data.get("supplier_name"),
            "contact": data.get("contact"),
            "email": data.get("email"),
            "address": data.get("address")
        }
            
        response = supabase.table('supplier').update(mapped_data).eq('supplier_id', supplier_id).execute()
            
        return jsonify(response.data), 200
    except Exception as e:
        print(f"--- UPDATE SUPPLIER {supplier_id} ERROR ---", e)
        return jsonify({"error": str(e)}), 500

# ==========================================
# PRODUCT & INVENTORY MANAGEMENT
# ==========================================
@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    # Retrieves all products from the inventory
    try:
        response = supabase.table('product').select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- GET INVENTORY ERROR ---", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/product', methods=['POST'])
def add_product():
    # Creates a new product profile with an initial stock of 0
    try:
        data = request.json
        mapped_data = {
            "product_name": data.get("name"),
            "category": data.get("category"),
            "stock": data.get("qty", 0),         
            "unit_price": data.get("retail")
        }
        
        response = supabase.table('product').insert(mapped_data).execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- ADD PRODUCT ERROR ---", e)
        return jsonify({"error": str(e)}), 500
    
# UPDATE: Edit existing product details
@app.route('/api/product/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        data = request.json
        print(f"--- INCOMING EDIT DATA FOR PRODUCT {product_id} ---", data)
        
        mapped_data = {
            "product_name": data.get("name"),
            "category": data.get("category"),
            "retail_price": data.get("retail_price"),
            "selling_price": data.get("selling_price")
        }
        
        response = supabase.table('product').update(mapped_data).eq('product_id', product_id).execute()
        return jsonify(response.data), 200
        
    except Exception as e:
        print(f"\n!!! UPDATE PRODUCT {product_id} ERROR !!!")
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/inventory/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    # Deletes a specific product from the inventory by product_id
    try:
        response = supabase.table('product').delete().eq('product_id', item_id).execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- DELETE PRODUCT ERROR ---", e)
        return jsonify({"error": str(e)}), 500

# ==========================================
# USER AUTHENTICATION
# ==========================================
@app.route('/api/login', methods=['POST'])
def login():
    # Authenticates a user using secure password hashing with a plaintext fallback
    try:
        data = request.json
        inp_username = data.get('username')
        inp_password = data.get('password')

        response = supabase.table('users').select("username, role, password").eq('username', inp_username).execute()
        user_list = response.data

        if len(user_list) > 0:
            user = user_list[0]
            db_password = user['password']

            if check_password_hash(db_password, inp_password) or db_password == inp_password:
                return jsonify({"success": True, "username": user['username'], "role": user['role']})
            else:
                return jsonify({"success": False, "message": "Invalid password"}), 401
        else:
            return jsonify({"success": False, "message": "Invalid username"}), 401

    except Exception as e:
        print("--- LOGIN ERROR ---", e) 
        return jsonify({"error": str(e)}), 500

# ==========================================
# RESTOCKING TRANSACTIONS
# ==========================================
@app.route('/api/restock', methods=['POST'])
def process_restock():
    # Processes a complex delivery transaction across multiple tables
    try:
        data = request.json
        supplier_id = data.get('supplier_id')
        employee_id = 1  # Hardcoded pending session implementation
        total_cost = data.get('total_cost')
        items = data.get('items', [])
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # Insert parent restock record
        restock_payload = {
            "date": current_date,
            "supplier_id": supplier_id,
            "employee_id": employee_id,
            "total_cost": total_cost
        }
        restock_res = supabase.table('restock').insert(restock_payload).execute()
        batch_id = restock_res.data[0]['batch_id']
        
        # Process individual line items
        for item in items:
            p_id = item['product_id']
            qty = int(item['quantity'])
            u_cost = float(item['unit_cost'])
            
            supabase.table('restock_detail').insert({
                "batch_id": batch_id,
                "product_id": p_id,
                "quantity": qty,
                "unit_cost": u_cost
            }).execute()
            
            prod_data = supabase.table('product').select('stock').eq('product_id', p_id).execute()
            current_stock = prod_data.data[0]['stock'] if prod_data.data else 0
            
            supabase.table('product').update({
                "stock": current_stock + qty,
                "supplier_id": supplier_id
            }).eq('product_id', p_id).execute()
            
            supabase.table('inventory_log').insert({
                "product_id": p_id,
                "transaction_type": "Restock",
                "quantity_change": qty,
                "date": current_date
            }).execute()

        return jsonify({"success": True, "batch_id": batch_id}), 201

    except Exception as e:
        print("--- RESTOCK TRANSACTION ERROR ---", e)
        return jsonify({"error": str(e)}), 500

# ==========================================
# CLIENT MANAGEMENT
# ==========================================
@app.route('/api/clients', methods=['GET'])
def get_clients():
    # Retrieves all customer records
    try:
        response = supabase.table('customer').select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- GET CLIENTS ERROR ---", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/clients', methods=['POST'])
def add_client():
    # Inserts a new customer record
    try:
        data = request.json
        mapped_data = {
            "name": data.get("name"),
            "address": data.get("address"),
            "contact": data.get("contact"),
            "email": data.get("email"),
            "business_style": data.get("business_style"),
            "tin": data.get("tin")
        }
        
        response = supabase.table('customer').insert(mapped_data).execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- ADD CLIENT ERROR ---", e)
        return jsonify({"error": str(e)}), 500

# ==========================================
# POS / SALES TRANSACTIONS
# ==========================================
@app.route('/api/sales', methods=['POST'])
def process_sale():
    # Processes a POS transaction, deducts stock, and logs the event
    try:
        data = request.json
        customer_id = data.get('customer_id')
        employee_id = 1  # Hardcoded pending session implementation
        total_amount = data.get('total_amount')
        items = data.get('items', [])
        
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # Insert parent sales record
        sale_payload = {
            "date": current_date,
            "customer_id": customer_id,
            "employee_id": employee_id,
            "total_amount": total_amount
        }
        sale_res = supabase.table('sales_transaction').insert(sale_payload).execute()
        sales_id = sale_res.data[0]['sales_id']
        
        # Process individual cart items
        for item in items:
            p_id = item['product_id']
            qty = int(item['quantity'])
            price = float(item['price'])
            subtotal = float(item['subtotal'])
            
            # Step 2: Save line item (sales_details)
            supabase.table('sales_details').insert({
                "sales_id": sales_id,
                "product_id": p_id,
                "quantity": qty,
                "price": price,
                "subtotal": subtotal
            }).execute()
            
            # Step 3: Deduct Live Inventory (product table) SAFELY
            prod_data = supabase.table('product').select('stock').eq('product_id', p_id).execute()
            current_stock = prod_data.data[0]['stock'] if prod_data.data else 0
            
            safe_new_stock = max(0, current_stock - qty)
            supabase.table('product').update({
                "stock": safe_new_stock 
            }).eq('product_id', p_id).execute()
            
            # Step 4: Write to Audit Log (inventory_log)
            supabase.table('inventory_log').insert({
                "product_id": p_id,
                "transaction_type": "Sale",
                "quantity_change": -qty, 
                "date": current_date
            }).execute()

            # --- NEW STEP 5: FIFO Batch Deduction (The Magic) ---
            qty_to_deduct = qty
            
            # Fetch all batches for this product that still have items inside, oldest first!
            batches_res = supabase.table('product_batches')\
                .select('*')\
                .eq('product_id', p_id)\
                .gt('qty_remaining', 0)\
                .order('date_received')\
                .execute()
            
            for batch in batches_res.data:
                if qty_to_deduct <= 0:
                    break # We found enough items, stop checking boxes!
                    
                batch_id = batch['batch_id']
                available_in_batch = batch['qty_remaining']
                
                if available_in_batch >= qty_to_deduct:
                    # This box has enough to cover the rest of the order
                    new_remaining = available_in_batch - qty_to_deduct
                    supabase.table('product_batches').update({"qty_remaining": new_remaining}).eq('batch_id', batch_id).execute()
                    qty_to_deduct = 0
                else:
                    # This box doesn't have enough! Empty it completely and keep looking.
                    supabase.table('product_batches').update({"qty_remaining": 0}).eq('batch_id', batch_id).execute()
                    qty_to_deduct -= available_in_batch

        return jsonify({"success": True, "sales_id": sales_id}), 201

    except Exception as e:
        print("--- SALE TRANSACTION ERROR ---", e)
        return jsonify({"error": str(e)}), 500

# ==========================================
# DASHBOARD METRICS
# ==========================================
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    # Aggregates KPI data for the main dashboard view
    try:
        prod_res = supabase.table('product').select('*').execute()
        products = prod_res.data
        
        low_stock_items = [p for p in products if p.get('stock', 0) <= 10]
        
        sales_res = supabase.table('sales_transaction').select('*').execute()
        sales = sales_res.data
        
        total_revenue = sum(float(s.get('total_amount', 0)) for s in sales)
        recent_sales = sorted(sales, key=lambda x: x['sales_id'], reverse=True)[:5]
        
        dashboard_data = {
            "total_revenue": total_revenue,
            "total_sales_count": len(sales),
            "total_products": len(products),
            "low_stock_count": len(low_stock_items),
            "low_stock_items": low_stock_items,
            "recent_sales": recent_sales
        }
        
        return jsonify(dashboard_data), 200

    except Exception as e:
        print("--- DASHBOARD ERROR ---", e)
        return jsonify({"error": str(e)}), 500

# ==========================================
# SALES LEDGER & REPORTING
# ==========================================
@app.route('/api/sales-record', methods=['GET'])
def get_sales_records():
    # Retrieves all sales transactions and joins customer names
    try:
        sales_res = supabase.table('sales_transaction').select('*').execute()
        sales = sales_res.data
        
        customers_res = supabase.table('customer').select('*').execute()
        customers = {c['customer_id']: c for c in customers_res.data}
        
        for sale in sales:
            c_id = sale.get('customer_id')
            sale['customer_name'] = customers.get(c_id, {}).get('name', 'Unknown')
            
        sales_sorted = sorted(sales, key=lambda x: x['sales_id'], reverse=True)
        return jsonify(sales_sorted), 200

    except Exception as e:
        print("--- SALES RECORD ERROR ---", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/sales/<int:sales_id>', methods=['GET'])
def get_sale_details(sales_id):
    # Retrieves comprehensive details for a specific sales invoice
    try:
        sale_res = supabase.table('sales_transaction').select('*').eq('sales_id', sales_id).execute()
        if not sale_res.data:
            return jsonify({"error": "Sale not found"}), 404
        sale = sale_res.data[0]
        
        cust_res = supabase.table('customer').select('*').eq('customer_id', sale['customer_id']).execute()
        customer = cust_res.data[0] if cust_res.data else {}
        
        items_res = supabase.table('sales_details').select('*').eq('sales_id', sales_id).execute()
        items = items_res.data
        
        for item in items:
            prod_res = supabase.table('product').select('product_name').eq('product_id', item['product_id']).execute()
            item['name'] = prod_res.data[0]['product_name'] if prod_res.data else "Unknown Product"
            
        return jsonify({
            "sale": sale,
            "customer": customer,
            "items": items
        }), 200

    except Exception as e:
        print(f"--- GET SALE {sales_id} ERROR ---", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/reports/sales', methods=['GET'])
def generate_sales_report():
    # Generates a sales revenue report based on a specific date range
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({"error": "Please provide start_date and end_date"}), 400
            
        res = supabase.table('sales_transaction')\
            .select('*')\
            .gte('date', start_date)\
            .lte('date', end_date)\
            .execute()
            
        sales = res.data
        total_revenue = sum(float(s['total_amount']) for s in sales)
        
        return jsonify({
            "start_date": start_date,
            "end_date": end_date,
            "total_transactions": len(sales),
            "total_revenue": total_revenue,
            "sales_data": sorted(sales, key=lambda x: x['date']) 
        }), 200

    except Exception as e:
        print("--- REPORT ERROR ---", e)
        return jsonify({"error": str(e)}), 500  

# ==========================================
# EMPLOYEE & USER MANAGEMENT
# ==========================================
@app.route('/api/employees', methods=['GET'])
def get_employees():
    # Retrieves employee profiles and joins their respective user auth roles
    try:
        emp_res = supabase.table('employee').select('*').execute()
        employees = emp_res.data
        
        users_res = supabase.table('users').select('*').execute()
        users = {u['id']: u for u in users_res.data}
        
        for emp in employees:
            u_id = emp.get('User_ID')
            user_info = users.get(u_id, {})
            emp['username'] = user_info.get('username', 'No Account')
            emp['role'] = user_info.get('role', 'Unassigned')
            emp['status'] = emp.get('status', 'Active') #dagdag ng status 
            
        return jsonify(employees), 200
    except Exception as e:
        print("--- GET EMPLOYEES ERROR ---", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/employees', methods=['POST'])
def add_employee():
    # Creates both a system login account and an employee profile 
    try:
        data = request.json
        
        user_payload = {
            "username": data.get("username"),
            "password": data.get("password"),
            "role": data.get("role", "Cashier")
        }
        user_res = supabase.table('users').insert(user_payload).execute()
        new_user_id = user_res.data[0]['id']
        
        emp_payload = {
            "name": data.get("name"),
            "contact": data.get("contact"),
            "email": data.get("email"),
            "address": data.get("address"),
            "User_ID": new_user_id 
        }
        supabase.table('employee').insert(emp_payload).execute()
        
        return jsonify({"success": True, "message": "User created!"}), 201

    except Exception as e:
        print("--- ADD EMPLOYEE ERROR ---", e)
        return jsonify({"error": str(e)}), 500
    
#nagdagdag ako neto for the update toggle ng status
@app.route('/api/employees/<int:emp_id>/status', methods=['PUT'])
def update_employee_status(emp_id):
    try:
        data = request.json
        status = data.get("status")

        supabase.table('employee') \
            .update({"status": status}) \
            .eq('employee_id', emp_id) \
            .execute()

        return jsonify({"success": True}), 200

    except Exception as e:
        print("--- STATUS UPDATE ERROR ---", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/update', methods=['PUT'])
def update_user_profile():
    # Updates the profile and auth credentials for the active user
    data = request.json
    username = data.get('username')

    if not username:
        return jsonify({"error": "User identifier is missing. Cannot update."}), 400

    try:
        user_response = supabase.table('users').select('id').eq('username', username).execute()
        
        if not user_response.data:
            return jsonify({"error": "User not found in the database."}), 404
            
        user_id = user_response.data[0]['id']

        employee_data = {
            "name": data.get('name'),
            "contact": data.get('contact'),
            "email": data.get('email'), 
            "address": data.get('address'),
            "age": data.get('age'),
            "birthday": data.get('birthday'),
            "status": data.get('status') #sa status pa dagdag na lang din sa supabase sabuihan si kuya lacs 
        }
        employee_clean = {k: v for k, v in employee_data.items() if v != "" and v is not None}

        users_data = {}
        if data.get('password'):
            users_data['password'] = generate_password_hash(data.get('password'))

        if employee_clean:
            supabase.table('employee').update(employee_clean).eq('User_ID', user_id).execute()
            
        if users_data:
            supabase.table('users').update(users_data).eq('id', user_id).execute()

        return jsonify({"message": "Profile updated successfully!"}), 200

    except Exception as e:
        print("--- PROFILE UPDATE ERROR ---", e)
        return jsonify({"error": "Failed to update database."}), 500
    
# ==========================================
# BATCH TRACKING (FIFO INVENTORY)
# ==========================================
@app.route('/api/stock/receive', methods=['POST'])
def receive_stock():
    # Logs individual incoming deliveries to product_batches and updates master inventory
    try:
        data = request.json
        product_id = data.get('product_id')
        supplier_name = data.get('supplier_name')
        qty_received = int(data.get('qty_received', 0)) 
        
        # --- NEW: Grab the retail price sent from React ---
        retail_price = data.get('retail_price') 

        if not product_id or not supplier_name or qty_received <= 0:
            return jsonify({"error": "Missing required fields or invalid quantity"}), 400

        batch_data = {
            "product_id": product_id,
            "supplier_name": supplier_name,
            "qty_received": qty_received,
            "qty_remaining": qty_received 
        }
        supabase.table('product_batches').insert(batch_data).execute()

        product_res = supabase.table('product').select('stock').eq('product_id', product_id).execute()
        
        if not product_res.data:
            return jsonify({"error": "Product not found in main inventory."}), 404
            
        current_stock = product_res.data[0]['stock']
        new_total_stock = current_stock + qty_received

        # --- NEW: Build the update payload to include the new price if it exists ---
        update_payload = {"stock": new_total_stock}
        if retail_price and float(retail_price) > 0:
            update_payload["retail_price"] = float(retail_price)

        # Save both the stock and the new price back to the main table
        supabase.table('product').update(update_payload).eq('product_id', product_id).execute()

        return jsonify({
            "message": "Stock received and batch logged successfully!", 
            "new_total": new_total_stock
        }), 200

    except Exception as e:
        print("--- RECEIVE STOCK ERROR ---", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/batches/<int:product_id>', methods=['GET'])
def get_product_batches(product_id):
    # Retrieves all delivery batches for a specific product for the Batch Report
    try:
        # Fetch batches and order them by date_received (oldest first for FIFO viewing)
        res = supabase.table('product_batches').select('*').eq('product_id', product_id).order('date_received').execute()
        return jsonify(res.data), 200
    except Exception as e:
        print(f"--- GET BATCHES ERROR ---", e)
        return jsonify({"error": str(e)}), 500  
         
# ==========================================
# SERVER INITIALIZATION
# ==========================================
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)