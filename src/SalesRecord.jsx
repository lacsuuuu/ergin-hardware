import React, { useState, useEffect } from 'react';
import './index.css';
import logo from './assets/logotrans.png';
import { useNavigate } from 'react-router-dom';

const SalesRecord = () => {
    const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="outer-margin-container">
      <div className="connected-border-box">
        <aside className="sidebar">
          <div className="logo-section">
            <img src={logo} alt="Ergin Hardware" className="sidebar-logo" />
          </div>
     <nav className="side-nav">
        <div className="nav-item" onClick={() => navigate('/dashboard')}>
            DASHBOARD</div>
        <div className="nav-item" onClick={() => navigate('/inventory')}>
            INVENTORY</div>
        <div className="nav-item active" onClick={() => navigate('/sales-record')}>
            SALES RECORD</div>
        <div className="nav-item" onClick={() => navigate('/user-access')}>
            USER ACCESS</div>
        <div className="nav-item" onClick={() => navigate('/transact')}>
            TRANSACT</div>
        <div className="nav-item " onClick={() => navigate('/generate-report')}>
            GENERATE REPORT</div>
        <div className="nav-item " onClick={() => navigate('/suppliers')}>
            SUPPLIERS</div>
        <div className="nav-item " onClick={() => navigate('/clients')}>
            CLIENTS</div>
     </nav>
          <div className="sidebar-footer">👤</div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area">
              <h2><span className="icon">🗄️</span> Sales Record</h2>
            </div>
            <div className="admin-info">
              <p className="real-time-date">
                Date: {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
              </p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" />

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

          {/* Sales Table */}
          <div className="table-container shadow-box">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Total Sales</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>TRX-10245</td>
                  <td>October</td>
                  <td>2025</td>
                  <td>15</td>
                  <td>10:23 AM</td>
                  <td>₱1,595.00</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn"><span>👁</span> View</button>
                      <button className="delete-btn">🗑️</button>
                    </div>
                  </td>
                </tr>
                {/* Additional rows here */}
              </tbody>
            </table>
          </div>

          <div className="pagination">
             <span>&lt; Page 1 &gt;</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalesRecord;