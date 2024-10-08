import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Table from './Table.jsx';
import CompetitionBadge from './CompetitionBadge.jsx';
import { competitionColors } from '../config/competitionColors';
import moment from 'moment-timezone';

function formatDate(dateString, timeString) {
  return moment.utc(`${dateString}T${timeString}`).local().format('ddd, M/D');
}

function formatTime(dateString, timeString) {
  return moment.utc(`${dateString}T${timeString}`).local().format('h:mm A');
}

const UpcomingMatchesTable = ({ teamId }) => {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/matches/upcoming')
      .then(response => response.json())
      .then(data => {
        console.log('Received match data:', data);
        let filteredMatches = teamId
          ? data.filter(match => match.aTeamId === parseInt(teamId) || match.bTeamId === parseInt(teamId))
          : data;
        
        filteredMatches.sort((a, b) => {
          const dateTimeA = moment.utc(`${a.date}T${a.time}`);
          const dateTimeB = moment.utc(`${b.date}T${b.time}`);
          return dateTimeA - dateTimeB;
        });
  
        setMatches(filteredMatches);
      })
      .catch(error => console.error('Error fetching matches:', error));
  }, [teamId]);
  
  const headers = ["", "", "MATCH", "", "", "TIME", "", ""];
  
  const columnStyles = [
    { width: '12%' }, { width: '19%' }, { width: '5%' }, { width: '19%' },
    { width: '10%' }, { width: '5%' }, { width: '10%' }, { width: '20%' },
  ];

  const textAlignments = [
    'text-center', 'text-right', 'text-center', 'text-left',
    'text-right', 'text-center', 'text-left', 'text-center',
  ];

  const handleMouseEnter = (e) => {
    const row = e.currentTarget;
    const findBarButton = row.querySelector('.find-a-bar-button');
    const soccerBall = findBarButton.querySelector('.soccer-ball');
    const rightArrow = findBarButton.querySelector('.right-arrow');

    row.classList.add('highlight-row');
    findBarButton.classList.add('hovered');
    soccerBall.classList.remove('rolling-back');
    soccerBall.style.animation = 'roll 0.5s forwards ease-in-out';
    rightArrow.style.right = '10px';
    rightArrow.style.opacity = '1';
  };

  const handleMouseLeave = (e) => {
    const row = e.currentTarget;
    const findBarButton = row.querySelector('.find-a-bar-button');
    const soccerBall = findBarButton.querySelector('.soccer-ball');
    const rightArrow = findBarButton.querySelector('.right-arrow');

    row.classList.remove('highlight-row');
    findBarButton.classList.remove('hovered');
    soccerBall.classList.add('rolling-back');
    soccerBall.style.animation = 'roll-back 0.5s forwards ease-in-out';
    rightArrow.style.right = '-20px';
    rightArrow.style.opacity = '0';
  };

  const handleRowClick = (matchId) => {
    navigate(`/matches/${matchId}`);
  };

  return (
    <div style={{ position: 'relative', maxHeight: 'calc(100vh - 1rem - 28rem)', overflowY: 'auto' }} className="rounded-lg bg-blue-300 bg-opacity-40 mt-8 shadow-lg"> 
      <Table headers={headers} columnStyles={columnStyles} textAlignments={textAlignments}> 
        {matches.length === 0 ? (
          <tr>
            <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">No upcoming matches found.</td>
          </tr>
        ) : (
          matches.map(match => (
          <tr 
            key={match.id}
            className="align-middle cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleRowClick(match.id)}
          >
            {textAlignments.map((alignment, index) => (
              <td key={index} className={`align-middle ${alignment}`} style={columnStyles[index]}>
                {index === 0 && (
                  <CompetitionBadge
                    competition={match.competition}
                    colorClasses={competitionColors[match.competition] || 'bg-green-100 text-green-700 ring-green-700/20'}
                  />
                )}
                {index === 1 && (
                  <div className="flex items-center justify-end">
                    {match.a_team_logo && (
                      <span className="inline-flex items-center mr-2">
                        {match.a_team_logo.startsWith('http') ? (
                          <img src={match.a_team_logo} alt={match.a_team} className="team-logo" />
                        ) : (
                          <span>{match.a_team_logo}</span>
                        )}
                      </span>
                    )}
                    <span>{match.a_team_short_name}</span>
                  </div>
                )}
                {index === 2 && "vs"}
                {index === 3 && (
                  <div className="flex items-center justify-start">
                    <span>{match.b_team_short_name}</span>
                    {match.b_team_logo && (
                      <span className="inline-flex items-center ml-2">
                        {match.b_team_logo.startsWith('http') ? (
                          <img src={match.b_team_logo} alt={match.b_team} className="team-logo" />
                        ) : (
                          <span>{match.b_team_logo}</span>
                        )}
                      </span>
                    )}
                  </div>
                )}
                {index === 4 && formatDate(match.date, match.time)}
                {index === 5 && "@"}
                {index === 6 && formatTime(match.date, match.time)}
                {index === 7 && (
                  <div className="find-a-bar-button">
                    Find a bar
                    <div className="soccer-ball"></div>
                    <div className="right-arrow">➜</div>
                  </div>
                )}
              </td>
            ))}
          </tr>
        ))
        )}
      </Table>
    </div>
  );
};

export default UpcomingMatchesTable;