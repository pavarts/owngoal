import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CompetitionBadge from './CompetitionBadge';
import { competitionColors } from '../config/competitionColors';
import moment from 'moment-timezone';

const BarUpcomingMatchesTable = ({ place_id }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/bars/${place_id}/events`);
        const sortedEvents = response.data.sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(`1970-01-01T${a.time}Z`) - new Date(`1970-01-01T${b.time}Z`));
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [place_id]);

  const handleRowClick = (matchId) => {
    navigate(`/matches/${matchId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-x-auto mb-1 rounded-lg">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr className="bg-gray-200 shadow-md">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Competition</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Match</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sound</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Opening Early?</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No upcoming matches found.</td>
            </tr>
          ) : (
            events.map((event) => {
              const eventTime = moment.utc(`${event.date}T${event.time}`).local();
              return (
                <tr 
                  key={event.id} 
                  onClick={() => handleRowClick(event.match_id)}
                  className="cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <CompetitionBadge
                      competition={event.competition}
                      colorClasses={competitionColors[event.competition] || 'bg-green-100 text-green-700 ring-green-700/20'}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {event.a_team_logo && (event.a_team_logo.startsWith('http') ? (
                        <img src={event.a_team_logo} alt={event.a_team} className="w-6 h-6 object-contain mr-2" />
                      ) : (
                        <span className="mr-2">{event.a_team_logo}</span>
                      ))}
                      <span className=''>{event.a_team }</span>
                      <span className="mx-4">vs</span>
                      <span className=''>{event.b_team}</span>
                      {event.b_team_logo && (event.b_team_logo.startsWith('http') ? (
                        <img src={event.b_team_logo} alt={event.b_team} className="w-6 h-6 object-contain ml-2" />
                      ) : (
                        <span className="ml-2">{event.b_team_logo}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{eventTime.format('dddd, M/D')} @ {eventTime.format('h:mm A')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.sound ? 'On' : 'Off'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.earlyOpening && event.openingTime ? moment(event.openingTime, 'HH:mm:ss').format('h:mm A') : ''}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BarUpcomingMatchesTable;