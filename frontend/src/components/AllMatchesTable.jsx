import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from './Table.jsx';
import CompetitionBadge from './CompetitionBadge.jsx';
import { competitionColors } from '../config/competitionColors';
import moment from 'moment-timezone';
import Pagination from './Pagination.jsx';

function formatDate(dateString) {
  return moment.utc(dateString).local().format('ddd, M/D');
}

function formatTime(dateString, timeString) {
  return moment.utc(`${dateString}T${timeString}`).local().format('h:mm A');
}

const AllMatchesTable = ({ matches, currentPage, setCurrentPage, matchesPerPage }) => {
  const navigate = useNavigate();

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const dateTimeA = moment.utc(`${a.date}T${a.time}`);
      const dateTimeB = moment.utc(`${b.date}T${b.time}`);
      return dateTimeA - dateTimeB;
    });
  }, [matches]);

  // Get current matches
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = sortedMatches.slice(indexOfFirstMatch, indexOfLastMatch);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    <div className="bg-blue-300 bg-opacity-40 rounded-lg overflow-hidden">
      <Table 
        headers={headers} 
        columnStyles={columnStyles} 
        textAlignments={textAlignments}
        stickyHeader={false}
      >
        {currentMatches.map(match => (
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
                {index === 4 && formatDate(match.date)}
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
        ))}
       </Table>
       <Pagination
        itemsPerPage={matchesPerPage}
        totalItems={sortedMatches.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
};



export default AllMatchesTable;