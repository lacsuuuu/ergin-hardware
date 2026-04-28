import React, { useState, useEffect } from 'react';
import './index.css';
import TopHeader from './TopHeader';
import Sidebar from './Sidebar';
import userAccessIcon from './assets/useracess_header icon.png';
import searchIcon from './assets/supplier_search button.png';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' 
  : 'https://ergin-hardware.onrender.com';

const ROWS_PER_PAGE = 8; 

const UserAccess = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // State
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); 
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1); 
  const [formError, setFormError] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [showAddDiscardModal, setShowAddDiscardModal] = useState(false);
  const [showEditDiscardModal, setShowEditDiscardModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [originalEditData, setOriginalEditData] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Form Data for New User
  const [formData, setFormData] = useState({
    name: '', contact: '', email: '', address: '', 
    username: '', password: '', role: 'Cashier'
  });

  // Form Data for Editing User
  const [editData, setEditData] = useState({
    employee_id: '', name: '', contact: '', username: '', password: '', role: 'Cashier'
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
      const response = await fetch(`${API_URL}/api/employees`);
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(emp => ({
          ...emp,
          status: emp.status || 'Active'
        }));
        setEmployees(formattedData);
      }
    } catch (error) { console.error("Error fetching employees:", error); }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setFormError(''); 

    const usernameExists = employees.some(
      (emp) => emp.username.toLowerCase() === formData.username.toLowerCase()
    );
    if (usernameExists) {
      setFormError('Username is already taken. Please choose another one.');
      return; 
    }

    const hasMinLength = formData.password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);

    if (!hasMinLength || !hasUpperCase || !hasNumber) {
      setFormError('Password must be at least 8 characters and include at least one uppercase letter and one number.');
      return; 
    }

    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        triggerToast("New user account created successfully!");
        fetchEmployees(); 
        closeModal(); 
      } else {
        alert("Failed to create user. Check terminal.");
      }
    } catch (error) { console.error("Error saving user:", error); }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setFormError('');

    const usernameExists = employees.some(
      (emp) => emp.username.toLowerCase() === editData.username.toLowerCase() && emp.employee_id !== editData.employee_id
    );
    if (usernameExists) {
      setFormError('Username is already taken by another employee.');
      return; 
    }

    if (editData.password !== '') {
      const hasMinLength = editData.password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(editData.password);
      const hasNumber = /[0-9]/.test(editData.password);

      if (!hasMinLength || !hasUpperCase || !hasNumber) {
        setFormError('New password must be at least 8 characters and include at least one uppercase letter and one number.');
        return; 
      }
    }

    try {
      const response = await fetch(`${API_URL}/api/employees/${editData.employee_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        triggerToast("Staff account updated successfully!");
        fetchEmployees(); 
        setShowEditModal(false);
      } else {
        alert("Failed to update user.");
      }
    } catch (error) { console.error("Error updating user:", error); }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError('');
    setFormData({ name: '', contact: '', email: '', address: '', username: '', password: '', role: 'Cashier' });
  };

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

//pinalitan ko code nila Dana para tawagin yung API instead of toggle lang talaga. for this to work palagay na lang sa supabase nung status tas lagay text active thanks youw
  const toggleStatus = async(employeeId, currentStatus) =>{
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    await fetch(`${API_URL}/api/employees/${employeeId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchEmployees();
  }


const handleEdit = (employee) => {
  const data = {
    employee_id: employee.employee_id,
    name: employee.name,
    contact: employee.contact,
    username: employee.username,
    password: '',
    role: employee.role
  };
  setEditData(data);
  setOriginalEditData(data);
  setFormError('');
  setShowEditModal(true);
  setActiveDropdown(null);
};

const handleArchive = (employee) => {
  setSelectedEmployee(employee);
  setShowArchiveModal(true);
  setActiveDropdown(null);
};

const handleArchiveSubmit = async () => {
  try {
    const newStatus = selectedEmployee.is_archived ? false : true;
    const response = await fetch(`${API_URL}/api/employees/${selectedEmployee.employee_id}/archive`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_archived: newStatus })
    });

    if (response.ok) {
      setEmployees(prev => prev.map(e =>
        e.employee_id === selectedEmployee.employee_id ? { ...e, is_archived: newStatus } : e
      ));
      triggerToast(newStatus ? `${selectedEmployee.name} has been archived.` : `${selectedEmployee.name} has been restored.`);
    } else {
      setEmployees(prev => prev.map(e =>
        e.employee_id === selectedEmployee.employee_id ? { ...e, is_archived: newStatus } : e
      ));
      triggerToast(newStatus ? `${selectedEmployee.name} archived (local only).` : `${selectedEmployee.name} restored (local only).`);
    }
  } catch (err) {
    setEmployees(prev => prev.map(e =>
      e.employee_id === selectedEmployee.employee_id ? { ...e, is_archived: !e.is_archived } : e
    ));
    triggerToast(`${selectedEmployee.name} archived (local only).`);
  }
  setShowArchiveModal(false);
  setSelectedEmployee(null);
};

  const filteredEmployees = employees.filter(e => {
    const matchesSearch =
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchive = showArchived ? true : !e.is_archived;
    return matchesSearch && matchesArchive;
  });

  const totalPages = Math.ceil(filteredEmployees.length / ROWS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handleAddCloseAttempt = () => {
  const isDirty = formData.name !== '' || formData.contact !== '' ||
    formData.email !== '' || formData.address !== '' ||
    formData.username !== '' || formData.password !== '';
  if (isDirty) setShowAddDiscardModal(true);
  else closeModal();
};

const handleEditCloseAttempt = () => {
  const isDirty =
    editData.name !== originalEditData.name ||
    editData.contact !== originalEditData.contact ||
    editData.username !== originalEditData.username ||
    editData.password !== '' ||
    editData.role !== originalEditData.role;
  if (isDirty) setShowEditDiscardModal(true);
  else setShowEditModal(false);
};

const closeEditFormCompletely = () => {
  setShowEditDiscardModal(false);
  setShowEditModal(false);
  setFormError('');
};

  const getRoleColor = (role) => {
    if (role === 'Administrator' || role === 'Admin') return '#d10000'; 
    if (role === 'Supervisor') return '#850000'; 
    return '#4a4a4a'; 
  };

  return (
    <div className="outer-margin-container">
      {toast.show && <div className={`toast-notification ${toast.type}`}>{toast.message}</div>}

      <div className="connected-border-box">
        
        <Sidebar />

        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={userAccessIcon} alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              <h2 style={{ margin: 0 }}>User & Staff Management</h2>
            </div>
            <TopHeader />
          </header>

          <hr className="divider" />

          {/* Compressed margin to save vertical space matching Sales Ledger */}
          {/* Modified Button Placement: Add Staff first, Archive second */}
          <div className="supplier-controls" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                placeholder="Search staff..." 
                className="search-input" 
                value={searchTerm} 
                onChange={handleSearchChange} 
                style={{ paddingLeft: '36px', width: '100%' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="add-supplier-btn" onClick={() => setShowModal(true)} style={{ margin: 0 }}>
                + Add Staff Account
              </button>

              <button
                onClick={() => setShowArchived(p => !p)}
                style={{
                  padding: '8px 14px', borderRadius: '4px', border: '1px solid #ccc',
                  background: showArchived ? '#555' : '#f1f2f6',
                  color: showArchived ? 'white' : '#555',
                  fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {showArchived ? '👁 Hide Archived' : '👁 Show Archived'}
              </button>
            </div>
          </div>

          <div className="table-container shadow-box">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Emp ID</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Full Name</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Role</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Username</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Contact Number</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Status</th>
                  <th style={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((emp) => (
                  <tr key={emp.employee_id} style={{
                    opacity: emp.is_archived ? 0.45 : 1,
                    background: emp.is_archived ? '#f5f5f5' : 'white',
                    transition: 'opacity 0.2s'
                  }}>
                    <td style={{ color: emp.is_archived ? '#999' : undefined }}>{emp.employee_id}</td>
                    <td style={{ fontWeight: 'bold', color: emp.is_archived ? '#999' : undefined }}>
                      {emp.name}
                      {emp.is_archived && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#ccc', color: '#555', padding: '2px 6px', borderRadius: '10px', fontWeight: 'normal' }}>Archived</span>}
                    </td>
                    <td>
                      {/* Tighter padding on the role badge to save vertical row height */}
                      <span style={{ 
                        background: getRoleColor(emp.role), 
                        color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                      }}>
                        {emp.role}
                      </span>
                    </td>
                    <td>{emp.username}</td>
                    <td>{emp.contact}</td>
                    <td>
                      <button 
                        onClick={() => !emp.is_archived && toggleStatus(emp.employee_id, emp.status)}
                        style={{
                          padding: '4px 10px', 
                          borderRadius: '4px', 
                          border: 'none',
                          fontWeight: 'bold', 
                          color: 'white', 
                          cursor: emp.is_archived ? 'default' : 'pointer', 
                          fontSize: '12px',
                          background: emp.is_archived ? '#888' : emp.status === 'Active' ? '#27ae60' : '#d10000', 
                          width: '75px' 
                        }}
                      >
                        {emp.is_archived ? 'Archived' : emp.status}
                      </button>
                    </td>
                    <td style={{ position: 'relative', textAlign: 'center', overflow: 'visible' }}>
                      {/* Compressed action button to keep row heights uniform with other pages */}
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === emp.employee_id ? null : emp.employee_id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#7f8c8d', padding: '0 8px', lineHeight: '1' }}
                      >
                        ⋮
                      </button>

                      {activeDropdown === emp.employee_id && (
                        <>
                          <div
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }}
                            onClick={() => setActiveDropdown(null)}
                          />
                          <div style={{
                            position: 'absolute', right: '40px', top: '25px',
                            background: 'white', border: '1px solid #e0e0e0',
                            borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                            zIndex: 10, display: 'flex', flexDirection: 'column',
                            width: '130px', overflow: 'hidden'
                          }}>
                            <button
                              onClick={() => handleEdit(emp)}
                              style={{ padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: '600', color: '#333' }}
                              onMouseOver={(e) => e.target.style.background = '#f4f8fb'}
                              onMouseOut={(e) => e.target.style.background = 'white'}
                            >
                               Edit
                            </button>
                            <button
                              onClick={() => handleArchive(emp)}
                              style={{ padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#e74c3c' }}
                              onMouseOver={(e) => e.target.style.background = '#fdf3f2'}
                              onMouseOut={(e) => e.target.style.background = 'white'}
                            >
                               {emp.is_archived ? 'Unarchive' : 'Archive'}
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedEmployees.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                      No staff accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Uniform Pagination lowered beautifully into the bottom space */}
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
                Page {currentPage} of {totalPages} ({filteredEmployees.length} records)
              </span>
            </div>
          )}

        </main>
      </div>

      {/* --- ADD USER MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="add-user-modal" style={{ maxWidth: '600px', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <div className="modal-header-red" style={{ padding: '16px 20px', background: '#d10000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Create Staff Account</h3>
              <button style={{
                  background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                  fontWeight: 'bold', padding: '4px 8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }} className="close-x" onClick={handleAddCloseAttempt}>
                ✖
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="modal-form" autoComplete="off" style={{ padding: '20px' }}>
              <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', color: '#2c3e50', marginTop: 0 }}>1. Personal Information</h4>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Full Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} autoComplete="off" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Contact Number</label>
                  <input type="text" required value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} autoComplete="off" />
                </div>
              </div>

              <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', color: '#2c3e50', marginTop: '15px' }}>2. System Login Credentials</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} autoComplete="new-username" />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} autoComplete="new-password" />
                </div>
                <div className="form-group">
                  <label>System Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="Cashier">Cashier</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div style={{ color: '#d10000', fontSize: '12px', fontWeight: 'bold', background: '#ffebeb', padding: '10px', borderRadius: '4px', border: '1px solid #ffcccc', marginTop: '15px' }}>
                  {formError}
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                <button type="button" className="cancel-btn" onClick={handleAddCloseAttempt} style={{ background: '#f1f2f6', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" className="save-btn" style={{ background: '#d10000', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="add-user-modal" style={{ maxWidth: '600px', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            
            <div className="modal-header-red" style={{ padding: '16px 20px', background: '#d10000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Edit Staff Account</h3>
              <button style={{ background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="close-x" onClick={() => handleEditCloseAttempt(false)}>✖</button>
            </div>

            <form onSubmit={handleUpdateUser} className="modal-form" autoComplete="off" style={{ padding: '20px' }}>
              
              <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', color: '#2c3e50', marginTop: 0 }}>1. Personal Information</h4>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Full Name</label>
                  <input type="text" required value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} autoComplete="off" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Contact Number</label>
                  <input type="text" required value={editData.contact} onChange={(e) => setEditData({...editData, contact: e.target.value})} autoComplete="off" />
                </div>
              </div>

              <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', color: '#2c3e50', marginTop: '15px' }}>2. System Login Credentials</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" required value={editData.username} onChange={(e) => setEditData({...editData, username: e.target.value})} autoComplete="new-username" />
                </div>
                <div className="form-group">
                  <label>New Password (Optional)</label>
                  <input type="password" placeholder="Leave blank to keep current" value={editData.password} onChange={(e) => setEditData({...editData, password: e.target.value})} autoComplete="new-password" />
                </div>
                <div className="form-group">
                  <label>System Role</label>
                  <select value={editData.role} onChange={(e) => setEditData({...editData, role: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="Cashier">Cashier</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div style={{ color: '#d10000', fontSize: '12px', fontWeight: 'bold', background: '#ffebeb', padding: '10px', borderRadius: '4px', border: '1px solid #ffcccc', marginTop: '15px' }}>
                  {formError}
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                <button type="button" className="cancel-btn" onClick={() => handleEditCloseAttempt(false)} style={{ background: '#f1f2f6', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" className="save-btn" style={{ background: '#d10000', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
{/* ── MODAL: DISCARD ADD STAFF ── */}
{showAddDiscardModal && (
  <div className="modal-overlay alert-overlay">
    <div className="delete-confirm-modal">
      <div className="modal-header-red"><h3>Cancel Adding Staff Account?</h3>
        <button style={{
          background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7',
          borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
          fontWeight: 'bold', padding: '4px 8px', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }} className="close-x" onClick={() => setShowAddDiscardModal(false)}>✖</button>
      </div>
      <div className="delete-modal-body">
        <p>You have unsaved details. All entered information will be discarded.</p>
        <div className="delete-modal-footer">
          <button className="confirm-delete-btn" onClick={() => { setShowAddDiscardModal(false); closeModal(); }}>Discard</button>
          <button className="cancel-delete-btn" onClick={() => setShowAddDiscardModal(false)}>Keep Editing</button>
        </div>
      </div>
    </div>
  </div>
)}

{/* ── MODAL: DISCARD EDIT STAFF ── */}
{showEditDiscardModal && (
  <div className="modal-overlay alert-overlay">
    <div className="delete-confirm-modal">
      <div className="modal-header-red"><h3>Cancel Editing Staff Account?</h3>
        <button style={{
          background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7',
          borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
          fontWeight: 'bold', padding: '4px 8px', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }} className="close-x" onClick={() => setShowEditDiscardModal(false)}>✖</button>
      </div>
      <div className="delete-modal-body">
        <p>You have unsaved changes. All modifications will be discarded.</p>
        <div className="delete-modal-footer">
          <button className="confirm-delete-btn" onClick={closeEditFormCompletely}>Discard</button>
          <button className="cancel-delete-btn" onClick={() => setShowEditDiscardModal(false)}>Keep Editing</button>
        </div>
      </div>
    </div>
  </div>
)}

{showArchiveModal && selectedEmployee && (
  <div className="modal-overlay alert-overlay">
    <div className="delete-confirm-modal" style={{ background: 'white', borderRadius: '12px', width: '400px', overflow: 'hidden' }}>
      <div className="modal-header-red" style={{ padding: '16px 20px', background: '#d10000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedEmployee.is_archived ? 'Restore Staff Account?' : 'Archive Staff Account?'}</h3>
        <button onClick={() => setShowArchiveModal(false)} style={{ background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px' }}>✖</button>
      </div>
      <div style={{ padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ color: '#333', fontSize: '14px', margin: '0 0 20px 0' }}>
          {selectedEmployee.is_archived
            ? <>Are you sure you want to restore <strong>{selectedEmployee.name}</strong>? Their account will be active again.</>
            : <>Are you sure you want to archive <strong>{selectedEmployee.name}</strong>? Their account will be deactivated and hidden from active staff lists.</>
          }
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={handleArchiveSubmit} style={{ padding: '10px 20px', backgroundColor: '#d10000', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {selectedEmployee.is_archived ? 'Yes, Restore' : 'Yes, Archive'}
          </button>
          <button onClick={() => setShowArchiveModal(false)} style={{ padding: '10px 20px', backgroundColor: '#ecf0f1', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default UserAccess;