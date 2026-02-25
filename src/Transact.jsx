import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const Transact = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- DATA STATE ---
  const [inventory, setInventory] = useState([]);
  const [clients, setClients] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // --- CART & SEARCH STATE ---
  const [selectedClient, setSelectedClient] = useState('');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- MODAL STATES ---
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', address: '', contact: '', business_style: '', tin: '' });
  
  const [invoiceData, setInvoiceData] = useState(null); // Holds data for the printable receipt

  // --- EFFECTS ---
  useEffect(() => {
    fetchInventory();
    fetchClients();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- API CALLS ---
  const fetchInventory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/inventory');
      const data = await response.json();
      setInventory(data);
    } catch (error) { console.error("Error fetching inventory:", error); }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) { console.error("Error fetching clients:", error); }
  };

  // --- QUICK ADD CLIENT LOGIC ---
  const handleQuickAddClient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData)
      });

      if (response.ok) {
        const data = await response.json();
        const newId = data[0].customer_id;
        triggerToast("Client saved!");
        fetchClients(); 
        setSelectedClient(newId); 
        setShowNewClientModal(false);
        setNewClientData({ name: '', address: '', contact: '', business_style: '', tin: '' });
      }
    } catch (error) { console.error("Error quick-adding client:", error); }
  };

  // --- CART & BARCODE LOGIC ---
  const addToCart = (product) => {
    if (product.stock <= 0) {
      triggerToast("Out of stock!", "error");
      return;
    }

    const existingItem = cart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        triggerToast("Not enough stock available!", "error");
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.product_id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.product_id,
        name: product.product_name,
        price: product.unit_price,
        quantity: 1,
        subtotal: product.unit_price
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const matchedProduct = inventory.find(p => 
        p.product_id.toString() === searchTerm.trim() || 
        p.product_name.toLowerCase() === searchTerm.trim().toLowerCase()
      );

      if (matchedProduct) {
        addToCart(matchedProduct);
        setSearchTerm(''); 
      } else {
        triggerToast("Product not found from scan!", "error");
      }
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // --- CHECKOUT LOGIC ---
  const handleCheckout = async () => {
    if (!selectedClient) { alert("Please select a client first!"); return; }
    if (cart.length === 0) { alert("Cart is empty!"); return; }

    const payload = {
      customer_id: selectedClient,
      total_amount: cartTotal,
      items: cart
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const clientInfo = clients.find(c => c.customer_id.toString() === selectedClient.toString());
        
        setInvoiceData({
          sales_id: data.sales_id,
          date: new Date().toLocaleDateString('en-US'),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          client: clientInfo,
          items: [...cart],
          total: cartTotal
        });

        triggerToast("Sale successful!");
        setCart([]); 
        setSelectedClient(''); 
        fetchInventory(); 
      }
    } catch (error) { console.error("Error during checkout:", error); }
  };

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const filteredInventory = inventory.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_id.toString().includes(searchTerm)
  );

  return (
    <div className="outer-margin-container">
      {toast.show && <div className={`toast-notification ${toast.type}`}>{toast.message}</div>}

      <div className="connected-border-box">
        <aside className="sidebar no-print">
          <div className="logo-section"><img src={logo} alt="Logo" className="sidebar-logo" /></div>
          <nav className="side-nav">
            <div className="nav-item" onClick={() => navigate('/dashboard')}>DASHBOARD</div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>USER ACCESS</div>
            <div className="nav-item active">TRANSACT</div>
            <div className="nav-item" onClick={() => navigate('/generate-report')}>GENERATE REPORT</div>
            <div className="nav-item" onClick={() => navigate('/suppliers')}>SUPPLIERS</div>
            <div className="nav-item" onClick={() => navigate('/clients')}>CLIENTS</div>
          </nav>
          <div className="sidebar-footer">👤</div>
        </aside>

        <main className="dashboard-content no-print" style={{ display: 'flex', gap: '20px' }}>
          
          {/* LEFT SIDE: Products List */}
          <div style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
            <header className="main-header" style={{ marginBottom: '20px' }}>
              <div className="title-area"><h2><span className="icon">🛒</span> Point of Sale</h2></div>
              <div className="admin-info">
                <p className="real-time-date">{currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}</p>
              </div>
            </header>

            <div style={{ marginBottom: '15px' }}>
              <input 
                type="text" 
                placeholder="🔍 Search products or SCAN BARCODE (Press Enter)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleBarcodeScan}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #bdc3c7', fontSize: '16px', fontWeight: 'bold' }}
                autoFocus
              />
            </div>

            <div className="table-container shadow-box" style={{ flex: 1, overflowY: 'auto' }}>
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>ID / Barcode</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map(p => (
                    <tr key={p.product_id}>
                      <td>{p.product_id}</td>
                      <td style={{ fontWeight: 'bold' }}>{p.product_name}</td>
                      <td>₱{p.unit_price}</td>
                      <td style={{ color: p.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>{p.stock}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => addToCart(p)}
                          style={{ background: '#3498db', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: p.stock > 0 ? 'pointer' : 'not-allowed', opacity: p.stock > 0 ? 1 : 0.5 }}
                          disabled={p.stock <= 0}
                        >
                          Add to Cart
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredInventory.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No products found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT SIDE: Cart & Checkout */}
          <div className="shadow-box" style={{ flex: '1', display: 'flex', flexDirection: 'column', background: '#fff', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Current Order</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Client Details:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  value={selectedClient} 
                  onChange={(e) => setSelectedClient(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">-- Choose a Client --</option>
                  {clients.map(c => (
                    <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setShowNewClientModal(true)}
                  style={{ background: '#f39c12', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  + New
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
              {cart.length === 0 ? (
                <p style={{ color: '#7f8c8d', textAlign: 'center', marginTop: '50px' }}>Cart is empty.<br/>Scan an item to begin!</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{item.quantity} x ₱{item.price}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 'bold' }}>₱{item.subtotal}</span>
                      <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '16px' }}>✖</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#2c3e50' }}>
                <span>Total:</span>
                <span>₱{cartTotal.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                style={{ width: '100%', background: cart.length > 0 ? '#27ae60' : '#bdc3c7', color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: cart.length > 0 ? 'pointer' : 'not-allowed' }}
              >
                Complete Checkout
              </button>
            </div>

          </div>
        </main>
      </div>

      {/* --- MODAL: QUICK ADD CLIENT --- */}
      {showNewClientModal && (
        <div className="modal-overlay no-print">
          <div className="add-user-modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header-red">
              <h3>Quick Add Client</h3>
              <button className="close-x" onClick={() => setShowNewClientModal(false)}>✖</button>
            </div>
            <form onSubmit={handleQuickAddClient} className="modal-form">
              <div className="form-group">
                <label>Client Name</label>
                <input type="text" required value={newClientData.name} onChange={(e) => setNewClientData({...newClientData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="text" required value={newClientData.contact} onChange={(e) => setNewClientData({...newClientData, contact: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="text" required value={newClientData.email} onChange={(e) => setNewClientData({...newClientData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" required value={newClientData.address} onChange={(e) => setNewClientData({...newClientData, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Business Type</label>
                <input type="text" required value={newClientData.business_style} onChange={(e) => setNewClientData({...newClientData, business_style: e.target.value})} />
              </div>
              <div className="form-group">
                <label>TIN</label>
                <input type="text" required value={newClientData.tin} onChange={(e) => setNewClientData({...newClientData, tin: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn">Save & Select</button>
                <button type="button" className="cancel-btn" onClick={() => setShowNewClientModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INVOICE PRINT MODAL --- */}
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
                  position: absolute !important; 
                  left: 0 !important; 
                  top: 0 !important; 
                  background: white !important; 
                  padding: 0 !important;
                  display: block !important;
                }
                .add-user-modal { 
                  box-shadow: none !important; 
                  max-width: 100% !important; 
                  width: 100% !important; 
                  margin: 0 !important;
                  border-radius: 0 !important;
                }
                .no-print { display: none !important; }
              }
            `}
          </style>

          {/* FIX: Removed 'no-print' from this wrapper! */}
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="add-user-modal" style={{ maxWidth: '800px', padding: '0', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              
              {/* --- EXACT 1:1 INVOICE DESIGN --- */}
              <div id="printable-invoice" style={{ padding: '40px', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
                
                {/* Header Section */}
                <div style={{ position: 'relative', textAlign: 'center', marginBottom: '20px' }}>
                  
                  {/* Top Right Info */}
                  <div style={{ position: 'absolute', top: 0, right: 0, textAlign: 'right', fontSize: '12px' }}>
                    <div>Invoice</div>
                    <div>Invoice No: {invoiceData.sales_id}</div>
                    <div>Date: {invoiceData.date}</div>
                    <div>Time: {invoiceData.time}</div>
                  </div>

                  <img src={logo} alt="Ergin Hardware" style={{ height: '60px', marginBottom: '10px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>ERGIN HARDWARE AND CONSTRUCTION SUPPLY TRADING</div>
                  <div style={{ fontSize: '12px' }}>Bomba Street, Salvacion, Murcia, Negros Occidental</div>
                  <div style={{ fontSize: '12px' }}>GINA T. PENAFIEL – Prop.</div>
                  <div style={{ fontSize: '12px' }}>NON-VAT REG. TIN 935-125-855-000</div>
                  
                  <h2 style={{ margin: '15px 0 5px 0', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>CHARGE SALES INVOICE</h2>
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
              {/* --- END OF PRINTABLE AREA --- */}

              {/* Action Buttons (These hide when printing due to the "no-print" class!) */}
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
                  Print
                </button>
                <button 
                  onClick={() => alert("Email backend is not configured yet! Let's build that later.")} 
                  style={{ background: '#c0392b', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
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

export default Transact;