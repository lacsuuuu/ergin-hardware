import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const GenerateReport = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [reportData] = useState([
    { id: 'GIR-001', name: 'Hammer (16oz)', category: 'Hand Tools', qty: 25, unit: 'pcs', retail: 180, selling: 180 },
    { id: 'GIR-002', name: 'Screwdriver Set (6 pcs)', category: 'Hand Tools', qty: 15, unit: 'set', retail: 350, selling: 320 },
    { id: 'GIR-003', name: 'Paint Brush (2")', category: 'Hand Tools', qty: 25, unit: 'pcs', retail: 75, selling: 75 },
    { id: 'GIR-004', name: 'Steel Nails (1kg)', category: 'Construction Materials', qty: 5, unit: 'kg', retail: 70, selling: 80 },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate totals for the bottom dashboard
  const totalItems = reportData.length;
  const totalValue = reportData.reduce((sum, item) => sum + (item.selling * item.qty), 0);

  return (
    <div className="outer-margin-container">
      <div className="connected-border-box">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo-section"><img src={logo} alt="Logo" className="sidebar-logo" /></div>
          <nav className="side-nav">
            <div className="nav-item" onClick={() => navigate('/dashboard')}>DASHBOARD</div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>USER ACCESS</div>
            <div className="nav-item" onClick={() => navigate('/transact')}>TRANSACT</div>
            <div className="nav-item active" onClick={() => navigate('/generate-report')}>GENERATE REPORT</div>
            <div className="nav-item" onClick={() => navigate('/suppliers')}>SUPPLIERS</div>
            <div className="nav-item">CLIENTS</div>
          </nav>
        </aside>

        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area">
              <h2><span className="icon">📋</span> Generate Inventory Report</h2>
            </div>
            <div className="admin-info">
              <p>Date: {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" />

          {/* Report Filters */}
          {/* Sales Controls with Calendar Picker */}
        <div className="sales-controls">
        <div className="filter-group">

        {/* Month Dropdown */}
        <div className="select-wrapper">
        <label className="filter-label">From:</label>
        <select className="filter-select">
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
        </select>
        </div>

        <div className="select-wrapper">
        <label className="filter-label">to:</label>
        <select className="filter-select">
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
        </select>
        </div>

        {/* Year Dropdown */}
        <div className="select-wrapper">
        <select className="filter-select">
            <option value="2008">2008</option>
            <option value="2009">2009</option>
            <option value="2010">2010</option>
            <option value="2011">2011</option>
            <option value="2012">2012</option>
            <option value="2013">2013</option>
            <option value="2014">2014</option>
            <option value="2015">2015</option>
            <option value="2016">2016</option>
            <option value="2017">2017</option>
            <option value="2018">2018</option>
            <option value="2019">2019</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
        </select>
        </div>
    </div>
    </div>


          {/* Report Table */}
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Qty.</th>
                  <th>Unit</th>
                  <th>Retail Price</th>
                  <th>Selling Price</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.qty}</td>
                    <td>{item.unit}</td>
                    <td>₱{item.retail}</td>
                    <td>₱{item.selling}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Dashboard Stats */}
          <div className="stats-dashboard">
            <div className="stat-card">
              <div className="stat-header">Total Items</div>
              <div className="stat-value">{totalItems}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">Total Inventory Value</div>
              <div className="stat-value">₱{totalValue.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">Low Stock Items</div>
              <div className="stat-value">--</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GenerateReport;