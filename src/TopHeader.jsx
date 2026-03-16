import React, { useState, useEffect } from 'react';
import UpdateProfileModal from './UpdateProfile';

const TopHeader = ({ userData, onUpdateSuccess }) => {
  // 1. State for the clock and the modal
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. The Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="admin-info" style={{ textAlign: 'right', marginBottom: '20px' }}>
      
      {/* The Clock */}
      <p className="real-time-date" style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#7f8c8d' }}>
        {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
      </p>
      
      {/* Dynamic Role Display */}
      <p className="welcome-text" style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
        Welcome, <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{userData?.user_role || 'Admin'}</span>
      </p>
      
      {/* Update Button */}
      <button 
        className="update-info-btn" 
        onClick={() => setIsModalOpen(true)} 
        style={{
          marginTop: '5px',
          padding: '6px 12px',
          backgroundColor: '#ac372f',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
      Update Information
      </button>

      {/* The Hidden Modal */}
      <UpdateProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userData={userData} 
        onUpdateSuccess={onUpdateSuccess} 
      />
    </div>
  );
};

export default TopHeader;