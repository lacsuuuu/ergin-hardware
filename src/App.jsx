import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import Dashboard from './Dashboard.jsx';
import Inventory from './Inventory.jsx';
import SalesRecord from './SalesRecord.jsx';
import UserAccess from './UserAccess.jsx';
import Transact from './Transact.jsx';
import GenerateReport from './GenerateReport.jsx';
import Suppliers from './Suppliers.jsx';
import Clients from './Clients.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
  
function App() {
  return (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />

    {/* Cashier + Supervisor + Admin */}
    <Route path="/dashboard"    element={<ProtectedRoute allowedRoles={['Cashier', 'Supervisor', 'Admin']}><Dashboard /></ProtectedRoute>} />
    <Route path="/inventory"    element={<ProtectedRoute allowedRoles={['Cashier', 'Supervisor', 'Admin']}><Inventory /></ProtectedRoute>} />
    <Route path="/sales-record" element={<ProtectedRoute allowedRoles={['Cashier', 'Supervisor', 'Admin']}><SalesRecord /></ProtectedRoute>} />
    <Route path="/transact"     element={<ProtectedRoute allowedRoles={['Cashier', 'Supervisor', 'Admin']}><Transact /></ProtectedRoute>} />

    {/* Supervisor + Admin only */}
    <Route path="/generate-report" element={<ProtectedRoute allowedRoles={['Supervisor', 'Admin']}><GenerateReport /></ProtectedRoute>} />

    {/* Admin only */}
    <Route path="/user-access" element={<ProtectedRoute allowedRoles={['Admin']}><UserAccess /></ProtectedRoute>} />
    <Route path="/suppliers"   element={<ProtectedRoute allowedRoles={['Admin']}><Suppliers /></ProtectedRoute>} />
    <Route path="/clients"     element={<ProtectedRoute allowedRoles={['Admin']}><Clients /></ProtectedRoute>} />
  </Routes>
  );
};

export default App;