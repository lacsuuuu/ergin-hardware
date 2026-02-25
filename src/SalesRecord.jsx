import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const SalesRecord = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // State
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceData, setInvoiceData] = useState(null); // Holds data for reprinting
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Effects
  useEffect(() => {
    fetchSalesRecords();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // API Calls
  const fetchSalesRecords = async () => {
    try {
      const response = await fetch('https://ergin-hardware.onrender.com/api/sales-record');
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) { console.error("Error fetching sales records:", error); }
  };

  const handleViewReceipt = async (salesId) => {
    try {
      const response = await fetch(`https://ergin-hardware.onrender.com/api/sales/${salesId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Rebuild the invoice data exactly how the print modal expects it!
        setInvoiceData({
          sales_id: data.sale.sales_id,
          date: data.sale.date,
          time: "--:--", // Historic time isn't stored in DB right now, we can just leave it blank or format it
          client: data.customer,
          items: data.items,
          total: data.sale.total_amount
        });
      } else {
        triggerToast("Failed to load invoice details.", "error");
      }
    } catch (error) { console.error("Error fetching receipt:", error); }
  };

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Filter logic
  const filteredSales = sales.filter(s => 
    s.sales_id.toString().includes(searchTerm) || 
    (s.customer_name && s.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="outer-margin-container">
      {toast.show && <div className={`toast-notification ${toast.type}`}>{toast.message}</div>}

      <div className="connected-border-box">
        
        {/* Sidebar */}
        <aside className="sidebar no-print">
          <div className="logo-section"><img src={logo} alt="Logo" className="sidebar-logo" /></div>
          <nav className="side-nav">
            <div className="nav-item" onClick={() => navigate('/dashboard')}>DASHBOARD</div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item active">SALES RECORD</div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>USER ACCESS</div>
            <div className="nav-item" onClick={() => navigate('/transact')}>TRANSACT</div>
            <div className="nav-item" onClick={() => navigate('/generate-report')}>GENERATE REPORT</div>
            <div className="nav-item" onClick={() => navigate('/suppliers')}>SUPPLIERS</div>
            <div className="nav-item" onClick={() => navigate('/clients')}>CLIENTS</div>
          </nav>
          <div className="sidebar-footer">👤</div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content no-print">
          <header className="main-header">
            <div className="title-area"><h2><span className="icon">📖</span> Sales Ledger</h2></div>
            <div className="admin-info">
              <p className="real-time-date">{currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}</p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" />

          {/* Controls */}
          <div className="supplier-controls" style={{ marginBottom: '20px' }}>
            <div className="search-wrapper" style={{ width: '400px' }}>
              <input 
                type="text" 
                placeholder="Search by Invoice # or Customer Name..." 
                className="search-input" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="table-container shadow-box">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.sales_id}>
                    <td style={{ fontWeight: 'bold' }}>INV-{sale.sales_id}</td>
                    <td>{sale.date}</td>
                    <td>{sale.customer_name}</td>
                    <td style={{ fontWeight: 'bold', color: '#27ae60' }}>
                      ₱{sale.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleViewReceipt(sale.sales_id)}
                        style={{ background: '#3498db', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        📄 View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                      No sales records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* --- INVOICE REPRINT MODAL (Exact Copy from Transact) --- */}
      {invoiceData && (
        <>
          <style>
            {`
              @media print {
                .connected-border-box { display: none !important; }
                .toast-notification { display: none !important; }
                @page { margin: 0.5cm; }
                body { margin: 0; background: white; }
                .modal-overlay { 
                  position: absolute !important; left: 0 !important; top: 0 !important; 
                  background: white !important; padding: 0 !important; display: block !important;
                }
                .add-user-modal { 
                  box-shadow: none !important; max-width: 100% !important; 
                  width: 100% !important; margin: 0 !important; border-radius: 0 !important;
                }
                .no-print { display: none !important; }
              }
            `}
          </style>

          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="add-user-modal" style={{ maxWidth: '800px', padding: '0', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              
              <div id="printable-invoice" style={{ padding: '40px', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
                
                {/* Header Section */}
                <div style={{ position: 'relative', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, textAlign: 'right', fontSize: '12px' }}>
                    <div>Invoice</div>
                    <div>Invoice No: {invoiceData.sales_id}</div>
                    <div>Date: {invoiceData.date}</div>
                  </div>

                  <img src={logo} alt="Ergin Hardware" style={{ height: '60px', marginBottom: '10px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>ERGIN HARDWARE AND CONSTRUCTION SUPPLY TRADING</div>
                  <div style={{ fontSize: '12px' }}>Bomba Street, Salvacion, Murcia, Negros Occidental</div>
                  <div style={{ fontSize: '12px' }}>GINA T. PENAFIEL – Prop.</div>
                  <div style={{ fontSize: '12px' }}>NON-VAT REG. TIN 935-125-855-000</div>
                  
                  <h2 style={{ margin: '15px 0 5px 0', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>CHARGE SALES INVOICE (REPRINT)</h2>
                </div>

                {/* Customer Details Section */}
                <div style={{ fontSize: '13px', lineHeight: '1.8', marginBottom: '20px' }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '80px' }}>Charged to:</span>
                    <span style={{ flex: 1, borderBottom: '1px solid black', paddingLeft: '10px' }}>{invoiceData.client?.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ width: '60px' }}>Address:</span>
                    <span style={{ flex: 2, borderBottom: '1px solid black', paddingLeft: '10px' }}>{invoiceData.client?.address}</span>
                    <span style={{ width: '45px' }}>Terms:</span>
                    <span style={{ flex: 1, borderBottom: '1px solid black', paddingLeft: '10px' }}>Cash</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ width: '95px' }}>Business Style:</span>
                    <span style={{ flex: 2, borderBottom: '1px solid black', paddingLeft: '10px' }}>{invoiceData.client?.business_style || ''}</span>
                    <span style={{ width: '30px' }}>TIN:</span>
                    <span style={{ flex: 1, borderBottom: '1px solid black', paddingLeft: '10px' }}>{invoiceData.client?.tin || ''}</span>
                  </div>
                </div>

                {/* Products Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                      <th style={{ padding: '8px 0', width: '10%' }}>Qty.</th>
                      <th style={{ padding: '8px 0', width: '10%' }}>Unit</th>
                      <th style={{ padding: '8px 0', width: '50%' }}>Articles</th>
                      <th style={{ padding: '8px 0', width: '15%', textAlign: 'center' }}>U/P</th>
                      <th style={{ padding: '8px 0', width: '15%', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '8px 0' }}>{item.quantity}</td>
                        <td style={{ padding: '8px 0' }}>pcs</td>
                        <td style={{ padding: '8px 0' }}>{item.name}</td>
                        <td style={{ padding: '8px 0', textAlign: 'center' }}>{item.price}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right' }}>₱{item.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Subtotals Section */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13px', marginBottom: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                  <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span>SubTotal:</span>
                      <span>₱ {invoiceData.total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span>Additional Charge:</span>
                      <span>₱ 0.00 (0%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ccc', paddingTop: '5px' }}>
                      <span>Total:</span>
                      <span>₱ {invoiceData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ borderBottom: '1px solid #ccc', marginBottom: '20px' }}></div>

                {/* Legal & Signatures */}
                <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                  <p style={{ textDecoration: 'underline', color: '#0056b3', marginBottom: '15px' }}>
                    Received the above in good condition. Parties expressly submit themselves to the jurisdiction of the Courts of Bacolod City, any legal action arising out of this transaction and to pay 25% attorney's fees fine of suit. Interest of 2% per month will be charged on overdue accounts.
                  </p>
                  
                  <div style={{ marginBottom: '15px', color: '#000' }}>
                    <div>BIR ATP No.: 077AU2023000005590</div>
                    <div>Date Issued: July 17, 2023</div>
                  </div>

                  <div style={{ fontWeight: 'bold', marginBottom: '40px', color: '#000' }}>
                    THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAXES
                  </div>

                  <div style={{ textAlign: 'center', width: '300px', margin: '0 auto' }}>
                    <div style={{ borderBottom: '1px solid black', height: '20px', marginBottom: '5px' }}></div>
                    <div>CLIENT</div>
                    <div>(Please sign over printed name)</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-footer no-print" style={{ background: '#f9f9f9', padding: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  onClick={() => setInvoiceData(null)} 
                  style={{ background: 'transparent', color: '#7f8c8d', padding: '10px 20px', border: 'none', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button 
                  onClick={() => window.print()} 
                  style={{ background: '#f1f2f6', color: '#2c3e50', padding: '10px 20px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🖨️ Print Copy
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