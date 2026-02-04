import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const UserAccess = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- STATE MANAGEMENT ---
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false); // New Discard UI State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const [users, setUsers] = useState([
    { id: 'USR-001', name: 'Gina Penafiel', address: 'Bago City', role: 'General Manager', birthday: '1987-07-08', contact: '09235745389', status: 'Active' },
    { id: 'USR-002', name: 'Karen Dominguez', address: 'Bacolod City', role: 'Supervisor', birthday: '1979-03-03', contact: '09204456628', status: 'Active' },
    { id: 'USR-003', name: 'Shane Shane', address: 'Silay City', role: 'Store Clerk', birthday: '2003-02-07', contact: '09202337892', status: 'Inactive' },
  ]);

  const [formData, setFormData] = useState({
    name: '', address: '', role: 'Supervisor', birthday: '', contact: '', password: '', confirmPassword: ''
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

  // --- HANDLERS ---
  const toggleMenu = (e, id) => {
    e.stopPropagation(); 
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      address: user.address,
      role: user.role,
      birthday: user.birthday,
      contact: user.contact,
      password: '', 
      confirmPassword: ''
    });
    setSelectedUserId(user.id);
    setIsEditing(true);
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleArchive = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Inactive' } : u));
    setOpenMenuId(null);
  };

  // --- DELETE LOGIC ---
  const openDeleteConfirm = (id) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const confirmDeletion = () => {
    setUsers(users.filter(u => u.id !== userToDelete));
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // --- DISCARD/CANCEL LOGIC ---
  const handleCancelAttempt = () => {
    // Check if user has entered any data
    const hasData = formData.name || formData.address || formData.birthday || formData.contact || formData.password;
    
    if (hasData) {
      setShowDiscardModal(true);
    } else {
      closeFormCompletely();
    }
  };

  const closeFormCompletely = () => {
    setShowModal(false);
    setShowDiscardModal(false);
    setIsEditing(false);
    setFormData({ name: '', address: '', role: 'Supervisor', birthday: '', contact: '', password: '', confirmPassword: '' });
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (isEditing) {
      setUsers(users.map(u => u.id === selectedUserId ? { ...u, ...formData } : u));
    } else {
      const newUser = {
        id: `USR-00${users.length + 1}`,
        ...formData,
        status: 'Active'
      };
      setUsers([...users, newUser]);
    }
    closeFormCompletely();
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
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item active">USER ACCESS</div>
            <div className="nav-item" onClick={() => navigate('/transact')}>TRANSACT</div>
            <div className="nav-item" onClick={() => navigate('/generate-report')}>GENERATE REPORT</div>
            <div className="nav-item" onClick={() => navigate('/suppliers')}>SUPPLIERS</div>
            <div className="nav-item" onClick={() => navigate('/clients')}>CLIENTS</div>
          </nav>
          <div className="sidebar-footer" onClick={() => navigate('/')}>👤</div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area">
              <h2><span className="icon">👤</span> User Access</h2>
            </div>
            <div className="admin-info">
              <p className="real-time-date">
                Date: {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
              </p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" />

          <div className="user-controls">
            <button className="add-user-btn" onClick={() => { setIsEditing(false); setShowModal(true); }}>Add User</button>
          </div>

          <div className="table-container shadow-box">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Role</th>
                  <th>Birthday</th>
                  <th>Contact Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ zIndex: openMenuId === user.id ? 10 : 1, position: 'relative' }}>
                    <td className="red-text">{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.address}</td>
                    <td>{user.role}</td>
                    <td>{user.birthday}</td>
                    <td>{user.contact}</td>
                    <td className={user.status === 'Active' ? 'status-active' : 'status-inactive'}>{user.status}</td>
                    <td>
                      <div className="action-menu-container">
                        <button className="dots-btn" onClick={(e) => toggleMenu(e, user.id)}>ooo</button>
                        {openMenuId === user.id && (
                          <div className="action-dropdown">
                            <div onClick={() => handleEdit(user)}>EDIT</div>
                            <div onClick={() => handleArchive(user.id)}>ARCHIVE</div>
                            <div onClick={() => openDeleteConfirm(user.id)} className="delete-text">DELETE</div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header-red">
              <h3>{isEditing ? "Edit User" : "Add User"}</h3>
              <button className="close-x" onClick={handleCancelAttempt}>✖</button>
            </div>
            <form onSubmit={handleSaveUser} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">Admin</option>
                    <option value="Store Clerk">Store Clerk</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Password {isEditing && "(Optional)"}</label>
                  <input type="password" required={!isEditing} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Birthday</label>
                  <input type="date" required value={formData.birthday} onChange={(e) => setFormData({...formData, birthday: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" required={!isEditing} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
              </div>
              <div className="form-group contact-group">
                <label>Contact Number:</label>
                <input type="text" required value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn">{isEditing ? "Update" : "Save"}</button>
                <button type="button" className="cancel-btn" onClick={handleCancelAttempt}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="modal-overlay alert-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header-red">
              <h3>Delete User?</h3>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this?</p>
              <div className="delete-modal-footer">
                <button className="confirm-delete-btn" onClick={confirmDeletion}>Confirm Delete</button>
                <button className="cancel-delete-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DISCARD CHANGES MODAL --- */}
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

export default UserAccess;