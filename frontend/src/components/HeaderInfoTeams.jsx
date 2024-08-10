import React, { useEffect, useRef } from 'react';
import CompetitionBadge from './CompetitionBadge';
import { competitionColors } from '../config/competitionColors';

const HeaderInfoTeams = ({ team }) => {
    const teamNameRef = useRef(null);

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

        if (teamNameRef.current) resizeText(teamNameRef.current);
    }, [team.name]);

    if (!team) return null;

    return (
        <div className="w-full flex flex-col items-center pt-8 pb-4 header-gradient overflow-hidden relative">
            <div className="versus-symbol">||</div>
            {team.competitions && team.competitions.length > 0 && team.competitions.map((competition) => (
                <CompetitionBadge 
                    key={competition.id}
                    competition={competition.name} 
                    colorClasses={competitionColors[competition.name] || "bg-green-100 text-green-700 ring-green-700/20 mb-2 z-10"} 
                />
            ))}
            <div className="flex flex-row items-center justify-between w-full">
                <div className="w-5/12 relative">
                    {team.logo && (
                        <span className="absolute inset-y-0 left-0 flex items-center">
                            <img src={team.logo} alt={team.name} className="team-logo-background object-contain" />
                        </span>
                    )}
                    <h1 ref={teamNameRef} className="text-5xl font-bold uppercase text-center relative z-10 text-gray-800 whitespace-nowrap overflow-hidden">
                        <span className="team-name-highlight">
                            {team.name}
                        </span>
                    </h1>
                </div>
            </div>
            {team.city && team.country && (
                <p className="text-center text-lg mt-8 relative z-10 text-white inline-block">
                    <span className='font-semibold'>{team.city}, {team.country}</span>
                </p>
            )}
        </div>
    );
};

export default HeaderInfoTeams;