import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CompetitionBadge from './CompetitionBadge';
import { competitionColors } from '../config/competitionColors';
import moment from 'moment-timezone';
import { FaSearch } from 'react-icons/fa';

const SearchResults = ({ results, query, onClose, onSearch }) => {
  const { teams = [], matches = [], bars = [] } = results || {};
  const [localQuery, setLocalQuery] = useState(query);

  // Sort matches by date and time
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = moment(`${a.date} ${a.time}`);
    const dateB = moment(`${b.date} ${b.time}`);
    return dateA - dateB;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(localQuery);
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center"> {/* Increased z-index */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <form onSubmit={handleSearch} className="mb-4 mt-6 relative">
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className="focus:placeholder-opacity-0 placeholder-slate-400 w-full border border-gray-300 rounded-full py-2 px-4 text-center"
                  placeholder="Search for a game, team, or bar"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white rounded-full p-2"
                >
                  <FaSearch className="text-sm" />
                </button>
              </form>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="mt-2">
                {/* Matches section */}
                {sortedMatches.length > 0 && (
                  <div className="mb-8 mt-8">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg">Matches</h4>
                      <Link to="/matches" className="text-blue-500 hover:text-blue-700">
                        View All
                      </Link>
                    </div>
                    <hr className="mb-4 border-gray-300" />
                    {sortedMatches.slice(0, 5).map(match => (
                      <Link key={match.id} to={`/matches/${match.id}`} className="flex items-center hover:bg-gray-100 p-2 rounded" onClick={onClose}>
                        <CompetitionBadge
                          competition={match.competition.name}
                          colorClasses={competitionColors[match.competition.name] || 'bg-green-100 text-green-700 ring-green-700/20'}
                          className="mr-4 flex-shrink-0"
                        />
                        <div className="flex-grow grid grid-cols-5 items-center">
                          <div className="col-span-2 flex justify-end items-center">
                            <span className="mr-1">{match.aTeam.short_name}</span>
                            <img src={match.aTeam.logo} alt={match.aTeam.name} className="w-6 h-6 object-contain" />
                          </div>
                          <div className="col-span-1 text-center">vs</div>
                          <div className="col-span-2 flex justify-start items-center">
                            <img src={match.bTeam.logo} alt={match.bTeam.name} className="w-6 h-6 mr-1 object-contain" />
                            <span>{match.bTeam.short_name}</span>
                          </div>
                        </div>
                        <div className="ml-2 text-sm text-gray-500 flex-shrink-0">
                        {moment.utc(`${match.date} ${match.time}`).local().format('M/D, h:mm A')}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {/* Teams section */}
                {teams.length > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg">Teams</h4>
                      <Link to="/teams" className="text-blue-500 hover:text-blue-700">
                        View All
                      </Link>
                    </div>
                    <hr className="mb-4 border-gray-300" />
                    {teams.slice(0, 5).map(team => (
                      <Link key={team.id} to={`/teams/${team.id}`} className="flex items-center hover:bg-gray-100 p-2 rounded" onClick={onClose}>
                        <img src={team.logo} alt={team.name} className="w-8 h-8 mr-2 object-contain" />
                        <span>{team.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {/* Bars section */}
                {bars.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg">Bars</h4>
                      <Link to="/bars" className="text-blue-500 hover:text-blue-700">
                        View All
                      </Link>
                    </div>
                    <hr className="mb-4 border-gray-300" />
                    {bars.slice(0, 5).map(bar => (
                      <Link key={bar.id} to={`/bars/${bar.place_id}`} className="block hover:bg-gray-100 p-2 rounded" onClick={onClose}>
                        <span className="font-semibold">{bar.name}</span>
                        <span className="text-gray-500 ml-2">{bar.neighborhood}, {bar.city}, {bar.state}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {teams.length === 0 && matches.length === 0 && bars.length === 0 && (
                  <div className="text-center text-gray-500">No results found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;