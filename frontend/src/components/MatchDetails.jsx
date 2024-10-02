// src/components/MatchDetails.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Map from './Map';
import HeaderInfo from './HeaderInfo';
import BarsTable from './BarsTable';
import { GoogleMapsContext } from '../contexts/GoogleMapsProvider';

const MatchDetails = () => {
  const { matchId } = useParams();
  const { isLoaded } = useContext(GoogleMapsContext);
  const [match, setMatch] = useState(null);
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to New York City

  const [soundFilter, setSoundFilter] = useState('Any');
  const [supporterFilter, setSupporterFilter] = useState('Any');

  useEffect(() => {
    const savedZipCode = localStorage.getItem('zipCode');
    if (savedZipCode) {
      setZipCode(savedZipCode);
      fetchCoordinatesFromZip(savedZipCode);
    }

    fetch(`${process.env.REACT_APP_API_URL}/matches/${matchId}`)
      .then(response => response.json())
      .then(data => setMatch(data))
      .catch(error => console.error('Error fetching match details:', error));

    fetch(`${process.env.REACT_APP_API_URL}/matches/${matchId}/bars`)
      .then(response => response.json())
      .then(data => setBars(data))
      .catch(error => console.error('Error fetching bars:', error));
  }, [matchId]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const newCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newCenter);
        setMapCenter(newCenter); // Update map center
      });
    }
  }, []);

  const fetchCoordinatesFromZip = (zip) => {
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
    
    fetch(geocodingUrl)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const newCenter = {
            lat: location.lat,
            lng: location.lng,
          };
          setUserLocation(newCenter);
          setMapCenter(newCenter); // Update map center
          localStorage.setItem('zipCode', zip); // Save ZIP code to local storage
        } else {
          console.error('Error fetching coordinates:', data);
        }
      })
      .catch(error => console.error('Error fetching coordinates:', error));
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = value => (value * Math.PI) / 180;
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
  };

  useEffect(() => {
    const applyFilters = () => {
      let filtered = bars;
  
      if (userLocation) {
        const maxDistance = 50; // Maximum distance in miles
  
        filtered = filtered
          .map(bar => ({
            ...bar,
            distance: calculateDistance(userLocation.lat, userLocation.lng, bar.lat, bar.lng)
          }))
          .filter(bar => bar.distance <= maxDistance)
          .sort((a, b) => a.distance - b.distance);
      }
  
      if (soundFilter !== 'Any') {
        const soundOn = soundFilter === 'On';
        filtered = filtered.filter(bar => bar.sound === soundOn);
      }
  
      if (supporterFilter !== 'Any') {
        filtered = filtered.filter(bar => bar.supportedTeams.includes(supporterFilter));
      }
  
      setFilteredBars(filtered);
    };
  
    applyFilters();
  }, [bars, soundFilter, supporterFilter, userLocation]);

  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  if (!match) {
    return <div>Loading match details...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <HeaderInfo match={match} />
      <div className="h-1 w-full bg-gradient-to-r from-custom-blue to-lime-green"></div>
      <div className="flex justify-start items-center mt-6 pl-6">
        <h2 className="text-4xl font-bold text-white">Find a bar</h2>
      </div>
      <div className="p-4 flex flex-grow overflow-hidden">
        <div className="w-2/3 p-2 overflow-auto h-full">
          <BarsTable
            bars={bars}
            filteredBars={filteredBars}
            userLocation={userLocation}
            zipCode={zipCode}
            setZipCode={setZipCode}
            fetchCoordinatesFromZip={fetchCoordinatesFromZip}
            soundFilter={soundFilter}
            setSoundFilter={setSoundFilter}
            supporterFilter={supporterFilter}
            setSupporterFilter={setSupporterFilter}
            match={match}
            calculateDistance={calculateDistance}
            hoveredBar={hoveredBar}
            setHoveredBar={setHoveredBar}
          />
        </div>
        <div className="w-1/3 p-2 overflow-auto h-full">
          <Map bars={filteredBars} center={mapCenter} hoveredBar={hoveredBar} />
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
