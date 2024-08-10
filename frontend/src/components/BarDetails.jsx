import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BarHeader from './BarHeader';
import BarUpcomingMatchesTable from './BarUpcomingMatchesTable';
import moment from 'moment-timezone';

const BarDetails = () => {
  const { place_id } = useParams();
  const [bar, setBar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTimezone, setUserTimezone] = useState('');

  useEffect(() => {
    const timezone = moment.tz.guess();
    const abbreviation = moment.tz(timezone).zoneAbbr();
    setUserTimezone(abbreviation);
  }, []);

  useEffect(() => {
    const fetchBarDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/bars/${place_id}`);
        const barData = response.data;
        
        // Ensure supportedTeams is an array, even if it's not provided by the API
        barData.supportedTeams = barData.supportedTeams || [];

        setBar(barData);
      } catch (error) {
        console.error('Error fetching bar details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarDetails();
  }, [place_id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!bar) {
    return <div>Bar not found.</div>;
  }

  return (
    <div className="relative z-0"> {/* Add relative positioning and z-index */}
      <BarHeader bar={bar} placeId={place_id} />
      <div className="mt-8 p-6 relative z-0"> {/* Add relative positioning and z-index */}
        <h3 className="text-4xl font-bold text-white mb-4">Upcoming Matches</h3>
        <BarUpcomingMatchesTable place_id={place_id} />
        <p className="absolute mt-1 text-sm text-gray-200 italic text-left">
          All times are in {userTimezone}
        </p>
      </div>
    </div>
  );
};
export default BarDetails;