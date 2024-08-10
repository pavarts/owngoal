import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ModalForm from './ModalForm';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const Events = () => {
  const [bars, setBars] = useState([]);
  const [selectedBar, setSelectedBar] = useState('');
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({});
  const [competitions, setCompetitions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState({ competitionId: '', competitionName: '' });
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingEvent, setEditingEvent] = useState(false);

  useEffect(() => {
    fetchBars();
    fetchCompetitions();
    fetchMatches();
  }, []);

  useEffect(() => {
    if (selectedBar) {
      fetchEvents(selectedBar);
    }
  }, [selectedBar]);

  useEffect(() => {
    if (selectedCompetition.competitionName) {
      const filteredMatches = matches.filter(match => match.competition === selectedCompetition.competitionName);
      console.log('Filtered Matches:', filteredMatches);
      setFilteredMatches(filteredMatches);
    } else {
      setFilteredMatches([]);
    }
  }, [selectedCompetition, matches]);

  useEffect(() => {
    console.log('Events:', events);
  }, [events]);

  useEffect(() => {
    console.log('Error Message:', errorMessage);
  }, [errorMessage]);

  const fetchBars = async () => {
    try {
      const response = await axios.get('http://localhost:3000/bars', getAuthHeader());
      setBars(response.data);
    } catch (error) {
      console.error('Error fetching bars:', error);
    }
  };

  const fetchEvents = async (place_id) => {
    try {
      const response = await axios.get(`http://localhost:3000/bars/${place_id}/events`, getAuthHeader());
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/competitions', getAuthHeader());
      setCompetitions(response.data);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await axios.get('http://localhost:3000/matches', getAuthHeader());
      setMatches(response.data);
      console.log('Fetched Matches:', response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const checkForExistingEvent = (matchId) => {
    console.log('Events:', events); // Log the events array
    const existingEvent = events.find(event => {
      console.log(`Checking event match_id ${event.match_id} against ${parseInt(matchId)}`);
      return event.match_id === parseInt(matchId);
    });
    console.log('existingEvent:', existingEvent);
    return existingEvent !== undefined;
  };

  const openModal = (event = null) => {
    if (event) {
      console.log('Editing event:', event);
      setEditingEvent(true);
      setNewEvent({
        id: event.id,
        match_id: event.match_id,
        sound: event.sound,
        earlyOpening: event.earlyOpening,
        openingTime: event.openingTime,
      });
      const selectedCompetition = competitions.find(comp => comp.name === event.competition);
      setSelectedCompetition({
        competitionId: selectedCompetition ? selectedCompetition.id : '',
        competitionName: event.competition
      });
      setFilteredMatches(matches.filter(match => match.competition === event.competition));
    } else {
      console.log('Adding new event');
      setEditingEvent(false);
      setNewEvent({});
      setSelectedCompetition({ competitionId: '', competitionName: '' });
      setFilteredMatches([]);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('Input changed:', name, value);

    if (name === 'match_id') {
      console.log('Heres the name:', name);
      console.log('Heres the value:', value);
      if (checkForExistingEvent(value)) {
        console.log('Event already exists for this match.');
        setErrorMessage('An event already exists for this match. Edit or delete the event if you would like to make changes.');
        return;
      } else {
        setErrorMessage('');
      }
    }

    if (type === 'checkbox') {
      setNewEvent({ ...newEvent, [name]: checked });
      if (name === 'earlyOpening' && !checked) {
        setNewEvent(prev => ({ ...prev, openingTime: null }));
      }
    } else {
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  const handleCompetitionChange = (e) => {
    const selectedCompetitionId = e.target.value;
    const selectedCompetitionName = competitions.find(comp => comp.id === parseInt(selectedCompetitionId)).name;
    setSelectedCompetition({ competitionId: selectedCompetitionId, competitionName: selectedCompetitionName });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      if (!newEvent.match_id || errorMessage) {
        return;
      }
      await axios.post(`http://localhost:3000/bars/${selectedBar}/events`, newEvent, getAuthHeader());
      fetchEvents(selectedBar);
      closeModal();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/events/${id}`, getAuthHeader());
      fetchEvents(selectedBar);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const updatedEvent = { ...newEvent };
      if (!newEvent.earlyOpening) {
        updatedEvent.openingTime = null;
      }
      await axios.put(`http://localhost:3000/events/${updatedEvent.id}`, updatedEvent, getAuthHeader());
      fetchEvents(selectedBar);
      closeModal();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Events</h2>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Select a bar:</label>
        <select value={selectedBar} onChange={(e) => setSelectedBar(e.target.value)} className="p-2 border rounded">
          <option value="">--Select a bar--</option>
          {bars.sort((a, b) => a.name.localeCompare(b.name)).map(bar => (
            <option key={bar.place_id} value={bar.place_id}>{bar.name} | {bar.location}</option>
          ))}
        </select>
      </div>
      {selectedBar && (
        <div>
          <button
            onClick={() => openModal(null)} // Ensure it passes null to add a new event
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Add Event
          </button>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Actions</th>
                <th className="py-2 px-4 border">Match</th>
                <th className="py-2 px-4 border">Sound</th>
                <th className="py-2 px-4 border">Early Opening</th>
                <th className="py-2 px-4 border">Opening Time</th>
                <th className="py-2 px-4 border">Competition</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => openModal(event)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                  <td className="py-2 px-4 border">{event.match}</td>
                  <td className="py-2 px-4 border">{event.sound ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border">{event.earlyOpening ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border">{event.openingTime}</td>
                  <td className="py-2 px-4 border">{event.competition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ModalForm
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={editingEvent ? 'Edit Event' : 'Add Event'}
        onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}
        editingEvent={editingEvent}
      >
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Competition</label>
          <select
            name="competition"
            value={selectedCompetition.competitionId}
            onChange={handleCompetitionChange}
            className="w-full p-2 border rounded"
            disabled={editingEvent}
          >
            <option value="">--Select a competition--</option>
            {competitions.map(comp => (
              <option key={comp.id} value={comp.id}>{comp.name}</option>
            ))}
          </select>
        </div>
        {selectedCompetition.competitionId && (
          <div className="mb-2">
            <label className="block text-sm font-bold mb-1">Match</label>
            <select
              name="match_id"
              value={newEvent.match_id || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={!!editingEvent}
            >
              <option value="">--Select a match--</option>
              {filteredMatches.map(match => (
                <option key={match.id} value={match.id}>
                  {match.a_team} vs {match.b_team} on {match.date} at {match.time}
                </option>
              ))}
            </select>
          </div>
        )}
        {errorMessage && (
          <div className="text-red-500 text-sm mb-2">{errorMessage}</div>
        )}
        {newEvent.match_id && (
          <>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">Sound</label>
              <input
                type="checkbox"
                name="sound"
                checked={newEvent.sound || false}
                onChange={(e) => setNewEvent({ ...newEvent, sound: e.target.checked })}
                className="p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-bold mb-1">
                Early Opening
                <input
                  type="checkbox"
                  name="earlyOpening"
                  checked={newEvent.earlyOpening}
                  onChange={handleInputChange}
                  className="ml-2"
                />
              </label>
            </div>
            {newEvent.earlyOpening && (
              <div className="mb-2">
                <label className="block text-sm font-bold mb-1">Opening Time</label>
                <input
                  type="time"
                  name="openingTime"
                  value={newEvent.openingTime || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, openingTime: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </>
        )}
      </ModalForm>
    </div>
  );
};

export default Events;
