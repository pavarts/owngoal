import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { countries } from '../../constants/countries';
import CompetitionBadge from '../../components/CompetitionBadge';
import ModalForm from './ModalForm';
import FilterInput from './FilterInput';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [newTeam, setNewTeam] = useState({ name: '', short_name: '', type: '', city: '', country: '', stadium: '', logo: '', competitions: [], hidden: false  });  
  const [editingTeam, setEditingTeam] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [filter, setFilter] = useState({ name: '', type: '', country: '', competition: '' });
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchCompetitions();
  }, []);

  useEffect(() => {
    if (teams.length > 0) {
      applyFilter(filter, showHiddenOnly);
    }
  }, [teams, filter, showHiddenOnly]);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('${process.env.REACT_APP_API_URL}/teams?includeHidden=true', getAuthHeader());
      setTeams(response.data);
      setFilteredTeams(response.data);  // Set filtered teams initially to all teams
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };
  

  const fetchCompetitions = async () => {
    try {
      const response = await axios.get('${process.env.REACT_APP_API_URL}/competitions', getAuthHeader());
      setCompetitions(response.data);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  const openModal = (team = null) => {
    setEditingTeam(team);
    setNewTeam({
      ...team,
      competitions: team && team.competitions ? team.competitions.map(comp => comp.id) : []
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingTeam(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeam({ ...newTeam, [name]: value });
  };

  const handleCompetitionChange = (e) => {
    const { value, checked } = e.target;
    const competitionId = parseInt(value, 10);
    const updatedCompetitions = checked
      ? [...newTeam.competitions, competitionId]
      : newTeam.competitions.filter((compId) => compId !== competitionId);
    setNewTeam({ ...newTeam, competitions: updatedCompetitions });
  };

  const handleAddOrEditTeam = async (e) => {
    e.preventDefault();
    try {
      const teamData = {
        ...newTeam,
        competitions: newTeam.competitions
          .map(id => parseInt(id, 10))
          .filter(id => !isNaN(id)) // Remove any NaN values
      };
      if (editingTeam) {
        await axios.put(`${process.env.REACT_APP_API_URL}/teams/${editingTeam.id}`, teamData, getAuthHeader());
      } else {
        await axios.post('${process.env.REACT_APP_API_URL}/teams', teamData, getAuthHeader());
      }
      closeModal();
      fetchTeams();
    } catch (error) {
      console.error(`Error ${editingTeam ? 'updating' : 'adding'} team:`, error.response?.data);
    }
  };
  const handleDeleteTeam = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/teams/${id}`, getAuthHeader());
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleSort = (column) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === column && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: column, direction: direction });
    const sortedTeams = [...filteredTeams].sort((a, b) => {
      if (a[column] < b[column]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[column] > b[column]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setFilteredTeams(sortedTeams);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    applyFilter({ ...filter, [name]: value });
  };

  const applyFilter = (filter, hiddenOnly) => {
    const filtered = teams.filter((team) => {
      const nameMatch = team.name?.toLowerCase().includes(filter.name.toLowerCase());
      const typeMatch = team.type?.toLowerCase().includes(filter.type.toLowerCase());
      const countryMatch = team.country?.toLowerCase().includes(filter.country.toLowerCase());
      const competitionMatch = !filter.competition || team.competitions?.some(comp => 
        comp.name.toLowerCase().includes(filter.competition.toLowerCase())
      );
      const hiddenMatch = hiddenOnly ? team.hidden : true;
  
      return nameMatch && typeMatch && countryMatch && competitionMatch && hiddenMatch;
    });
  
    setFilteredTeams(filtered);
  };
  
  const handleToggleHidden = async (id) => {
    try {
      const team = teams.find(t => t.id === id);
      const updatedTeam = { ...team, hidden: !team.hidden };
      await axios.put(`${process.env.REACT_APP_API_URL}/teams/${id}`, updatedTeam, getAuthHeader());
      fetchTeams();
    } catch (error) {
      console.error('Error toggling team visibility:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Teams</h2>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-12"
      >
        Add Team
      </button>
      <div className="flex mb-4">
        <FilterInput name="name" placeholder="Filter by name" value={filter.name} onChange={handleFilterChange} />
        <FilterInput name="type" placeholder="Filter by type" value={filter.type} onChange={handleFilterChange} />
        <FilterInput name="country" placeholder="Filter by country" value={filter.country} onChange={handleFilterChange} />
        <FilterInput name="competition" placeholder="Filter by competition" value={filter.competition} onChange={handleFilterChange} />
        <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="form-checkbox"
          checked={showHiddenOnly}
          onChange={(e) => {
            const newShowHiddenOnly = e.target.checked;
            setShowHiddenOnly(newShowHiddenOnly);
            applyFilter(filter, newShowHiddenOnly);
          }}
        />
        <span className="ml-2">Show hidden teams only</span>
        </label>
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border sticky left-0 z-10">Actions</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('hidden')}>Hidden</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('id')}>ID</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('name')}>Name</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('short_name')}>Short Name</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('type')}>Type</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('city')}>City</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('country')}>Country</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('stadium')}>Stadium</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('logo')}>Logo</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('competitions')}>Competitions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => {
              console.log('Team:', team); // Debug log
              return (
                <tr key={team.id}>
                  <td className="py-2 px-4 border sticky left-0 bg-gray-100 z-10">
                    <button
                      onClick={() => openModal(team)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                  <td className="py-2 px-4 border">
                      <input
                        type="checkbox"
                        checked={team.hidden}
                        onChange={() => handleToggleHidden(team.id)}
                      />
                    </td>
                  <td className="py-2 px-4 border">{team.id}</td>
                  <td className="py-2 px-4 border">{team.name}</td>
                  <td className="py-2 px-4 border">{team.short_name}</td>
                  <td className="py-2 px-4 border">{team.type}</td>
                  <td className="py-2 px-4 border">{team.city}</td>
                  <td className="py-2 px-4 border">{team.country}</td>
                  <td className="py-2 px-4 border">{team.stadium}</td>
                  <td className="py-2 px-4 border">{team.logo}</td>
                  <td className="py-2 px-4 border">
                    {team.competitions &&
                      team.competitions.map((competition) => (
                        <CompetitionBadge key={competition.id} competition={competition.name} />
                      ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ModalForm
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={editingTeam ? 'Edit Team' : 'Add New Team'}
        onSubmit={handleAddOrEditTeam}
      >
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={newTeam.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Short Name</label>
          <input
            type="text"
            name="short_name"
            value={newTeam.short_name}
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
                value="National"
                checked={newTeam.type === 'National'}
                onChange={handleInputChange}
                className="mr-1"
              />
              National
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="Club"
                checked={newTeam.type === 'Club'}
                onChange={handleInputChange}
                className="mr-1"
              />
              Club
            </label>
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">City</label>
          <input
            type="text"
            name="city"
            value={newTeam.city}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Country</label>
          <select
            name="country"
            value={newTeam.country}
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
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Stadium</label>
          <input
            type="text"
            name="stadium"
            value={newTeam.stadium}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Logo</label>
          <input
            type="text"
            name="logo"
            value={newTeam.logo}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Competitions</label>
          {competitions.map((competition) => (
            <div key={competition.id} className="flex items-center mb-1">
              <input
                type="checkbox"
                id={`competition-${competition.id}`}
                value={competition.id}
                checked={newTeam.competitions && newTeam.competitions.includes(competition.id)}
                onChange={handleCompetitionChange}
                className="mr-2"
              />
              <label htmlFor={`competition-${competition.id}`}>{competition.name}</label>
            </div>
          ))}
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">
            <input
              type="checkbox"
              name="hidden"
              checked={newTeam.hidden}
              onChange={(e) => setNewTeam({ ...newTeam, hidden: e.target.checked })}
            />
            Hidden
          </label>
        </div>
      </ModalForm>
    </div>
  );
};

export default Teams;
