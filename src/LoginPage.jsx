import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logotrans.png';
import './index.css';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000'
  : 'https://ergin-hardware.onrender.com';

function LoginPage() {
  const navigate = useNavigate();
  
  const [showError, setShowError] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear previous error
    setPasswordError('');

    // Password Validation Rules
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    // Check if password meets all requirements
    if (!hasMinLength || !hasUpperCase || !hasNumber) {
      setPasswordError('Password must be at least 8 characters and include at least one uppercase letter and one number.');
      return; // Stop login process if validation fails
    }

    try {
        const response = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: name,
            password: password
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem('currentUser', data.username);
          localStorage.setItem('currentRole', data.role);
          navigate('/dashboard');
        } else {
          setShowError(true);
        }

      } catch (error) {
        console.error("Login error:", error);
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
                <label>USERNAME</label>
                <input 
                  type="text" 
                  placeholder="Enter your username"
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
                {/* Validation Error Display */}
                {passwordError && (
                  <p style={{ color: '#d10000', fontSize: '11px', marginTop: '5px', textAlign: 'left', lineHeight: '1.3' }}>
                    {passwordError}
                  </p>
                )}
              </div>

              <button type="submit" className="login-btn">LOG IN</button>
            </form>

            <div className="footer">
              © {new Date().getFullYear()} Ergin Hardware and Construction Supply Trading.
            </div>
          </div>
        </div>

        {/* CUSTOM WARNING MODAL */}
        {showError && (
          <div className="error-modal-overlay">
            <div className="error-modal-content">
              <div className="error-header">
                <span>Invalid Credentials</span>
                <button style={{
                        background: '#f1f2f6',
                        color: '#333',
                        border: '1px solid #bdc3c7',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} className="close-x" onClick={() => setShowError(false)}>
                        ✖
                      </button>
              </div>
              <div className="error-body">
                <p>The username or password you entered is incorrect.</p>
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