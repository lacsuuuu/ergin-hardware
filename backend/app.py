import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

#CONFIGURATION & SETUP
load_dotenv()
app = Flask(__name__)
CORS(app) # Allows React to talk to Flask

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY. Check your .env file!")

supabase: Client = create_client(url, key)

#SUPPLIER ROUTES
# READ: Get all suppliers
@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    try:
        response = supabase.table('supplier').select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- GET SUPPLIERS ERROR ---", e)
        return jsonify({"error": str(e)}), 500

# CREATE: Add a new supplier
@app.route('/api/suppliers', methods=['POST'])
def add_supplier():
    try:
        data = request.json
        print("--- INCOMING SUPPLIER DATA ---", data)
        
        # Translate React data to exactly match your DB columns
        mapped_data = {
            "supplier_name": data.get("name"),   
            "contact": data.get("contact"),
            "address": data.get("address")
        }
        
        response = supabase.table('supplier').insert(mapped_data).execute()
        return jsonify(response.data)
    except Exception as e:
        print("\n!!! ADD SUPPLIER ERROR !!!")
        print(e)
        return jsonify({"error": str(e)}), 500

#PRODUCT (INVENTORY) ROUTES
# READ: Get all products
@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    try:
        response = supabase.table('product').select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- GET INVENTORY ERROR ---", e)
        return jsonify({"error": str(e)}), 500

# CREATE: Add a new product (Profile only, stock starts at 0)
@app.route('/api/product', methods=['POST'])
def add_product():
    try:
        data = request.json
        print("--- INCOMING PRODUCT DATA ---", data)
        
        mapped_data = {
            "product_name": data.get("name"),
            "category": data.get("category"),
            "stock": data.get("qty", 0),         
            "unit_price": data.get("retail")
        }
        
        response = supabase.table('product').insert(mapped_data).execute()
        return jsonify(response.data)
    except Exception as e:
        print("\n!!! ADD PRODUCT ERROR !!!")
        print(e)
        return jsonify({"error": str(e)}), 500

