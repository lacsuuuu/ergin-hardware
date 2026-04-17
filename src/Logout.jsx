import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();
  // State to track if the mouse is hovering over the button
  const [isHovered, setIsHovered] = useState(false);
  // NEW: State to control the confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser'); //dinagdag ko kasi napansin ko na bug pag nag log out ako hindi nawawala yung role ko kahit nag iba ako ng account cashier -> admin. naka cashier parin
    localStorage.removeItem('currentRole');
    navigate('/login', { replace: true });
  };

  // We define the styles here in a reusable object to keep the JSX clean
  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: 'calc(100% - 16px)', // Adjusts for the 8px side margins
    padding: '12px 24px', // Increased horizontal padding from your image
    marginTop: 'auto', // Pushes the button to the bottom of the flex container (the sidebar)
    marginBottom: '8px',
    marginLeft: '8px',
    marginRight: '8px',
    
    // Core styling to match the image
    border: 'none',
    borderRadius: '4px', // This creates the "pill" shape (highly rounded corners)
    fontSize: '16px',
    fontWeight: 'bold', // Bold text, as seen in your image
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out', // Smooth transition for hover effects

    // Base color and text styling
    color: '#FFFFFF', // Text is always white

    backgroundColor: isHovered ? '#ac372f' : '#d32f2f',
  };

  return (
    <>
      <button 
        type="button" 
        onClick={() => setShowLogoutModal(true)} // Changed to open the confirmation modal
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={buttonStyle}
      >
        {/* SVG Logout Icon */}
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        {/* Label Text */}
        <span>Logout</span>
      </button>

      {/* NEW: Logout Confirmation Modal */}
      {showLogoutModal && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
          onClick={(e) => {
            // Closes modal if user clicks the dark background
            if (e.target === e.currentTarget) setShowLogoutModal(false);
          }}
        >
          <div className="delete-confirm-modal" style={{
            background: 'white', borderRadius: '8px', width: '90%', maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', overflow: 'hidden'
          }}>
            {/* Uniform Modal Header */}
            <div className="modal-header-red" style={{ padding: '16px 20px', background: '#d10000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Confirm Logout</h3>
              <button 
                className="close-x"
                onClick={() => setShowLogoutModal(false)}
                style={{
                  background: '#f1f2f6', color: '#333', border: '1px solid #bdc3c7',
                  borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                  fontWeight: 'bold', padding: '4px 8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✖
              </button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '15px', color: '#333', fontWeight: '500' }}>
                Are you sure you want to log out of the system?
              </p>
            </div>

            {/* Uniform Modal Footer */}
            <div className="modal-footer" style={{ background: '#f9f9f9', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee' }}>
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutModal(false)}
                style={{ background: '#f1f2f6', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleLogout} // Triggers the actual logout logic
                style={{ background: '#d10000', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Logout;