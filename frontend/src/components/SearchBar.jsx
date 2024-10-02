import React, { useState } from 'react';
import axios from 'axios';
import SearchResults from './SearchResults';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ size = 'large' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const sizeClasses = size === 'small' 
    ? 'text-xs py-2 px-2 pr-8' 
    : 'py-3 px-4 pr-12';

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setShowModal(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/search?query=${searchQuery}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      performSearch(query);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setResults(null);
  };

  return (
    <div className={`relative ${size === 'small' ? 'w-80' : 'w-full'}`}>
      <div className="relative flex items-center">
      <input
          type="text"
          placeholder="Search for a game, team, or bar"
          className={`focus:placeholder-opacity-0 placeholder-gray-500 font-normal w-full border border-blue-300 rounded-full ${sizeClasses} text-center
                      hover:shadow-custom hover:bg-gray-100 transition-all duration-200
                      focus:outline-none focus:ring-0 focus:border-blue-300
                      ${isFocused ? 'shadow-custom' : 'shadow-sm'}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <button
          onClick={() => performSearch(query)}
          className={`absolute right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 ${size === 'small' ? 'w-6 h-6' : 'p-2 w-8 h-8'} flex items-center justify-center
                     transition-colors duration-200`}
          aria-label="Search"
        >
          <FaSearch className="text-sm"/>
        </button>
      </div>
      {isLoading && <div className="absolute right-12 top-3">Loading...</div>}
      {showModal && (
        <SearchResults 
          results={results} 
          query={query} 
          onClose={handleCloseModal}
          onSearch={performSearch}
        />
      )}
    </div>
  );
};

export default SearchBar;
