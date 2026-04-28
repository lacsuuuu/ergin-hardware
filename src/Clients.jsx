import React, { useState, useEffect } from 'react';
import './index.css';

import TopHeader from './TopHeader';

import Sidebar from './Sidebar';
import clientIcon from './assets/client_header icon.png';
import searchIcon from './assets/supplier_search button.png'; // Added search icon import

// Sidebar nav icons
//import dashboardIcon from './assets/dashboard_header icon.png';
//import inventoryIcon from './assets/inventory_header icon.png';
//import salesRecordIcon from './assets/salesrecord_header icon.png';
//import userAccessIcon from './assets/useracess_header icon.png';
//import transactIcon from './assets/transact_pos header.png';
//import generateReportIcon from './assets/generate report_ header icon.png';
//import supplierIcon from './assets/supplier_header icon.png';
//import Logout from './Logout';
//import logo from './assets/logotrans.png';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' 
  : 'https://ergin-hardware.onrender.com';

const ROWS_PER_PAGE = 8; // Pagination constant

const Clients = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Pagination state

  // --- MODAL & ACTION STATES ---
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // ADDED
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [activeDropdown, setActiveDropdown] = useState(null); // ADDED

  const [showEditDiscardModal, setShowEditDiscardModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [originalEditData, setOriginalEditData] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // --- DATA STATE ---
  const [clients, setClients] = useState([]);
  
  // Matches the 'customer' table columns
  const [formData, setFormData] = useState({
    name: '', address: '', contact: '', email: '', business_style: '', tin: ''
  });

  // Edit form data — ADDED
  const [editData, setEditData] = useState({
    customer_id: '', name: '', address: '', contact: '', email: '', business_style: '', tin: ''
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

  // ADDED: Handle update client
  const handleUpdateClient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/clients/${editData.customer_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        triggerToast("Client updated successfully!");
        fetchClients();
        setShowEditModal(false);
      } else {
        alert("Failed to update client. Check Flask terminal.");
      }
    } catch (error) {
      console.error("Error updating client:", error);
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

  // ADDED: Open edit modal
const handleEdit = (client) => {
  const data = {
    customer_id: client.customer_id,
    name: client.name,
    address: client.address,
    contact: client.contact,
    email: client.email,
    business_style: client.business_style,
    tin: client.tin
  };
  setEditData(data);
  setOriginalEditData(data);
  setShowEditModal(true);
  setActiveDropdown(null);
};

  // ADDED: Archive handler
const handleArchive = (client) => {
  setSelectedClient(client);
  setShowArchiveModal(true);
  setActiveDropdown(null);
};

const handleArchiveSubmit = async () => {
  try {
    const newStatus = selectedClient.is_archived ? false : true;
    const response = await fetch(`${API_URL}/api/clients/${selectedClient.customer_id}/archive`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_archived: newStatus })
    });

    if (response.ok) {
      // Update local state instantly — no need to re-fetch
      setClients(prev => prev.map(c =>
        c.customer_id === selectedClient.customer_id
          ? { ...c, is_archived: newStatus }
          : c
      ));
      triggerToast(newStatus ? `${selectedClient.name} has been archived.` : `${selectedClient.name} has been restored.`);
    } else {
      // Backend route may not exist yet — still update locally so UI works
      setClients(prev => prev.map(c =>
        c.customer_id === selectedClient.customer_id
          ? { ...c, is_archived: newStatus }
          : c
      ));
      triggerToast(newStatus ? `${selectedClient.name} archived (local only).` : `${selectedClient.name} restored (local only).`);
    }
  } catch (err) {
    // Fallback: still apply locally if backend isn't ready
    setClients(prev => prev.map(c =>
      c.customer_id === selectedClient.customer_id
        ? { ...c, is_archived: !c.is_archived }
        : c
    ));
    triggerToast(`${selectedClient.name} archived (local only).`);
  }
  setShowArchiveModal(false);
  setSelectedClient(null);
};

const handleEditCloseAttempt = () => {
  const isDirty =
    editData.name !== originalEditData.name ||
    editData.address !== originalEditData.address ||
    editData.contact !== originalEditData.contact ||
    editData.email !== originalEditData.email ||
    editData.business_style !== originalEditData.business_style ||
    editData.tin !== originalEditData.tin;
  if (isDirty) setShowEditDiscardModal(true);
  else setShowEditModal(false);
};

