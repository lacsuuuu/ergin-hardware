import os
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. Load the secrets
load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

print(f"URL found: {url}")
# We print only the first 5 chars of the key for safety
print(f"Key found: {key[:5]}..." if key else "Key found: None")

if not url or not key:
    print("❌ ERROR: Missing keys in .env file!")
    exit()

# 2. Try to connect
try:
    print("Attempting to connect to Supabase...")
    supabase: Client = create_client(url, key)
    
    # 3. Try a simple fetch (doesn't matter if table is empty)
    # We just want to see if Supabase replies without crashing.
    # Replace 'inventory' with 'products' or whatever table name you made.
    response = supabase.table('Inventory_Log').select("*").limit(1).execute()
    
    print("✅ SUCCESS! Connected to Supabase.")
    print("Data received:", response.data)

except Exception as e:
    print("❌ CONNECTION FAILED")
    print("Error details:", e)