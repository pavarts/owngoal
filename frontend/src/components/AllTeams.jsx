// src/components/AllTeams.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AllTeams = () => {
  const [teams, setTeams] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTeamsAndCompetitions = async () => {
      try {
        const [teamsResponse, competitionsResponse] = await Promise.all([
          axios.get('http://localhost:3000/teams'),
          axios.get('http://localhost:3000/competitions')
        ]);
        setTeams(teamsResponse.data);
        setCompetitions(competitionsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchTeamsAndCompetitions();
  }, []);

  const filteredTeams = teams.filter(team => {
    const matchesCompetition = selectedCompetition === '' || team.competitions.some(comp => comp.id === parseInt(selectedCompetition));
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCompetition && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-5xl font-semibold mb-6 text-white">Teams</h1>
      
      <div className="mb-6 mt-12 flex flex-wrap gap-4 items-center justify-center">
        <select
          className="p-2 rounded-md appearance-none"
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
          style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em 1em' }}
        >
          <option value="">All Competitions</option>
          {competitions.map(competition => (
            <option key={competition.id} value={competition.id}>
              {competition.name}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Search teams..."
          className="p-2 rounded-md flex-grow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredTeams.sort((a, b) => a.name.localeCompare(b.name)).map(team => (
          <Link to={`/teams/${team.id}`} key={team.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-transform hover:scale-105">
            <img src={team.logo} alt={team.name} className="w-16 h-16 object-contain mb-2" />
            <h2 className="text-center text-sm font-semibold">{team.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllTeams;