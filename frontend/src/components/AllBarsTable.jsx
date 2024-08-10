import React from 'react';
import { Link } from 'react-router-dom';
import Pagination from './Pagination.jsx';

const AllBarsTable = ({ 
  filteredBars, 
  userLocation, 
  calculateDistance,
  hoveredBar,
  setHoveredBar,
  currentPage,
  barsPerPage,
  paginate
}) => {
  const indexOfLastBar = currentPage * barsPerPage;
  const indexOfFirstBar = indexOfLastBar - barsPerPage;
  const currentBars = filteredBars.slice(indexOfFirstBar, indexOfLastBar);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        <table className="min-w-full rounded-lg overflow-hidden">
        <thead className="bg-gray-100 shadow-md relative">
          <tr>
            <th className="px-6 pt-3 pb-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bar</th>
            <th className="px-6 pt-3 pb-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Distance</th>
            <th className="px-6 pt-3 pb-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Supported Teams</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 rounded-lg">
          {currentBars.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center text-gray-500 mt-8">No bars found matching your criteria.</td>
            </tr>
          ) : (
            currentBars.map((bar) => (
              <tr 
                key={bar.id}
                onMouseEnter={() => setHoveredBar(bar.name)}
                onMouseLeave={() => setHoveredBar(null)}
                className={hoveredBar === bar.name ? 'bg-gray-100' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link to={`/bars/${bar.place_id}`} 
                    className="hover:text-blue-500 hover:underline"
                  >{bar.name}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {userLocation
                    ? `${calculateDistance(userLocation.lat, userLocation.lng, bar.latitude, bar.longitude)} mi`
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex justify-center space-x-2">
                    {bar.supportedTeams.map(team => (
                      <img key={team.id} src={team.logo} alt={team.name} className="w-6 h-6 object-contain" title={team.name} />
                    ))}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Pagination
          itemsPerPage={barsPerPage}
          totalItems={filteredBars.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};


export default AllBarsTable;