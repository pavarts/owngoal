import React from 'react';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import CompetitionBadge from '../CompetitionBadge';
import { competitionColors } from '../../config/competitionColors';

const AllMatchesTable = ({ matches, events, handleAddEvent, renderMatch }) => {
  return (
    <div className="bg-blue-300 bg-opacity-40 rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-custom-blue to-lime-green text-white shadow-md">
            <th className="py-2 px-4 text-center">Competition</th>
            <th className="py-2 px-4 text-center">Match</th>
            <th className="py-2 px-4 text-center">Time</th>
            <th className="py-2 px-4 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr key={match.id} className={index % 2 === 0 ? 'bg-blue-300 bg-opacity-40' : ''}>
              <td className="py-2 px-4 text-center">
                <CompetitionBadge
                  competition={match.competition}
                  colorClasses={competitionColors[match.competition] || 'bg-green-100 text-green-700 ring-green-700/20'}
                />
              </td>
              <td className="py-2 px-4 text-center">
                {renderMatch(match.a_team, match.a_team_logo, match.b_team, match.b_team_logo)}
              </td>
              <td className="py-2 px-4 text-center">
                {moment(match.date).format('ddd, M/D')} @ {moment(match.time, 'HH:mm:ss').format('h:mm A')}
              </td>
              <td className="py-2 px-4 text-center">
                <div className="flex justify-center items-center">
                  {events.some(event => event.match_id === match.id) ? (
                    <FontAwesomeIcon icon={faCheck} className="text-lime-green text-lg" />
                  ) : (
                    <button onClick={() => handleAddEvent(match)}>
                      <FontAwesomeIcon icon={faPlus} className="text-orange-200 hover:text-orange-300 text-lg" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllMatchesTable;