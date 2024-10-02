import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AccountSettings = () => {
  const [email, setEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('${process.env.REACT_APP_API_URL}/current-user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmail(response.data.username);
        setNewEmail(response.data.username);
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    fetchUserEmail();
  }, []);

  const handleEmailEdit = () => {
    setIsEditingEmail(true);
  };

  const handleEmailCancel = () => {
    setIsEditingEmail(false);
    setNewEmail(email);
    setEmailError('');
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put('${process.env.REACT_APP_API_URL}/update-email', { email: newEmail }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmail(newEmail);
      setIsEditingEmail(false);
      setEmailError('');
    } catch (error) {
      console.error('Error updating email:', error);
      setEmailError('Failed to update email');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put('${process.env.REACT_APP_API_URL}/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to change password');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-white mb-4 mt-6">Account Settings</h1>
      <hr className="mb-8 border-gray-200" />
      
      <div className="grid grid-cols-2 gap-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-4">Email</h2>
          {isEditingEmail ? (
            <form onSubmit={handleEmailUpdate}>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={`w-full p-2 border rounded mb-2 bg-orange-100 ${emailError ? 'border-red-800 border-2' : ''}`}
                required
              />
              {emailError && <p className="text-red-800 text-sm mb-2">{emailError}</p>}
              <button type="submit" className="bg-blue-500 text-white p-2 rounded mr-2">
                Save
              </button>
              <button onClick={handleEmailCancel} className="bg-gray-500 text-white p-2 rounded">
                Cancel
              </button>
            </form>
          ) : (
            <div>
              <input
                type="text"
                value={email}
                readOnly
                className="w-full p-2 border rounded bg-white focus:outline-none mb-4"
              />
              <button onClick={handleEmailEdit} className="bg-green-500 text-white p-2 rounded">
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-2">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Current Password"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {passwordError && <p className="text-red-800 text-sm mb-2">{passwordError}</p>}
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;