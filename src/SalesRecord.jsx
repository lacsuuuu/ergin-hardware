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
import searchIcon from './assets/supplier_search button.png';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000'
  : 'https://ergin-hardware.onrender.com';

const ROWS_PER_PAGE = 8; 

const SalesRecord = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');       
  const [invoiceData, setInvoiceData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);     

  // Modal state for Remarks
  const [remarksModal, setRemarksModal] = useState({ show: false, text: '', saleId: null });

  useEffect(() => {
    fetchSalesRecords();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSalesRecords = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sales-record`);
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) { console.error("Error fetching sales records:", error); }
  };

  const handleViewReceipt = async (salesId) => {
    // 1. INSTANT POP-UP: Find the basic info we already have in the main table
    const basicSaleInfo = sales.find(s => s.sales_id === salesId);
    
    if (basicSaleInfo) {
      // Instantly show the modal with the data we know, leaving items empty for a split second
      setInvoiceData({
        sales_id: basicSaleInfo.sales_id,
        date: basicSaleInfo.date,
        time: "--:--",
        client: { name: basicSaleInfo.customer_name }, // Use the name we already have
        items: [], 
        total: basicSaleInfo.total_amount,
        remarks: basicSaleInfo.remarks || ''
      });
    }

    // 2. BACKGROUND FETCH: Silently grab the full details (specific items, addresses, etc.)
    try {
      const response = await fetch(`${API_URL}/api/sales/${salesId}`);
      if (response.ok) {
        const data = await response.json();
        // Seamlessly update the open modal with the full data once it arrives
        setInvoiceData({
          sales_id: data.sale.sales_id,
          date: data.sale.date,
          time: "--:--",
          client: data.customer,
          items: data.items,
          total: data.sale.total_amount,
          remarks: data.sale.remarks || ''
        });
      } else {
        triggerToast("Failed to load full invoice details.", "error");
      }
    } catch (error) { 
      console.error("Error fetching receipt:", error); 
    }
  };

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Remarks Handlers
  const handleOpenRemarks = (sale) => {
    setRemarksModal({ show: true, text: sale.remarks || '', saleId: sale.sales_id });
  };

  const handleSaveRemarks = () => {
    setSales(prevSales => 
      prevSales.map(s => s.sales_id === remarksModal.saleId ? { ...s, remarks: remarksModal.text } : s)
    );
    setRemarksModal({ show: false, text: '', saleId: null });
    triggerToast("Remarks updated.", "success");
  };

  const navIconStyle = {
    width: '20px', height: '20px', marginRight: '8px',
    objectFit: 'contain', verticalAlign: 'middle'
  };

  const filteredSales = sales.filter(s => {
    const cleanSearch = searchTerm.replace(/^INV-/i, '').toLowerCase();
    const matchesSearch =
      s.sales_id.toString().includes(cleanSearch) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(cleanSearch));
    const matchesDate = filterDate ? s.date === filterDate : true;
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredSales.length / ROWS_PER_PAGE);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="outer-margin-container">
      
      {/* Properly styled pop-up toast matching system theme */}
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

        {/* Sidebar */}
        <aside className="sidebar no-print">
          <div className="logo-section"><img src={logo} alt="Logo" className="sidebar-logo" /></div>
          <nav className="side-nav">
            <div className="nav-item" onClick={() => navigate('/dashboard')}>
              <img src={dashboardIcon} alt="" style={navIconStyle} />DASHBOARD
            </div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>
              <img src={inventoryIcon} alt="" style={navIconStyle} />INVENTORY
            </div>
            <div className="nav-item active">
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
            <div className="nav-item" onClick={() => navigate('/clients')}>
              <img src={clientIcon} alt="" style={navIconStyle} />CLIENTS
            </div>
          </nav>
          <Logout />
        </aside>

        {/* Main Content */}
        <main className="dashboard-content no-print">
          <header className="main-header">
            <div className="title-area" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={salesRecordIcon} alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              <h2 style={{ margin: 0 }}>Sales Ledger</h2>
            </div>
            <TopHeader />
          </header>

          <hr className="divider" />

          {/* Controls row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>

            <div style={{ position: 'relative', width: '380px' }}>
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
                placeholder="Search by Invoice # or Customer Name..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ paddingLeft: '36px', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', whiteSpace: 'nowrap' }}>Filter by Date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={handleDateChange}
                style={{
                  padding: '8px 10px', border: '1px solid #d10000',
                  borderRadius: '4px', fontSize: '13px', cursor: 'pointer'
                }}
              />
              {filterDate && (
                <button
                  onClick={() => { setFilterDate(''); setCurrentPage(1); }}
                  style={{
                    background: '#d10000', color: 'white', border: 'none',
                    borderRadius: '4px', padding: '8px 10px', fontSize: '12px',
                    cursor: 'pointer', fontWeight: 'bold'
                  }}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="table-container shadow-box">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Invoice #</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Date</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Customer</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Total Amount</th>
                  <th style={{ fontWeight: 'bold', color: '#333' }}>Remarks</th>
                  <th style={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.length > 0 ? paginatedSales.map((sale) => (
                  <tr key={sale.sales_id}>
                    <td style={{ fontWeight: 'bold' }}>INV-{sale.sales_id}</td>
                    <td>{sale.date}</td>
                    <td>{sale.customer_name}</td>
                    <td style={{ fontWeight: 'bold', color: '#27ae60' }}>
                      ₱{parseFloat(sale.total_amount).toFixed(2)}
                    </td>
                    <td style={{ fontSize: '12px', color: '#666', fontStyle: sale.remarks ? 'normal' : 'italic' }}>
                      {sale.remarks || '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleViewReceipt(sale.sales_id)}
                          style={{
                            background: '#d10000', color: 'white', border: 'none',
                            padding: '6px 14px', borderRadius: '4px', fontSize: '12px',
                            fontWeight: 'bold', cursor: 'pointer'
                          }}>
                          View Receipt
                        </button>
                        
                        <button
                          onClick={() => handleOpenRemarks(sale)}
                          style={{
                            background: '#fff', color: '#d10000', border: '1px solid #d10000',
                            padding: '6px 14px', borderRadius: '4px', fontSize: '12px',
                            fontWeight: 'bold', cursor: 'pointer'
                          }}>
                          Remarks
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                      No sales records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
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
                Page {currentPage} of {totalPages} ({filteredSales.length} records)
              </span>
            </div>
          )}

        </main>
      </div>

      {/* REMARKS MODAL */}
      {remarksModal.show && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="receipt-modal" style={{
            maxWidth: '400px', width: '90%', background: 'white',
            borderRadius: '8px', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
          }}>
            <div className="modal-header-red" style={{ padding: '16px 20px', background: '#d10000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Invoice Remarks (INV-{remarksModal.saleId})</h3>
              <button style={{
                  background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                  fontWeight: 'bold', padding: '4px 8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }} className="close-x" onClick={() => setRemarksModal({ show: false, text: '', saleId: null })}>
                ✖
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <textarea
                value={remarksModal.text}
                onChange={(e) => setRemarksModal({ ...remarksModal, text: e.target.value })}
                placeholder="Enter remarks for this transaction here..."
                style={{ 
                  width: '100%', height: '140px', padding: '12px', 
                  borderRadius: '4px', border: '1px solid #ccc', 
                  resize: 'none', fontSize: '14px', boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div className="modal-footer" style={{ background: '#f9f9f9', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee' }}>
              <button
                onClick={() => setRemarksModal({ show: false, text: '', saleId: null })}
                className="cancel-btn"
                style={{ background: '#f1f2f6', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Close
              </button>
              <button
                onClick={handleSaveRemarks}
                className="save-btn"
                style={{ background: '#d10000', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Save Remarks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXISTING INVOICE RECEIPT MODAL */}
      {invoiceData && (
        <>
          <style>
            {`
              @media print {
                .connected-border-box { display: none !important; }
                .toast-notification { display: none !important; }
                @page { margin: 0.5cm; size: A5; }
                body { margin: 0; background: white; }
                .modal-overlay {
                  position: absolute !important; left: 0 !important; top: 0 !important;
                  background: white !important; padding: 0 !important; display: block !important;
                }
                .receipt-modal {
                  box-shadow: none !important; max-width: 100% !important;
                  width: 100% !important; margin: 0 !important; border-radius: 0 !important;
                }
                .no-print { display: none !important; }
              }
            `}
          </style>

          {/* Click outside to close wrapper */}
          <div 
            className="modal-overlay" 
            style={{ zIndex: 9998 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setInvoiceData(null);
              }
            }}
          >
            <div className="receipt-modal" style={{
              maxWidth: '560px', width: '90%', background: 'white',
              borderRadius: '8px', overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              maxHeight: '90vh', overflowY: 'auto'
            }}>

              <div id="printable-invoice" style={{ padding: '24px', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>

                <div style={{ position: 'relative', textAlign: 'center', marginBottom: '14px' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, textAlign: 'right', fontSize: '10px' }}>
                    <div>Invoice</div>
                    <div>Invoice No: {invoiceData.sales_id}</div>
                    <div>Date: {invoiceData.date}</div>
                  </div>
                  <img src={logo} alt="Ergin Hardware" style={{ height: '44px', marginBottom: '6px' }} />
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>ERGIN HARDWARE AND CONSTRUCTION SUPPLY TRADING</div>
                  <div style={{ fontSize: '10px' }}>Bomba Street, Salvacion, Murcia, Negros Occidental</div>
                  <div style={{ fontSize: '10px' }}>GINA T. PENAFIEL – Prop. | NON-VAT REG. TIN 935-125-855-000</div>
                  <h3 style={{ margin: '10px 0 4px 0', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    CHARGE SALES INVOICE (REPRINT)
                  </h3>
                </div>

                <div style={{ fontSize: '11px', lineHeight: '1.7', marginBottom: '12px' }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '75px', fontWeight: 'bold' }}>Charged to:</span>
                    <span style={{ flex: 1, borderBottom: '1px solid black', paddingLeft: '6px' }}>{invoiceData.client?.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ width: '55px', fontWeight: 'bold' }}>Address:</span>
                    <span style={{ flex: 2, borderBottom: '1px solid black', paddingLeft: '6px' }}>{invoiceData.client?.address}</span>
                    <span style={{ width: '40px', fontWeight: 'bold' }}>Terms:</span>
                    <span style={{ flex: 1, borderBottom: '1px solid black', paddingLeft: '6px' }}>Cash</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ width: '85px', fontWeight: 'bold' }}>Business Style:</span>
                    <span style={{ flex: 2, borderBottom: '1px solid black', paddingLeft: '6px' }}>{invoiceData.client?.business_style || ''}</span>
                    <span style={{ width: '28px', fontWeight: 'bold' }}>TIN:</span>
                    <span style={{ flex: 1, borderBottom: '1px solid black', paddingLeft: '6px' }}>{invoiceData.client?.tin || ''}</span>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                      <th style={{ padding: '5px 0', width: '10%' }}>Qty.</th>
                      <th style={{ padding: '5px 0', width: '10%' }}>Unit</th>
                      <th style={{ padding: '5px 0', width: '50%' }}>Articles</th>
                      <th style={{ padding: '5px 0', width: '15%', textAlign: 'center' }}>U/P</th>
                      <th style={{ padding: '5px 0', width: '15%', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render empty rows smoothly while fetching items */}
                    {invoiceData.items?.length > 0 ? (
                      invoiceData.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '4px 0' }}>{item.quantity}</td>
                          <td style={{ padding: '4px 0' }}>pcs</td>
                          <td style={{ padding: '4px 0' }}>{item.name}</td>
                          <td style={{ padding: '4px 0', textAlign: 'center' }}>{item.price}</td>
                          <td style={{ padding: '4px 0', textAlign: 'right' }}>₱{item.subtotal}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ padding: '12px 0', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>Loading items...</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', marginBottom: '12px', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
                  <div style={{ width: '220px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>SubTotal:</span>
                      <span>₱ {invoiceData.total?.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Additional Charge:</span>
                      <span>₱ 0.00 (0%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ccc', paddingTop: '4px' }}>
                      <span>Total:</span>
                      <span>₱ {invoiceData.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {invoiceData.remarks && (
                  <div style={{ fontSize: '11px', marginBottom: '10px', padding: '6px 8px', background: '#fff8e1', borderLeft: '3px solid #d10000', borderRadius: '2px' }}>
                    <strong>Remarks:</strong> {invoiceData.remarks}
                  </div>
                )}

                <div style={{ borderBottom: '1px solid #ccc', marginBottom: '12px' }}></div>

                <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                  <p style={{ textDecoration: 'underline', color: '#0056b3', marginBottom: '10px' }}>
                    Received the above in good condition. Parties expressly submit themselves to the jurisdiction of the Courts of Bacolod City, any legal action arising out of this transaction and to pay 25% attorney's fees fine of suit. Interest of 2% per month will be charged on overdue accounts.
                  </p>
                  <div style={{ marginBottom: '10px' }}>
                    <div>BIR ATP No.: 077AU2023000005590</div>
                    <div>Date Issued: July 17, 2023</div>
                  </div>
                  <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                    THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAXES
                  </div>
                  <div style={{ textAlign: 'center', width: '240px', margin: '0 auto' }}>
                    <div style={{ borderBottom: '1px solid black', height: '16px', marginBottom: '4px' }}></div>
                    <div style={{ fontSize: '10px' }}>CLIENT</div>
                    <div style={{ fontSize: '10px' }}>(Please sign over printed name)</div>
                  </div>
                </div>
              </div>

              <div className="modal-footer no-print" style={{
                background: '#f9f9f9', padding: '16px 24px',
                display: 'flex', justifyContent: 'flex-end', gap: '12px',
                borderTop: '1px solid #eee'
              }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: '#f1f2f6', color: '#333',
                    padding: '8px 24px', border: '1px solid #ccc',
                    borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                  }}>
                  Print
                </button>
                <button
                  onClick={() => alert(`Email functionality for Invoice ${invoiceData.sales_id} coming soon!`)}
                  style={{
                    background: '#d10000', color: '#fff',
                    padding: '8px 24px', border: 'none',
                    borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                  }}>
                  Send Via Email
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default SalesRecord;