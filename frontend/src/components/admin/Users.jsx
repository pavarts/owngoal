// src/components/admin/Users.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalForm from './ModalForm';
import FilterInput from './FilterInput';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [bars, setBars] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'bar', barId: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [filter, setFilter] = useState({ username: '', barName: '' });

  useEffect(() => {
    fetchUsers();
    fetchBars();
  }, []);

  useEffect(() => {
    applyFilter(filter);
  }, [users, filter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Users data received:', response.data);  // Add this line
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/bars', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBars(response.data);
    } catch (error) {
      console.error('Error fetching bars:', error);
    }
  };


  const openModal = (user = null) => {
    setEditingUser(user);
    setNewUser(user || { username: '', password: '', role: 'bar', barId: '' });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleAddOrEditUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingUser) {
        // For editing, we'll keep the existing logic
        await axios.put(`http://localhost:3000/users/${editingUser.id}`, newUser, { headers });
      } else {
        // For adding a new user, we'll omit the password field
        const { password, ...userWithoutPassword } = newUser;
        await axios.post('http://localhost:3000/users', userWithoutPassword, { headers });
      }
      
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error(`Error ${editingUser ? 'updating' : 'adding'} user:`, error.response?.data);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const applyFilter = (filter) => {
    const filtered = users.filter((user) => {
      const usernameMatch = user.username.toLowerCase().includes(filter.username.toLowerCase());
      const barNameMatch = filter.barName === '' || (user.Bar?.name || '').toLowerCase().includes(filter.barName.toLowerCase());
      return usernameMatch && barNameMatch;
    });
    setFilteredUsers(filtered);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add User
      </button>
      <div className="flex mb-4">
        <FilterInput name="username" placeholder="Filter by email" value={filter.username} onChange={handleFilterChange} />
        <FilterInput name="barName" placeholder="Filter by bar name" value={filter.barName} onChange={handleFilterChange} />
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border">Actions</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Role</th>
              <th className="py-2 px-4 border">Bar Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
                <tr key={user.id}>
                <td className="py-2 px-4 border">
                    <button
                    onClick={() => openModal(user)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                    Edit
                    </button>
                    {user.role !== 'admin' && (
                    <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                        Delete
                    </button>
                    )}
                </td>
                <td className="py-2 px-4 border">{user.username}</td>
                <td className="py-2 px-4 border">{user.role}</td>
                <td className="py-2 px-4 border">{user.Bar?.name || 'N/A'}</td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>

      <ModalForm
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={editingUser ? 'Edit User' : 'Add New User'}
        onSubmit={handleAddOrEditUser}
      >
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Email</label>
          <input
            type="email"
            name="username"
            value={newUser.username}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Role</label>
          <select
            name="role"
            value={newUser.role}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="admin">Admin</option>
            <option value="bar">Bar</option>
          </select>
        </div>
        {newUser.role === 'bar' && (
          <div className="mb-2">
            <label className="block text-sm font-bold mb-1">Bar</label>
            <select
              name="barId"
              value={newUser.barId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a bar</option>
              {bars.map((bar) => (
                <option key={bar.id} value={bar.id}>
                  {bar.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </ModalForm>
    </div>
  );
};

export default Users;