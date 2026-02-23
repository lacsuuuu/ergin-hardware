import os
from flask import Flask, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. CONFIGURATION

# Load environment variables from .env file
load_dotenv()

# Initialize Flask
app = Flask(__name__)

# Enable CORS: This allows your React app (running on a different port)
# to talk to this Flask app without security errors.
CORS(app)

# Initialize Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Safety check to ensure keys are loaded
if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY. Check your .env file!")

supabase: Client = create_client(url, key)

# ROUTES (API Endpoints)

@app.route('/')
def home():
    """A simple check to see if the server is running."""
    return jsonify({
        "status": "online", 
        "message": "Flask Backend is running successfully!"
    })

@app.route('/api/data')
def get_data():
    """
    Fetches data from Supabase and sends it to React.
    Replace 'your_table_name' with a real table from your database.
    """
    try:
        # Example: Fetch all rows from a table named "todos" or "users"
        # CHANGE 'todos' to your actual table name!
        response = supabase.table('todos').select("*").execute()
        
        return jsonify(response.data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from flask import request  

# READ: Get all todos
@app.route('/todos', methods=['GET'])
def get_todos():
    try:
        # Select all rows from the 'todos' table
        response = supabase.table('todos').select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# CREATE: Add a new todo
@app.route('/todos', methods=['POST'])
def add_todo():
    try:
        # Get the task text sent from React
        data = request.json
        new_task = data.get('task')

        # Insert it into Supabase
        response = supabase.table('todos').insert({"task": new_task}).execute()
        
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET: Fetch all inventory items
@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    try:
        response = supabase.table('inventory').select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST: Add a new item
@app.route('/api/inventory', methods=['POST'])
def add_item():
    try:
        data = request.json
        # Insert the data sent from React
        response = supabase.table('inventory').insert(data).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# DELETE: Remove an item by ID
@app.route('/api/inventory/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    try:
        # Delete the row where the 'id' column matches
        response = supabase.table('inventory').delete().eq('id', item_id).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        # We expect the frontend to send 'username' and 'password'
        inp_username = data.get('username')
        inp_password = data.get('password')

        # We check if a user exists with THIS username and THIS password
        response = supabase.table('users').select("username, role")\
            .eq('username', inp_username)\
            .eq('password', inp_password)\
            .execute()
        
        user_list = response.data

        if len(user_list) > 0:
            user = user_list[0]
            return jsonify({
                "success": True, 
                "username": user['username'],
                "role": user['role']
            })
        else:
            return jsonify({"success": False, "message": "Invalid login"}), 401

    except Exception as e:
        print("Login Error:", e) # Print error to terminal for debugging
        return jsonify({"error": str(e)}), 500
    
# START SERVER
if __name__ == '__main__':
    # Running on port 5000 is the standard for Flask
    app.run(debug=True, port=5000)