import React, { useState, useEffect } from 'react';
import './index.css';

import TopHeader from './TopHeader';
import BatchReport from './BatchReport';

import Sidebar from "./Sidebar";
import inventoryIcon from './assets/inventory_header icon.png';
import searchIcon from './assets/supplier_search button.png'; // Added search icon import

//same sa dashboard.jsx eto yung mga import na di na need kasi nasa loob na ng sidebar.jsx
//import logo from './assets/logotrans.png';
//import dashboardIcon from './assets/dashboard_header icon.png';
//import Logout from './Logout';
//import salesRecordIcon from './assets/salesrecord_header icon.png';
//import userAccessIcon from './assets/useracess_header icon.png';
//import transactIcon from './assets/transact_pos header.png';
//import generateReportIcon from './assets/generate report_ header icon.png';
//import supplierIcon from './assets/supplier_header icon.png';
//import clientIcon from './assets/client_header icon.png';
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000'
  : 'https://ergin-hardware.onrender.com';

const ITEMS_PER_PAGE = 8;

const CATEGORIES = [
  'Tools',
  'Hardware',
  'Electrical',
  'Plumbing',
  'Paint & Supplies',
  'Construction Materials',
  'Safety Equipment',
  'Fasteners',
  'Others',
];

const Inventory = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showEditDiscardModal, setShowEditDiscardModal] = useState(false);
  const [originalEditData, setOriginalEditData] = useState(null); 
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [formData, setFormData] = useState({
    name: '', category: '', retail_price: 0, selling_price: 0
  });

  const [editData, setEditData] = useState({
    id: '', name: '', category: '', retail_price: 0, selling_price: 0
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showBatchReport, setShowBatchReport] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchInventory();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inventory`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        triggerToast("Product profile created successfully!");
        fetchInventory();
        closeFormCompletely();
      } else {
        alert("Failed to save product. Check the Flask terminal.");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/product/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (response.ok) {
        triggerToast("Product updated successfully!");
        setShowEditModal(false);
        fetchInventory();
      } else {
        alert("Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  const handleArchiveSubmit = async () => {
    try {
      const newStatus = selectedProduct.is_archived ? false : true;
      const response = await fetch(`${API_URL}/api/product/${selectedProduct.product_id}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: newStatus })
      });

      if (response.ok) {
        setProducts(prev => prev.map(p =>
          p.product_id === selectedProduct.product_id ? { ...p, is_archived: newStatus } : p
        ));
        triggerToast(newStatus ? `${selectedProduct.product_name} has been archived.` : `${selectedProduct.product_name} has been restored.`);
      } else {
        setProducts(prev => prev.map(p =>
          p.product_id === selectedProduct.product_id ? { ...p, is_archived: newStatus } : p
        ));
        triggerToast(newStatus ? `${selectedProduct.product_name} archived (local only).` : `${selectedProduct.product_name} restored (local only).`);
      }
    } catch (error) {
      setProducts(prev => prev.map(p =>
        p.product_id === selectedProduct.product_id ? { ...p, is_archived: !p.is_archived } : p
      ));
      triggerToast(`${selectedProduct.product_name} archived (local only).`);
    }
    setShowArchiveModal(false);
    setSelectedProduct(null);
  };

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleCloseAttempt = () => {
    if (formData.name !== "") setShowDiscardModal(true);
    else closeFormCompletely();
  };

  const closeFormCompletely = () => {
    setShowDiscardModal(false);
    setShowAddModal(false);
    setFormData({ name: '', category: '', retail_price: 0, selling_price: 0 });
  };

const openEditModal = (product) => {
  const data = {
    id: product.product_id,
    name: product.product_name,
    category: product.category,
    retail_price: product.retail_price || 0,
    selling_price: product.selling_price || 0
  };
  setEditData(data);
  setOriginalEditData(data); // <-- save original
  setShowEditModal(true);
  setActiveDropdown(null);
};

