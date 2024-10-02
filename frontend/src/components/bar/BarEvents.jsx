import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import UpcomingEventsTable from './BarUpcomingEventsTable';
import AllMatchesTable from './BarAllMatchesTable';
import moment from'moment-timezone';
import Pagination from '../Pagination';

const BarEvents = () => {
  const [events, setEvents] = useState([]);
  const [barPlaceId, setBarPlaceId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [editingEvent, setEditingEvent] = useState({
    sound: false,
    earlyOpening: false,
    openingTime: ''
  });
  const [currentPage, setCurrentPage] = useState({ events: 1, matches: 1 });
  const eventsPerPage = 10;
  const matchesPerPage = 15;

  useEffect(() => {
    const fetchBarInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('${process.env.REACT_APP_API_URL}/bar-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBarPlaceId(response.data.place_id);
      } catch (error) {
        console.error('Error fetching bar info:', error);
      }
    };

    fetchBarInfo();
    fetchMatches();
    fetchCompetitions();
  }, []);
  const fetchEvents = async () => {
    if (!barPlaceId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/bars/${barPlaceId}/events/upcoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    if (barPlaceId) {
      fetchEvents();
    }
  }, [barPlaceId]);
  const fetchMatches = async () => {
    try {
      const response = await axios.get('${process.env.REACT_APP_API_URL}/matches/upcoming');
      setMatches(response.data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const response = await axios.get('${process.env.REACT_APP_API_URL}/competitions');
      setCompetitions(response.data);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setEditingEvent({
      sound: event.sound,
      earlyOpening: event.earlyOpening,
      openingTime: event.openingTime || ''
    });
    setEditModalOpen(true);
  };

  const handleAddEvent = (match) => {
    setCurrentMatch(match);
    setEditingEvent({
      sound: false,
      earlyOpening: false,
      openingTime: ''
    });
    setAddModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleDeleteEvent = (event) => {
    setCurrentEvent(event);
    setDeleteModalOpen(true);
  };


  const confirmEditEvent = async (updatedEvent) => {
    try {
      const token = localStorage.getItem('token');
      // Make sure we're sending the event id
      await axios.put(`${process.env.REACT_APP_API_URL}/events/${currentEvent.id}`, {
        ...updatedEvent,
        id: currentEvent.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const confirmDeleteEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/events/${currentEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const confirmAddEvent = async (newEvent) => {
    try {
      const token = localStorage.getItem('token');
      const eventData = {
        ...newEvent,
        match_id: currentMatch.id,
        openingTime: newEvent.earlyOpening ? newEvent.openingTime : null
      };
      await axios.post(`${process.env.REACT_APP_API_URL}/bars/${barPlaceId}/events`, eventData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
      setAddModalOpen(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.a_team.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.b_team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || moment(event.date).isSame(selectedDate, 'day');
    const matchesCompetition = !selectedCompetition || event.competition === selectedCompetition;
    return matchesSearch && matchesDate && matchesCompetition;
  });

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.a_team.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          match.b_team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || moment(match.date).isSame(selectedDate, 'day');
    const matchesCompetition = !selectedCompetition || match.competition === selectedCompetition;
    return matchesSearch && matchesDate && matchesCompetition;
  });

  const paginateData = (data, page, pageSize) => {
    const startIndex = (page - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  };

  const paginatedEvents = paginateData(filteredEvents, currentPage.events, eventsPerPage);
  const paginatedMatches = paginateData(filteredMatches, currentPage.matches, matchesPerPage);

  const renderMatch = (teamA, teamALogo, teamB, teamBLogo) => (
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-end w-2/5">
        <span className="mr-2">{teamA}</span>
        <img src={teamALogo} alt={teamA} className="w-6 h-6 object-contain" />
      </div>
      <div className="w-1/5 text-center">vs</div>
      <div className="flex items-center justify-start w-2/5">
        <img src={teamBLogo} alt={teamB} className="w-6 h-6 object-contain mr-2" />
        <span>{teamB}</span>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-white mb-4 mt-6">My Events</h1>
      <hr className="mb-8 border-gray-200" />
      
      <div className="mb-4 flex justify-center space-x-4">
        <input
          type="text"
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md"
        />
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          placeholderText="Select a date"
          className="p-2 border rounded-md"
        />
        <select
          className="p-2 rounded-md appearance-none bg-white"
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
          style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em 1em' }}
        >
          <option value="">All Competitions</option>
          {competitions.map(competition => (
            <option key={competition.id} value={competition.id}>
              {competition.name}
            </option>
          ))}
        </select>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Upcoming Events</h2>
      <UpcomingEventsTable 
        events={paginatedEvents} 
        handleEditEvent={handleEditEvent} 
        handleDeleteEvent={handleDeleteEvent}
        renderMatch={renderMatch}
      />
      <Pagination
        itemsPerPage={eventsPerPage}
        totalItems={filteredEvents.length}
        paginate={(pageNumber) => setCurrentPage(prev => ({ ...prev, events: pageNumber }))}
        currentPage={currentPage.events}
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">All Matches</h2>
      <AllMatchesTable 
        matches={paginatedMatches}
        events={events}
        handleAddEvent={handleAddEvent}
        renderMatch={renderMatch}
      />
      <Pagination
        itemsPerPage={matchesPerPage}
        totalItems={filteredMatches.length}
        paginate={(pageNumber) => setCurrentPage(prev => ({ ...prev, matches: pageNumber }))}
        currentPage={currentPage.matches}
      />

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Event</h2>
            <div className="mb-4">
              <p><strong>Competition:</strong> {currentEvent.competition}</p>
              <p><strong>Match:</strong> {currentEvent.a_team} vs {currentEvent.b_team}</p>
              <p><strong>Date & Time:</strong> {format(new Date(currentEvent.date), 'MMM d, yyyy')} @ {format(new Date(`2000-01-01T${currentEvent.time}`), 'h:mm a')}</p>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Sound</label>
              <div>
                <label className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    name="sound"
                    value="true"
                    checked={editingEvent.sound === true}
                    onChange={() => setEditingEvent(prev => ({ ...prev, sound: true }))}
                    className="mr-2"
                  />
                  On
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="sound"
                    value="false"
                    checked={editingEvent.sound === false}
                    onChange={() => setEditingEvent(prev => ({ ...prev, sound: false }))}
                    className="mr-2"
                  />
                  Off
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="earlyOpening"
                  checked={editingEvent.earlyOpening}
                  onChange={handleEditInputChange}
                  className="mr-2"
                />
                Opening Early
              </label>
            </div>
            {editingEvent.earlyOpening && (
              <div className="mb-4">
                <label className="block mb-2">Opening Time</label>
                <input
                  type="time"
                  name="openingTime"
                  value={editingEvent.openingTime}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={() => setEditModalOpen(false)} className="mr-2 bg-gray-500 text-white p-2 rounded">Cancel</button>
              <button onClick={() => confirmEditEvent(editingEvent)} className="bg-blue-500 text-white p-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Add Event</h2>
          <div className="mb-4">
            <p><strong>Competition:</strong> {currentMatch.competition}</p>
            <p><strong>Match:</strong> {currentMatch.a_team} vs {currentMatch.b_team}</p>
            <p><strong>Date & Time:</strong> {format(new Date(currentMatch.date), 'MMM d, yyyy')} @ {format(new Date(`2000-01-01T${currentMatch.time}`), 'h:mm a')}</p>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Sound</label>
            <div>
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  name="sound"
                  value="true"
                  checked={editingEvent.sound === true}
                  onChange={() => setEditingEvent(prev => ({ ...prev, sound: true }))}
                  className="mr-2"
                />
                On
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="sound"
                  value="false"
                  checked={editingEvent.sound === false}
                  onChange={() => setEditingEvent(prev => ({ ...prev, sound: false }))}
                  className="mr-2"
                />
                Off
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="earlyOpening"
                checked={editingEvent.earlyOpening}
                onChange={handleEditInputChange}
                className="mr-2"
              />
              Opening Early
            </label>
          </div>
          {editingEvent.earlyOpening && (
            <div className="mb-4">
              <label className="block mb-2">Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={editingEvent.openingTime}
                onChange={handleEditInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          <div className="flex justify-end">
            <button onClick={() => setAddModalOpen(false)} className="mr-2 bg-gray-500 text-white p-2 rounded">Cancel</button>
            <button onClick={() => confirmAddEvent(editingEvent)} className="bg-blue-500 text-white p-2 rounded">Add</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default BarEvents;