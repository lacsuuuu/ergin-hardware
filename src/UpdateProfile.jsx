import React, { useState, useEffect } from 'react';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:5000' 
  : 'https://ergin-hardware.onrender.com';

const UpdateProfileModal = ({ isOpen, onClose, userData, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: '',
    age: '',
    birthday: '',
    password: '',
    role: 'Admin'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // --- NEW: Age Calculation Helper ---
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return '';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // If the birth month hasn't happened yet this year, or it's the birth month but the day hasn't happened, subtract 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (userData && isOpen) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        contact: userData.contact || '',
        address: userData.address || '',
        // Auto-calculate the age based on the database birthday on load
        age: userData.birthday ? calculateAge(userData.birthday) : (userData.age || ''),
        birthday: userData.birthday || '',
        password: '', 
        role: userData.user_role || 'Admin'
      });
      setMessage({ text: '', type: '' }); 
    }
  }, [userData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`${API_URL}/api/users/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: localStorage.getItem('currentUser'), 
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          address: formData.address,
          age: formData.age,
          birthday: formData.birthday,
          password: formData.password
        })
      });

      if (response.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => {
          setIsLoading(false);
          onClose();
          if (onUpdateSuccess) onUpdateSuccess(); 
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.error || 'Failed to update profile.', type: 'error' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ text: 'Server connection error.', type: 'error' });
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // --- NEW: If they change the birthday, update the age instantly ---
    if (name === 'birthday') {
      const newAge = calculateAge(value);
      setFormData({ ...formData, birthday: value, age: newAge });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div style={styles.overlay}>
      <div className="shadow-box" style={styles.modalBox}>
        
        {/* --- NEW HEADER BLOCK --- */}
        <div style={styles.headerContainer}>
          <h3 style={styles.headerTitle}>Update User Profile</h3>
          <button style={styles.closeIcon} onClick={onClose} aria-label="Close">
            ✖
          </button>
        </div>

        {/* --- NEW BODY WRAPPER FOR PADDING --- */}
        <div style={styles.bodyContainer}>
          {message.text && (
            <div style={{ ...styles.messageBox, backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.formContainer}>
            <div style={styles.grid}>
              {/* Column 1 */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} style={styles.input} />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} style={styles.input} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Contact Number</label>
                <input type="text" name="contact" value={formData.contact} onChange={handleChange} style={styles.input} placeholder="e.g. 09123456789" />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} style={styles.input} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Birthday</label>
                <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} style={styles.input} />
              </div>

              <div style={styles.inputGroup}>
                <label style={{ ...styles.label, color: '#7f8c8d' }}>Age</label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age} 
                  readOnly 
                  style={{ ...styles.input, backgroundColor: '#f9f9f9', color: '#7f8c8d', cursor: 'not-allowed' }} 
                  placeholder="Auto-calculated"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} style={styles.input} placeholder="Leave blank to keep current" />
              </div>

              <div style={styles.inputGroup}>
                <label style={{ ...styles.label, color: '#7f8c8d' }}>System Role</label>
                <div style={styles.roleBadge}> {formData.role}</div>
              </div>
            </div>

            <div style={styles.buttonContainer}>
              <button type="button" onClick={onClose} disabled={isLoading} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" disabled={isLoading} style={styles.saveBtn}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    backdropFilter: 'blur(2px)' 
  },
  modalBox: {
    background: 'white', 
    borderRadius: '12px',
    width: '600px', 
    color: '#333', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    overflow: 'hidden'
  },
  headerContainer: {
    backgroundColor: '#d32f2f',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    margin: 0, 
    fontSize: '20px',
    color: 'white',
    fontWeight: 'bold'
  },
  closeIcon: {
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
  },
  bodyContainer: {
    padding: '30px' // We moved the padding here so the form stays centered
  },
  messageBox: {
    padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', textAlign: 'center'
  },
  formContainer: {
    display: 'flex', flexDirection: 'column', gap: '18px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', 
    gap: '15px'
  },
  inputGroup: {
    display: 'flex', flexDirection: 'column'
  },
  label: {
    fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#2c3e50'
  },
  input: {
    padding: '10px', border: '1px solid #bdc3c7', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  },
  roleBadge: {
    padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', 
    borderRadius: '6px', color: '#6c757d', fontWeight: 'bold', cursor: 'not-allowed', boxSizing: 'border-box'
  },
  buttonContainer: {
    display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', borderTop: '2px solid #f1f2f6', paddingTop: '15px'
  },
  cancelBtn: {
    padding: '10px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#ecf0f1', color: '#333', fontWeight: 'bold'
  },
  saveBtn: {
    padding: '10px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#d32f2f', color: 'white', fontWeight: 'bold'
  }
};

export default UpdateProfileModal;