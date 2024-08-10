import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:3000/current-user', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Error fetching current user:', error);
          localStorage.removeItem('token');
        }
      }
    };
    checkCurrentUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', { username, password });
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('userRole', response.data.role);
        if (response.data.role === 'admin') {
          navigate('/admin/teams');
        } else if (response.data.role === 'bar') {
          navigate('/bar/bar-profile');
        }
      }
    } catch (error) {
      console.error('Login failed', error.response ? error.response.data : error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">Currently Logged In</h2>
          <p className="mb-4 text-center">{currentUser.barName}</p>
          <p className="mb-6 text-center text-sm text-gray-600">{currentUser.username}</p>
          <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div className="mb-6 relative">
          <label className="block text-sm font-bold mb-2">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-lg pr-10"
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 pt-6 flex items-center cursor-pointer"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            onClick={togglePasswordVisibility}
          >
            <FontAwesomeIcon 
              icon={showPassword ? faEyeSlash : faEye} 
              className={showPassword ? "text-gray-600" : "text-gray-500"}
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Login
        </button>
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-blue-500 hover:text-blue-700 text-sm">Forgot my password?</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
