import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from './Map';
import AllBarsTable from './AllBarsTable';

const AllBars = () => {
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to New York City
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [zipCode, setZipCode] = useState('');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [barsPerPage] = useState(10);

  useEffect(() => {
    fetchBars();
    fetchTeams();
  }, []);

  const fetchBars = async () => {
    try {
      const response = await axios.get('http://localhost:3000/bars');
      const validBars = response.data.filter(bar => 
        bar.latitude && bar.longitude && 
        !isNaN(parseFloat(bar.latitude)) && !isNaN(parseFloat(bar.longitude))
      );
      const sortedBars = validBars.sort((a, b) => 
        calculateDistance(userLocation.lat, userLocation.lng, parseFloat(a.latitude), parseFloat(a.longitude)) - 
        calculateDistance(userLocation.lat, userLocation.lng, parseFloat(b.latitude), parseFloat(b.longitude))
      );
      setBars(sortedBars);
      setFilteredBars(sortedBars);
    } catch (error) {
      console.error('Error fetching bars:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:3000/teams');
      const sortedTeams = response.data.sort((a, b) => a.name.localeCompare(b.name));
      setTeams(sortedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchCoordinatesFromZip = async () => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);
      if (response.data.results && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        setUserLocation({ lat, lng });
        setMapCenter({ lat, lng });
        // Re-sort bars based on new location
        const sortedBars = [...bars].sort((a, b) => 
          calculateDistance(lat, lng, parseFloat(a.latitude), parseFloat(a.longitude)) - 
          calculateDistance(lat, lng, parseFloat(b.latitude), parseFloat(b.longitude))
        );
        setBars(sortedBars);
        setFilteredBars(sortedBars);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };

  useEffect(() => {
    const filtered = bars.filter(bar => {
      const matchesSearch = bar.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = selectedTeam === '' || bar.supportedTeams.some(team => team.id === parseInt(selectedTeam));
      return matchesSearch && matchesTeam;
    });
    setFilteredBars(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedTeam, bars]);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return parseFloat(distance.toFixed(2));
  };

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-5xl font-semibold mb-6 text-white">Bars</h1>
      
      <div className="mb-6 mt-12 flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center">
          <input
            type="text"
            className="px-3 py-2 rounded-l-full text-xs bg-gray-200 text-gray-600"
            placeholder="Enter your zip code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchCoordinatesFromZip();
              }
            }}
          />
          <button
            onClick={fetchCoordinatesFromZip}
            className="px-3 py-2 rounded-r-full bg-blue-500 text-white text-xs"
          >
            Update Location
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Search bars..."
          className="p-2 rounded-md flex-grow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select
          className="p-2 rounded-md appearance-none"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em 1em' }}
        >
          <option value="">All Supported Teams</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex">
        <div className="w-1/2 pr-4 h-[calc(100vh-300px)] overflow-y-auto"> {/* Add fixed height and overflow */}
          <AllBarsTable 
            filteredBars={filteredBars}
            userLocation={userLocation}
            calculateDistance={calculateDistance}
            hoveredBar={hoveredBar}
            setHoveredBar={setHoveredBar}
            currentPage={currentPage}
            barsPerPage={barsPerPage}
            paginate={paginate}
          />
        </div>
        <div className="w-1/2 pl-4 h-[calc(100vh-300px)]"> {/* Add fixed height */}
          <Map 
            bars={filteredBars.map(bar => ({
              ...bar,
              lat: parseFloat(bar.latitude),
              lng: parseFloat(bar.longitude)
            }))} 
            center={mapCenter} 
            hoveredBar={hoveredBar}
          />
        </div>
      </div>
    </div>
  );
};


export default AllBars;