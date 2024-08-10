import React from 'react';
import { Link } from 'react-router-dom';

const BarsTable = ({ 
  bars, 
  filteredBars, 
  userLocation, 
  zipCode, 
  setZipCode, 
  fetchCoordinatesFromZip, 
  soundFilter, 
  setSoundFilter, 
  supporterFilter, 
  setSupporterFilter, 
  match, 
  calculateDistance, 
  hoveredBar, 
  setHoveredBar 
}) => {
  return (
    <table className="min-w-full rounded-lg overflow-hidden">
      <thead className="bg-gray-100 shadow-md relative">
        <tr>
          <th className="px-6 pt-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bar</th>
          <th className="px-6 pt-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Distance from</th>
          <th className="px-6 pt-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sound</th>
          <th className="px-6 pt-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Supporter bar</th>
        </tr>
        <tr>
          <th></th>
          <th className="px-6 pt-2 pb-4 text-left text-xs font-medium text-gray-500 tracking-wider">
            <div className="flex items-center">
              <input
                type="text"
                className="px-3 py-2 rounded-full text-xs bg-gray-200 text-gray-600 mr-2"
                placeholder="Enter your zip code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchCoordinatesFromZip(zipCode);
                  }
                }}
              />
              <button
                onClick={() => fetchCoordinatesFromZip(zipCode)}
                className="px-3 py-2 rounded-full bg-blue-500 text-white text-xs"
              >
                Update Location
              </button>
            </div>
          </th>
          <th className="px-6 pt-2 pb-4 text-left text-xs font-medium text-gray-500 tracking-wider">
            <div className="flex space-x-2">
              {['Any', 'On', 'Off'].map(option => (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-full text-xs ${soundFilter === option ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  onClick={() => setSoundFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </th>
          <th className="px-6 pt-2 pb-4 text-center text-xs font-medium text-gray-500 tracking-wider">
            <div className="flex justify-center space-x-2">
              {[
                { option: 'Any', logo: 'Any' },
                { option: match.a_team, logo: match.a_team_logo },
                { option: match.b_team, logo: match.b_team_logo }
              ].map(({ option, logo }) => (
                <button
                  key={option}
                  className={`px-2 py-1 rounded-full text-xs ${supporterFilter === option ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  onClick={() => setSupporterFilter(option)}
                >
                  {option === 'Any' ? (
                    'Any'
                  ) : (
                    <img src={logo} alt={option} className="w-6 h-6 object-contain" />
                  )}
                </button>
              ))}
            </div>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200 rounded-lg">
        {filteredBars.length === 0 ? (
          <tr>
            <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No bars found.</td>
          </tr>
        ) : (
          filteredBars.map((bar, index) => (
            <tr 
              key={index}
              onMouseEnter={() => setHoveredBar(bar.name)}
              onMouseLeave={() => setHoveredBar(null)}
              className={hoveredBar === bar.name ? 'bg-gray-100' : ''}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <Link to={`/bars/${bar.place_id}`} 
                  className="hover:text-blue-500 hover:underline" 
                  onClick={() => console.log(`Navigating to bar with id: ${bar.place_id}`)}
                >{bar.name}</Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {userLocation
                  ? `${calculateDistance(userLocation.lat, userLocation.lng, bar.lat, bar.lng).toFixed(2)} mi`
                  : 'Enter your location'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bar.sound ? 'On' : 'Off'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex justify-center space-x-2 text-lg">
                  {bar.supportedTeams.includes(match.a_team) && 
                    <img src={match.a_team_logo} alt={match.a_team} className="w-6 h-6 object-contain" />
                  }
                  {bar.supportedTeams.includes(match.b_team) && 
                    <img src={match.b_team_logo} alt={match.b_team} className="w-6 h-6 object-contain" />
                  }
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default BarsTable;