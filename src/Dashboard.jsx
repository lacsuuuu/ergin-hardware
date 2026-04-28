import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import TopHeader from './TopHeader';
import './index.css';
import Sidebar from "./Sidebar";
import dashboardIcon from './assets/dashboard_header icon.png';
import { canAccess } from "./sidebarRoles";

//these r unused imports na since nilagay ko yung buong sidebar sa loob ng sidebar.jsx para magamit ng lahat with js <Sidebar /> 
//import inventoryIcon from './assets/inventory_header icon.png';
//import salesRecordIcon from './assets/salesrecord_header icon.png';
//import userAccessIcon from './assets/useracess_header icon.png';
//import transactIcon from './assets/transact_pos header.png';
//import generateReportIcon from './assets/generate report_ header icon.png';
//import supplierIcon from './assets/supplier_header icon.png';
//import clientIcon from './assets/client_header icon.png';
//import logo from './assets/logotrans.png';
//import Logout from './Logout';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000'
  : 'https://ergin-hardware.onrender.com';

const RESTOCK_PER_PAGE = 7; // NEW: Pagination limit designed to perfectly match the height of the chart

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentRole = localStorage.getItem('currentRole');
  const isAdmin = currentRole === 'Admin';

  const [currentRestockPage, setCurrentRestockPage] = useState(1); // NEW: Pagination state

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
      const response = await fetch(`${API_URL}/api/dashboard`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleQuickPurchase = (productName) => {
    navigate('/suppliers', { state: { restockProduct: productName } });
  };

  const chartData = dashboardData.recent_sales
    .slice()
    .reverse()
    .reduce((acc, sale) => {
      const existing = acc.find(d => d.date === sale.date);
      if (existing) {
        existing.revenue = parseFloat((existing.revenue + sale.total_amount).toFixed(2));
        existing.sales += 1;
      } else {
        acc.push({ date: sale.date, revenue: parseFloat(sale.total_amount.toFixed(2)), sales: 1 });
      }
      return acc;
    }, []);

  // NEW: Pagination calculations for Low Stock Items
  const totalRestockPages = Math.ceil(dashboardData.low_stock_items.length / RESTOCK_PER_PAGE);
  const paginatedRestockItems = dashboardData.low_stock_items.slice(
    (currentRestockPage - 1) * RESTOCK_PER_PAGE,
    currentRestockPage * RESTOCK_PER_PAGE
  );

  const kpiItem = (label, value, red = false, lastItem = false) => (
    <div style={{
      textAlign: 'center',
      padding: '0 20px',
      borderRight: lastItem ? 'none' : '1px solid #eee',
      flex: 1
    }}>
      <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: red ? '#d10000' : '#222' }}>{value}</div>
    </div>
  );

  return (
    <div className="outer-margin-container">
      <div className="connected-border-box">

        <Sidebar />

        {/* Main Content */}
        <main className="dashboard-content" style={{
          position: 'relative',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: '10px',
          padding: '14px'
        }}>

          {/* Header */}
          <header className="main-header" style={{ flexShrink: 0, padding: 0 }}>
            <div className="title-area" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={dashboardIcon} alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              <h2 style={{ margin: 0 }}>Business Dashboard</h2>
            </div>
            <TopHeader userData={{ role: currentRole }} />
          </header>

          <hr className="divider" style={{ margin: '0', flexShrink: 0 }} />

          {/* KPI Stats Row */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '12px 8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}>
            {kpiItem('TOTAL REVENUE', `₱${dashboardData.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, true)}
            {kpiItem('TOTAL SALES', dashboardData.total_sales_count)}
            {kpiItem('TOTAL PRODUCTS', dashboardData.total_products)}
            {kpiItem('LOW STOCK ALERTS', dashboardData.low_stock_count, true, true)}
          </div>

          {/* Middle Row: Chart (left) | Low Stock (right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', flexShrink: 0 }}>

            {/* Option A: Bar + Line Combined Chart */}
            <div style={{ background: 'white', borderRadius: '8px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '12px', color: '#333' }}>Sales &amp; Revenue Overview</h3>
                <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#666' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(209,0,0,0.2)', border: '1px solid #d10000', display: 'inline-block' }}></span>
                    Sales Count
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '10px', height: '2px', background: '#7b0000', display: 'inline-block' }}></span>
                    Revenue (₱)
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={185}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
                  barCategoryGap={chartData.length === 1 ? '60%' : '20%'}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} width={28} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} width={50} tickFormatter={v => `₱${v}`} />
                  <Tooltip formatter={(value, name) => name === 'revenue' ? [`₱${value}`, 'Revenue'] : [value, 'Sales Count']} />
                  <Bar yAxisId="left" dataKey="sales" fill="rgba(209,0,0,0.2)" stroke="#d10000" strokeWidth={1} radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#7b0000" strokeWidth={2} dot={{ fill: '#7b0000', r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Low Stock Panel */}
            <div style={{
              background: 'white', borderRadius: '8px', padding: '14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              overflowY: 'auto'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#c0392b', borderBottom: '2px solid #eee', paddingBottom: '6px' }}>
                Needs Restock (≤ 10)
              </h3>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                {/* UPDATED: Map over paginated items instead of all items */}
                {paginatedRestockItems.map(item => (
                  <li key={item.product_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 0', borderBottom: '1px solid #f5f5f5'
                  }}>
                    <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{item.product_name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{
                        color: 'white', background: '#e74c3c',
                        padding: '2px 7px', borderRadius: '10px',
                        fontSize: '10px', fontWeight: 'bold'
                      }}>
                        {item.stock} left
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleQuickPurchase(item.product_name)}
                          style={{
                            background: '#d10000', color: 'white', border: 'none',
                            padding: '3px 7px', borderRadius: '4px',
                            fontSize: '10px', fontWeight: 'bold', cursor: 'pointer'
                          }}>
                          + Buy
                        </button>
                      )}
                    </div>
                  </li>
                ))}
                {paginatedRestockItems.length === 0 && (
                  <li style={{ padding: '10px 0', color: '#7f8c8d', textAlign: 'center', fontSize: '11px' }}>
                    All stock levels OK!
                  </li>
                )}
              </ul>

              {/* NEW: Uniform Pagination Controls (Scaled slightly for the smaller panel) */}
              {totalRestockPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                  <button
                    onClick={() => setCurrentRestockPage(p => Math.max(p - 1, 1))}
                    disabled={currentRestockPage === 1}
                    style={{
                      background: currentRestockPage === 1 ? '#eee' : '#d10000',
                      color: currentRestockPage === 1 ? '#aaa' : 'white',
                      border: 'none', borderRadius: '4px', padding: '4px 8px',
                      cursor: currentRestockPage === 1 ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '10px'
                    }}>
                    ← Prev
                  </button>

                  {Array.from({ length: totalRestockPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentRestockPage(page)}
                      style={{
                        background: currentRestockPage === page ? '#d10000' : 'white',
                        color: currentRestockPage === page ? 'white' : '#333',
                        border: '1px solid #ddd', borderRadius: '4px',
                        padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '10px',
                        minWidth: '24px'
                      }}>
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentRestockPage(p => Math.min(p + 1, totalRestockPages))}
                    disabled={currentRestockPage === totalRestockPages}
                    style={{
                      background: currentRestockPage === totalRestockPages ? '#eee' : '#d10000',
                      color: currentRestockPage === totalRestockPages ? '#aaa' : 'white',
                      border: 'none', borderRadius: '4px', padding: '4px 8px',
                      cursor: currentRestockPage === totalRestockPages ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '10px'
                    }}>
                    Next →
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* Bottom Row: Recent Transactions */}
          <div style={{
            background: 'white', borderRadius: '8px', padding: '12px 14px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0
          }}>
            <h3 style={{ marginTop: 0, fontSize: '12px', borderBottom: '2px solid #eee', paddingBottom: '6px', marginBottom: '0' }}>
              Recent Transactions
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f9f9f9' }}>
                  <th style={{ padding: '7px 10px', borderBottom: '1px solid #ddd', fontSize: '11px' }}>Invoice #</th>
                  <th style={{ padding: '7px 10px', borderBottom: '1px solid #ddd', fontSize: '11px' }}>Date</th>
                  <th style={{ padding: '7px 10px', borderBottom: '1px solid #ddd', fontSize: '11px' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_sales.slice(0, 5).map(sale => (
                  <tr key={sale.sales_id}>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>INV-{sale.sales_id}</td>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>{sale.date}</td>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid #f0f0f0', fontSize: '11px', fontWeight: 'bold', color: '#27ae60' }}>
                      ₱{sale.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {dashboardData.recent_sales.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ padding: '10px', textAlign: 'center', fontSize: '11px', color: '#999' }}>
                      No recent sales found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Floating Forecast Button */}
          {canAccess(currentRole, 'generate-report') && (
            <button onClick={() => navigate('/generate-report')}
              style={{
                position: 'fixed', bottom: '30px', right: '30px',
                background: '#d10000', color: 'white', border: 'none',
                padding: '12px 20px', borderRadius: '30px', fontSize: '13px',
                fontWeight: 'bold', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(209,0,0,0.4)',
                zIndex: 999, display: 'flex', alignItems: 'center', gap: '6px'
              }}>
              📈 FORECAST
            </button>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;