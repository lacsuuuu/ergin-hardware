import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const GenerateReport = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Report State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please select both a start and end date.");
      return;
    }
    if (startDate > endDate) {
      alert("Start Date cannot be after End Date!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/reports/sales?start_date=${startDate}&end_date=${endDate}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        alert("Failed to generate report.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="outer-margin-container">
      
      {/* CSS to make ONLY the report print perfectly */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .connected-border-box { border: none !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; }
            .dashboard-content { margin: 0 !important; padding: 0 !important; }
            @page { margin: 1cm; }
            body { background: white; margin: 0; }
          }
        `}
      </style>

      <div className="connected-border-box">
        
        {/* Sidebar */}
        <aside className="sidebar no-print">
          <div className="logo-section"><img src={logo} alt="Logo" className="sidebar-logo" /></div>
          <nav className="side-nav">
            <div className="nav-item" onClick={() => navigate('/dashboard')}>DASHBOARD</div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>USER ACCESS</div>
            <div className="nav-item" onClick={() => navigate('/transact')}>TRANSACT</div>
            <div className="nav-item active">GENERATE REPORT</div>
            <div className="nav-item" onClick={() => navigate('/suppliers')}>SUPPLIERS</div>
            <div className="nav-item" onClick={() => navigate('/clients')}>CLIENTS</div>
          </nav>
          <div className="sidebar-footer">👤</div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content" style={{ display: 'flex', flexDirection: 'column' }}>
          
          <header className="main-header no-print">
            <div className="title-area"><h2><span className="icon">📈</span> Generate Reports</h2></div>
            <div className="admin-info">
              <p className="real-time-date">{currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}</p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider no-print" />

          {/* Filter Controls */}
          <div className="shadow-box no-print" style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Sales Summary Report Filters</h3>
            <form onSubmit={handleGenerateReport} style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '4px' }} 
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '4px' }} 
                  required
                />
              </div>
              <button 
                type="submit" 
                style={{ background: '#27ae60', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '42px' }}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>

          {/* Generated Report Area */}
          {reportData && (
            <div id="printable-report" style={{ background: '#fff', padding: '40px', borderRadius: '8px', border: '1px solid #eee', flex: 1 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2c3e50', paddingBottom: '20px', marginBottom: '20px' }}>
                <div>
                  <img src={logo} alt="Ergin Hardware" style={{ height: '50px', marginBottom: '10px' }} />
                  <h2 style={{ margin: '0', color: '#2c3e50' }}>SALES SUMMARY REPORT</h2>
                  <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>ERGIN HARDWARE AND CONSTRUCTION SUPPLY</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="no-print" style={{ marginBottom: '15px' }}>
                    <button onClick={() => window.print()} style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      🖨️ Print Report
                    </button>
                  </div>
                  <strong>Period:</strong> {reportData.start_date} to {reportData.end_date}<br/>
                  <strong>Generated On:</strong> {currentTime.toLocaleDateString()}<br/>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', flex: 1, borderLeft: '4px solid #3498db' }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 'bold' }}>TOTAL TRANSACTIONS</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>{reportData.total_transactions}</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', flex: 1, borderLeft: '4px solid #27ae60' }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 'bold' }}>TOTAL REVENUE</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>₱ {reportData.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f1f2f6', color: '#2c3e50' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Invoice #</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #bdc3c7' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.sales_data.map((sale) => (
                    <tr key={sale.sales_id}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{sale.date}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>INV-{sale.sales_id}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                        ₱ {sale.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))}
                  {reportData.sales_data.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d', fontStyle: 'italic' }}>
                        No sales found for the selected date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ marginTop: '50px', textAlign: 'center', color: '#95a5a6', fontSize: '12px' }}>
                *** End of Report ***
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default GenerateReport;