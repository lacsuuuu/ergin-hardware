import { useNavigate } from "react-router-dom";
import { canAccess } from "./sidebarRoles";
import Logout from "./Logout";

import logo from "./assets/logo.png";
import dashboardIcon from "./assets/dashboard_header icon.png";
import inventoryIcon from "./assets/inventory_header icon.png";
import salesRecordIcon from './assets/salesrecord_header icon.png';
import userAccessIcon from './assets/useracess_header icon.png';
import transactIcon from './assets/transact_pos header.png';
import generateReportIcon from './assets/generate report_ header icon.png';
import supplierIcon from './assets/supplier_header icon.png';
import clientIcon from './assets/client_header icon.png';

const Sidebar = () => {

  const navigate = useNavigate();
  const currentRole = localStorage.getItem("currentRole");

  const navIconStyle = {
    width: "20px",
    marginRight: "10px"
  };

  return (
    <aside className="sidebar">

      <div className="logo-section">
        <img src={logo} alt="Logo" className="sidebar-logo" />
      </div>

      <nav className="side-nav">

        {canAccess(currentRole, "dashboard") && (
          <div className="nav-item" onClick={() => navigate('/dashboard')}>
            <img src={dashboardIcon} alt="" style={navIconStyle} />
            DASHBOARD
          </div>
        )}

        {canAccess(currentRole, "inventory") && (
          <div className="nav-item" onClick={() => navigate('/inventory')}>
            <img src={inventoryIcon} alt="" style={navIconStyle} />
            INVENTORY
          </div>
        )}

        {canAccess(currentRole, "sales-record") && (
          <div className="nav-item" onClick={() => navigate('/sales-record')}>
            <img src={salesRecordIcon} alt="" style={navIconStyle} />
            SALES RECORD
          </div>
        )}

        {canAccess(currentRole, "user-access") && (
          <div className="nav-item" onClick={() => navigate('/user-access')}>
            <img src={userAccessIcon} alt="" style={navIconStyle} />
            USER ACCESS
          </div>
        )}

        {canAccess(currentRole, "transact") && (
          <div className="nav-item" onClick={() => navigate('/transact')}>
            <img src={transactIcon} alt="" style={navIconStyle} />
            TRANSACT
          </div>
        )}

        {canAccess(currentRole, "generate-report") && (
          <div className="nav-item" onClick={() => navigate('/generate-report')}>
            <img src={generateReportIcon} alt="" style={navIconStyle} />
            GENERATE REPORT
          </div>
        )}

        {canAccess(currentRole, "suppliers") && (
          <div className="nav-item" onClick={() => navigate('/suppliers')}>
            <img src={supplierIcon} alt="" style={navIconStyle} />
            SUPPLIERS
          </div>
        )}

        {canAccess(currentRole, "clients") && (
          <div className="nav-item" onClick={() => navigate('/clients')}>
            <img src={clientIcon} alt="" style={navIconStyle} />
            CLIENTS
          </div>
        )}

      </nav>

      <Logout />

    </aside>
  );
};

export default Sidebar;