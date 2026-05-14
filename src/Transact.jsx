import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import './index.css';
import Sidebar from './Sidebar';
import logo from './assets/logotrans.png';

// Sidebar nav icons
import transactIcon from './assets/transact_pos header.png';
import searchIcon from './assets/supplier_search button.png';
import Logout from './Logout';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' 
  : 'https://ergin-hardware.onrender.com';

const ROWS_PER_PAGE = 8; 
  
const Transact = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- DATA STATE ---
  const [inventory, setInventory] = useState([]);
  const [clients, setClients] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // --- CART & SEARCH STATE ---
  const [selectedClient, setSelectedClient] = useState('');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); 

  // --- MODAL STATES ---
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', address: '', contact: '', email: '', business_style: '', tin: '' });
  
  const [invoiceData, setInvoiceData] = useState(null); 

  // --- CHECKOUT MODAL STATES ---
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false); // NEW: Loading state for checkout

  // --- BARCODE SCANNER STATE ---
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanStatus, setScanStatus] = useState(null); 
  const barcodeRef = React.useRef(null);

  // --- CAMERA SCANNER STATE ---
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = React.useRef(null);
  const cameraReaderRef = React.useRef(null);

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
      const response = await fetch(`${API_URL}/api/inventory`);
      const data = await response.json();
      setInventory(data);
    } catch (error) { console.error("Error fetching inventory:", error); }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clients`);
      const data = await response.json();
      setClients(data);
    } catch (error) { console.error("Error fetching clients:", error); }
  };

  // --- QUICK ADD CLIENT LOGIC ---
  const handleQuickAddClient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/clients`, {
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
        setNewClientData({ name: '', address: '', contact: '', email: '', business_style: '', tin: '' });
      }
    } catch (error) { console.error("Error quick-adding client:", error); }
  };

  // --- CART LOGIC ---
  const addToCart = (product) => {
    if (product.stock <= 0) {
      triggerToast("Out of stock!", "error");
      return;
    }

    const productPrice = Number(product.selling_price || 0);
    const existingItem = cart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        triggerToast("Not enough stock available!", "error");
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.product_id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * productPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.product_id,
        name: product.product_name,
        price: productPrice,
        quantity: 1,
        subtotal: productPrice
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const handleCartAdd = (productId) => {
    const product = inventory.find(p => p.product_id === productId);
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + 1;
        if (product && newQty > product.stock) {
          triggerToast("Not enough stock available!", "error");
          return item;
        }
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }));
  };

  const handleCartMinus = (productId) => {
    setCart(cart.map(item => {
      if (item.product_id === productId && item.quantity > 1) {
        const newQty = item.quantity - 1;
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }));
  };

  const handleCartCustomQty = (productId, value) => {
    const product = inventory.find(p => p.product_id === productId);
    let newQty = parseInt(value);

    if (isNaN(newQty) || newQty < 1) newQty = 1;

    setCart(cart.map(item => {
      if (item.product_id === productId) {
        if (product && newQty > product.stock) {
          triggerToast(`Only ${product.stock} available!`, "error");
          newQty = product.stock; 
        }
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }));
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

  // --- CAMERA SCANNER FUNCTIONS ---
  const openCameraScanner = async () => {
    setCameraError('');
    setShowCamera(true);
    setTimeout(() => startCameraRead(), 300);
  };

  const startCameraRead = async () => {
    try {
      if (!videoRef.current) return;

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.QR_CODE,
      ]);

      const reader = new BrowserMultiFormatReader(hints);
      cameraReaderRef.current = reader;

      await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          const scanned = result.getText();
          closeCameraScanner();

          const matchedProduct = inventory.find(p =>
            p.product_id.toString() === scanned ||
            p.product_name.toLowerCase() === scanned.toLowerCase()
          );

          if (matchedProduct) {
            addToCart(matchedProduct);
            setScanStatus('success');
            triggerToast(`✔ Added: ${matchedProduct.product_name}`, 'success');
            setTimeout(() => setScanStatus(null), 600);
          } else {
            setScanStatus('error');
            triggerToast(`✘ No product found for: "${scanned}"`, 'error');
            setTimeout(() => setScanStatus(null), 600);
          }
        }
      });
    } catch (err) {
      if (err?.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser.');
      } else {
        setCameraError('Could not start camera: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const closeCameraScanner = () => {
    try { cameraReaderRef.current?.reset(); } catch (_) {}
    cameraReaderRef.current = null;
    setShowCamera(false);
    setCameraError('');
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };
  
  const handleDedicatedScan = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const scanned = barcodeInput.trim();
      if (!scanned) return;

      const matchedProduct = inventory.find(p =>
        p.product_id.toString() === scanned ||
        p.product_name.toLowerCase() === scanned.toLowerCase()
      );

      if (matchedProduct) {
        addToCart(matchedProduct);
        setScanStatus('success');
        triggerToast(`✔ Added: ${matchedProduct.product_name}`, 'success');
      } else {
        setScanStatus('error');
        triggerToast(`✘ No product found for: "${scanned}"`, 'error');
      }

      setBarcodeInput('');
      setTimeout(() => setScanStatus(null), 600);
      setTimeout(() => barcodeRef.current?.focus(), 50);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // --- CHECKOUT LOGIC ---
  const handleCheckoutClick = () => {
    if (!selectedClient) { alert("Please select a client first!"); return; }
    if (cart.length === 0) { alert("Cart is empty!"); return; }
    setShowCheckoutConfirm(true);
  };

  const handleCheckout = async () => {
    setIsProcessingCheckout(true); // NEW: Start loading indicator

    const payload = {
      customer_id: selectedClient,
      total_amount: cartTotal,
      items: cart
    };

    try {
      const response = await fetch(`${API_URL}/api/sales`, {
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
        setShowCheckoutConfirm(false); // NEW: Close confirmation modal only AFTER success
      } else {
        alert("Failed to process checkout. Please try again.");
        setShowCheckoutConfirm(false);
      }
    } catch (error) { 
      console.error("Error during checkout:", error); 
      alert("Network error during checkout.");
      setShowCheckoutConfirm(false);
    } finally {
      setIsProcessingCheckout(false); // NEW: Stop loading indicator
    }
  };

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredInventory = inventory.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_id.toString().includes(searchTerm)
  );

  const totalInventoryPages = Math.ceil(filteredInventory.length / ROWS_PER_PAGE);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };
  const handleSendEmail = async () => {
    
  const clientInfo = invoiceData.client;

  if (!clientInfo?.email) {
    alert("This client has no email address on file. Please update their profile in the Clients section.");
    return;
  }

  const emailBody = {
    to: clientInfo.email,
    subject: `Invoice #${invoiceData.sales_id} - Ergin Hardware`,
    sales_id: invoiceData.sales_id,
    date: invoiceData.date,
    client_name: clientInfo.name,
    client_address: clientInfo.address || '',
    client_business_style: clientInfo.business_style || '',
    client_tin: clientInfo.tin || '',
    items: invoiceData.items,
    total: invoiceData.total
  };

  try {
    const response = await fetch(`${API_URL}/api/send-invoice-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailBody)
    });

    if (response.ok) {
      triggerToast(`Invoice sent to ${clientInfo.email}!`, 'success');
    } else {
      const err = await response.json();
      alert(`Failed to send email: ${err.error || 'Unknown error'}`);
    }
  } catch (error) {
    alert("Network error while sending email.");
    console.error("Email error:", error);
  }
};


  return (
    <div className="outer-margin-container">
      {toast.show && <div className={`toast-notification ${toast.type}`}>{toast.message}</div>}

      <div className="connected-border-box">
        <Sidebar />

        <main className="dashboard-content no-print" style={{ display: 'flex', gap: '20px' }}>
          
          {/* LEFT SIDE: Products List */}
          <div style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
            <header className="main-header" style={{ marginBottom: '20px' }}>
              <div className="title-area" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={transactIcon} alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                <h2>Point of Sale</h2>
              </div>
              <div className="admin-info">
                <p className="real-time-date">{currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}</p>
              </div>
            </header>

            {/* BARCODE SCANNER INPUT */}
            <div style={{
              marginBottom: '12px',
              background: scanStatus === 'success' ? '#e8f5e9' : scanStatus === 'error' ? '#ffebee' : '#1a1a2e',
              borderRadius: '8px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'background 0.2s ease',
              border: `2px solid ${scanStatus === 'success' ? '#27ae60' : scanStatus === 'error' ? '#e74c3c' : '#d32f2f'}`
            }}>
              {/* Scanner icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={scanStatus === 'success' ? '#27ae60' : scanStatus === 'error' ? '#e74c3c' : '#ffffff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: 'stroke 0.2s' }}>
                <line x1="3" y1="5" x2="3" y2="19" />
                <line x1="7" y1="5" x2="7" y2="19" />
                <line x1="11" y1="5" x2="11" y2="19" />
                <line x1="15" y1="5" x2="15" y2="19" />
                <line x1="18" y1="5" x2="18" y2="19" />
                <line x1="21" y1="5" x2="21" y2="19" />
                <line x1="1" y1="7" x2="23" y2="7" strokeWidth="1" stroke={scanStatus ? undefined : '#d32f2f'} />
                <line x1="1" y1="17" x2="23" y2="17" strokeWidth="1" stroke={scanStatus ? undefined : '#d32f2f'} />
              </svg>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', color: scanStatus ? '#555' : '#aaa', marginBottom: '3px' }}>
                  BARCODE SCANNER
                </div>
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleDedicatedScan}
                  placeholder="Scan barcode or type ID then press Enter..."
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: scanStatus === 'success' ? '#27ae60' : scanStatus === 'error' ? '#e74c3c' : '#ffffff',
                    letterSpacing: '1px',
                    caretColor: '#d32f2f'
                  }}
                />
              </div>

              {/* Status indicator */}
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                background: scanStatus === 'success' ? '#27ae60' : scanStatus === 'error' ? '#e74c3c' : '#d32f2f',
                boxShadow: scanStatus ? 'none' : '0 0 6px #d32f2f',
                transition: 'background 0.2s'
              }} />

              {/* Camera button */}
              <button
                onClick={openCameraScanner}
                title="Open camera scanner"
                style={{
                  background: '#d32f2f', border: 'none', borderRadius: '6px',
                  padding: '6px 10px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '5px', color: 'white',
                  fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                CAM
              </button>
            </div>

            {/* SEARCH BAR */}
            <div style={{ marginBottom: '15px', position: 'relative' }}>
              <img 
                src={searchIcon} 
                alt="Search" 
                style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  width: '20px', height: '20px', pointerEvents: 'none'
                }} 
              />
              <input 
                type="text" 
                placeholder="Search products or scan barcode..." 
                value={searchTerm}
                onChange={handleSearchChange} 
                onKeyDown={handleBarcodeScan}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '4px', border: '1px solid #d32f2f', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                autoFocus
              />
            </div>

            <div className="table-container shadow-box" style={{ flex: 1, overflowY: 'auto' }}>
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th style={{ width: '7%', fontWeight: 'bold', color: '#333' }}>ID / Barcode</th>
                    <th style={{ width: '10%', fontWeight: 'bold', color: '#333' }}>Product</th>
                    <th style={{ width: '5%', fontWeight: 'bold', color: '#333' }}>Price</th>
                    <th style={{ width: '10%', textAlign: 'center', fontWeight: 'bold', color: '#333' }}>Stock</th>
                    <th style={{ width: '10%', textAlign: 'center', fontWeight: 'bold', color: '#333' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInventory.map(p => (
                    <tr key={p.product_id}>
                      <td style={{ textAlign: 'center' }}>{p.product_id}</td>
                      <td style={{ fontWeight: 'bold' }}>{p.product_name}</td>
                      <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        ₱{Number(p.selling_price || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td style={{ textAlign: 'center', color: p.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>{p.stock}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => addToCart(p)}
                          style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: p.stock > 0 ? 'pointer' : 'not-allowed', opacity: p.stock > 0 ? 1 : 0.5 }}
                          disabled={p.stock <= 0}
                        >
                          Add to Cart
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedInventory.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No products found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Uniform Pagination */}
            {totalInventoryPages > 1 && (
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

                {Array.from({ length: totalInventoryPages }, (_, i) => i + 1).map(page => (
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
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalInventoryPages))}
                  disabled={currentPage === totalInventoryPages}
                  style={{
                    background: currentPage === totalInventoryPages ? '#eee' : '#d10000',
                    color: currentPage === totalInventoryPages ? '#aaa' : 'white',
                    border: 'none', borderRadius: '4px', padding: '6px 12px',
                    cursor: currentPage === totalInventoryPages ? 'default' : 'pointer', fontWeight: 'bold'
                  }}>
                  Next →
                </button>

                <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                  Page {currentPage} of {totalInventoryPages} ({filteredInventory.length} records)
                </span>
              </div>
            )}

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
                  style={{ background: '#ac372f', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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
                      <div style={{ fontWeight: 'bold', color: '#000' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        ₱{Number(item.price).toLocaleString(undefined, {minimumFractionDigits: 2})} each
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f1f2f6', border: '1px solid #bdc3c7', borderRadius: '4px', overflow: 'hidden' }}>
                        <button onClick={() => handleCartMinus(item.product_id)} style={{ padding: '4px 10px', background: '#e0e0e0', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>-</button>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleCartCustomQty(item.product_id, e.target.value)}
                          style={{ width: '40px', textAlign: 'center', border: 'none', padding: '4px 0', outline: 'none', background: 'white', fontWeight: 'bold' }}
                          min="1"
                        />
                        <button onClick={() => handleCartAdd(item.product_id)} style={{ padding: '4px 10px', background: '#e0e0e0', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>+</button>
                      </div>
                      
                      <span style={{ fontWeight: 'bold', minWidth: '70px', textAlign: 'right', color: '#000' }}>
                        ₱{item.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                      
                      <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px', padding: '0' }}>✖</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
                <span>Total:</span>
                <span>₱{cartTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              
              <button 
                onClick={handleCheckoutClick}
                disabled={cart.length === 0}
                style={{ width: '100%', background: cart.length > 0 ? '#ac372f' : '#bdc3c7', color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: cart.length > 0 ? 'pointer' : 'not-allowed' }}
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
              <button 
                style={{ background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                className="close-x" 
                onClick={() => setShowNewClientModal(false)}>
                ✖
              </button>
            </div>
            <form onSubmit={handleQuickAddClient} className="modal-form">
              <div className="form-group">
                <label>Client Name</label>
                <input type="text" required value={newClientData.name} onChange={(e) => setNewClientData({...newClientData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="text" value={newClientData.contact} onChange={(e) => setNewClientData({...newClientData, contact: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="text" value={newClientData.email} onChange={(e) => setNewClientData({...newClientData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" value={newClientData.address} onChange={(e) => setNewClientData({...newClientData, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Business Type</label>
                <input type="text" value={newClientData.business_style} onChange={(e) => setNewClientData({...newClientData, business_style: e.target.value})} />
              </div>
              <div className="form-group">
                <label>TIN</label>
                <input type="text" value={newClientData.tin} onChange={(e) => setNewClientData({...newClientData, tin: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn">Save & Select</button>
                <button type="button" className="cancel-btn" onClick={() => setShowNewClientModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CHECKOUT CONFIRMATION (Step 1) --- */}
      {showCheckoutConfirm && (
        <div className="modal-overlay no-print" style={{ zIndex: 9998 }}>
          <div className="add-user-modal" style={{ maxWidth: '380px', padding: '0', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="modal-header-red">
              <h3>Confirm Checkout</h3>
            </div>
            <div style={{ padding: '24px', background: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
              <p style={{ fontSize: '15px', color: '#2c3e50', marginBottom: '6px' }}>
                You are about to complete this order.
              </p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ac372f', marginBottom: '20px' }}>
                Total: ₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '24px' }}>
                Do you want to proceed with the checkout?
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowCheckoutConfirm(false)}
                  disabled={isProcessingCheckout}
                  style={{ padding: '10px 28px', borderRadius: '4px', border: '1px solid #ccc', background: '#f1f2f6', color: '#555', cursor: isProcessingCheckout ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', opacity: isProcessingCheckout ? 0.7 : 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessingCheckout}
                  style={{ padding: '10px 28px', borderRadius: '4px', border: 'none', background: '#ac372f', color: 'white', cursor: isProcessingCheckout ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', opacity: isProcessingCheckout ? 0.7 : 1 }}
                >
                  {isProcessingCheckout ? 'Processing...' : 'Yes, Proceed'}
                </button>
              </div>
            </div>
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

          <div 
            className="modal-overlay" 
            style={{ zIndex: 9999 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setInvoiceData(null);
            }}
          >
            <div className="add-user-modal" style={{ maxWidth: '800px', padding: '0', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              
              <div id="printable-invoice" style={{ padding: '40px', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
                
                <div style={{ position: 'relative', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, textAlign: 'right', fontSize: '11px' }}>
                    <div>Invoice</div>
                    <div>Invoice No: {invoiceData.sales_id}</div>
                    <div>Date: {invoiceData.date}</div>
                  </div>

                  <img src={logo} alt="Ergin Hardware" style={{ height: '50px', marginBottom: '5px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>ERGIN HARDWARE AND CONSTRUCTION SUPPLY TRADING</div>
                  <div style={{ fontSize: '11px' }}>Bomba Street, Salvacion, Murcia, Negros Occidental</div>
                  <div style={{ fontSize: '11px' }}>GINA T. PENAFIEL – Prop.</div>
                  
                  <h2 style={{ margin: '15px 0 15px 0', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>CHARGE SALES INVOICE</h2>
                </div>

                <div style={{ fontSize: '12px', lineHeight: '1.8', marginBottom: '20px' }}>
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

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '12px' }}>
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
                        <td style={{ padding: '8px 0', textAlign: 'center' }}>₱{Number(item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right' }}>₱{Number(item.subtotal).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12px', marginBottom: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                  <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span>SubTotal:</span>
                      <span>₱ {invoiceData.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span>Additional Charge:</span>
                      <span>₱ 0.00 (0%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ccc', paddingTop: '5px' }}>
                      <span>Total:</span>
                      <span>₱ {invoiceData.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  <p style={{ textDecoration: 'underline', color: '#0056b3', marginBottom: '30px' }}>
                    Received the above in good condition. Parties expressly submit themselves to the jurisdiction of the Courts of Bacolod City, any legal action arising out of this transaction and to pay 25% attorney's fees fine of suit. Interest of 2% per month will be charged on overdue accounts.
                  </p>
                  
                  <div style={{ textAlign: 'center', width: '250px', margin: '0 auto' }}>
                    <div style={{ borderBottom: '1px solid black', height: '20px', marginBottom: '5px' }}></div>
                    <div>CLIENT</div>
                    <div>(Please sign over printed name)</div>
                  </div>
                </div>
              </div>

              <div className="modal-footer no-print" style={{ background: '#f9f9f9', padding: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ background: '#f1f2f6', color: '#2c3e50', padding: '10px 20px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Print
                </button>
                <button 
                  onClick={handleSendEmail} 
                  style={{ background: '#c0392b', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Send Via Email
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* --- CAMERA SCANNER MODAL --- */}
      {showCamera && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          flexDirection: 'column', gap: '16px'
        }}>
          <div style={{
            background: '#1a1a2e', borderRadius: '12px', overflow: 'hidden',
            width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            border: '2px solid #d32f2f'
          }}>
            {/* Header */}
            <div style={{
              background: '#d32f2f', padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                CAMERA BARCODE SCANNER
              </div>
              <button onClick={closeCameraScanner} style={{
                background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7',
                borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                fontWeight: 'bold', padding: '4px 8px'
              }}>✖</button>
            </div>

            {/* Video feed */}
            <div style={{ position: 'relative', background: '#000' }}>
              <video
                ref={videoRef}
                style={{ width: '100%', display: 'block', maxHeight: '320px', objectFit: 'cover' }}
                autoPlay
                muted
                playsInline
              />
              {/* Scan line overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{
                  width: '75%', height: '2px',
                  background: 'rgba(211, 47, 47, 0.8)',
                  boxShadow: '0 0 8px #d32f2f',
                  animation: 'scanline 2s ease-in-out infinite'
                }} />
              </div>
              {/* Corner brackets */}
              {[
                { top: '15%', left: '10%', borderTop: '3px solid #d32f2f', borderLeft: '3px solid #d32f2f' },
                { top: '15%', right: '10%', borderTop: '3px solid #d32f2f', borderRight: '3px solid #d32f2f' },
                { bottom: '15%', left: '10%', borderBottom: '3px solid #d32f2f', borderLeft: '3px solid #d32f2f' },
                { bottom: '15%', right: '10%', borderBottom: '3px solid #d32f2f', borderRight: '3px solid #d32f2f' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: '20px', height: '20px', ...s }} />
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 16px', textAlign: 'center' }}>
              {cameraError ? (
                <p style={{ color: '#e74c3c', fontSize: '13px', margin: 0 }}>{cameraError}</p>
              ) : (
                <p style={{ color: '#aaa', fontSize: '12px', margin: 0 }}>
                  Point your camera at a barcode. It will scan automatically.
                </p>
              )}
            </div>
          </div>

          <style>{`
            @keyframes scanline {
              0%, 100% { transform: translateY(-60px); opacity: 0.4; }
              50% { transform: translateY(60px); opacity: 1; }
            }
          `}</style>
        </div>
      )}

    </div>
  );
};

export default Transact;