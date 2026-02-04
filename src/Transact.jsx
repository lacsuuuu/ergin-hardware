import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';
import InvoiceView from './InvoiceView.jsx';

const Transact = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- 1. STATE MANAGEMENT ---
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  // Customer State
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    terms: '',
    businessStyle: '',
    tin: ''
  });

  // --- 2. HANDLERS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAddToList = () => {
    if (!itemName || !qty || !price) return alert("Please fill all fields");

    const newItem = {
      id: `ERG-${Math.floor(100 + Math.random() * 900)}`,
      name: itemName,
      qty: parseInt(qty),
      price: parseFloat(price),
      unit: 'pcs',
      subtotal: parseInt(qty) * parseFloat(price)
    };

    setItems([...items, newItem]);
    setItemName(''); setQty(''); setPrice('');
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // --- 3. CALCULATIONS ---
  const subTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round(subTotal * 0.08); // Clean 8% calculation
  const totalAmount = subTotal + tax;

  return (
    <div className="outer-margin-container">
      <div className="connected-border-box">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="logo-section">
            <img src={logo} alt="Ergin Hardware" className="sidebar-logo" />
          </div>
          <nav className="side-nav">
            <div className="nav-item" onClick={() => navigate('/dashboard')}>DASHBOARD</div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>USER ACCESS</div>
            <div className="nav-item active" onClick={() => navigate('/transact')}>TRANSACT</div>
            <div className="nav-item" onClick={() => navigate('/generate-report')}>GENERATE REPORT</div>
            <div className="nav-item" onClick={() => navigate('/suppliers')}>SUPPLIERS</div>
            <div className="nav-item" onClick={() => navigate('/clients')}>CLIENTS</div>
          </nav>
          <div className="sidebar-footer">👤</div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area">
              <h2><span className="icon">📄</span> Create Transaction</h2>
            </div>
            <div className="admin-info">
              <p className="real-time-date">
                Date: {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
              </p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" />

          {/* ITEM ENTRY BAR */}
          <div className="entry-bar">
            <input type="text" placeholder="Item Name" className="entry-input large" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            <input type="number" placeholder="Qty" className="entry-input small" value={qty} onChange={(e) => setQty(e.target.value)} />
            <input type="number" placeholder="Price" className="entry-input small" value={price} onChange={(e) => setPrice(e.target.value)} />
            <button className="entry-btn red" onClick={handleAddToList}>Add to list</button>
            <button className="entry-btn dark-red" onClick={() => {setItemName(''); setQty(''); setPrice('');}}>Clear</button>
            <button className="entry-btn red">Use Scanner</button>
          </div>

          <div className="transaction-layout">
            {/* LEFT: TABLE AREA */}
            <div className="items-list-container">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Item Name</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>{item.price}</td>
                      <td>₱{item.subtotal.toLocaleString()}</td>
                      <td><button className="delete-btn-square" onClick={() => removeItem(item.id)}>🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RIGHT: INVOICE SUMMARY SIDEBAR */}
            <div className="invoice-container shadow-box">
              <div className="invoice-header">
                <span>Invoice</span>
                <span className="invoice-number">INV-003163</span>
              </div>
              
              <div className="invoice-fields">
                <input type="text" name="name" placeholder="Customer Name" className="invoice-input" value={customerInfo.name} onChange={handleCustomerChange} />
                <input type="text" name="address" placeholder="Address" className="invoice-input" value={customerInfo.address} onChange={handleCustomerChange} />
                <input type="text" name="terms" placeholder="Terms" className="invoice-input" value={customerInfo.terms} onChange={handleCustomerChange} />
                <input type="text" name="businessStyle" placeholder="Business Style" className="invoice-input" value={customerInfo.businessStyle} onChange={handleCustomerChange} />
                <input type="text" name="tin" placeholder="TIN" className="invoice-input" value={customerInfo.tin} onChange={handleCustomerChange} />
              </div>

              <div className="invoice-summary">
                <div className="summary-row"><span>Subtotal</span> <span>₱{subTotal.toLocaleString()}.00</span></div>
                <div className="summary-row"><span>Additional Charges</span> <span className="charge-box">8%</span></div>
                <div className="summary-row total"><span>Total</span> <span>₱{totalAmount.toLocaleString()}.00</span></div>
              </div>
              <button className="generate-btn" onClick={() => setShowReceipt(true)}>Generate Invoice</button>
            </div>
          </div>
        </main>

        {/* PRINTABLE MODAL */}
        {showReceipt && (
          <InvoiceView 
            items={items} 
            customer={customerInfo} 
            onClose={() => setShowReceipt(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default Transact;