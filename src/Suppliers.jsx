import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';
import TopHeader from './TopHeader';
import Logout from './Logout';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' 
  : 'https://ergin-hardware.onrender.com';

const Suppliers = () => {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Modal Toggles
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // NEW ADD MODAL STATE
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  // --- STATES FOR ACTION MENU & EDIT/ARCHIVE ---
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Form Data 
  const [receiveData, setReceiveData] = useState({
    product_id: '', supplier_name: '', qty_received: '', retail_price: '' // ADDED RETAIL PRICE
  });
  
  const [newSupplierData, setNewSupplierData] = useState({
    name: '', contact: '', email: '', address: '' // ADDED EMAIL
  });

  const [editData, setEditData] = useState({
    supplier_name: '', contact: '', email: '', address: '' // ADDED EMAIL
  });

  // --- EFFECTS ---
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  // --- API CALLS ---
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/suppliers`);
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inventory`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplierData)
      });

      if (response.ok) {
        triggerToast("Supplier added successfully!");
        setShowAddModal(false);
        setNewSupplierData({ name: '', contact: '', email: '', address: '' });
        fetchSuppliers(); 
      } else {
        const err = await response.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiveStock = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/stock/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: receiveData.product_id,
          supplier_name: receiveData.supplier_name,
          qty_received: parseInt(receiveData.qty_received),
          retail_price: parseFloat(receiveData.retail_price) || 0 // NEW RETAIL PRICE PAYLOAD
        })
      });

      if (response.ok) {
        triggerToast("Stock received successfully!");
        setShowReceiveModal(false);
        setReceiveData({ product_id: '', supplier_name: '', qty_received: '', retail_price: '' });
        fetchProducts(); 
      } else {
        const err = await response.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (error) {
      console.error("Error receiving stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTION HANDLERS ---
  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setEditData({
      supplier_name: supplier.supplier_name,
      contact: supplier.contact,
      email: supplier.email || '',
      address: supplier.address
    });
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const openArchiveModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowArchiveModal(true);
    setActiveDropdown(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/suppliers/${selectedSupplier.supplier_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        triggerToast("Supplier updated successfully!");
        setShowEditModal(false);
        fetchSuppliers();
      } else {
        const err = await response.json();
        alert(`Failed to update: ${err.error}`);
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      alert("Network error while updating supplier.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveSubmit = async () => {
    alert(`Archive functionality for ${selectedSupplier.supplier_name} coming soon!`);
    setShowArchiveModal(false);
  };

  // --- HELPERS ---
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
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
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>USER ACCESS</div>
            <div className="nav-item" onClick={() => navigate('/transact')}>TRANSACT</div>
            <div className="nav-item" onClick={() => navigate('/generate-report')}>GENERATE REPORT</div>
            <div className="nav-item active">SUPPLIERS</div>
            <div className="nav-item" onClick={() => navigate('/clients')}>CLIENTS</div>
          </nav>
          <Logout />
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area">
              <h2>Supplier Management</h2>
            </div>
            <TopHeader />
          </header>

          <hr className="divider" />

          {/* Controls Area */}
          <div className="inventory-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div className="search-wrapper">
              <input type="text" placeholder="Search suppliers..." className="search-input" />
            </div>
            <div className="filter-group" style={{ display: 'flex', gap: '10px' }}>
              {/* RECEIVE STOCK BUTTON */}
              <button 
                className="add-product-btn" 
                style={{ backgroundColor: '#d32f2f' }} 
                onClick={() => setShowReceiveModal(true)}
              >
                Receive Stock
              </button>
              {/* ADD SUPPLIER BUTTON */}
              <button 
                className="add-product-btn" 
                style={{ backgroundColor: '#d32f2f' }} 
                onClick={() => setShowAddModal(true)}
              >
                + Add Supplier
              </button>
              
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="table-container shadow-box">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Supplier ID</th>
                  <th>Supplier Name</th>
                  <th>Contact</th>
                  <th>Email</th> {/* NEW COLUMN */}
                  <th>Address</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length > 0 ? (
                  suppliers.map((sup) => (
                    <tr key={sup.supplier_id}>
                      <td>{sup.supplier_id}</td>
                      <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>{sup.supplier_name}</td>
                      <td>{sup.contact}</td>
                      <td>{sup.email || 'N/A'}</td> {/* EMAIL DISPLAY */}
                      <td>{sup.address}</td>
                      
                      {/* ACTION CELL */}
                      <td style={{ position: 'relative', textAlign: 'center', overflow: 'visible' }}>
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === sup.supplier_id ? null : sup.supplier_id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', color: '#7f8c8d' }}
                        >
                          ⋮
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === sup.supplier_id && (
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
                                onClick={() => openEditModal(sup)}
                                style={{ padding: '10px 15px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f1f2f6', fontSize: '13px', fontWeight: 'bold', color: '#000' }}
                                onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                                onMouseOut={(e) => e.target.style.background = 'white'}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => openArchiveModal(sup)}
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
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No suppliers found. Click "+ Add Supplier" to create one!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* --- MODAL: ADD SUPPLIER --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header-red" style={{ backgroundColor: '#d32f2f' }}>
              <h3>+ Add New Supplier</h3>
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
                      className="close-x" onClick={() => setShowAddModal(false)}>
                        ✖
                        </button>
            </div>
            <form className="modal-form" onSubmit={handleAddSupplier}>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Supplier Name:</label>
                  <input 
                    type="text" 
                    required 
                    value={newSupplierData.name} 
                    onChange={e => setNewSupplierData({...newSupplierData, name: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ width: '50%' }}>
                  <label>Contact Number:</label>
                  <input 
                    type="text" 
                    required 
                    value={newSupplierData.contact} 
                    onChange={e => setNewSupplierData({...newSupplierData, contact: e.target.value})} 
                  />
                </div>
                <div className="form-group" style={{ width: '50%' }}>
                  <label>Email Address:</label>
                  <input 
                    type="email" 
                    value={newSupplierData.email} 
                    onChange={e => setNewSupplierData({...newSupplierData, email: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Address:</label>
                  <input 
                    type="text" 
                    required 
                    value={newSupplierData.address} 
                    onChange={e => setNewSupplierData({...newSupplierData, address: e.target.value})} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn" style={{ backgroundColor: '#d32f2f' }} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Supplier'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: RECEIVE STOCK DELIVERY --- */}
      {showReceiveModal && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header-red" style={{ backgroundColor: '#d32f2f' }}>
              <h3>Log Incoming Delivery</h3>
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
                      }}className="close-x" onClick={() => setShowReceiveModal(false)}>
                        ✖
                        </button>
            </div>
            <form className="modal-form" onSubmit={handleReceiveStock}>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Select Supplier:</label>
                  <select 
                    required 
                    value={receiveData.supplier_name}
                    onChange={(e) => setReceiveData({...receiveData, supplier_name: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="">-- Choose a Supplier --</option>
                    {suppliers.map(sup => (
                      <option key={sup.supplier_id} value={sup.supplier_name}>{sup.supplier_name}</option>
                    ))}
                    <option value="Walk-in / Unknown">Walk-in / Unknown</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Select Product:</label>
                  <select 
                    required 
                    value={receiveData.product_id}
                    onChange={(e) => {
                  
                      const selectedId = e.target.value;
                      const selectedProd = products.find(p => p.product_id.toString() === selectedId);
                    
                      setReceiveData({
                        ...receiveData, 
                        product_id: selectedId,
                        retail_price: selectedProd ? selectedProd.retail_price : '' 
                      });
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="">-- Choose a Product --</option>
                    {products.map(prod => (
                      <option key={prod.product_id} value={prod.product_id}>
                        ID: {prod.product_id} - {prod.product_name} (Current Stock: {prod.stock})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ width: '50%' }}>
                  <label>Qty Received:</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="e.g. 50"
                    required
                    value={receiveData.qty_received}
                    onChange={(e) => setReceiveData({...receiveData, qty_received: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ width: '50%' }}>
                  <label>Update Retail Price (₱):</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="e.g. 150.00"
                    value={receiveData.retail_price}
                    onChange={(e) => setReceiveData({...receiveData, retail_price: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="save-btn" style={{ backgroundColor: '#d32f2f' }} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Receive Delivery'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowReceiveModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT SUPPLIER --- */}
      {showEditModal && selectedSupplier && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header-red" style={{ backgroundColor: '#d32f2f' }}>
              <h3>Edit Supplier Details</h3>
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
                      }}className="close-x" onClick={() => setShowEditModal(false)}>
                        ✖
                        </button>
            </div>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Supplier Name:</label>
                  <input type="text" required value={editData.supplier_name} onChange={(e) => setEditData({...editData, supplier_name: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ width: '50%' }}>
                  <label>Contact Number:</label>
                  <input type="text" value={editData.contact} onChange={(e) => setEditData({...editData, contact: e.target.value})} />
                </div>
                <div className="form-group" style={{ width: '50%' }}>
                  <label>Email Address:</label>
                  <input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Address:</label>
                  <input type="text" value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn" style={{ backgroundColor: '#d32f2f' }} disabled={isLoading}> {isLoading ? 'Saving...' : 'Save Changes'} </button>
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ARCHIVE CONFIRMATION --- */}
      {showArchiveModal && selectedSupplier && (
        <div className="modal-overlay alert-overlay">
          <div className="delete-confirm-modal" style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center' }}>
            <h3 style={{ color: '#e74c3c', marginTop: 0 }}>Archive Supplier?</h3>
            <p style={{ color: '#000', marginBottom: '20px' }}>
              Are you sure you want to archive <strong>{selectedSupplier.supplier_name}</strong>? They will no longer appear in your active dropdowns for receiving stock.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button onClick={handleArchiveSubmit} style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Yes, Archive</button>
              <button onClick={() => setShowArchiveModal(false)} style={{ padding: '10px 20px', backgroundColor: '#ecf0f1', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;