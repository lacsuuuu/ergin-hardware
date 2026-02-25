import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const Suppliers = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // --- MODAL & ACTION STATES ---
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false); // NEW
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // --- DATA STATE ---
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryProducts, setInventoryProducts] = useState([]); // NEW: For the dropdown
  const [selectedSupplier, setSelectedSupplier] = useState(null); // NEW
  
  const [formData, setFormData] = useState({
    name: '', contact: '', address: ''
  });

  // NEW: State for the items in the current delivery
  const [restockItems, setRestockItems] = useState([
    { product_id: '', quantity: 0, unit_cost: 0 }
  ]);

  // --- EFFECTS ---
  useEffect(() => {
    fetchSuppliers();
    fetchInventory(); // Fetch products so we can select them in the modal
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // --- API CALLS ---
  const fetchSuppliers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/inventory');
      const data = await response.json();
      setInventoryProducts(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        triggerToast("New supplier added!");
        fetchSuppliers(); 
        closeFormCompletely();
      } else {
        alert("Failed to save supplier. Check Flask terminal.");
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  // --- RESTOCK LOGIC ---
  const openRestockModal = (supplier) => {
    setSelectedSupplier(supplier);
    setRestockItems([{ product_id: '', quantity: 0, unit_cost: 0 }]);
    setShowRestockModal(true);
    setOpenMenuId(null);
  };

  const handleAddRestockRow = () => {
    setRestockItems([...restockItems, { product_id: '', quantity: 0, unit_cost: 0 }]);
  };

  const handleRestockItemChange = (index, field, value) => {
    const updatedItems = [...restockItems];
    updatedItems[index][field] = value;
    setRestockItems(updatedItems);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-calculate the total cost of the delivery
    const totalCost = restockItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    
    const payload = {
      supplier_id: selectedSupplier.supplier_id, // Ensure we send the correct ID
      total_cost: totalCost,
      items: restockItems
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        triggerToast("Delivery received! Inventory updated successfully.");
        fetchInventory(); // Refresh inventory data in the background
        closeFormCompletely();
      } else {
        alert("Failed to process restock. Check Flask terminal.");
      }
    } catch (error) {
      console.error("Error processing restock:", error);
    }
  };

  // --- HELPERS ---
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleCancelAttempt = () => {
    const hasData = Object.values(formData).some(val => val !== '');
    if (hasData) setShowDiscardModal(true);
    else closeFormCompletely();
  };

  const closeFormCompletely = () => {
    setShowModal(false);
    setShowDiscardModal(false);
    setShowRestockModal(false);
    setFormData({ name: '', contact: '', address: '' });
  };

  const filteredSuppliers = suppliers.filter(s =>
    (s.supplier_name && s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.contact && s.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="outer-margin-container">
      {toast.show && <div className={`toast-notification ${toast.type}`}>{toast.message}</div>}

      <div className="connected-border-box">
        <aside className="sidebar">
          <div className="logo-section"><img src={logo} alt="Logo" className="sidebar-logo" /></div>
          <nav className="side-nav">
            <div className="nav-item" onClick={() => navigate('/dashboard')}>DASHBOARD</div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>USER ACCESS</div>
            <div className="nav-item" onClick={() => navigate('/transact')}>TRANSACT</div>
            <div className="nav-item" onClick={() => navigate('/generate-report')}>GENERATE REPORT</div>
            <div className="nav-item active">SUPPLIERS</div>
            <div className="nav-item" onClick={() => navigate('/clients')}>CLIENTS</div>
          </nav>
          <div className="sidebar-footer">👤</div>
        </aside>

        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area"><h2><span className="icon">🚚</span> Supplier Management</h2></div>
            <div className="admin-info">
              <p className="real-time-date">Date: {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}</p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" />

          <div className="supplier-controls">
            <div className="search-wrapper">
              <input type="text" placeholder="Search suppliers..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <span className="search-icon">🔍</span>
            </div>
            <button className="add-supplier-btn" onClick={() => setShowModal(true)}>Add Supplier</button>
          </div>

          <div className="table-container shadow-box">
            <table className="supplier-table">
              <thead>
                <tr>
                  <th>Supplier ID</th>
                  <th>Supplier Name</th>
                  <th>Contact Person</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((s) => (
                    <tr key={s.supplier_id} style={{ zIndex: openMenuId === s.supplier_id ? 10 : 1, position: 'relative' }}>
                      <td>{s.supplier_id}</td>
                      <td style={{ fontWeight: 'bold' }}>{s.supplier_name}</td>
                      <td>{s.contact}</td>
                      <td>{s.address}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="action-menu-container">
                          <button 
                            className="dots-btn" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setOpenMenuId(openMenuId === s.supplier_id ? null : s.supplier_id); 
                            }}
                          >
                            ooo
                          </button>
                          {openMenuId === s.supplier_id && (
                            <div className="action-dropdown" style={{ right: '0', top: '100%' }}>
                              <div onClick={() => openRestockModal(s)} style={{ color: '#27ae60', fontWeight: 'bold' }}>RECEIVE STOCK</div>
                              <div>EDIT</div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No suppliers found. Add one above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* --- ADD SUPPLIER MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="add-user-modal"> 
            <div className="modal-header-red">
              <h3>Add Supplier</h3>
              <button className="close-x" onClick={handleCancelAttempt}>✖</button>
            </div>
            <form onSubmit={handleSaveSupplier} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input type="text" required value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Address</label>
                  <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={handleCancelAttempt}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESTOCK MODAL --- */}
      {showRestockModal && (
        <div className="modal-overlay">
          <div className="add-user-modal" style={{ maxWidth: '650px' }}>
            <div className="modal-header-red">
              <h3>Receive Delivery from {selectedSupplier?.supplier_name}</h3>
              <button className="close-x" onClick={closeFormCompletely}>✖</button>
            </div>
            <form onSubmit={handleRestockSubmit} className="modal-form">
              
              <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                {restockItems.map((item, index) => (
                  <div className="form-row" key={index} style={{ alignItems: 'flex-end', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                    
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Product Delivered</label>
                      <select 
                        required 
                        value={item.product_id}
                        onChange={(e) => handleRestockItemChange(index, 'product_id', e.target.value)}
                      >
                        <option value="">Select a Product...</option>
                        {inventoryProducts.map(p => (
                          <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ flex: 1, marginLeft: '10px' }}>
                      <label>Qty Received</label>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        value={item.quantity} 
                        onChange={(e) => handleRestockItemChange(index, 'quantity', parseInt(e.target.value) || 0)} 
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1, marginLeft: '10px' }}>
                      <label>Unit Cost (₱)</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        step="0.01"
                        value={item.unit_cost} 
                        onChange={(e) => handleRestockItemChange(index, 'unit_cost', parseFloat(e.target.value) || 0)} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <button type="button" onClick={handleAddRestockRow} style={{ background: '#ecf0f1', color: '#2c3e50', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  + Add Another Item
                </button>
                
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#c0392b' }}>
                  Total: ₱{restockItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0).toFixed(2)}
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="submit" className="save-btn">Confirm Delivery</button>
                <button type="button" className="cancel-btn" onClick={closeFormCompletely}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DISCARD CHANGES MODAL --- */}
      {showDiscardModal && (
        <div className="modal-overlay alert-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header-red"><h3>Discard Changes?</h3></div>
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

export default Suppliers;