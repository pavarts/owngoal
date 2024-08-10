import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BarProfile = () => {
  const [barInfo, setBarInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editInfo, setEditInfo] = useState({});
  const [allTeams, setAllTeams] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchBarInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const [barResponse, teamsResponse] = await Promise.all([
          axios.get('http://localhost:3000/bar-profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/teams', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setBarInfo({...barResponse.data, hasOutdoorSpace: barResponse.data.hasOutdoorSpace === true, place_id: barResponse.data.place_id});
        setAllTeams(teamsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load bar profile');
        setLoading(false);
      }
    };
    fetchBarInfo();
  }, []);

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^(\+1|1)?[-.\s]?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    return phoneRegex.test(phone);
  };
  
  const isValidUrl = (url) => {
    if (!url) return true; // Allow empty values
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlRegex.test(url);
  };
  
  const handleEdit = () => {
    setEditInfo({ 
      ...barInfo,
      supportedTeams: barInfo.supportedTeams?.map(team => team.id) || []
    });
    setIsEditing(true);
    setValidationErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
  
    if (name === 'phone') {
      newValue = formatPhoneNumber(value);
    }
  
    setEditInfo({
      ...editInfo,
      [name]: newValue,
    });
  };

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!isValidPhoneNumber(editInfo.phone)) {
      errors.phone = 'Invalid phone number';
    }
    if (!isValidUrl(editInfo.instagram)) {
      errors.instagram = 'Invalid Instagram URL';
    }
    if (!isValidUrl(editInfo.website)) {
      errors.website = 'Invalid website URL';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSupportedTeamsChange = (teamId) => {
    setEditInfo(prevState => {
      const currentTeams = prevState.supportedTeams || [];
      if (teamId === '') {
        // If "No team" is selected, clear all other selections
        return { ...prevState, supportedTeams: [] };
      } else if (currentTeams.includes(teamId)) {
        // If the team is already selected, remove it
        return { ...prevState, supportedTeams: currentTeams.filter(id => id !== teamId) };
      } else {
        // Otherwise, add the team
        return { ...prevState, supportedTeams: [...currentTeams, teamId] };
      }
    });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const place_id = barInfo.place_id;
      if (!place_id) {
        throw new Error('Bar place_id is missing');
      }
      await axios.put(`http://localhost:3000/bars/${place_id}`, editInfo, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const updatedBarInfo = { ...barInfo, ...editInfo };
      updatedBarInfo.supportedTeams = allTeams.filter(team => editInfo.supportedTeams.includes(team.id));
      setBarInfo(updatedBarInfo);
      setIsEditing(false);
      setValidationErrors({});
    } catch (error) {
      console.error('Error updating bar info:', error);
      setError('Failed to update bar profile');
    }
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!barInfo) return <div>No bar profile found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-white mb-4 mt-6">My Bar's Profile</h1>
      <hr className="mb-8 border-gray-200" />
      <form>
        <div className="mb-4">
          <label className="block mb-2 text-white font-semibold">Name</label>
          <input
            type="text"
            name="name"
            value={barInfo.name}
            readOnly
            className="w-full p-2 border rounded bg-white focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block mb-2 text-white font-semibold">Location</label>
            <input
              type="text"
              name="location"
              value={barInfo.location}
              readOnly
              className="w-full p-2 border rounded bg-white focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-white font-semibold">Neighborhood</label>
            <input
              type="text"
              name="neighborhood"
              value={isEditing ? editInfo.neighborhood : barInfo.neighborhood}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full p-2 border rounded ${isEditing ? 'bg-orange-100 focus:border-blue-500 focus:ring focus:ring-blue-200' : 'focus:outline-none'}`}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="mb-4">
            <label className="block mb-2 text-white font-semibold">
              Phone
              {validationErrors.phone && <span className="text-red-800 ml-2 text-sm">{validationErrors.phone}</span>}
            </label>
            <input
              type="text"
              name="phone"
              value={isEditing ? editInfo.phone : barInfo.phone}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full p-2 border rounded ${isEditing ? 'bg-orange-100' : ''} ${validationErrors.phone ? 'border-red-800 border-2' : ''}`}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-white font-semibold">
              Instagram
              {validationErrors.instagram && <span className="text-red-800 ml-2 text-sm">{validationErrors.instagram}</span>}
            </label>
            <input
              type="text"
              name="instagram"
              value={isEditing ? editInfo.instagram : barInfo.instagram}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full p-2 border rounded ${isEditing ? 'bg-orange-100' : ''} ${validationErrors.instagram ? 'border-red-800 border-2' : ''}`}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-white font-semibold">
              Website
              {validationErrors.website && <span className="text-red-800 ml-2 text-sm">{validationErrors.website}</span>}
            </label>
            <input
              type="text"
              name="website"
              value={isEditing ? editInfo.website : barInfo.website}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full p-2 border rounded ${isEditing ? 'bg-orange-100' : ''} ${validationErrors.website ? 'border-red-800 border-2' : ''}`}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-white font-semibold">Bio (max 300 characters)</label>
          <textarea
            name="bio"
            value={isEditing ? editInfo.bio : barInfo.bio}
            onChange={handleChange}
            readOnly={!isEditing}
            maxLength={300}
            rows={4}
            className={`w-full p-2 border rounded ${isEditing ? 'bg-orange-100 focus:border-blue-500 focus:ring focus:ring-blue-200' : 'focus:outline-none'}`}
          />
          {isEditing && (
            <p className="text-sm text-orange-100 mt-1">
              {300 - (editInfo.bio?.length || 0)} characters remaining
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="flex items-center text-white font-semibold">
          <span>Have outdoor TVs?</span>
            <input
              type="checkbox"
              name="hasOutdoorSpace"
              checked={isEditing ? editInfo.hasOutdoorSpace : barInfo.hasOutdoorSpace}
              onChange={handleChange}
              disabled={!isEditing}
              className="ml-2"
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-white font-semibold">
            Supported Teams: 
            {!isEditing && (
              <span className="ml-2 font-normal">
                {barInfo.supportedTeams && barInfo.supportedTeams.length > 0
                  ? barInfo.supportedTeams.map(team => team.name).join(', ')
                  : 'None'}
              </span>
            )}
          </label>
          {isEditing && (
            <div className="max-h-48 overflow-y-auto bg-orange-100 rounded p-2">
              <div className="mb-2">
                <label className="flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    value=""
                    checked={editInfo.supportedTeams?.length === 0}
                    onChange={() => handleSupportedTeamsChange('')}
                    className="mr-2"
                  />
                  No team
                </label>
              </div>
              {allTeams
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(team => (
                  <div key={team.id} className="mb-2">
                    <label className="flex items-center text-gray-700">
                      <input
                        type="checkbox"
                        value={team.id}
                        checked={editInfo.supportedTeams?.includes(team.id)}
                        onChange={() => handleSupportedTeamsChange(team.id)}
                        className="mr-2"
                      />
                      {team.name}
                    </label>
                  </div>
                ))
              }
            </div>
          )}
        </div>
        {isEditing ? (
          <div>
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-500 text-white font-semibold px-4 py-2 mt-2 rounded mr-2"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white font-semibold px-4 py-2 mt-2 rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleEdit}
            className="bg-green-400 text-white font-semibold px-4 py-2  mt-2 rounded"
          >
            Edit
          </button>
        )}
        {error && <div className="text-red-500 mb-4">{error}</div>}
      </form>
    </div>
  );
};

export default BarProfile;