const closeEditFormCompletely = () => {
  setShowEditDiscardModal(false);
  setShowEditModal(false);
};

  // --- FILTER & PAGINATION LOGIC ---
  const filteredClients = clients.filter(c => {
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.contact && c.contact.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesArchive = showArchived ? true : !c.is_archived;
    return matchesSearch && matchesArchive;
  });

  const totalPages = Math.ceil(filteredClients.length / ROWS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 when searching
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
        <Sidebar />

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
                  <th style={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>Action</th>{/* ADDED */}
                </tr>
              </thead>
              <tbody>
                {paginatedClients.length > 0 ? (
                  paginatedClients.map((c) => (
                    <tr key={c.customer_id} style={{
                      opacity: c.is_archived ? 0.45 : 1,
                      background: c.is_archived ? '#f5f5f5' : 'white',
                      transition: 'opacity 0.2s'
                    }}>
                      <td style={{ padding: '12px', color: c.is_archived ? '#999' : undefined }}>{c.customer_id}</td>
                      <td style={{ fontWeight: 'bold', padding: '12px', color: c.is_archived ? '#999' : undefined }}>
                        {c.name}
                        {c.is_archived && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#ccc', color: '#555', padding: '2px 6px', borderRadius: '10px', fontWeight: 'normal' }}>Archived</span>}
                      </td>
                      <td style={{ padding: '12px', color: c.is_archived ? '#999' : undefined }}>{c.contact}</td>
                      <td style={{ padding: '12px', color: c.is_archived ? '#999' : undefined }}>{c.email}</td>
                      <td style={{ padding: '12px', color: c.is_archived ? '#999' : undefined }}>{c.address}</td>
                      <td style={{ padding: '12px', color: c.is_archived ? '#999' : undefined }}>{c.business_style}</td>
                      <td style={{ padding: '12px', color: c.is_archived ? '#999' : undefined }}>{c.tin}</td>

                      {/* ADDED: Action dropdown column */}
                      <td style={{ position: 'relative', textAlign: 'center', overflow: 'visible', padding: '12px' }}>
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === c.customer_id ? null : c.customer_id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#7f8c8d', padding: '0 8px', lineHeight: '1' }}
                        >
                          ⋮
                        </button>

                        {activeDropdown === c.customer_id && (
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
                              {!c.is_archived && (
                                <button
                                  onClick={() => handleEdit(c)}
                                  style={{ padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: '600', color: '#333' }}
                                  onMouseOver={(e) => e.target.style.background = '#f4f8fb'}
                                  onMouseOut={(e) => e.target.style.background = 'white'}
                                >
                                   Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleArchive(c)}
                                style={{ padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#e74c3c' }}
                                onMouseOver={(e) => e.target.style.background = '#fdf3f2'}
                                onMouseOut={(e) => e.target.style.background = 'white'}
                              >
                                 {c.is_archived ? 'Unarchive' : 'Archive'}
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No clients found. Add one above!</td>
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

      {/* --- Edit CLIENT MODAL --- ADDED */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header-red">
              <h3>Edit Client</h3>
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
                      }} className="close-x" onClick={() => handleEditCloseAttempt(false)}>
                        ✖
                      </button>
            </div>
            <form onSubmit={handleUpdateClient} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Client Name / Company</label>
                  <input type="text" required value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" required value={editData.contact} onChange={(e) => setEditData({...editData, contact: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Business Style</label>
                  <input type="text" value={editData.business_style} onChange={(e) => setEditData({...editData, business_style: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" required value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>TIN (Tax ID)</label>
                  <input type="text" value={editData.tin} onChange={(e) => setEditData({...editData, tin: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" className="cancel-btn" onClick={() => handleEditCloseAttempt(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DISCARD CHANGES MODAL --- */}
      {showDiscardModal && (
        <div className="modal-overlay alert-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header-red"><h3>Cancel Adding New Client?</h3>
            <button style={{
                  background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                  fontWeight: 'bold', padding: '4px 8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }} className="close-x" onClick={() => setShowDiscardModal(false)}>
                ✖
              </button></div>
            <div className="delete-modal-body">
              <p>You have unsaved details. All entered information will be discarded.</p>
              <div className="delete-modal-footer">
                <button className="confirm-delete-btn" onClick={closeFormCompletely}>Discard</button>
                <button className="cancel-delete-btn" onClick={() => setShowDiscardModal(false)}>Keep Editing</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DISCARD EDIT CLIENT ── */}
{showEditDiscardModal && (
  <div className="modal-overlay alert-overlay">
    <div className="delete-confirm-modal">
      <div className="modal-header-red"><h3>Cancel Editing Client?</h3>
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

{/* ── MODAL: ARCHIVE CLIENT ── */}
{showArchiveModal && selectedClient && (
  <div className="modal-overlay alert-overlay">
    <div className="delete-confirm-modal" style={{ background: 'white', borderRadius: '12px', width: '400px', overflow: 'hidden' }}>
      <div className="modal-header-red" style={{ padding: '16px 20px', background: '#d10000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedClient.is_archived ? 'Restore Client?' : 'Archive Client?'}</h3>
        <button onClick={() => setShowArchiveModal(false)} style={{ background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px' }}>✖</button>
      </div>
      <div style={{ padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ color: '#333', fontSize: '14px', margin: '0 0 20px 0' }}>
          {selectedClient.is_archived
            ? <>Are you sure you want to restore <strong>{selectedClient.name}</strong>? They will appear as an active client again.</>
            : <>Are you sure you want to archive <strong>{selectedClient.name}</strong>? They will be grayed out and hidden from active lists.</>
          }
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={handleArchiveSubmit} style={{ padding: '10px 20px', backgroundColor: '#d10000', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {selectedClient.is_archived ? 'Yes, Restore' : 'Yes, Archive'}
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



export default Clients;