# DELETE: Remove an item
@app.route('/api/inventory/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    try:
        response = supabase.table('product').delete().eq('product_id', item_id).execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- DELETE ERROR ---", e)
        return jsonify({"error": str(e)}), 500

#USER AUTHENTICATION (Saved for later)
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        inp_username = data.get('username')
        inp_password = data.get('password')

        response = supabase.table('users').select("username, role")\
            .eq('username', inp_username)\
            .eq('password', inp_password)\
            .execute()
        
        user_list = response.data

        if len(user_list) > 0:
            user = user_list[0]
            return jsonify({"success": True, "username": user['username'], "role": user['role']})
        else:
            return jsonify({"success": False, "message": "Invalid login"}), 401

    except Exception as e:
        print("Login Error:", e) 
        return jsonify({"error": str(e)}), 500


#TRANSACTIONS (RESTOCK)
@app.route('/api/restock', methods=['POST'])
def process_restock():
    try:
        data = request.json
        print("--- INCOMING RESTOCK DATA ---", data)
        
        supplier_id = data.get('supplier_id')
        # Hardcoding employee_id to 1 for now until you have user login sessions
        employee_id = 1 
        total_cost = data.get('total_cost')
        items = data.get('items', []) # The list of products in the delivery
        
        # Get today's date formatted for PostgreSQL (YYYY-MM-DD)
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # --- 1. Create the Receipt (restock table) ---
        restock_payload = {
            "date": current_date,
            "supplier_id": supplier_id,
            "employee_id": employee_id,
            "total_cost": total_cost
        }
        restock_res = supabase.table('restock').insert(restock_payload).execute()
        batch_id = restock_res.data[0]['batch_id']
        
        # --- 2, 3, & 4. Process Each Item ---
        for item in items:
            p_id = item['product_id']
            qty = int(item['quantity'])
            u_cost = float(item['unit_cost'])
            
            # Step 2: Save line item (restock_detail)
            supabase.table('restock_detail').insert({
                "batch_id": batch_id,
                "product_id": p_id,
                "quantity": qty,
                "unit_cost": u_cost
            }).execute()
            
            # Step 3: Update Live Inventory (product table)
            # Fetch current stock
            prod_data = supabase.table('product').select('stock').eq('product_id', p_id).execute()
            current_stock = prod_data.data[0]['stock'] if prod_data.data else 0
            
            # Add new qty to current stock and link the supplier
            supabase.table('product').update({
                "stock": current_stock + qty,
                "supplier_id": supplier_id
            }).eq('product_id', p_id).execute()
            
            # Step 4: Write to Audit Log (inventory_log)
            supabase.table('inventory_log').insert({
                "product_id": p_id,
                "transaction_type": "Restock",
                "quantity_change": qty,
                "date": current_date
            }).execute()

        print(f"--- RESTOCK BATCH #{batch_id} SUCCESSFUL ---")
        return jsonify({"success": True, "batch_id": batch_id}), 201

    except Exception as e:
        print("\n!!! RESTOCK TRANSACTION FAILED !!!")
        print(e)
        return jsonify({"error": str(e)}), 500

#READ: Get all clients
@app.route('/api/clients', methods=['GET'])
def get_clients():
    try:
        response = supabase.table('customer').select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        print("--- GET CLIENTS ERROR ---", e)
        return jsonify({"error": str(e)}), 500

#CREATE: Add a new client
@app.route('/api/clients', methods=['POST'])
def add_client():
    try:
        data = request.json
        print("--- INCOMING CLIENT DATA ---", data)
        
        # Translate React data to match your 'customer' table perfectly
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
        print("\n!!! ADD CLIENT ERROR !!!")
        print(e)
        return jsonify({"error": str(e)}), 500

#TRANSACTIONS (SALES / POS)
@app.route('/api/sales', methods=['POST'])
def process_sale():
    try:
        data = request.json
        print("--- INCOMING SALE DATA ---", data)
        
        customer_id = data.get('customer_id')
        employee_id = 1 # Hardcoded until user sessions are built
        total_amount = data.get('total_amount')
        items = data.get('items', []) # The cart items
        
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # --- 1. Create the Receipt (sales_transaction) ---
        sale_payload = {
            "date": current_date,
            "customer_id": customer_id,
            "employee_id": employee_id,
            "total_amount": total_amount
        }
        sale_res = supabase.table('sales_transaction').insert(sale_payload).execute()
        sales_id = sale_res.data[0]['sales_id']
        
        # --- 2, 3, & 4. Process Each Item in the Cart ---
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
            
            # Step 3: Deduct Live Inventory (product table)
            prod_data = supabase.table('product').select('stock').eq('product_id', p_id).execute()
            current_stock = prod_data.data[0]['stock'] if prod_data.data else 0
            
            supabase.table('product').update({
                "stock": current_stock - qty # DEDUCTING stock here!
            }).eq('product_id', p_id).execute()
            
            # Step 4: Write to Audit Log (inventory_log)
            supabase.table('inventory_log').insert({
                "product_id": p_id,
                "transaction_type": "Sale",
                "quantity_change": -qty, # Negative number to show it left the warehouse
                "date": current_date
            }).execute()

        print(f"--- SALE #{sales_id} SUCCESSFUL ---")
        return jsonify({"success": True, "sales_id": sales_id}), 201

    except Exception as e:
        print("\n!!! SALE TRANSACTION FAILED !!!")
        print(e)
        return jsonify({"error": str(e)}), 500

# 8. DASHBOARD ROUTES
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        # 1. Fetch Products to find Low Stock items
        prod_res = supabase.table('product').select('*').execute()
        products = prod_res.data
        
        # Filter for items that have 10 or fewer in stock
        low_stock_items = [p for p in products if p.get('stock', 0) <= 10]
        
        # 2. Fetch Sales to calculate Revenue
        sales_res = supabase.table('sales_transaction').select('*').execute()
        sales = sales_res.data
        
        # Calculate total revenue across all time (you can filter by month later!)
        total_revenue = sum(float(s.get('total_amount', 0)) for s in sales)
        
        # Sort sales to get the 5 most recent ones
        recent_sales = sorted(sales, key=lambda x: x['sales_id'], reverse=True)[:5]
        
        # Package it all up for React
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
        print("\n!!! DASHBOARD ERROR !!!")
        print(e)
        return jsonify({"error": str(e)}), 500

# 9. SALES RECORD (LEDGER) ROUTES
@app.route('/api/sales-record', methods=['GET'])
def get_sales_records():
    try:
        # Fetch all sales
        sales_res = supabase.table('sales_transaction').select('*').execute()
        sales = sales_res.data
        
        # Fetch all customers so we can attach their names to the table
        customers_res = supabase.table('customer').select('*').execute()
        customers = {c['customer_id']: c for c in customers_res.data}
        
        # Merge the customer name into the sale data
        for sale in sales:
            c_id = sale.get('customer_id')
            sale['customer_name'] = customers.get(c_id, {}).get('name', 'Unknown')
            
        # Sort newest to oldest
        sales_sorted = sorted(sales, key=lambda x: x['sales_id'], reverse=True)
        return jsonify(sales_sorted), 200

    except Exception as e:
        print("\n!!! SALES RECORD ERROR !!!", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/sales/<int:sales_id>', methods=['GET'])
def get_sale_details(sales_id):
    try:
        # 1. Get Sale Header
        sale_res = supabase.table('sales_transaction').select('*').eq('sales_id', sales_id).execute()
        if not sale_res.data:
            return jsonify({"error": "Sale not found"}), 404
        sale = sale_res.data[0]
        
        # 2. Get Customer Details
        cust_res = supabase.table('customer').select('*').eq('customer_id', sale['customer_id']).execute()
        customer = cust_res.data[0] if cust_res.data else {}
        
        # 3. Get Line Items
        items_res = supabase.table('sales_details').select('*').eq('sales_id', sales_id).execute()
        items = items_res.data
        
        # 4. Get Product Names for the line items
        for item in items:
            prod_res = supabase.table('product').select('product_name').eq('product_id', item['product_id']).execute()
            item['name'] = prod_res.data[0]['product_name'] if prod_res.data else "Unknown Product"
            
        return jsonify({
            "sale": sale,
            "customer": customer,
            "items": items
        }), 200

    except Exception as e:
        print(f"\n!!! GET SALE {sales_id} ERROR !!!", e)
        return jsonify({"error": str(e)}), 500
@app.route('/api/employees', methods=['GET'])
def get_employees():
    try:
        # Fetch employees
        emp_res = supabase.table('employee').select('*').execute()
        employees = emp_res.data
        
        # Fetch users to match usernames and roles
        users_res = supabase.table('users').select('*').execute()
        users = {u['id']: u for u in users_res.data}
        
        # Combine the data so React gets one clean list
        for emp in employees:
            u_id = emp.get('User_ID')
            user_info = users.get(u_id, {})
            emp['username'] = user_info.get('username', 'No Account')
            emp['role'] = user_info.get('role', 'Unassigned')
            
        return jsonify(employees), 200
    except Exception as e:
        print("\n!!! GET EMPLOYEES ERROR !!!", e)
        return jsonify({"error": str(e)}), 500

# USER ACCESS & EMPLOYEE ROUTES
@app.route('/api/employees', methods=['POST'])
def add_employee():
    try:
        data = request.json
        print("--- INCOMING EMPLOYEE DATA ---", data)
        
        # --- 1. Create the Login Account (users table) ---
        user_payload = {
            "username": data.get("username"),
            "password": data.get("password"),
            "role": data.get("role", "Cashier")
        }
        user_res = supabase.table('users').insert(user_payload).execute()
        new_user_id = user_res.data[0]['id']
        
        # --- 2. Create the Employee Profile (employee table) ---
        emp_payload = {
            "name": data.get("name"),
            "contact": data.get("contact"),
            "email": data.get("email"),
            "address": data.get("address"),
            "User_ID": new_user_id # Link them together!
        }
        supabase.table('employee').insert(emp_payload).execute()
        
        return jsonify({"success": True, "message": "User created!"}), 201

    except Exception as e:
        print("\n!!! ADD EMPLOYEE ERROR !!!")
        print(e)
        return jsonify({"error": str(e)}), 500

# 11. GENERATE REPORT ROUTES
@app.route('/api/reports/sales', methods=['GET'])
def generate_sales_report():
    try:
        # Get the dates sent from React's date pickers
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({"error": "Please provide start_date and end_date"}), 400
            
        # Fetch sales strictly within that date range!
        res = supabase.table('sales_transaction')\
            .select('*')\
            .gte('date', start_date)\
            .lte('date', end_date)\
            .execute()
            
        sales = res.data
        
        # Calculate the math so React doesn't have to
        total_revenue = sum(float(s['total_amount']) for s in sales)
        
        return jsonify({
            "start_date": start_date,
            "end_date": end_date,
            "total_transactions": len(sales),
            "total_revenue": total_revenue,
            "sales_data": sorted(sales, key=lambda x: x['date']) # Sort by oldest to newest
        }), 200

    except Exception as e:
        print("\n!!! REPORT ERROR !!!", e)
        return jsonify({"error": str(e)}), 500    
       
# START SERVER
if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)