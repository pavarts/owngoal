import React from 'react';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import CompetitionBadge from '../CompetitionBadge';
import { competitionColors } from '../../config/competitionColors';

const UpcomingEventsTable = ({ events, handleEditEvent, handleDeleteEvent, renderMatch }) => {
  
  const formatDate = (dateString, timeString) => {
    return moment.utc(`${dateString}T${timeString}`).local().format('ddd, M/D');
  };

  const formatTime = (dateString, timeString) => {
    return moment.utc(`${dateString}T${timeString}`).local().format('h:mm A');
  };

  
  // Sort events by date and time
  const sortedEvents = [...events].sort((a, b) => {
    const dateTimeA = moment(`${a.date} ${a.time}`);
    const dateTimeB = moment(`${b.date} ${b.time}`);
    return dateTimeA - dateTimeB;
  });

  return (
    <div className="overflow-x-auto mb-1 rounded-lg">
      <table className="min-w-full rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr className="bg-gray-200 shadow-md">
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Competition</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Match</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Sound</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Opening Early?</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedEvents.map(event => (
            <tr key={event.id}>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <CompetitionBadge
                  competition={event.competition}
                  colorClasses={competitionColors[event.competition] || 'bg-green-100 text-green-700 ring-green-700/20'}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {renderMatch(event.a_team, event.a_team_logo, event.b_team, event.b_team_logo)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {formatDate(event.date, event.time)} @ {formatTime(event.date, event.time)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">{event.sound ? 'On' : 'Off'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {event.earlyOpening ? `Yes, ${moment(event.openingTime, 'HH:mm:ss').format('h:mm A')}` : 'No'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                <button onClick={() => handleEditEvent(event)} className="mr-2">
                  <FontAwesomeIcon icon={faPencilAlt} className="text-blue-600 hover:text-blue-900 text-md" />
                </button>
                <button onClick={() => handleDeleteEvent(event)}>
                  <FontAwesomeIcon icon={faTimes} className="text-red-600 hover:text-red-900 text-lg" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UpcomingEventsTable;