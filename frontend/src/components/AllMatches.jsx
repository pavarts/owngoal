import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AllMatchesTable from './AllMatchesTable';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const AllMatches = () => {
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesResponse, competitionsResponse] = await Promise.all([
          axios.get('http://localhost:3000/matches/upcoming'),
          axios.get('http://localhost:3000/competitions')
        ]);
        setMatches(matchesResponse.data);
        setCompetitions(competitionsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredMatches = matches.filter(match => {
    const matchesCompetition = selectedCompetition === '' || match.competitionId === parseInt(selectedCompetition);
    const matchesDate = !selectedDate || new Date(match.date).toDateString() === selectedDate.toDateString();
    const matchesSearch = match.a_team.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          match.b_team.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCompetition && matchesDate && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-5xl font-semibold mb-6 text-white">Matches</h1>
      
      <div className="mb-6 mt-12 flex flex-wrap gap-4 items-center justify-center">
        <select
          className="p-2 rounded-md appearance-none bg-white"
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
          placeholder="Search teams"
          className="p-2 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '300px' }} // Increased width of the search box
        />

        <div className="inline-block" style={{ width: '180px' }}>
            <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                placeholderText="Select a date"
                className="p-2 rounded-md w-full"
            />
        </div>
      </div>

      <AllMatchesTable 
        matches={filteredMatches} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        matchesPerPage={matchesPerPage}
      />
    </div>
  );
};

export default AllMatches;