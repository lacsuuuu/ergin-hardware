import React, { useState } from 'react';
import './InvoiceView.css';
import logo from './assets/logotrans.png';

const InvoiceView = ({ items, customer, onClose }) => {
  // --- STATE FOR EMAIL WORKFLOW ---
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [emailData, setEmailData] = useState({
    address: customer.email || '',
    subject: 'Your Invoice from Ergin Hardware',
    message: ''
  });

  const subTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const additionalCharge = subTotal * 0.08; 
  const total = subTotal + additionalCharge;
  
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // --- HANDLERS ---
  const handleSendEmail = (e) => {
    e.preventDefault();
    // Logic to actually send email would go here
    setShowEmailModal(false);
    setShowSuccessAlert(true);
  };

  return (
    <div className="invoice-modal-overlay no-print-bg">
      <div className="invoice-paper">
        <button className="close-x no-print" onClick={onClose}>×</button>

        {/* Header Section */}
        <div className="receipt-header">
          <img src={logo} alt="Ergin Hardware" className="receipt-logo" />
          <h3 className="company-name">ERGIN HARDWARE AND CONSTRUCTION SUPPLY TRADING</h3>
          <p className="address-line">Bomba Street, Salvacion, Murcia, Negros Occidental</p>
          <p className="prop-line">GINA T. PENAFIEL – Prop.</p>
          <p className="tin-line">NON-VAT REG. TIN 935-125-855-000</p>
          <h2 className="invoice-title">CHARGE SALES INVOICE</h2>
        </div>

        {/* Metadata Fields */}
        <div className="receipt-metadata">
          <div className="meta-column-left">
            <p><strong>Charged to:</strong> {customer.name || '________________'}</p>
            <p><strong>Address:</strong> {customer.address || '________________'}</p>
            <p><strong>TIN:</strong> {customer.tin || '________________'}</p>
          </div>
          <div className="meta-column-right">
            <p><strong>Invoice No:</strong> 2463</p>
            <p><strong>Date:</strong> {currentDate}</p>
            <p><strong>Time:</strong> {currentTime}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="receipt-table">
          <thead>
            <tr>
              <th>Qty.</th><th>Unit</th><th>Articles</th><th>U/P</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.qty}</td>
                <td>{item.unit || 'pcs'}</td>
                <td>{item.name}</td>
                <td>{item.price.toLocaleString()}</td>
                <td>₱{item.subtotal.toLocaleString()}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 5 - items.length))].map((_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary and Legal */}
        <div className="receipt-bottom-grid">
          <div className="legal-text">
            <p>Received the above in good condition...</p>
            <p className="valid-claim">THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAXES</p>
          </div>
          
          <div className="totals-box">
            <div className="total-line"><span>SubTotal:</span><span>₱{subTotal.toLocaleString()}.00</span></div>
            <div className="total-line"><span>Additional Charge:</span><span>₱{additionalCharge.toLocaleString()} (8%)</span></div>
            <div className="total-line grand-total"><span>Total:</span><span>₱{total.toLocaleString()}.00</span></div>
          </div>
        </div>

        <div className="signature-section">
          <div className="sig-wrapper"><div className="line"></div><p>CLIENT</p></div>
        </div>

        {/* Footer Actions */}
        <div className="invoice-actions no-print">
          <button className="print-btn" onClick={() => window.print()}>Print Receipt</button>
          <button className="email-btn" onClick={() => setShowEmailModal(true)}>Send Via Email</button>
        </div>
      </div>

      {/* --- EMAIL MODAL --- */}
      {showEmailModal && (
        <div className="modal-overlay alert-overlay no-print">
          <div className="email-modal shadow-box">
            <div className="modal-header-red">
              <h3>Send Invoice Through Email</h3>
              <button className="close-x" onClick={() => setShowEmailModal(false)}>×</button>
            </div>
            <form className="email-form" onSubmit={handleSendEmail}>
              <div className="form-group">
                <label>Client Email Address</label>
                <input 
                  type="email" 
                  value={emailData.address} 
                  onChange={(e) => setEmailData({...emailData, address: e.target.value})}
                  placeholder="client@example.com"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  value={emailData.subject} 
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  rows="4"
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                ></textarea>
              </div>
              <div className="email-footer">
                <button type="button" className="cancel-email-btn" onClick={() => setShowEmailModal(false)}>Cancel</button>
                <button type="submit" className="send-email-btn">Send Email</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SUCCESS ALERT --- */}
      {showSuccessAlert && (
        <div className="modal-overlay alert-overlay no-print">
          <div className="success-alert-box shadow-box">
            <div className="success-alert-header">
              Invoice sent to {emailData.address}
            </div>
            <div className="success-alert-body">
              <button className="ok-btn" onClick={() => setShowSuccessAlert(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceView;