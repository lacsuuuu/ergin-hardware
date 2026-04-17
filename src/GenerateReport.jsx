import React, { useState, useEffect } from 'react';
import './index.css';
import logo from './assets/logotrans.png';
import TopHeader from './TopHeader';
import Logout from './Logout';
import Sidebar from './Sidebar';

// Sidebar nav icons
//import dashboardIcon from './assets/dashboard_header icon.png';
//import inventoryIcon from './assets/inventory_header icon.png';
//import salesRecordIcon from './assets/salesrecord_header icon.png';
//import userAccessIcon from './assets/useracess_header icon.png';
//import transactIcon from './assets/transact_pos header.png';
import generateReportIcon from './assets/generate report_ header icon.png';
//import supplierIcon from './assets/supplier_header icon.png';
//import clientIcon from './assets/client_header icon.png';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' 
  : 'https://ergin-hardware.onrender.com';

const GenerateReport = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Report State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuick, setActiveQuick] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- QUICK DATE HELPERS ---
  const toDateStr = (d) => d.toISOString().split('T')[0];

  const applyQuickRange = (label) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start, end;

    if (label === 'Last 7 Days') {
      end = new Date(today);
      start = new Date(today);
      start.setDate(start.getDate() - 6);
    } else if (label === 'Last 30 Days') {
      end = new Date(today);
      start = new Date(today);
      start.setDate(start.getDate() - 29);
    } else if (label === 'This Month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today);
    } else if (label === 'Last Month') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (label === 'This Year') {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today);
    }

    setStartDate(toDateStr(start));
    setEndDate(toDateStr(end));
    setActiveQuick(label);
  };

  const quickButtons = ['Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'This Year'];

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
      const response = await fetch(`${API_URL}/api/reports/sales?start_date=${startDate}&end_date=${endDate}`);
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

  // --- BAR CHART COMPONENT ---
  const BarChart = ({ salesData }) => {
    if (!salesData || salesData.length === 0) return null;

    // Group by date
    const grouped = {};
    salesData.forEach(sale => {
      if (!grouped[sale.date]) grouped[sale.date] = 0;
      grouped[sale.date] += sale.total_amount;
    });

    const labels = Object.keys(grouped).sort();
    const values = labels.map(d => grouped[d]);
    const maxVal = Math.max(...values);

    const chartWidth = 780;
    const chartHeight = 320;
    const padLeft = 90;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 60;
    const barAreaWidth = chartWidth - padLeft - padRight;
    const barAreaHeight = chartHeight - padTop - padBottom;

    const barCount = labels.length;
    const barGroupWidth = barAreaWidth / barCount;
    const barWidth = Math.min(barGroupWidth * 0.55, 55);

    // Y-axis ticks
    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => (maxVal / tickCount) * i);

    const getX = (i) => padLeft + i * barGroupWidth + barGroupWidth / 2 - barWidth / 2;
    const getBarHeight = (val) => (val / maxVal) * barAreaHeight;
    const getY = (val) => padTop + barAreaHeight - getBarHeight(val);

    const formatAmt = (v) => v >= 1000 ? `₱${(v/1000).toFixed(1)}k` : `₱${v}`;
    const shortDate = (d) => {
      const parts = d.split('-');
      return `${parts[1]}/${parts[2]}`;
    };

    return (
      <div style={{ marginTop: '30px', background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px 20px 10px 20px' }}>
        <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '18px', fontWeight: 'bold' }}>
          Sales Revenue by Date
        </h3>
        <p style={{ margin: '0 0 16px 0', color: '#7f8c8d', fontSize: '14px' }}>
          Bar chart of total revenue per transaction date
        </p>
        <div style={{ overflowX: 'auto' }}>
          <svg
            width={Math.max(chartWidth, barCount * 60 + padLeft + padRight)}
            height={chartHeight}
            style={{ display: 'block' }}
          >
            {/* Y-axis gridlines & labels */}
            {yTicks.map((tick, i) => {
              const y = padTop + barAreaHeight - (tick / maxVal) * barAreaHeight;
              return (
                <g key={i}>
                  <line
                    x1={padLeft} y1={y}
                    x2={chartWidth - padRight} y2={y}
                    stroke="#e0e0e0" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '4,3'}
                  />
                  <text x={padLeft - 8} y={y + 4} textAnchor="end" fontSize="12" fill="#95a5a6">
                    {formatAmt(tick)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {labels.map((label, i) => {
              const x = getX(i);
              const bh = getBarHeight(values[i]);
              const y = getY(values[i]);
              return (
                <g key={label}>
                  <rect
                    x={x} y={y}
                    width={barWidth} height={bh}
                    fill="#d32f2f" rx="3" ry="3"
                    opacity="0.85"
                  />
                  {/* Value label on top of bar */}
                  <text
                    x={x + barWidth / 2} y={y - 7}
                    textAnchor="middle" fontSize="12" fill="#2c3e50" fontWeight="bold"
                  >
                    {formatAmt(values[i])}
                  </text>
                  {/* X-axis date label */}
                  <text
                    x={x + barWidth / 2}
                    y={padTop + barAreaHeight + 20}
                    textAnchor="middle" fontSize="12" fill="#7f8c8d"
                  >
                    {shortDate(label)}
                  </text>
                </g>
              );
            })}

            {/* X axis line */}
            <line
              x1={padLeft} y1={padTop + barAreaHeight}
              x2={chartWidth - padRight} y2={padTop + barAreaHeight}
              stroke="#bdc3c7" strokeWidth="1.5"
            />
            {/* Y axis line */}
            <line
              x1={padLeft} y1={padTop}
              x2={padLeft} y2={padTop + barAreaHeight}
              stroke="#bdc3c7" strokeWidth="1.5"
            />
          </svg>
        </div>
        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#bdc3c7', textAlign: 'center' }}>
          * Multiple transactions on the same date are combined
        </p>
      </div>
    );
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
          .quick-btn {
            background: #f1f2f6;
            color: #2c3e50;
            border: 1px solid #ddd;
            padding: 6px 13px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.15s;
            white-space: nowrap;
          }
          .quick-btn:hover {
            background: #f8d7d7;
            border-color: #d32f2f;
            color: #d32f2f;
          }
          .quick-btn.active {
            background: #d32f2f;
            color: white;
            border-color: #d32f2f;
          }
        `}
      </style>

      <div className="connected-border-box">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="dashboard-content" style={{ display: 'flex', flexDirection: 'column' }}>
          
          <header className="main-header no-print">
            <div className="title-area" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={generateReportIcon} alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              <h2 style={{ margin: 0 }}>Generate Reports</h2>
            </div>
            <TopHeader />
          </header>

          <hr className="divider no-print" />

          {/* Filter Controls */}
          <div className="shadow-box no-print" style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>Sales Summary Report Filters</h3>

            {/* Quick Range Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: '600', marginRight: '4px' }}>Quick:</span>
              {quickButtons.map(label => (
                <button
                  key={label}
                  type="button"
                  className={`quick-btn${activeQuick === label ? ' active' : ''}`}
                  onClick={() => applyQuickRange(label)}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleGenerateReport} style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => { setStartDate(e.target.value); setActiveQuick(null); }}
                  style={{ width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '4px' }} 
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => { setEndDate(e.target.value); setActiveQuick(null); }}
                  style={{ width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '4px' }} 
                  required
                />
              </div>
              <button 
                type="submit" 
                style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '42px' }}
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
                    <button onClick={() => window.print()} style={{ background: '#ac372f', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Print Report
                    </button>
                  </div>
                  <strong>Period:</strong> {reportData.start_date} to {reportData.end_date}<br/>
                  <strong>Generated On:</strong> {currentTime.toLocaleDateString()}<br/>
                </div>
              </div>

              {/* Bar Chart - above the summary cards */}
              {reportData.sales_data.length > 0 && (
                <BarChart salesData={reportData.sales_data} />
              )}

              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', marginTop: '30px' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', flex: 1, borderLeft: '4px solid #3498db' }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 'bold' }}>TOTAL TRANSACTIONS</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>{reportData.total_transactions}</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', flex: 1, borderLeft: '4px solid #d3f2f' }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 'bold' }}>TOTAL REVENUE</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d3f2f' }}>₱ {reportData.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
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
