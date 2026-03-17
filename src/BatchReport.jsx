import React, { useState, useEffect } from 'react';
import logo from './assets/logotrans.png';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' 
  : 'https://ergin-hardware.onrender.com';

const BatchReport = ({ activeProduct, currentTime, onClose }) => {
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the batches from the database when the component opens
  useEffect(() => {
    if (activeProduct) {
      fetchBatches();
    }
  }, [activeProduct]);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/batches/${activeProduct.id}`);
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      } else {
        console.error("Failed to fetch batches");
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeProduct) return null;

  return (
    <>
      <style>
        {`
          .invoice-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(3px); }
          .invoice-paper { background: white; width: 800px; max-height: 90vh; overflow-y: auto; padding: 40px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); position: relative; color: #333; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .close-x { position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #7f8c8d; }
          .close-x:hover { color: #e74c3c; }
          .receipt-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2c3e50; padding-bottom: 20px; }
          .receipt-logo { height: 80px; object-fit: contain; margin-bottom: 10px; }
          .company-name { margin: 0 0 5px 0; font-size: 22px; color: #2c3e50; font-weight: 800; }
          .company-info { margin: 2px 0; font-size: 14px; color: #555; }
          .company-info-small { margin: 2px 0; font-size: 12px; color: #7f8c8d; }
          .document-main-title { margin: 20px 0 0 0; font-size: 24px; letter-spacing: 2px; color: #000; font-weight: bold; }
          .receipt-metadata { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
          .receipt-metadata p { margin: 5px 0; }
          .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
          .receipt-table th { background: #f1f2f6; padding: 12px; text-align: left; border-bottom: 2px solid #bdc3c7; color: #2c3e50; }
          .receipt-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .receipt-bottom-grid { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .legal-text { font-size: 12px; color: #7f8c8d; }
          .valid-claim { font-weight: bold; color: #e74c3c; letter-spacing: 1px; margin-top: 5px; }
          .totals-box { background: #f8f9fa; padding: 15px 25px; border-radius: 6px; border-left: 4px solid #d32f2f; }
          .grand-total { font-size: 18px; font-weight: bold; color: #2c3e50; display: flex; gap: 20px; }
          .signature-section { margin-top: 40px; display: flex; justify-content: flex-end; text-align: center; }
          .sig-wrapper .line { width: 200px; border-bottom: 1px solid #333; margin-bottom: 5px; }
          .sig-wrapper p { margin: 2px 0; font-size: 14px; color: #555; }
          .invoice-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
          .print-btn { background: #ac372f; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px; }
          .print-btn:hover { background: #d32f2f; }
          .email-btn { background: #ecf0f1; color: #333; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px; }
          .email-btn:hover { background: #bdc3c7; }
          @media print { .no-print { display: none !important; } .invoice-modal-overlay { position: static; background: white; display: block; } .invoice-paper { width: 100%; box-shadow: none; padding: 0; max-height: none; overflow: visible; } body { margin: 0; padding: 0; background: white; } @page { margin: 1cm; } }
        `}
      </style>

      <div className="invoice-modal-overlay no-print-bg">
        <div className="invoice-paper">
          <button className="close-x no-print" onClick={onClose}>✖</button>
          
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

          <div className="receipt-metadata">
              <div className="meta-left">
                  <p><strong>Item Name:</strong> {activeProduct.name}</p>
                  <p><strong>Item ID:</strong> {activeProduct.id}</p>
                  <p><strong>Category:</strong> {activeProduct.category}</p>
              </div>
              <div className="meta-right" style={{ textAlign: 'right' }}>
                  <p><strong>Date Generated:</strong> {currentTime.toLocaleDateString()}</p>
                  <p><strong>Current Total Stock:</strong> {activeProduct.qty} {activeProduct.unit}</p>
                  <p><strong>Retail Price (Cost):</strong> ₱{Number(activeProduct.retail || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
          </div>

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
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                        Loading batch history...
                      </td>
                    </tr>
                  ) : batches.length > 0 ? (
                    batches.map((batch) => (
                      <tr key={batch.batch_id}>
                          <td>{batch.qty_received}</td>
                          <td>{activeProduct.unit}</td>
                          <td>
                            <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>Supplier: {batch.supplier_name}</div>
                            <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                              Received: {new Date(batch.date_received).toLocaleDateString()} &nbsp;|&nbsp; 
                              <span style={{ color: batch.qty_remaining > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                                Remaining: {batch.qty_remaining}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            ₱{(batch.qty_received * Number(activeProduct.retail || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d', fontStyle: 'italic' }}>
                        No delivery batches recorded for this product yet.
                      </td>
                    </tr>
                  )}
              </tbody>
          </table>

          <div className="receipt-bottom-grid">
              <div className="legal-text">
                  <p>This document is an internal record for Ergin Hardware inventory tracking.</p>
                  <p className="valid-claim">INTERNAL USE ONLY</p>
              </div>
              <div className="totals-box">
                  <div className="total-line grand-total">
                      <span>Current Asset Value:</span>
                      <span>₱{(Number(activeProduct.qty || 0) * Number(activeProduct.retail || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
              </div>
          </div>
          
          <div className="signature-section">
              <div className="sig-wrapper">
                  <div className="line"></div>
                  <p>Inventory Manager</p>
                  <p>(Please sign over printed name)</p>
              </div>
          </div>

          <div className="invoice-actions no-print">
              <button onClick={() => window.print()} className="print-btn">Print Batch Report</button>
              <button onClick={onClose} className="email-btn">Close</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BatchReport;