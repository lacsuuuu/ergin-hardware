import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import Dashboard from './Dashboard.jsx';
import Inventory from './Inventory.jsx';
import SalesRecord from './SalesRecord.jsx';
import UserAccess from './UserAccess.jsx';
import Transact from './Transact.jsx';
import GenerateReport from './GenerateReport.jsx';
import Suppliers from './Suppliers.jsx';
import Clients from './Clients.jsx';
  
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/sales-record" element={<SalesRecord />} />
      <Route path="/user-access" element={<UserAccess />} />
      <Route path="/transact" element={<Transact />} />
      <Route path="/generate-report" element={<GenerateReport />} />
      <Route path="suppliers" element={<Suppliers />} />
      <Route path="clients" element={<Clients />} />
    </Routes>
  );
}

export default App;