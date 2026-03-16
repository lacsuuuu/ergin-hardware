# Repository Overview

This is a simple full‑stack inventory and sales web application. It pairs a **React/Vite** frontend with a **Flask** backend that talks to a **Supabase** PostgreSQL database. The two sides communicate over a REST API at `/api/*` and run in the same repository.

## Architecture

* `backend/app.py` is the single Flask app.  All HTTP routes live here; they are grouped by feature (suppliers, inventory, clients, transactions, dashboard, sales, employees, reports, user updates).
* The backend uses `supabase` Python client to read/write tables such as `supplier`, `product`, `customer`, `restock`, `sales_transaction`, `employee`, `users`, etc.  Look at the route implementations for examples of mapping incoming JSON to DB column names and chaining multiple operations (e.g. restock and sale endpoints update inventory + audit logs).
* Environment variables `SUPABASE_URL` and `SUPABASE_KEY` are loaded via `python-dotenv`.  A `.env` file is expected at the project root when running locally; `backend/test_connection.py` can be run to verify connectivity.
* CORS is enabled (`flask_cors.CORS(app)`) so the React app can call the API during development (`localhost:3000 -> 5000`).

* Frontend lives in `src/`.  Every major view is its own `.jsx` component (e.g. `Dashboard.jsx`, `Inventory.jsx`, `SalesRecord.jsx` etc.).  `App.jsx` and `main.jsx` bootstrap React Router (`react-router-dom`) for navigation.  Styling is done with a handful of CSS classes in `index.css` and component‑specific `.css` files.
* API base URL is chosen at runtime via:
  ```js
  const API_URL = window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:5000'
    : 'https://ergin-hardware.onrender.com';
  ```
  This pattern recurs in all components that call the backend.
* Data fetching uses the native `fetch` API and updates state through React hooks (`useState`, `useEffect`).  Little business logic exists in the frontend; most calculations (totals, low‑stock filtering, etc.) are done by the server.

## Developer Workflows

1. **Backend**
   * Create a Python virtual environment in `backend/` and install: `pip install -r backend/requirements.txt`.
   * Populate a `.env` file with `SUPABASE_URL`/`SUPABASE_KEY` and optionally `PORT`.
   * Run `python backend/app.py` (or `FLASK_APP=backend/app.py flask run`) to start the API on port 5000.
   * Use `python backend/test_connection.py` to sanity‑check the Supabase setup.
   * Deployments currently target Render; the production URL is hard‑coded in the frontend as shown above.

2. **Frontend**
   * Install Node deps in the repo root: `npm install` (or `pnpm`/`yarn`).
   * Start dev server with `npm run dev`.  Hot‑reloading works thanks to Vite.
   * Build for production with `npm run build`; preview with `npm run preview`.
   * ESLint rules are defined in `eslint.config.js`; run `npm run lint` for static checks.

3. **Database**
   * There is no local PostgreSQL; everything goes through Supabase.  Tables are assumed to exist with the names referenced in `app.py`.
   * Column naming conventions: snake_case, e.g. `product_id`, `supplier_name`.  React forms send camelCase field names which are remapped server‑side (`mapped_data` objects).

## Project‑Specific Conventions

* All API routes return JSON and catch exceptions to print a log and respond with a 500 plus `{"error": ...}`.
* New features are often added by editing `app.py` – keep the same try/except structure and return patterns.
* State in frontend components is initialized to sensible defaults (objects with zeroed fields or empty arrays).
* Navigation sidebar items hard‑code route paths; keep them in sync with the `<Routes>` defined elsewhere.
* Product/inventory interactions always update two things: the `product` table's `stock` and the `inventory_log` audit table.
* User authentication is rudimentary: a `/api/login` route that checks plain‑text password.  Passwords are hashed only when updating (`werkzeug.security.generate_password_hash` in `/api/users/update`).

## Integration Points & External Dependencies

* **Supabase**: used for all persistence.  The client is created once at import time in `app.py`.  Look at any route to see examples of `supabase.table(...).select/insert/update/delete().execute()`.
* **Flask‑CORS**: allows cross‑origin requests from the Vite server.
* **Vite/React**: `<script type="module">` entry in `index.html` loads `main.jsx`.  The React Compiler plugin (`babel-plugin-react-compiler`) is enabled in `vite.config.js`, though the app itself is plain JavaScript.

## Notes for AI Agents

* Start by reading `backend/app.py` to understand available endpoints and the database schema implicitly used there.  Use those endpoints when writing frontend code or adding new API logic.
* When adding a new form in React, mirror the naming pattern in the backend: send simple objects and let the server map to database fields.
* UI components typically live next to their CSS; follow the existing style (light use of inline styles supplemented by `index.css`).
* There is currently no automated test suite – manual smoke tests (using the browser or `test_connection.py`) are the norm.
* Be conservative about adding new dependencies; the project stays minimal (no Redux, no axios, no TypeScript).

---

Feel free to ask for clarification if any part of this guide is unclear or if you need more details about database structure, routing, or development flow.