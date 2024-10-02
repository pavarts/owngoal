import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import FilterInput from './FilterInput';
import moment from 'moment-timezone';
import StatusFilter from '../StatusFilter';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

Modal.setAppElement('#root');

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [newMatch, setNewMatch] = useState({
    competitionId: '',
    aTeamId: '',
    bTeamId: '',
    date: '',
    time: '',
    location: ''
  });
  const [editingMatch, setEditingMatch] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [filter, setFilter] = useState({ competitionId: '', teamName: '' });
  const [selectedTeamA, setSelectedTeamA] = useState(null);
  const [statusFilter, setStatusFilter] = useState({
    upcoming: true,
    current: true,
    completed: false
  });

  useEffect(() => {
    fetchMatches();
    fetchCompetitions();
  }, []);
  
  useEffect(() => {
    if (matches.length > 0) {
      applyFilter(filter, statusFilter);
    }
  }, [matches, filter, statusFilter]);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('${process.env.REACT_APP_API_URL}/matches/all', getAuthHeader());
      setMatches(response.data);
      setFilteredMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
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

  const fetchTeamsForCompetition = async (competitionId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/competitions/${competitionId}/teams`, getAuthHeader());
      setFilteredTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams for competition:', error);
    }
  };

  const getMatchStatus = (match) => {
    const now = moment();
    const startTime = moment(`${match.date}T${match.time}`);
    const endTime = moment(`${match.date}T${match.time}`).add(2, 'hours');
  
    if (now.isBefore(startTime)) return 'Upcoming';
    if (now.isBetween(startTime, endTime)) return 'Current';
    return 'Completed';
  };

  const openModal = (match = null) => {
    if (match) {
      const localDateTime = moment.utc(match.date + ' ' + match.time).local();
      setNewMatch({
        id: match.id,
        competitionId: match.competitionId ? match.competitionId.toString() : '',
        aTeamId: match.aTeamId ? match.aTeamId.toString() : '',
        bTeamId: match.bTeamId ? match.bTeamId.toString() : '',
        date: localDateTime.format('YYYY-MM-DD'),
        time: localDateTime.format('HH:mm'),
        location: match.location || ''
      });
      if (match.competitionId) {
        fetchTeamsForCompetition(match.competitionId);
      }
    } else {
      setNewMatch({
        competitionId: '',
        aTeamId: '',
        bTeamId: '',
        date: '',
        time: '',
        location: ''
      });
    }
    setEditingMatch(match);
    setModalIsOpen(true);
    setSelectedTeamA(null); 
  };

  const handleTeamAChange = (teamA) => {
    setSelectedTeamA(teamA);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingMatch(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMatch({ ...newMatch, [name]: value });
  
    if (name === 'competitionId') {
      fetchTeamsForCompetition(value);
    }
  
    if (name === 'aTeamId') {
      const selectedTeam = filteredTeams.find(team => team.id === parseInt(value, 10));
      if (selectedTeam && selectedTeam.stadium) {
        setNewMatch(prev => ({...prev, location: selectedTeam.stadium}));
      }
    }
  };

  const handleAddOrEditMatch = async (e) => {
    e.preventDefault();
  
    const localDateTime = moment(`${newMatch.date}T${newMatch.time}`);
    const utcDateTime = localDateTime.utc();
  
    const matchData = {
      competitionId: newMatch.competitionId ? parseInt(newMatch.competitionId, 10) : null,
      aTeamId: newMatch.aTeamId ? parseInt(newMatch.aTeamId, 10) : null,
      bTeamId: newMatch.bTeamId ? parseInt(newMatch.bTeamId, 10) : null,
      date: newMatch.date,
      time: newMatch.time,
      location: newMatch.location
    };
  
    console.log("Saving match data: ", matchData);
  
    try {
      if (editingMatch) {
        await axios.put(`${process.env.REACT_APP_API_URL}/matches/${editingMatch.id}`, matchData, getAuthHeader());
      } else {
        await axios.post('${process.env.REACT_APP_API_URL}/matches', matchData, getAuthHeader());
      }
      closeModal();
      fetchMatches();
    } catch (error) {
      console.error(`Error ${editingMatch ? 'updating' : 'adding'} match:`, error.response?.data || error.message);
    }
  };

  

  const handleDeleteMatch = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/matches/${id}`, getAuthHeader());
      fetchMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  };

  const handleSort = (column) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === column && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: column, direction: direction });
    const sortedMatches = [...filteredMatches].sort((a, b) => {
      if (a[column] < b[column]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[column] > b[column]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setFilteredMatches(sortedMatches);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilter = { ...filter, [name]: value };
    setFilter(newFilter);
    applyFilter(newFilter, statusFilter);
  };

  const applyFilter = (filter, statusFilter) => {
    const filtered = matches.filter((match) => {
      const competitionMatch = !filter.competitionId || (match.competition && match.competition.toLowerCase().includes(filter.competitionId.toLowerCase()));
      const teamMatch = !filter.teamName || (match.a_team && match.a_team.toLowerCase().includes(filter.teamName.toLowerCase())) || (match.b_team && match.b_team.toLowerCase().includes(filter.teamName.toLowerCase()));
      
      const now = moment();
      const matchDateTime = moment.utc(`${match.date}T${match.time}`);
      const status = matchDateTime.isAfter(now) ? 'upcoming' : 
                     (matchDateTime.isSameOrBefore(now) && matchDateTime.add(2, 'hours').isAfter(now)) ? 'current' : 
                     'completed';
      
      const statusMatch = statusFilter[status];
  
      return competitionMatch && teamMatch && statusMatch;
    });
  
    setFilteredMatches(filtered);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Matches</h2>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-12"
      >
        Add Match
      </button>
      <div className="flex mb-4">
        <FilterInput
          placeholder="Filter by competition"
          name="competitionId"
          value={filter.competitionId}
          onChange={handleFilterChange}
        />
        <FilterInput
          placeholder="Filter by Team Name"
          name="teamName"
          value={filter.teamName}
          onChange={handleFilterChange}
        />
      <div className="ml-4">
          <StatusFilter 
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            applyFilter={applyFilter}
            filter={filter}
          />
        </div>
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border sticky left-0 z-10">Actions</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('id')}>ID</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('competition')}>Competition</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('aTeam')}>Team A</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('bTeam')}>Team B</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('status')}>Status</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('date')}>Date</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('time')}>Time</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('location')}>Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((match) => (
              <tr key={match.id}>
                <td className="py-2 px-4 border sticky left-0 bg-gray-100 z-10">
                  <button
                    onClick={() => openModal(match)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMatch(match.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
                <td className="py-2 px-4 border">{match.id}</td>
                <td className="py-2 px-4 border">{match.competition}</td>
                <td className="py-2 px-4 border">{getMatchStatus(match)}</td>
                <td className="py-2 px-4 border">{match.a_team}</td>
                <td className="py-2 px-4 border">{match.b_team}</td>
                <td className="py-2 px-4 border">{moment(match.date).format('YYYY-MM-DD')}</td>   
                <td className="py-2 px-4 border">
                  {moment(`${match.date}T${match.time}`).format('HH:mm')} 
                  ({moment(`${match.date}T${match.time}`).format('z')})
                </td>
                <td className="py-2 px-4 border">{match.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add/Edit Match"
        className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      >
        <div className="bg-white p-8 rounded shadow-md max-w-md mx-auto mt-20">
          <h3 className="text-xl font-bold mb-4">{editingMatch ? 'Edit Match' : 'Add New Match'}</h3>
          <form onSubmit={handleAddOrEditMatch}>
          <div className="mb-2">
            <label className="block text-sm font-bold mb-1">Competition</label>
            <select
              name="competitionId"
              value={newMatch.competitionId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={editingMatch}
            >
              <option value="">Select a competition</option>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-bold mb-1">Team A</label>
            <select
              name="aTeamId"
              value={newMatch.aTeamId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={editingMatch}
            >
              <option value="">Select Team A</option>
              {Array.isArray(filteredTeams) &&
                filteredTeams.sort((a, b) => a.name.localeCompare(b.name)).map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-bold mb-1">Team B</label>
            <select
              name="bTeamId"
              value={newMatch.bTeamId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={editingMatch}
            >
              <option value="">Select Team B</option>
              {Array.isArray(filteredTeams) &&
                filteredTeams.sort((a, b) => a.name.localeCompare(b.name)).map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
            </select>
          </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={newMatch.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Time</label>
              <input
                type="time"
                name="time"
                value={newMatch.time}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={newMatch.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {editingMatch ? 'Update Match' : 'Add Match'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Matches;
