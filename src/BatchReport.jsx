import React from 'react';
import logo from './assets/logotrans.png';

const BatchReport = ({ activeProduct, currentTime, onClose }) => {
  if (!activeProduct) return null;

  return (
    <div className="invoice-modal-overlay no-print-bg">
      <div className="invoice-paper">
        {/* Close Button - Hidden on Print */}
        <button className="close-x no-print" onClick={onClose}>✖</button>
        
        {/* CENTERED HEADER - Following your business style */}
        <div className="receipt-header">
            <img src={logo} alt="Ergin Logo" className="receipt-logo" />
            <h3 className="company-name">ERGIN HARDWARE AND CONSTRUCTION SUPPLY TRADING</h3>
            <p className="company-info">Bomba Street, Salvacion, Murcia, Negros Occidental</p>
            <p className="company-info">GINA T. PENAFIEL - Prop.</p>
            <p className="company-info-small">NON-VAT REG. TIN: 933-133-858-000</p>
            
            <div className="invoice-title">
              <h2 className="document-main-title">PRODUCT BATCH RECORD</h2>
            </div>
        </div>

        {/* METADATA GRID */}
        <div className="receipt-metadata">
            <div className="meta-left">
                <p><strong>Item Name:</strong> {activeProduct.name}</p>
                <p><strong>Item ID:</strong> {activeProduct.id}</p>
                <p><strong>Category:</strong> {activeProduct.category}</p>
            </div>
            <div className="meta-right" style={{ textAlign: 'right' }}>
                <p><strong>Date Generated:</strong> {currentTime.toLocaleDateString()}</p>
                <p><strong>Current Total Stock:</strong> {activeProduct.qty} {activeProduct.unit}</p>
                <p><strong>Retail Price:</strong> ₱{activeProduct.retail.toLocaleString()}</p>
            </div>
        </div>

        {/* DATA TABLE */}
        <table className="receipt-table">
            <thead>
                <tr>
                    <th width="10%">Qty.</th>
                    <th width="10%">Unit</th>
                    <th width="50%">Batch Details / Supplier Source</th>
                    <th width="30%" style={{ textAlign: 'right' }}>Total Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{activeProduct.qty}</td>
                    <td>{activeProduct.unit}</td>
                    <td>Initial Inventory Stock</td>
                    <td style={{ textAlign: 'right' }}>₱{(activeProduct.qty * activeProduct.retail).toLocaleString()}</td>
                </tr>
                {/* Visual Filler Rows */}
                <tr className="empty-row"><td></td><td></td><td></td><td></td></tr>
            </tbody>
        </table>

        {/* TOTAL ASSET BOX */}
        <div className="receipt-bottom-grid">
            <div className="legal-text">
                <p>This document is an internal record for Ergin Hardware inventory tracking.</p>
                <p className="valid-claim">INTERNAL USE ONLY</p>
            </div>
            <div className="totals-box">
                <div className="total-line grand-total">
                    <span>Current Asset Value:</span>
                    <span>₱{(activeProduct.qty * activeProduct.retail).toLocaleString()}</span>
                </div>
            </div>
        </div>

        {/* SIGNATURE SECTION - From your Inspo */}
        <div className="signature-section">
            <div className="sig-wrapper">
                <div className="line"></div>
                <p>Inventory Manager</p>
                <p>(Please sign over printed name)</p>
            </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="invoice-actions no-print">
            <button onClick={() => window.print()} className="print-btn">Print Batch Report</button>
            <button onClick={onClose} className="email-btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default BatchReport;