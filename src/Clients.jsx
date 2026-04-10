import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';
import TopHeader from './TopHeader';
import Logout from './Logout';

// Sidebar nav icons
import dashboardIcon from './assets/dashboard_header icon.png';
import inventoryIcon from './assets/inventory_header icon.png';
import salesRecordIcon from './assets/salesrecord_header icon.png';
import userAccessIcon from './assets/useracess_header icon.png';
import transactIcon from './assets/transact_pos header.png';
import generateReportIcon from './assets/generate report_ header icon.png';
import supplierIcon from './assets/supplier_header icon.png';
import clientIcon from './assets/client_header icon.png';
import searchIcon from './assets/supplier_search button.png'; // Added search icon import

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' 
  : 'https://ergin-hardware.onrender.com';

const ROWS_PER_PAGE = 8; // Pagination constant

const Clients = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Pagination state

  // --- MODAL & ACTION STATES ---
  const [showModal, setShowModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // --- DATA STATE ---
  const [clients, setClients] = useState([]);
  
  // Matches the 'customer' table columns
  const [formData, setFormData] = useState({
    name: '', address: '', contact: '', email: '', business_style: '', tin: ''
  });

  // --- EFFECTS ---
  useEffect(() => {
    fetchClients();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- API CALLS ---
  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clients`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        triggerToast("New client added successfully!");
        fetchClients(); 
        closeFormCompletely();
      } else {
        alert("Failed to save client. Check Flask terminal.");
      }
    } catch (error) {
      console.error("Error saving client:", error);
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
    setFormData({ name: '', address: '', contact: '', email: '', business_style: '', tin: '' });
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredClients = clients.filter(c =>
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.contact && c.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredClients.length / ROWS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const navIconStyle = {
    width: '20px', height: '20px', marginRight: '8px',
    objectFit: 'contain', verticalAlign: 'middle'
  };

  return (
    <div className="outer-margin-container">
      
      {/* FIXED TOAST NOTIFICATION: Styled to match system theme */}
      {toast.show && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '30px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 10000,
            background: toast.type === 'error' ? '#990000' : '#d10000', 
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(209, 0, 0, 0.25)', 
            fontWeight: 'bold',
            fontSize: '14px',
            textAlign: 'center',
            minWidth: '200px',
            border: '1px solid #b30000'
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="connected-border-box">
        <aside className="sidebar">
          <div className="logo-section"><img src={logo} alt="Logo" className="sidebar-logo" /></div>
          <nav className="side-nav">
            <div className="nav-item" onClick={() => navigate('/dashboard')}>
              <img src={dashboardIcon} alt="" style={navIconStyle} />DASHBOARD
            </div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>
              <img src={inventoryIcon} alt="" style={navIconStyle} />INVENTORY
            </div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>
              <img src={salesRecordIcon} alt="" style={navIconStyle} />SALES RECORD
            </div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>
              <img src={userAccessIcon} alt="" style={navIconStyle} />USER ACCESS
            </div>
            <div className="nav-item" onClick={() => navigate('/transact')}>
              <img src={transactIcon} alt="" style={navIconStyle} />TRANSACT
            </div>
            <div className="nav-item" onClick={() => navigate('/generate-report')}>
              <img src={generateReportIcon} alt="" style={navIconStyle} />GENERATE REPORT
            </div>
            <div className="nav-item" onClick={() => navigate('/suppliers')}>
              <img src={supplierIcon} alt="" style={navIconStyle} />SUPPLIERS
            </div>
            <div className="nav-item active">
              <img src={clientIcon} alt="" style={navIconStyle} />CLIENTS
            </div>
          </nav>
          <Logout />
        </aside>

        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={clientIcon} alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              <h2 style={{ margin: 0 }}>Client Management</h2>
            </div>
            <TopHeader />
          </header>

          <hr className="divider" />

          <div className="supplier-controls" style={{ marginBottom: '16px' }}>
            {/* Search Bar with Icon */}
            <div className="search-wrapper" style={{ position: 'relative', width: '300px' }}>
              <img 
                src={searchIcon} 
                alt="Search" 
                style={{
                  position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                  width: '18px', height: '18px', pointerEvents: 'none'
                }} 
              />
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="search-input" 
                value={searchTerm} 
                onChange={handleSearchChange} 
                style={{ paddingLeft: '36px', width: '100%' }} 
              />
            </div>
            <button className="add-supplier-btn" onClick={() => setShowModal(true)}>Add Client</button>
          </div>

          <div className="table-container shadow-box">
            <table className="supplier-table">
              <thead>
                <tr>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Client ID</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Client Name</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Contact</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Email</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Address</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Business Style</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>TIN</th>
                </tr>
              </thead>
              <tbody>
                {/* Mapping over paginatedClients instead of raw clients array */}
                {paginatedClients.length > 0 ? (
                  paginatedClients.map((c) => (
                    <tr key={c.customer_id}>
                      <td style={{ padding: '12px' }}>{c.customer_id}</td>
                      <td style={{ fontWeight: 'bold', padding: '12px' }}>{c.name}</td>
                      <td style={{ padding: '12px' }}>{c.contact}</td>
                      <td style={{ padding: '12px' }}>{c.email}</td>
                      <td style={{ padding: '12px' }}>{c.address}</td>
                      <td style={{ padding: '12px' }}>{c.business_style}</td>
                      <td style={{ padding: '12px' }}>{c.tin}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No clients found. Add one above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Uniform Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  background: currentPage === 1 ? '#eee' : '#d10000',
                  color: currentPage === 1 ? '#aaa' : 'white',
                  border: 'none', borderRadius: '4px', padding: '6px 12px',
                  cursor: currentPage === 1 ? 'default' : 'pointer', fontWeight: 'bold'
                }}>
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    background: currentPage === page ? '#d10000' : 'white',
                    color: currentPage === page ? 'white' : '#333',
                    border: '1px solid #ddd', borderRadius: '4px',
                    padding: '6px 10px', cursor: 'pointer', fontWeight: 'bold',
                    minWidth: '34px'
                  }}>
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  background: currentPage === totalPages ? '#eee' : '#d10000',
                  color: currentPage === totalPages ? '#aaa' : 'white',
                  border: 'none', borderRadius: '4px', padding: '6px 12px',
                  cursor: currentPage === totalPages ? 'default' : 'pointer', fontWeight: 'bold'
                }}>
                Next →
              </button>

              <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                Page {currentPage} of {totalPages} ({filteredClients.length} records)
              </span>
            </div>
          )}

        </main>
      </div>

      {/* --- ADD CLIENT MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="add-user-modal"> 
            <div className="modal-header-red">
              <h3>Add Client</h3>
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
                      }} className="close-x" onClick={handleCancelAttempt}>
                        ✖
                      </button>
            </div>
            <form onSubmit={handleSaveClient} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Client Name / Company</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" required value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Business Style</label>
                  <input type="text" value={formData.business_style} onChange={(e) => setFormData({...formData, business_style: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>TIN (Tax ID)</label>
                  <input type="text" value={formData.tin} onChange={(e) => setFormData({...formData, tin: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn"> Add Client</button>
                <button type="button" className="cancel-btn" onClick={handleCancelAttempt}>Cancel</button>
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

export default Clients;