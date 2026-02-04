import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const Clients = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // --- MODAL & ACTION STATES ---
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isViewMode, setIsViewMode] = useState(false); // New state to handle Read-Only view

  // --- DATA STATE ---
  const [clients, setClients] = useState([
    {
      id: 'CLT-001',
      name: 'Daniel Reyes',
      address: '24 San Juan St., Brgy. Villamonte, Bacolod City',
      email: 'DanielReyes@email.com',
      terms: '7 days',
      businessStyle: 'Personal / Individual',
      tin: '345-221-900-000',
      status: 'Active'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '', address: '', terms: '', businessStyle: '', tin: ''
  });

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => {
      clearInterval(timer);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // --- HELPERS ---
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleCancelAttempt = () => {
    if (isViewMode) {
        closeFormCompletely();
        return;
    }
    const hasData = Object.values(formData).some(val => val !== '');
    if (hasData) setShowDiscardModal(true);
    else closeFormCompletely();
  };

  const closeFormCompletely = () => {
    setShowModal(false);
    setShowDiscardModal(false);
    setIsViewMode(false);
    setFormData({ name: '', address: '', terms: '', businessStyle: '', tin: '' });
  };

  // --- OPERATIONS ---
  const handleAddClient = (e) => {
    e.preventDefault();
    const newClient = { 
      id: `CLT-00${clients.length + 1}`, 
      ...formData, 
      email: 'newclient@email.com', // Placeholder
      status: 'Active' 
    };
    setClients([...clients, newClient]);
    triggerToast("New client added successfully!");
    closeFormCompletely();
  };

  const handleView = (client) => {
    setFormData({ 
      name: client.name, 
      address: client.address, 
      terms: client.terms, 
      businessStyle: client.businessStyle, 
      tin: client.tin 
    });
    setIsViewMode(true);
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleArchive = (id) => {
    setClients(clients.map(c => c.id === id ? { ...c, status: 'Inactive' } : c));
    setOpenMenuId(null);
    triggerToast("Client archived successfully!");
  };

  return (
    <div className="outer-margin-container">
      {toast.show && <div className={`toast-notification ${toast.type}`}>{toast.message}</div>}

      <div className="connected-border-box">
        <aside className="sidebar">
          <div className="logo-section"><img src={logo} alt="Ergin Hardware" className="sidebar-logo" /></div>
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
            <div className="title-area"><h2>Client Management</h2></div>
            <div className="admin-info">
              <p className="real-time-date">{currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}</p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" />

          <div className="client-controls">
            <div className="search-wrapper">
              <input type="text" placeholder="Search..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <span className="search-icon">🔍</span>
            </div>
            <button className="add-client-btn" onClick={() => { setIsViewMode(false); setShowModal(true); }}>Add Client</button>
          </div>

          <div className="table-container shadow-box">
            <table className="client-table">
              <thead>
                <tr>
                  <th>Client ID</th><th>Client Name</th><th>Address</th><th>Email</th><th>Terms</th><th>Business Style</th><th>Tin</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((client) => (
                  <tr key={client.id} style={{ zIndex: openMenuId === client.id ? 10 : 1, position: 'relative' }}>
                    <td className="client-id-text">{client.id}</td>
                    <td>{client.name}</td>
                    <td className="address-cell">{client.address}</td>
                    <td>{client.email}</td>
                    <td>{client.terms}</td>
                    <td>{client.businessStyle}</td>
                    <td>{client.tin}</td>
                    <td>
                      <div className="action-menu-container">
                        <button className="dots-btn" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === client.id ? null : client.id); }}>ooo</button>
                        {openMenuId === client.id && (
                          <div className="action-dropdown">
                            <div onClick={() => handleView(client)}>VIEW</div>
                            <div onClick={() => handleArchive(client.id)}>ARCHIVE</div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button className="page-arrow" disabled>{'<'}</button>
              <span>Page 1</span>
              <button className="page-arrow" disabled>{'>'}</button>
            </div>
          </div>
        </main>
      </div>

      {/* --- ADD/VIEW CLIENT MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header-red">
              <h3>{isViewMode ? "Client Information" : "Add Client"}</h3>
              <button className="close-x" onClick={handleCancelAttempt}>✖</button>
            </div>
            <form onSubmit={handleAddClient} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Client Name</label>
                  <input type="text" disabled={isViewMode} required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Business Style</label>
                  <input type="text" disabled={isViewMode} required value={formData.businessStyle} onChange={(e) => setFormData({...formData, businessStyle: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" disabled={isViewMode} required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tin</label>
                  <input type="text" disabled={isViewMode} required value={formData.tin} onChange={(e) => setFormData({...formData, tin: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ width: '48%' }}>
                  <label>Terms</label>
                  <input type="text" disabled={isViewMode} required value={formData.terms} onChange={(e) => setFormData({...formData, terms: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                {!isViewMode ? (
                  <>
                    <button type="submit" className="save-btn">Save Changes</button>
                    <button type="button" className="cancel-btn" onClick={handleCancelAttempt}>Cancel</button>
                  </>
                ) : (
                  <button type="button" className="cancel-btn" onClick={closeFormCompletely}>Close</button>
                )}
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