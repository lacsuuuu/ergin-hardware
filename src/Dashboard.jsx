import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import './index.css';
import logo from './assets/logotrans.png';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Redirect to login page on logout
  const handleLogout = () => {
    navigate('/'); 
  };

  // Timer logic for the real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString();
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });

  // Metrics data for the Bar Chart
  const combinedData = [
    { name: 'Total Products', value: 3, color: '#e63946' },      // Red
    { name: 'Stock Quantity', value: 159, color: '#457b9d' },    // Blue
    { name: 'Total Sales (₱)', value: 12735, color: '#2a9d8f' }, // Green
    { name: 'Low Stock Alerts', value: 3, color: '#f4a261' }     // Orange
  ];

  return (
    <div className="outer-margin-container">
      <div className="connected-border-box">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo-section">
            <img src={logo} alt="Ergin Hardware" className="sidebar-logo" />
          </div>
          <nav className="side-nav">
            <div className="nav-item active" onClick={() => navigate('/dashboard')}>DASHBOARD</div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>USER ACCESS</div>
            <div className="nav-item" onClick={() => navigate('/transact')}>TRANSACT</div>
            <div className="nav-item" onClick={() => navigate('/generate-report')}>GENERATE REPORT</div>
            <div className="nav-item" onClick={() => navigate('/suppliers')}>SUPPLIERS</div>
            <div className="nav-item" onClick={() => navigate('/clients')}>CLIENTS</div>
          </nav>
          <div className="sidebar-footer" onClick={handleLogout} title="Logout" style={{ cursor: 'pointer' }}>👤</div>
        </aside>

        {/* Main Dashboard Content */}
        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area">
              <h2><span className="icon">🔳</span> Dashboard Overview</h2>
            </div>
            
            <div className="admin-info">
              <p className="real-time-date">Date: {formattedDate} | {formattedTime}</p>
              <p className="welcome-text">Welcome, Admin</p>
              <button className="update-btn" onClick={() => navigate('/user-access')}>Update Information</button>
            </div>
          </header>

          <hr className="divider" />

          {/* SINGLE COMBINED GRAPH SECTION */}
          <section className="graph-section" style={{ 
            backgroundColor: '#fff', 
            padding: '20px', 
            borderRadius: '10px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            marginBottom: '30px',
            height: '350px' 
          }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Sales & Inventory Overview</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: '#f5f5f5'}} />
                <Legend />
                <Bar dataKey="value" name="Metric Value" radius={[4, 4, 0, 0]}>
                  {combinedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Lower Compartments */}
          <div className="lower-layout">
            {/* QUICK ACTIONS: Correctly linked to pages */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <button 
                className="small-btn red" 
                onClick={() => navigate('/inventory')}
              >
                Add Item
              </button>
              <button 
                className="small-btn gray" 
                onClick={() => navigate('/transact')}
              >
                New Sale
              </button>
            </div>

            {/* LOW STOCK ALERTS */}
            <div className="info-compartment alerts-box">
              <h3 className="alert-header">⚠️ Low Stock Alerts:</h3>
              <div className="alert-entry">
                <p className="item-name">Concrete Hollow Blocks</p>
                <p className="rem-stock">Remaining Stock: 12 pcs</p>
              </div>
              <div className="alert-entry">
                <p className="item-name">Premium Marine Plywood 18mm</p>
                <p className="rem-stock">Remaining Stock: 4 sheets</p>
              </div>
            </div>

            {/* FORECAST OVERVIEW */}
            <div className="info-compartment forecast-box">
              <h3>📊 Forecast Overview</h3>
              <div className="forecast-entry">
                <p><strong>Product: Concrete Hollow Blocks</strong></p>
                <p>Total Quantity Sold: 185</p>
                <p>Total Revenue: ₱7,846</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


export default Dashboard;