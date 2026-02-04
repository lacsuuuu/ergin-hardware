import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logotrans.png';
import './index.css';

function LoginPage() {
  const navigate = useNavigate();
  
  const [showError, setShowError] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Validation Logic
    // We check for "admin", but we save the "name" to storage for the Dashboard
    if (name.toLowerCase() === "admin" && password === "1234") {
      
      // --- FIX: SAVE USERNAME BEFORE NAVIGATING ---
      // We capitalize the first letter so it looks nice on the dashboard
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      localStorage.setItem('currentUser', displayName); 
      
      navigate('/dashboard');
    } else {
      setShowError(true); 
    }
  };

  return (
    <div className="login-wrapper">
      <div className="main-frame">
        
        {/* Left Side: Branding */}
        <div className="brand-panel">
          <img src={logo} alt="Ergin Hardware Logo" className="large-logo" />
        </div>

        {/* Right Side: Login Form */}
        <div className="form-panel">
          <div className="login-card">
            <img src={logo} alt="Small Logo" className="form-logo" />
            
            <form onSubmit={handleLogin}>
              <div className="input-field">
                <label>NAME</label>
                <input 
                  type="text" 
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div className="input-field">
                <label>PASSWORD</label>
                <div className="password-wrapper">
                  <input 
                    type={passwordVisible ? "text" : "password"} 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <span className="toggle-password" onClick={togglePasswordVisibility}>
                    {passwordVisible ? "👁" : "⌣"}
                  </span>
                </div>
              </div>

              <button type="submit" className="login-btn">LOG IN</button>
            </form>

            <div className="footer">
              © 2008 Ergin Hardware and Construction Supply Trading.
            </div>
          </div>
        </div>

        {/* CUSTOM WARNING MODAL */}
        {showError && (
          <div className="error-modal-overlay">
            <div className="error-modal-content">
              <div className="error-header">
                <span>Invalid Credentials</span>
                <button className="close-x" onClick={() => setShowError(false)}>✖</button>
              </div>
              <div className="error-body">
                <p>The name or password you entered is incorrect.</p>
                <button className="try-again-btn" onClick={() => setShowError(false)}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;