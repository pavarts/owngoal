import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalForm from './ModalForm';
import FilterInput from './FilterInput';
import { countries } from '../../constants/countries';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState([]);
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    type: '',
    country: ''
  });
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [filter, setFilter] = useState({ name: '', type: '', country: '' });

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const response = await axios.get('${process.env.REACT_APP_API_URL}/competitions', getAuthHeader());
      setCompetitions(response.data);
      setFilteredCompetitions(response.data);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  const openModal = (competition = null) => {
    setEditingCompetition(competition);
    setNewCompetition(competition || {
      name: '',
      type: '',
      country: ''
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingCompetition(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompetition({ ...newCompetition, [name]: value });
  };

  const handleAddOrEditCompetition = async (e) => {
    e.preventDefault();
    try {
      if (editingCompetition) {
        await axios.put(`${process.env.REACT_APP_API_URL}/competitions/${editingCompetition.id}`, newCompetition, getAuthHeader());
      } else {
        await axios.post('${process.env.REACT_APP_API_URL}/competitions', newCompetition, getAuthHeader());
      }
      closeModal();
      fetchCompetitions();
    } catch (error) {
      console.error(`Error ${editingCompetition ? 'updating' : 'adding'} competition:`, error.response.data);
    }
  };

  const handleDeleteCompetition = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/competitions/${id}`, getAuthHeader());
      fetchCompetitions();
    } catch (error) {
      console.error('Error deleting competition:', error);
    }
  };

  const handleSort = (column) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === column && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: column, direction: direction });
    const sortedCompetitions = [...filteredCompetitions].sort((a, b) => {
      if (a[column] < b[column]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[column] > b[column]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setFilteredCompetitions(sortedCompetitions);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    applyFilter({ ...filter, [name]: value });
  };

  const applyFilter = (filter) => {
    const filtered = competitions.filter(competition => 
      (competition.name?.toLowerCase() || '').includes(filter.name.toLowerCase()) &&
      (competition.type?.toLowerCase() || '').includes(filter.type.toLowerCase()) &&
      (competition.country?.toLowerCase() || '').includes(filter.country.toLowerCase())
    );
    setFilteredCompetitions(filtered);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Competitions</h2>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add Competition
      </button>
      <div className="flex mb-4">
        <FilterInput name="name" placeholder="Filter by name" value={filter.name} onChange={handleFilterChange} />
        <FilterInput name="type" placeholder="Filter by type" value={filter.type} onChange={handleFilterChange} />
        <FilterInput name="country" placeholder="Filter by country" value={filter.country} onChange={handleFilterChange} />
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border sticky left-0 z-10">Actions</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('id')}>ID</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('name')}>Name</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('type')}>Type</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('country')}>Country</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('createdAt')}>Created At</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('updatedAt')}>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompetitions.map(competition => (
              <tr key={competition.id}>
                <td className="py-2 px-4 border sticky left-0 bg-gray-100 z-10">
                  <button onClick={() => openModal(competition)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteCompetition(competition.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                    Delete
                  </button>
                </td>
                <td className="py-2 px-4 border">{competition.id}</td>
                <td className="py-2 px-4 border">{competition.name}</td>
                <td className="py-2 px-4 border">{competition.type}</td>
                <td className="py-2 px-4 border">{competition.country}</td>
                <td className="py-2 px-4 border">{competition.createdAt}</td>
                <td className="py-2 px-4 border">{competition.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalForm
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={editingCompetition ? 'Edit Competition' : 'Add New Competition'}
        onSubmit={handleAddOrEditCompetition}
      >
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={newCompetition.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Type</label>
          <div className="flex">
            <label className="mr-4">
              <input
                type="radio"
                name="type"
                value="Cup"
                checked={newCompetition.type === 'Cup'}
                onChange={handleInputChange}
                className="mr-1"
              />
              Cup
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="League"
                checked={newCompetition.type === 'League'}
                onChange={handleInputChange}
                className="mr-1"
              />
              League
            </label>
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Country</label>
          <select
            name="country"
            value={newCompetition.country}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </ModalForm>
    </div>
  );
};

export default Competitions;
