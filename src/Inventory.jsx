import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const Inventory = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  
  // Modal Toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Form Data (Matches your actual database schema now!)
  const [formData, setFormData] = useState({
    name: '', category: '', retail: 0
  });

  // --- EFFECTS ---
  useEffect(() => {
    fetchInventory();
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- API CALLS ---
  const fetchInventory = async () => {
    try {
      const response = await fetch('https://ergin-hardware.onrender.com/api/inventory');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://ergin-hardware.onrender.com/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        triggerToast("Product profile created successfully!");
        fetchInventory(); // Refresh the list from the database
        closeFormCompletely();
      } else {
        alert("Failed to save product. Check the Flask terminal.");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  // --- HELPERS ---
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleCloseAttempt = () => {
    if (formData.name !== "") setShowDiscardModal(true);
    else closeFormCompletely();
  };

  const closeFormCompletely = () => {
    setShowDiscardModal(false);
    setShowAddModal(false);
    setFormData({ name: '', category: '', retail: 0 });
  };

  return (
    <div className="outer-margin-container">
      {toast.show && <div className={`toast-notification ${toast.type}`}>{toast.message}</div>}

      <div className="connected-border-box">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo-section">
            <img src={logo} alt="Ergin Hardware" className="sidebar-logo" />
          </div>
          <nav className="side-nav">
            <div className="nav-item" onClick={() => navigate('/dashboard')}>DASHBOARD</div>
            <div className="nav-item active" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>USER ACCESS</div>
            <div className="nav-item" onClick={() => navigate('/transact')}>TRANSACT</div>
            <div className="nav-item" onClick={() => navigate('/generate-report')}>GENERATE REPORT</div>
            <div className="nav-item" onClick={() => navigate('/suppliers')}>SUPPLIERS</div>
            <div className="nav-item" onClick={() => navigate('/clients')}>CLIENTS</div>
          </nav>
          <div className="sidebar-footer">👤</div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area">
              <h2><span className="icon">📂</span> Inventory Management</h2>
            </div>
            <div className="admin-info">
              <p className="real-time-date">
                Date: {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
              </p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" />

          {/* Controls Area */}
          <div className="inventory-controls">
            <div className="search-wrapper">
              <input type="text" placeholder="Search....." className="search-input" />
              <span className="search-icon">🔍</span>
            </div>
            <div className="filter-group">
              <select className="filter-select"><option>Filter by</option></select>
              <select className="filter-select"><option>Sort by</option></select>
              <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
                + Add Product
              </button>
            </div>
          </div>

          {/* Table Area */}
          <div className="table-container shadow-box">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Stock Qty</th>
                  <th>Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.product_id}>
                      <td>{product.product_id}</td>
                      <td style={{ fontWeight: 'bold' }}>{product.product_name}</td>
                      <td>{product.category}</td>
                      <td>
                        <span style={{ 
                          color: product.stock > 0 ? '#27ae60' : '#e74c3c', 
                          fontWeight: 'bold' 
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td>₱{product.unit_price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No products found. Add one above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* --- MODAL: ADD PRODUCT --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header-red">
              <h3>+ Create Product Profile</h3>
              <button className="close-x" onClick={handleCloseAttempt}>✖</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Product Name:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Steel Nails"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hardware"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price (₱):</label>
                  <input 
                    type="number" 
                    placeholder="₱0.00"
                    step="0.01"
                    required
                    value={formData.retail}
                    onChange={(e) => setFormData({...formData, retail: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Initial Stock:</label>
                  <input 
                    type="text" 
                    value="0 (Add stock via Supplier Restock)"
                    disabled
                    className="readonly-input"
                    style={{ color: '#7f8c8d', fontStyle: 'italic', backgroundColor: '#f9f9f9' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="save-btn">Save Profile</button>
                <button type="button" className="cancel-btn" onClick={handleCloseAttempt}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: DISCARD CHANGES --- */}
      {showDiscardModal && (
        <div className="modal-overlay alert-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header-red">
              <h3>Discard Changes?</h3>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to quit editing?</p>
              <div className="delete-modal-footer">
                <button className="confirm-delete-btn" onClick={closeFormCompletely}>Discard Changes</button>
                <button className="cancel-delete-btn" onClick={() => setShowDiscardModal(false)}>Keep Editing</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;