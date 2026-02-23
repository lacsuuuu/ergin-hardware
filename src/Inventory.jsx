import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';
import BatchReport from './BatchReport'; 

const Inventory = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  
  // Modal Toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false); // Added for Batch View
  
  // Selection state
  const [selectedId, setSelectedId] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null); // Added to pass data to report
  const [formData, setFormData] = useState({
    id: 'ERG-004', name: '', category: 'Construction Materials', qty: 10, unit: '', retail: 0
  });

  // --- LOGIC HANDLERS ---
  useEffect(() => {
    fetchInventory();
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);

    
  }, []);

    const fetchInventory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/inventory');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCloseAttempt = () => {
    if (formData.name !== "") setShowDiscardModal(true);
    else setShowAddModal(false);
  };

  const confirmDiscard = () => {
    setShowDiscardModal(false);
    setShowAddModal(false);
    setFormData({ id: 'ERG-004', name: '', category: 'Construction Materials', qty: 10, unit: '', retail: 0 });
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
  if (!selectedId) return;

  try {
    await fetch(`http://127.0.0.1:5000/api/inventory/${selectedId}`, {
      method: 'DELETE',
    });

    fetchInventory();
    setShowDeleteModal(false);
  } catch (error) {
    console.error("Error deleting:", error);
  }
};

  const handleSave = async (e) => {
  e.preventDefault();
  
  const newProduct = { 
    ...formData, 
    selling: formData.retail // or however you calculate selling price
  };

  try {
    const response = await fetch('http://127.0.0.1:5000/api/Inventory_Log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });

    if (response.ok) {
      fetchInventory(); // <--- Refresh the list from the database
      setShowAddModal(false);
      // Reset form
      setFormData({ id: 'ERG-005', name: '', category: 'Materials', qty: 0, unit: '', retail: 0 });
    } else {
      alert("Failed to save product");
    }
  } catch (error) {
    console.error("Error saving:", error);
  }
};

  // Function to trigger the Batch Modal
  const handleViewBatch = (product) => {
    setActiveProduct(product);
    setShowBatchModal(true);
  };

  return (
    <div className="outer-margin-container">
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
              <button className="add-product-btn" onClick={() => setShowAddModal(true)}>Add Product</button>
            </div>
          </div>

          {/* Table Area */}
          <div className="table-container shadow-box">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Qty.</th>
                  <th>Unit</th>
                  <th>Retail Price</th>
                  <th>Selling Price</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.id}>
                    <td className="item-id-cell">{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.qty}</td>
                    <td>{item.unit}</td>
                    <td>₱{item.retail}</td>
                    <td>₱{item.selling}</td>
                    <td>
                      <div className="action-cell-group">
                        <button className="delete-icon-btn" onClick={() => handleDeleteClick(item.id)}>🗑️</button>
                        <button className="view-batch-btn" onClick={() => handleViewBatch(item)}>View Batch</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* --- MODAL: BATCH REPORT (INVOKED HERE) --- */}
      {showBatchModal && (
        <BatchReport 
          activeProduct={activeProduct} 
          currentTime={currentTime} 
          onClose={() => setShowBatchModal(false)} 
        />
      )}

      {/* --- MODAL: ADD PRODUCT --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header-red">
              <h3>+ Add New Product</h3>
              <button className="close-x" onClick={handleCloseAttempt}>✖</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Item ID:</label>
                  <input type="text" value={formData.id} readOnly className="readonly-input" />
                </div>
                <div className="form-group">
                  <label>Unit:</label>
                  <select 
                    required
                    value={formData.unit} 
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="">Select Unit</option>
                    <option value="pcs">pcs</option>
                    <option value="set">set</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Product:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Steel Nails"
                    required
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Quantity:</label>
                  <input 
                    type="number" 
                    value={formData.qty}
                    onChange={(e) => setFormData({...formData, qty: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category:</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Price:</label>
                  <input 
                    type="number" 
                    placeholder="₱0"
                    onChange={(e) => setFormData({...formData, retail: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={handleCloseAttempt}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: DELETE CONFIRMATION --- */}
      {showDeleteModal && (
        <div className="modal-overlay alert-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header-red">
              <h3>Delete Item?</h3>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this product?</p>
              <div className="delete-modal-footer">
                <button className="confirm-delete-btn" onClick={confirmDelete}>Confirm Delete</button>
                <button className="cancel-delete-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
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
                <button className="confirm-delete-btn" onClick={confirmDiscard}>Discard Changes</button>
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