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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  // --- DATA STATE ---
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Hardware Supply Corp.', contact: 'Juan Dela Cruz', phone: '0917-555-0123', email: 'juan@hwdsupply.ph', address: 'Unit 5, Industrial Ave., Bacolod', products: 'Screwdriver', status: 'Active' },
    { id: 2, name: 'Paint the Wall Org.', contact: 'Jon Doe', phone: '0923-456-0808', email: 'jondoe@paintdwall.ph', address: 'Unit 5, Industrial Ave., Bacolod', products: 'Paint Brush', status: 'Inactive' }
  ]);

  const [formData, setFormData] = useState({
    name: '', contact: '', phone: '', email: '', address: '', products: ''
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
    const hasData = Object.values(formData).some(val => val !== '');
    if (hasData) setShowDiscardModal(true);
    else closeFormCompletely();
  };

  const closeFormCompletely = () => {
    setShowModal(false);
    setShowDiscardModal(false);
    setIsEditing(false);
    setFormData({ name: '', contact: '', phone: '', email: '', address: '', products: '' });
  };

  // --- CRUD OPERATIONS ---
  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (isEditing) {
      setSuppliers(suppliers.map(s => s.id === selectedSupplierId ? { ...s, ...formData } : s));
      triggerToast("Supplier updated successfully!");
    } else {
      const newSupplier = { id: Date.now(), ...formData, status: 'Active' };
      setSuppliers([...suppliers, newSupplier]);
      triggerToast("New supplier added!");
    }
    closeFormCompletely();
  };

  const handleEdit = (supplier) => {
    setFormData({ 
      name: supplier.name, contact: supplier.contact, phone: supplier.phone, 
      email: supplier.email, address: supplier.address, products: supplier.products 
    });
    setSelectedSupplierId(supplier.id);
    setIsEditing(true);
    setShowModal(true);
    setOpenMenuId(null);
  };

  const confirmDeletion = () => {
    setSuppliers(suppliers.filter(s => s.id !== supplierToDelete));
    setShowDeleteModal(false);
    triggerToast("Supplier removed", "error");
  };

  const handleArchive = (id) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, status: 'Inactive' } : s));
    setOpenMenuId(null);
    triggerToast("Supplier archived");
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <th>Supplier Name</th><th>Contact Person</th><th>Phone</th><th>Email</th>
                  <th>Address</th><th>Products Supplied</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} style={{ zIndex: openMenuId === s.id ? 10 : 1, position: 'relative' }}>
                    <td style={{ fontWeight: 'bold' }}>{s.name}</td>
                    <td>{s.contact}</td>
                    <td>{s.phone}</td>
                    <td className="email-cell">{s.email}</td>
                    <td>{s.address}</td>
                    <td>{s.products}</td>
                    <td><span className={`status-pill ${s.status.toLowerCase()}`}>{s.status}</span></td>
                    <td>
                      <div className="action-menu-container">
                        <button className="dots-btn" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === s.id ? null : s.id); }}>ooo</button>
                        {openMenuId === s.id && (
                          <div className="action-dropdown">
                            <div onClick={() => handleEdit(s)}>EDIT</div>
                            <div onClick={() => handleArchive(s.id)}>ARCHIVE</div>
                            <div onClick={() => { setSupplierToDelete(s.id); setShowDeleteModal(true); }} className="delete-text">DELETE</div>
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

      {/* --- ADD/EDIT SUPPLIER MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="add-user-modal"> {/* Reusing the UserAccess modal class for consistency */}
            <div className="modal-header-red">
              <h3>{isEditing ? "Edit Supplier" : "Add Supplier"}</h3>
              <button className="close-x" onClick={handleCancelAttempt}>✖</button>
            </div>
            <form onSubmit={handleSaveSupplier} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input type="text" required value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Product Supplied</label>
                  <input type="text" required value={formData.products} onChange={(e) => setFormData({...formData, products: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
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

      {/* --- CONFIRMATION MODALS --- */}
      {showDeleteModal && (
        <div className="modal-overlay alert-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header-red"><h3>Delete User?</h3></div>
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