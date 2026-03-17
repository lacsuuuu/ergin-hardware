import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';
import TopHeader from './TopHeader';
import BatchReport from './BatchReport';
import Logout from './Logout';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' 
  : 'https://ergin-hardware.onrender.com';

const Inventory = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  
  // Modal Toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // NEW EDIT MODAL
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  
  // Form Data 
  const [formData, setFormData] = useState({
    name: '', category: '', retail_price: 0, selling_price: 0
  });

  const [editData, setEditData] = useState({
    id: '', name: '', category: '', retail_price: 0, selling_price: 0
  }); // NEW EDIT DATA STATE

  // --- STATES FOR ACTION MENU & BATCH REPORT ---
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [showBatchReport, setShowBatchReport] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); 

  // --- EFFECTS ---
  useEffect(() => {
    fetchInventory();
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- API CALLS ---
  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inventory`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        triggerToast("Product profile created successfully!");
        fetchInventory(); 
        closeFormCompletely();
      } else {
        alert("Failed to save product. Check the Flask terminal.");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  // --- NEW: EDIT API CALL ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/product/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        triggerToast("Product updated successfully!");
        setShowEditModal(false);
        fetchInventory();
      } else {
        alert("Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating:", error);
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
    setFormData({ name: '', category: '', retail_price: 0, selling_price: 0 });
  };

  const openEditModal = (product) => {
    setEditData({
      id: product.product_id,
      name: product.product_name,
      category: product.category,
      retail_price: product.retail_price || 0,
      selling_price: product.selling_price || 0
    });
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const openBatchReport = (product) => {
    setSelectedProduct({
      id: product.product_id,
      name: product.product_name,
      category: product.category,
      qty: product.stock,
      retail: product.retail_price || 0,
      unit: 'pcs' 
    });
    setShowBatchReport(true);
    setActiveDropdown(null); 
  };

  const handleArchive = (productId) => {
    alert(`Archive functionality for Product ID: ${productId} coming soon!`);
    setActiveDropdown(null);
  };
  
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
  
  return (
      // Checks every single column for a match!
      product.product_id?.toString().toLowerCase().includes(searchLower) ||
      product.product_name?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower) ||
      product.stock?.toString().toLowerCase().includes(searchLower) ||
      product.retail_price?.toString().toLowerCase().includes(searchLower) ||
      product.selling_price?.toString().toLowerCase().includes(searchLower)
    );
  });

  // --- SORTING LOGIC ---
  // We use [...filteredProducts] to make a safe copy so we don't accidentally mutate the original data
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return (a.product_name || '').localeCompare(b.product_name || '');
      case 'name-desc':
        return (b.product_name || '').localeCompare(a.product_name || '');
      case 'price-low':
        return (Number(a.selling_price) || 0) - (Number(b.selling_price) || 0);
      case 'price-high':
        return (Number(b.selling_price) || 0) - (Number(a.selling_price) || 0);
      case 'stock-low':
        return (Number(a.stock) || 0) - (Number(b.stock) || 0);
      case 'stock-high':
        return (Number(b.stock) || 0) - (Number(a.stock) || 0);
      default:
        return 0; // If nothing is selected, leave it exactly as it came from the database
    }
  });

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
          <Logout />
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area">
              <h2>Inventory Management</h2>
            </div>
            <TopHeader />
          </header>

          <hr className="divider" />
          {/* Controls Area */}
          <div className="inventory-controls">
            <div className="search-wrapper">
              <input 
                  type="text" 
                  placeholder="Search all columns..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
                  <select 
                    className="filter-select" 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="">Sort by...</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-high">Price (Highest First)</option>
                    <option value="price-low">Price (Lowest First)</option>
                    <option value="stock-high">Stock (Highest First)</option>
                    <option value="stock-low">Stock (Lowest First)</option>
                  </select>
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
                  <th>Retail Price</th>
                  <th>Selling Price</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.length > 0 ? (
                  sortedProducts.map((product) => (
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
                      <td style={{ color: '#000' }}>
                        ₱{Number(product.retail_price || 0).toFixed(2)}
                      </td>
                      <td style={{ color: '#000' }}>
                        ₱{Number(product.selling_price || 0).toFixed(2)}
                      </td>
                      
                      <td style={{ position: 'relative', textAlign: 'center', overflow: 'visible' }}>
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === product.product_id ? null : product.product_id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', color: '#7f8c8d' }}
                        >
                          ⋮
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === product.product_id && (
                          <>
                            <div 
                              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} 
                              onClick={() => setActiveDropdown(null)}
                            />
                            
                            <div style={{
                              position: 'absolute', right: '40px', top: '25px', background: 'white',
                              border: '1px solid #e0e0e0', borderRadius: '6px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                              zIndex: 10, display: 'flex', flexDirection: 'column', width: '120px', overflow: 'hidden'
                            }}>
                              <button 
                                onClick={() => openEditModal(product)}
                                style={{ padding: '10px 15px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f1f2f6', fontSize: '13px', fontWeight: 'bold', color: '#2980b9' }}
                                onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                                onMouseOut={(e) => e.target.style.background = 'white'}
                              >
                                Edit / Update
                              </button>
                              <button 
                                onClick={() => openBatchReport(product)}
                                style={{ padding: '10px 15px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f1f2f6', fontSize: '13px', fontWeight: 'bold', color: '#000' }}
                                onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                                onMouseOut={(e) => e.target.style.background = 'white'}
                              >
                                Batches
                              </button>
                              <button 
                                onClick={() => handleArchive(product.product_id)}
                                style={{ padding: '10px 15px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#e74c3c' }}
                                onMouseOver={(e) => e.target.style.background = '#fdf3f2'}
                                onMouseOut={(e) => e.target.style.background = 'white'}
                              >
                                Archive
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No products found. Add one above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* --- RENDER THE BATCH REPORT IF OPEN --- */}
      {showBatchReport && selectedProduct && (
        <BatchReport 
          activeProduct={selectedProduct} 
          currentTime={currentTime} 
          onClose={() => setShowBatchReport(false)} 
        />
      )}

      {/* --- MODAL: EDIT PRODUCT (NEW) --- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header-red" style={{ backgroundColor: '#d32f2f' }}>
              <h3>Edit Product Profile</h3>
              <button 
                style={{ background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                className="close-x" 
                onClick={() => setShowEditModal(false)}
              >
                ✖
              </button>
            </div>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Product Name:</label>
                  <input type="text" required value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Category:</label>
                  <input type="text" required value={editData.category} onChange={(e) => setEditData({...editData, category: e.target.value})} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ width: '50%' }}>
                  <label>Retail / Cost Price (₱):</label>
                  <input type="number" step="0.01" required value={editData.retail_price} onChange={(e) => setEditData({...editData, retail_price: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group" style={{ width: '50%' }}>
                  <label>Actual Selling Price (₱):</label>
                  <input type="number" step="0.01" required value={editData.selling_price} onChange={(e) => setEditData({...editData, selling_price: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="save-btn" style={{ backgroundColor: '#d32f2f' }}>Save Changes</button>
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD PRODUCT --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header-red">
              <h3>+ Create Product Profile</h3>
              <button style={{
                        background: '#f1f2f6',
                        color: '#333',
                        border: '1px solid #bdc3c7',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} 
                      className="close-x" 
                      onClick={handleCloseAttempt}
                    >
                      ✖
                    </button>
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
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Category:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hardware"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ width: '50%' }}>
                  <label>Retail / Cost Price (₱):</label>
                  <input 
                    type="number" 
                    placeholder="₱0.00"
                    step="0.01"
                    required
                    value={formData.retail_price}
                    onChange={(e) => setFormData({...formData, retail_price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group" style={{ width: '50%' }}>
                  <label>Actual Selling Price (₱):</label>
                  <input 
                    type="number" 
                    placeholder="₱0.00"
                    step="0.01"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({...formData, selling_price: parseFloat(e.target.value)})}
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