const handleEditCloseAttempt = () => {
  const isDirty =
    editData.name !== originalEditData.name ||
    editData.category !== originalEditData.category ||
    editData.retail_price !== originalEditData.retail_price ||
    editData.selling_price !== originalEditData.selling_price;

  if (isDirty) setShowEditDiscardModal(true);
  else setShowEditModal(false);
};

const closeEditFormCompletely = () => {
  setShowEditDiscardModal(false);
  setShowEditModal(false);
};

const openArchiveModal = (product) => {
    setSelectedProduct(product);
    setShowArchiveModal(true);
    setActiveDropdown(null);
  };

  const openBatchReport = (product) => {
    setSelectedProduct({
      id: product.product_id,
      name: product.product_name,
      category: product.category,
      qty: product.stock,
      retail: product.retail_price || 0,
      unit: 'pcs'
    });
    setShowBatchReport(true);
    setActiveDropdown(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesArchive = showArchived ? true : !product.is_archived;
    if (!matchesArchive) return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      product.product_id?.toString().toLowerCase().includes(s) ||
      product.product_name?.toLowerCase().includes(s) ||
      product.category?.toLowerCase().includes(s) ||
      product.stock?.toString().toLowerCase().includes(s) ||
      product.retail_price?.toString().toLowerCase().includes(s) ||
      product.selling_price?.toString().toLowerCase().includes(s)
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc': return (a.product_name || '').localeCompare(b.product_name || '');
      case 'name-desc': return (b.product_name || '').localeCompare(a.product_name || '');
      case 'price-low': return (Number(a.selling_price) || 0) - (Number(b.selling_price) || 0);
      case 'price-high': return (Number(b.selling_price) || 0) - (Number(a.selling_price) || 0);
      case 'stock-low': return (Number(a.stock) || 0) - (Number(b.stock) || 0);
      case 'stock-high': return (Number(b.stock) || 0) - (Number(a.stock) || 0);
      default: return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Reset to page 1 when search/sort changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortOption]);

  // Shared modal input style
  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #ddd',
    borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box',
    outline: 'none', transition: 'border 0.2s'
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '5px', display: 'block'
  };

  return (
    <div className="outer-margin-container">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>{toast.message}</div>
      )}

      <div className="connected-border-box">
        {/* Sidebar */}
        <Sidebar />


        {/* Main Content */}
        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={inventoryIcon} alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              <h2 style={{ margin: 0 }}>Inventory Management</h2>
            </div>
            <TopHeader />
          </header>

          <hr className="divider" />

          {/* Controls */}
          <div className="inventory-controls">
            
            {/* Added Search Icon Logic Here */}
            <div className="search-wrapper" style={{ position: 'relative' }}>
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
                placeholder="Search all columns..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px' }} // Padding ensures text doesn't overlap the icon
              />
            </div>

            <div className="filter-group">
              <select
                className="filter-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Sort by...</option>
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="price-high">Price (Highest First)</option>
                <option value="price-low">Price (Lowest First)</option>
                <option value="stock-high">Stock (Highest First)</option>
                <option value="stock-low">Stock (Lowest First)</option>
              </select>
              <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
                + Add Product
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

          {/* Table */}
          <div className="table-container shadow-box">
            <table className="inventory-table">
              <thead>
                <tr>
                  {/* Applied Bold Styling to Headers */}
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Product ID</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Product Name</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Category</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Stock Qty</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Selling Price</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Retail / Cost Price</th>
                  <th style={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <tr key={product.product_id} style={{
                      opacity: product.is_archived ? 0.45 : 1,
                      background: product.is_archived ? '#f5f5f5' : 'white',
                      transition: 'opacity 0.2s'
                    }}>
                      <td style={{ color: product.is_archived ? '#999' : undefined }}>{product.product_id}</td>
                      <td style={{ fontWeight: '600', color: product.is_archived ? '#999' : undefined }}>
                        {product.product_name}
                        {product.is_archived && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#ccc', color: '#555', padding: '2px 6px', borderRadius: '10px', fontWeight: 'normal' }}>Archived</span>}
                      </td>
                      <td style={{ color: product.is_archived ? '#999' : undefined }}>{product.category}</td>
                      <td>
                        <span style={{
                          color: product.is_archived ? '#999' : product.stock > 10 ? '#27ae60' : product.stock > 0 ? '#e67e22' : '#e74c3c',
                          fontWeight: 'bold'
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td style={{ color: product.is_archived ? '#999' : '#000' }}>₱{Number(product.selling_price || 0).toFixed(2)}</td>
                      <td style={{ color: product.is_archived ? '#999' : '#555' }}>₱{Number(product.retail_price || 0).toFixed(2)}</td>

                      <td style={{ position: 'relative', textAlign: 'center', overflow: 'visible' }}>
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === product.product_id ? null : product.product_id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#7f8c8d', padding: '4px 8px' }}
                        >
                          ⋮
                        </button>

                        {activeDropdown === product.product_id && (
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
                              {!product.is_archived && (
                                <>
                                  <button
                                    onClick={() => openEditModal(product)}
                                    style={{ padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: '600', color: '#333' }}
                                    onMouseOver={(e) => e.target.style.background = '#f4f8fb'}
                                    onMouseOut={(e) => e.target.style.background = 'white'}
                                  >
                                     Edit
                                  </button>
                                  <button
                                    onClick={() => openBatchReport(product)}
                                    style={{ padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: '600', color: '#333' }}
                                    onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                                    onMouseOut={(e) => e.target.style.background = 'white'}
                                  >
                                     Batches
                                  </button>
                                </>
                              )}
                              <button onClick={() => openArchiveModal(product)} style={{ padding: '10px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#e74c3c' }}
                                onMouseOver={(e) => e.target.style.background = '#fdf3f2'}
                                onMouseOut={(e) => e.target.style.background = 'none'}
                                >{product.is_archived ? 'Unarchive' : 'Archive'}
                                </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '13px' }}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '0 4px' }}>
              <span style={{ fontSize: '12px', color: '#888' }}>
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)} of {sortedProducts.length} products
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '5px 12px', borderRadius: '6px', border: '1px solid #ddd',
                    background: currentPage === 1 ? '#f5f5f5' : 'white',
                    color: currentPage === 1 ? '#bbb' : '#333',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '12px', fontWeight: '600'
                  }}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: '5px 10px', borderRadius: '6px',
                      border: page === currentPage ? 'none' : '1px solid #ddd',
                      background: page === currentPage ? '#d10000' : 'white',
                      color: page === currentPage ? 'white' : '#333',
                      cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      minWidth: '32px'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '5px 12px', borderRadius: '6px', border: '1px solid #ddd',
                    background: currentPage === totalPages ? '#f5f5f5' : 'white',
                    color: currentPage === totalPages ? '#bbb' : '#333',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '12px', fontWeight: '600'
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Batch Report */}
      {showBatchReport && selectedProduct && (
        <BatchReport
          activeProduct={selectedProduct}
          currentTime={currentTime}
          onClose={() => setShowBatchReport(false)}
        />
      )}

      {/* ── MODAL: ADD PRODUCT ── */}
      {showAddModal && (
        <div className="modal-overlay">
          <div style={{
            background: 'white', borderRadius: '10px', width: '480px',
            maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden'
          }}>
            {/* Header Styled like UserAccess */}
            <div className="modal-header-red" style={{ padding: '16px 20px', background: '#d10000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Create Product Profile</h3>
              <button style={{
                  background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                  fontWeight: 'bold', padding: '4px 8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }} className="close-x" onClick={handleCloseAttempt}>
                ✖
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Product Name</label>
                <input type="text" placeholder="e.g. Steel Nails" required style={inputStyle}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Category</label>
                <select required style={inputStyle}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="">— Select Category —</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Selling Price (₱)</label>
                  <input type="number" placeholder="0.00" step="0.01" required style={inputStyle}
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label style={labelStyle}>Retail / Cost Price (₱)</label>
                  <input type="number" placeholder="0.00" step="0.01" required style={inputStyle}
                    value={formData.retail_price}
                    onChange={(e) => setFormData({ ...formData, retail_price: parseFloat(e.target.value) })} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Initial Stock</label>
                <input type="text" disabled style={{ ...inputStyle, background: '#f7f7f7', color: '#999', fontStyle: 'italic' }}
                  value="0 — Add stock via Supplier Restock" />
              </div>

              {/* Footer Styled like UserAccess */}
              <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                <button type="button" className="cancel-btn" onClick={handleCloseAttempt} style={{ background: '#f1f2f6', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" className="save-btn" style={{ background: '#d10000', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PRODUCT ── */}
      {showEditModal && (
        <div className="modal-overlay">
          <div style={{
            background: 'white', borderRadius: '10px', width: '480px',
            maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden'
          }}>
            {/* Header Styled like UserAccess */}
            <div className="modal-header-red" style={{ padding: '16px 20px', background: '#d10000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Edit Product Profile</h3>
              <button style={{
                  background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                  fontWeight: 'bold', padding: '4px 8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }} className="close-x" onClick={() => handleEditCloseAttempt(false)}>
                ✖
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Product Name</label>
                <input type="text" required style={inputStyle}
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Category</label>
                <select required style={inputStyle}
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}>
                  <option value="">— Select Category —</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Selling Price (₱)</label>
                  <input type="number" step="0.01" required style={inputStyle}
                    value={editData.selling_price}
                    onChange={(e) => setEditData({ ...editData, selling_price: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label style={labelStyle}>Retail / Cost Price (₱)</label>
                  <input type="number" step="0.01" required style={inputStyle}
                    value={editData.retail_price}
                    onChange={(e) => setEditData({ ...editData, retail_price: parseFloat(e.target.value) })} />
                </div>
              </div>

              {/* Footer Styled like UserAccess */}
              <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                <button type="button" className="cancel-btn" onClick={() => handleEditCloseAttempt(false)} style={{ background: '#f1f2f6', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" className="save-btn" style={{ background: '#d10000', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showArchiveModal && selectedProduct && (
        <div className="modal-overlay alert-overlay">
          <div className="delete-confirm-modal" style={{ background: 'white', borderRadius: '12px', width: '400px', overflow: 'hidden' }}>
            <div className="modal-header-red" style={{ padding: '16px 20px', background: '#d10000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedProduct.is_archived ? 'Restore Product?' : 'Archive Product?'}</h3>
              <button onClick={() => setShowArchiveModal(false)} style={{ background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px' }}>✖</button>
            </div>
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <p style={{ color: '#333', fontSize: '14px', margin: '0 0 20px 0' }}>
                {selectedProduct.is_archived
                  ? <>Are you sure you want to restore <strong>{selectedProduct.product_name}</strong>? It will appear in active inventory again.</>
                  : <>Are you sure you want to archive <strong>{selectedProduct.product_name}</strong>? It will be hidden from active inventory lists.</>
                }
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button onClick={handleArchiveSubmit} style={{ padding: '10px 20px', backgroundColor: '#d10000', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {selectedProduct.is_archived ? 'Yes, Restore' : 'Yes, Archive'}
                </button>
                <button onClick={() => setShowArchiveModal(false)} style={{ padding: '10px 20px', backgroundColor: '#ecf0f1', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DISCARD CHANGES ── */}
      {showDiscardModal && (
        <div className="modal-overlay alert-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header-red"><h3>Cancel Adding New Product?</h3>
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
{/* ── MODAL: DISCARD EDIT CHANGES ── */}
{showEditDiscardModal && (
  <div className="modal-overlay alert-overlay">
    <div className="delete-confirm-modal">
      <div className="modal-header-red"><h3>Cancel Editing Product?</h3>
      <button style={{
            background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7',
            borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
            fontWeight: 'bold', padding: '4px 8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }} className="close-x" onClick={() => setShowEditDiscardModal(false)}>
          ✖
        </button></div>
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

    </div>
  );
};

export default Inventory;