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

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. Send Username/Password to Backend
      // Notice we are sending keys 'username' and 'password' to match Python
      const response = await fetch('https://ergin-hardware.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: name,
          password: password 
        }) 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 2. Login Success!
        
        // Save the Role and Username to the browser
        localStorage.setItem('currentUser', data.username);
        localStorage.setItem('currentRole', data.role);

        if (data.role === 'Admin') {
            navigate('/dashboard');
        } else {
            navigate('/transact');
        }

      } else {
        setShowError(true);
      }

    } catch (error) {
      console.error("Login Error:", error);
      alert("System Error: Check backend console");
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