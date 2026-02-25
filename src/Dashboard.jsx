import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import logo from './assets/logotrans.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Dashboard State
  const [dashboardData, setDashboardData] = useState({
    total_revenue: 0,
    total_sales_count: 0,
    total_products: 0,
    low_stock_count: 0,
    low_stock_items: [],
    recent_sales: []
  });

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div className="outer-margin-container">
      <div className="connected-border-box">
        
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo-section"><img src={logo} alt="Logo" className="sidebar-logo" /></div>
          <nav className="side-nav">
            <div className="nav-item active">DASHBOARD</div>
            <div className="nav-item" onClick={() => navigate('/inventory')}>INVENTORY</div>
            <div className="nav-item" onClick={() => navigate('/sales-record')}>SALES RECORD</div>
            <div className="nav-item" onClick={() => navigate('/user-access')}>USER ACCESS</div>
            <div className="nav-item" onClick={() => navigate('/transact')}>TRANSACT</div>
            <div className="nav-item" onClick={() => navigate('/generate-report')}>GENERATE REPORT</div>
            <div className="nav-item" onClick={() => navigate('/suppliers')}>SUPPLIERS</div>
            <div className="nav-item" onClick={() => navigate('/clients')}>CLIENTS</div>
          </nav>
          <div className="sidebar-footer">👤</div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <header className="main-header">
            <div className="title-area"><h2><span className="icon">📊</span> Business Dashboard</h2></div>
            <div className="admin-info">
              <p className="real-time-date">{currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}</p>
              <p className="welcome-text">Welcome, Admin</p>
            </div>
          </header>

          <hr className="divider" style={{ marginBottom: '20px' }} />

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            
            <div className="shadow-box" style={{ background: '#2c3e50', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#bdc3c7' }}>TOTAL REVENUE</h3>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>₱{dashboardData.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>

            <div className="shadow-box" style={{ background: '#3498db', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ecf0f1' }}>TOTAL SALES</h3>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{dashboardData.total_sales_count}</div>
            </div>

            <div className="shadow-box" style={{ background: '#27ae60', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ecf0f1' }}>TOTAL PRODUCTS</h3>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{dashboardData.total_products}</div>
            </div>

            <div className="shadow-box" style={{ background: dashboardData.low_stock_count > 0 ? '#e74c3c' : '#f39c12', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ecf0f1' }}>LOW STOCK ALERTS</h3>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{dashboardData.low_stock_count}</div>
            </div>

          </div>

          {/* Lower Section: Split View */}
          <div style={{ display: 'flex', gap: '20px' }}>
            
            {/* Recent Sales Table */}
            <div className="shadow-box" style={{ flex: '2', padding: '20px', borderRadius: '8px', background: 'white' }}>
              <h3 style={{ marginTop: '0', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Recent Transactions</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f9f9f9' }}>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Invoice #</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Date</th>
                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recent_sales.map(sale => (
                    <tr key={sale.sales_id}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>INV-{sale.sales_id}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{sale.date}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#27ae60' }}>
                        ₱{sale.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {dashboardData.recent_sales.length === 0 && (
                    <tr><td colSpan="3" style={{ padding: '10px', textAlign: 'center' }}>No recent sales found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Low Stock Alerts */}
            <div className="shadow-box" style={{ flex: '1', padding: '20px', borderRadius: '8px', background: 'white' }}>
              <h3 style={{ marginTop: '0', borderBottom: '2px solid #eee', paddingBottom: '10px', color: '#c0392b' }}>Needs Restock (≤ 10)</h3>
              <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
                {dashboardData.low_stock_items.map(item => (
                  <li key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontWeight: 'bold' }}>{item.product_name}</span>
                    <span style={{ color: 'white', background: '#e74c3c', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      {item.stock} left
                    </span>
                  </li>
                ))}
                {dashboardData.low_stock_items.length === 0 && (
                  <li style={{ padding: '10px 0', color: '#7f8c8d', textAlign: 'center' }}>Inventory levels look good!</li>
                )}
              </ul>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;