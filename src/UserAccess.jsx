import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const UserAccess = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // State
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Form Data for New User
  const [formData, setFormData] = useState({
    name: '', contact: '', email: '', address: '', 
    username: '', password: '', role: 'Cashier'
  });

  // Effects
  useEffect(() => {
    fetchEmployees();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // API Calls
  const fetchEmployees = async () => {
    try {
      const response = await fetch('https://ergin-hardware.onrender.com/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) { console.error("Error fetching employees:", error); }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://ergin-hardware.onrender.com/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        triggerToast("New user account created successfully!");
        fetchEmployees(); 
        setShowModal(false);
        setFormData({ name: '', contact: '', email: '', address: '', username: '', password: '', role: 'Cashier' });
      } else {
        alert("Failed to create user. Check terminal.");
      }
    } catch (error) { console.error("Error saving user:", error); }
  };

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Filter
  const filteredEmployees = employees.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="outer-margin-container">
      {toast.show && <div className={`toast-notification ${toast.type}`}>{toast.message}</div>}

      <div className="connected-border-box">
        
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo-section"><img src={logo} alt="Logo" className="sidebar-logo" /></div>
          <nav className="side-nav">
            <div className="nav-item" onClick={() => navigate('/dashboard')}>DASHBOARD</div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item active">USER ACCESS</div>
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
            <div className="title-area"><h2><span className="icon">🛡️</span> User & Staff Management</h2></div>
            <div className="admin-info">
              <p className="real-time-date">{currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}</p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" />

          {/* Controls */}
          <div className="supplier-controls" style={{ marginBottom: '20px' }}>
            <div className="search-wrapper">
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="search-input" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="add-supplier-btn" onClick={() => setShowModal(true)}>+ Add Staff Account</button>
          </div>

          {/* Users Table */}
          <div className="table-container shadow-box">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Username</th>
                  <th>Contact Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td>{emp.employee_id}</td>
                    <td style={{ fontWeight: 'bold' }}>{emp.name}</td>
                    <td>
                      <span style={{ 
                        background: emp.role === 'Admin' ? '#8e44ad' : '#2980b9', 
                        color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                      }}>
                        {emp.role}
                      </span>
                    </td>
                    <td>{emp.username}</td>
                    <td>{emp.contact}</td>
                    <td style={{ color: '#27ae60', fontWeight: 'bold' }}>Active</td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                      No staff accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* --- ADD USER MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="add-user-modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header-red">
              <h3>Create Staff Account</h3>
              <button className="close-x" onClick={() => setShowModal(false)}>✖</button>
            </div>
            <form onSubmit={handleSaveUser} className="modal-form">
              
              <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', color: '#2c3e50' }}>1. Personal Information</h4>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Full Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Contact Number</label>
                  <input type="text" required value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
                </div>
              </div>

              <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', color: '#2c3e50', marginTop: '15px' }}>2. System Login Credentials</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>System Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="Cashier">Cashier</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="submit" className="save-btn">Create Account</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserAccess;