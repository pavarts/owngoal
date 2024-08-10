import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import FilterInput from './FilterInput';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

Modal.setAppElement('#root'); // Make sure to set the root element for accessibility

const libraries = ['places'];

const Bars = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const autocompleteRef = useRef(null);
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [newBar, setNewBar] = useState({
    name: '',
    latitude: '',
    longitude: '',
    place_id: '',
    location: '',
    city: '',
    state: '',
    neighborhood: '',
    capacity: '',
    phone: '',
    instagram: '',
    website: '',
    photos: '',
    numberOfTVs: '',
    hasOutdoorSpace: false,
    bio: '',
    supportedTeams: [],
    hidden: false
  });
  const [editingBar, setEditingBar] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [filter, setFilter] = useState({ name: '', location: '' });
  const [teams, setTeams] = useState([]);
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);

  useEffect(() => {
    fetchBars();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (bars.length > 0) {
      applyFilter(filter, showHiddenOnly);
    }
  }, [bars, filter, showHiddenOnly]);

  const fetchBars = async () => {
    try {
      const response = await axios.get('http://localhost:3000/bars?includeHidden=true', getAuthHeader());
      const barsWithTeams = response.data.map(bar => ({
        ...bar,
        supportedTeams: bar.supportedTeams || []
      }));
      setBars(barsWithTeams);
      setFilteredBars(barsWithTeams);  // Set filtered bars initially to all bars
    } catch (error) {
      console.error('Error fetching bars:', error);
    }
  };
  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:3000/teams', getAuthHeader());
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const openModal = (bar = null) => {
    setEditingBar(bar);
    setNewBar(bar || {
      name: '',
      latitude: '',
      longitude: '',
      place_id: '',
      location: '',
      capacity: '',
      phone: '',
      instagram: '',
      website: '',
      photos: '',
      numberOfTVs: '',
      hasOutdoorSpace: false,
      bio: '',
      supportedTeams: [] // Initialize as an empty array for new bars
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingBar(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, options } = e.target;
    if (name === 'supportedTeams') {
      const selectedTeams = Array.from(options)
        .filter(option => option.selected)
        .map(option => teams.find(team => team.id === parseInt(option.value)));
      setNewBar({ ...newBar, supportedTeams: selectedTeams });
    } else {
      setNewBar({ ...newBar, [name]: value });
    }
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNewBar({ ...newBar, [name]: checked });
  };

  const handleAddOrEditBar = async (e) => {
    e.preventDefault();
    try {
      const barData = {
        ...newBar,
        supportedTeams: newBar.supportedTeams.map(team => team.id)
      };
      if (editingBar) {
        await axios.put(`http://localhost:3000/bars/${editingBar.place_id}`, barData, getAuthHeader());
      } else {
        await axios.post('http://localhost:3000/bars', barData, getAuthHeader());
      }
      closeModal();
      fetchBars();
    } catch (error) {
      console.error(`Error ${editingBar ? 'updating' : 'adding'} bar:`, error.response?.data);
    }
  };

  const handleDeleteBar = async (place_id) => {
    try {
      await axios.delete(`http://localhost:3000/bars/${place_id}`, getAuthHeader());
      fetchBars();
    } catch (error) {
      console.error('Error deleting bar:', error);
    }
  };

  const handleSort = (column) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === column && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: column, direction: direction });
    const sortedBars = [...filteredBars].sort((a, b) => {
      if (a[column] < b[column]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[column] > b[column]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setFilteredBars(sortedBars);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    applyFilter({ ...filter, [name]: value });
  };

  const applyFilter = (filter, hiddenOnly) => {
    const filtered = bars.filter(bar => 
      (bar.name?.toLowerCase() || '').includes(filter.name.toLowerCase()) &&
      (bar.location?.toLowerCase() || '').includes(filter.location.toLowerCase()) &&
      (hiddenOnly ? bar.hidden : true)
    );
    setFilteredBars(filtered);
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place) {
      const { name, geometry, place_id, formatted_address, formatted_phone_number, website, editorial_summary } = place;
      
      let city = '';
      let state = '';
      for (let component of place.address_components) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
      }
      setNewBar({
        ...newBar,
        name: name || newBar.name,
        latitude: geometry?.location?.lat() || newBar.latitude,
        longitude: geometry?.location?.lng() || newBar.longitude,
        place_id: place_id || newBar.place_id,
        location: formatted_address || newBar.location,
        city: city || newBar.city,
        state: state || newBar.state,
        phone: formatted_phone_number || newBar.phone,
        website: website || newBar.website,
        bio: editorial_summary?.overview || newBar.bio
      });
    }
  };

  const handleToggleHidden = async (place_id) => {
    try {
      const updatedBars = bars.map(bar => {
        if (bar.place_id === place_id) {
          return { ...bar, hidden: !bar.hidden };
        }
        return bar;
      });
      setBars(updatedBars);
      setFilteredBars(updatedBars);
  
      const bar = updatedBars.find(b => b.place_id === place_id);
      await axios.put(`http://localhost:3000/bars/${place_id}`, {
        ...bar,
        supportedTeams: bar.supportedTeams.map(team => team.id)
      }, getAuthHeader());
    } catch (error) {
      console.error('Error toggling bar visibility:', error);
      // Revert the change if the API call fails
      fetchBars();
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Bars</h2>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add Bar
      </button>
      <div className="flex mb-4">
        <FilterInput name="name" placeholder="Filter by name" value={filter.name} onChange={handleFilterChange} />
        <FilterInput name="location" placeholder="Filter by location" value={filter.location} onChange={handleFilterChange} />
        <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="form-checkbox"
          checked={showHiddenOnly}
          onChange={(e) => {
            const newShowHiddenOnly = e.target.checked;
            setShowHiddenOnly(newShowHiddenOnly);
            applyFilter(filter, newShowHiddenOnly);
          }}
        />
        <span className="ml-2">Show hidden bars only</span>
        </label>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border sticky left-0 z-10">Actions</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('hidden')}>Hidden</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('place_id')}>Place ID</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('name')}>Name</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('latitude')}>Latitude</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('longitude')}>Longitude</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('location')}>Location</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('city')}>City</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('state')}>State</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('neighborhood')}>Neighborhood</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('capacity')}>Capacity</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('phone')}>Phone</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('instagram')}>Instagram</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('website')}>Website</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('photos')}>Photos</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('numberOfTVs')}>Number of TVs</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('hasOutdoorSpace')}>Has Outdoor Space</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('bio')}>Bio</th>
              <th className="py-2 px-4 border cursor-pointer" onClick={() => handleSort('supportedTeams')}>Supported Teams</th>
            </tr>
          </thead>
          <tbody>
            {filteredBars.map(bar => (
              <tr key={bar.place_id}>
                <td className="py-2 px-4 border sticky left-0 bg-gray-100 z-10">
                  <button onClick={() => openModal(bar)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteBar(bar.place_id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                    Delete
                  </button>
                </td>
                <td className="py-2 px-4 border">
                  <input
                    type="checkbox"
                    checked={bar.hidden}
                    onChange={() => handleToggleHidden(bar.place_id)}
                  />
                </td>
                <td className="py-2 px-4 border">{bar.place_id}</td>
                <td className="py-2 px-4 border">{bar.name}</td>
                <td className="py-2 px-4 border">{bar.latitude}</td>
                <td className="py-2 px-4 border">{bar.longitude}</td>
                <td className="py-2 px-4 border">{bar.location}</td>
                <td className="py-2 px-4 border">{bar.city}</td>
                <td className="py-2 px-4 border">{bar.state}</td>
                <td className="py-2 px-4 border">{bar.neighborhood}</td>
                <td className="py-2 px-4 border">{bar.capacity}</td>
                <td className="py-2 px-4 border">{bar.phone}</td>
                <td className="py-2 px-4 border">{bar.instagram}</td>
                <td className="py-2 px-4 border">{bar.website}</td>
                <td className="py-2 px-4 border">{bar.photos}</td>
                <td className="py-2 px-4 border">{bar.numberOfTVs}</td>
                <td className="py-2 px-4 border">{bar.hasOutdoorSpace ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4 border">{bar.bio}</td>
                <td className="py-2 px-4 border">
                  {bar.supportedTeams ? bar.supportedTeams.map(team => team.name).join(', ') : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add/Edit Bar"
        className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      >
        <div className="bg-white p-8 rounded shadow-md max-w-md mx-auto mt-20">
          <h3 className="text-xl font-bold mb-4">{editingBar ? 'Edit Bar' : 'Add New Bar'}</h3>
          <form onSubmit={handleAddOrEditBar}>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Name</label>
              <Autocomplete onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} onPlaceChanged={handlePlaceChanged}>
                <input
                  type="text"
                  name="name"
                  value={newBar.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </Autocomplete>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={newBar.latitude}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={newBar.longitude}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Place ID</label>
              <input
                type="text"
                name="place_id"
                value={newBar.place_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={newBar.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">City</label>
              <input
                type="text"
                name="city"
                value={newBar.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">State</label>
              <input
                type="text"
                name="state"
                value={newBar.state}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Neighborhood (if applicable)</label>
              <input
                type="text"
                name="neighborhood"
                value={newBar.neighborhood}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={newBar.capacity}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                step="1" // This ensures the input increments by 1 when using the up/down arrows
                min="0" // Optional: Sets the minimum value to 0
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={newBar.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Instagram</label>
              <input
                type="text"
                name="instagram"
                value={newBar.instagram}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Website</label>
              <input
                type="text"
                name="website"
                value={newBar.website}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Photos</label>
              <input
                type="text"
                name="photos"
                value={newBar.photos}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Number of TVs</label>
              <input
                type="number"
                name="numberOfTVs"
                value={newBar.numberOfTVs}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                step="1" // This ensures the input increments by 1 when using the up/down arrows
                min="0" // Optional: Sets the minimum value to 0
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Has Outdoor Space</label>
              <input
                type="checkbox"
                name="hasOutdoorSpace"
                checked={newBar.hasOutdoorSpace}
                onChange={handleCheckboxChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Bio</label>
              <textarea
                name="bio"
                value={newBar.bio}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Supported Teams</label>
              <select
                multiple
                name="supportedTeams"
                value={newBar.supportedTeams?.map(team => team.id.toString()) || []}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                size="5" // This will show 5 options at a time, adjust as needed
              >
                {teams
                .sort((a, b) => a.name.localeCompare(b.name)) 
                .map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Hold Ctrl (Cmd on Mac) to select multiple teams</p>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">
                <input
                  type="checkbox"
                  name="hidden"
                  checked={newBar.hidden}
                  onChange={(e) => setNewBar({ ...newBar, hidden: e.target.checked })}
                />
                Hidden
              </label>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={closeModal} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                Cancel
              </button>
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                {editingBar ? 'Update Bar' : 'Add Bar'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Bars;
