import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import HeaderInfoTeams from './HeaderInfoTeams';
import UpcomingMatchesTable from './UpcomingMatchesTable';

const TeamDetails = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/teams/${id}`);
        console.log('Team data:', response.data); // For debugging
        setTeam(response.data);
      } catch (error) {
        console.error('Error fetching team details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!team) {
    return <div>Team not found.</div>;
  }

  return (
    <div className="relative z-0"> {/* Add a relative positioning context */}
      <div className="relative z-10"> {/* Ensure header is above the content but below SearchResults */}
        <HeaderInfoTeams team={team} />
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-custom-blue to-lime-green"></div>
      <div className="mt-8 p-6 relative z-0"> {/* Ensure content is below the header */}
        <h3 className="text-4xl font-bold text-white mb-4">Upcoming Matches</h3>
        <UpcomingMatchesTable teamId={id} />
      </div>
    </div>
  );
};

export default TeamDetails;