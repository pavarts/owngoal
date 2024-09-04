import React, { useEffect, useRef } from 'react';
import CompetitionBadge from './CompetitionBadge';
import moment from 'moment-timezone';
import { competitionColors } from '../config/competitionColors';
import { Link } from 'react-router-dom';

function formatDate(dateString, timeString) {
    return moment.utc(`${dateString}T${timeString}`).local().format('dddd, MMMM Do, YYYY');
  }
  
  function formatTime(dateString, timeString) {
    const localDateTime = moment.utc(`${dateString}T${timeString}`).local();
    const timeFormat = localDateTime.format('h:mmA');
    const timezone = moment.tz.guess();
    const abbreviation = moment.tz(timezone).zoneAbbr();
    return `${timeFormat} ${abbreviation}`;
  }

const HeaderInfo = ({ match }) => {

    const teamARef = useRef(null);
    const teamBRef = useRef(null);

    useEffect(() => {
        const resizeText = (element) => {
            const container = element.parentElement;
            const fontSize = parseInt(window.getComputedStyle(element).fontSize);
            element.style.fontSize = `${fontSize}px`;

            while (element.scrollWidth > container.clientWidth) {
                const newSize = parseInt(element.style.fontSize) - 1;
                element.style.fontSize = `${newSize}px`;
            }
        };

        if (teamARef.current) resizeText(teamARef.current);
        if (teamBRef.current) resizeText(teamBRef.current);
    }, [match.a_team, match.b_team]);


    return (
        <div className="w-full flex flex-col items-center pt-8 pb-4 header-gradient overflow-hidden relative z-[1]">
        <div className="versus-symbol">//</div>
        <CompetitionBadge competition={match.competition} colorClasses={competitionColors[match.competition] || "bg-green-100 text-green-700 ring-green-700/20 mb-2 z-10"} />
            <div className="flex flex-row items-center justify-between w-full">
                <div className="w-5/12 relative">
                    {match.a_team_logo && (
                        <span className="absolute inset-y-0 left-0 flex items-center">
                            {match.a_team_logo.startsWith('http') ? (
                                <img src={match.a_team_logo} alt={match.a_team} className="team-logo-background object-contain" />
                            ) : (
                                <span>{match.a_team_logo}</span>
                            )}
                        </span>
                    )}
                    <h1 ref={teamARef} className="text-5xl font-bold uppercase text-center relative z-10 text-gray-800 whitespace-nowrap overflow-hidden">
                        <Link to={`/teams/${match.aTeamId}`} className="team-name-highlight">
                            {match.a_team}
                        </Link>
                    </h1>
                </div>
                <div className="w-5/12 relative">
                    {match.b_team_logo && (
                        <span className="absolute inset-y-0 right-0 flex items-center">
                            {match.b_team_logo.startsWith('http') ? (
                                <img src={match.b_team_logo} alt={match.b_team} className="team-logo-background object-contain" />
                            ) : (
                                <span>{match.b_team_logo}</span>
                            )}
                        </span>
                    )}
                    <h1 ref={teamBRef} className="text-5xl font-bold uppercase text-center relative z-10 text-gray-800 whitespace-nowrap overflow-hidden">
                        <Link to={`/teams/${match.bTeamId}`} className="team-name-highlight">
                            {match.b_team}
                        </Link>
                    </h1>
                </div>
            </div>
            <p className="text-center text-lg mt-8 relative z-10 text-white  inline-block">
                <span className=' font-semibold'>{formatDate(match.date, match.time)} </span> 
                <span className='text-black font-bold text-xl'>@</span>
                <span className=' font-semibold '> {formatTime(match.date, match.time)}</span>
            </p>
            {/* <p className="text-center font-semibold text-lg relative z-10 text-white">{formatTime(match.date, match.time)}</p> */}
        </div>
    );
};

export default HeaderInfo;
