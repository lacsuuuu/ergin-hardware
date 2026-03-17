import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();
  // State to track if the mouse is hovering over the button
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    // Clear the frontend token
    localStorage.removeItem('authToken');
    // Redirect to the login screen
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
    <button 
      type="button" 
      onClick={handleLogout}
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
  );
}

export default Logout;