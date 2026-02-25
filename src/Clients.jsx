import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const Clients = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

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
      const response = await fetch('http://127.0.0.1:5000/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/clients', {
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

  const filteredClients = clients.filter(c =>
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.contact && c.contact.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <div className="nav-item" onClick={() => navigate('/suppliers')}>SUPPLIERS</div>
            <div className="nav-item active">CLIENTS</div>
          </nav>
          <div className="sidebar-footer">👤</div>
        </aside>

        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area"><h2><span className="icon">🤝</span> Client Management</h2></div>
            <div className="admin-info">
              <p className="real-time-date">Date: {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}</p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" />

          <div className="supplier-controls">
            <div className="search-wrapper">
              <input type="text" placeholder="Search clients..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <span className="search-icon">🔍</span>
            </div>
            <button className="add-supplier-btn" onClick={() => setShowModal(true)}>Add Client</button>
          </div>

          <div className="table-container shadow-box">
            <table className="supplier-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Client Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Business Style</th>
                  <th>TIN</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((c) => (
                    <tr key={c.customer_id}>
                      <td>{c.customer_id}</td>
                      <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                      <td>{c.contact}</td>
                      <td>{c.email}</td>
                      <td>{c.address}</td>
                      <td>{c.business_style}</td>
                      <td>{c.tin}</td>
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
        </main>
      </div>

      {/* --- ADD CLIENT MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="add-user-modal"> 
            <div className="modal-header-red">
              <h3>Add Client</h3>
              <button className="close-x" onClick={handleCancelAttempt}>✖</button>
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
                <button type="submit" className="save-btn">Save Client</button>
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