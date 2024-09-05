import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import SearchBar from './SearchBar';
import { useAuth } from '../AuthContext';

const NavBar = ({ isMenuOpen, setIsMenuOpen }) => {
  const { userRole, logout } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="w-full px-6 py-1 flex justify-between items-center relative shadow-md">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-80"></div>
      <div className="flex gap-4 items-center relative z-10">
        <Link to="/">
          <img src="/assets/short_logo.svg" alt="Short Logo" className="w-14 h-14" />
        </Link>
      </div>
      {!isHomePage && (
        <div className="flex-grow flex justify-center relative z-10">
          <SearchBar size="small" />
        </div>
      )}
      <div className="relative z-10" ref={menuRef}>
        <button 
          onClick={toggleMenu} 
          className={`p-2 text-2xl font-semibold font-roboto ${isMenuOpen ? 'text-white' : 'text-black'} hover:text-white`}
        >
          <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
        </button>
        {isMenuOpen && (
          <div className="fixed top-[64px] right-0 w-44 z-50 h-full">
            <div className={`fixed top-[64px] right-0 w-44 h-[calc(100%-64px)] bg-gray-900 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <Link to="/matches" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                <span className="relative inline-block z-10">
                  Matches
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                </span>
              </Link>
              <Link to="/teams" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                <span className="relative inline-block z-10">
                  Teams
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                </span>
              </Link>
              <Link to="/bars" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                <span className="relative inline-block z-10">
                  Bars
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                </span>
              </Link>
              <hr className="my-2 border-gray-500" />
              <Link to="/about" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                <span className="relative inline-block z-10">
                  About
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                </span>
              </Link>
              <Link to="/forbars" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                <span className="relative inline-block z-10">
                  I'm a Bar
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                </span>
              </Link>

              {(userRole === 'admin' || userRole === 'bar') && (
                <hr className="my-2 border-gray-500" />
              )}
              
              {userRole === 'admin' && (
                <>
                  <Link to="/admin/teams" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                    <span className="relative inline-block z-10">
                      Teams [A]
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                    </span>
                  </Link>
                  <Link to="/admin/matches" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                    <span className="relative inline-block z-10">
                      Matches [A]
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                    </span>
                  </Link>
                  <Link to="/admin/bars" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                    <span className="relative inline-block z-10">
                      Bars [A]
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                    </span>
                  </Link>
                  <Link to="/admin/events" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                    <span className="relative inline-block z-10">
                      Events [A]
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                    </span>
                  </Link>
                  <Link to="/admin/competitions" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                    <span className="relative inline-block z-10">
                      Competitions [A]
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                    </span>
                  </Link>
                  <Link to="/admin/users" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                    <span className="relative inline-block z-10">
                      Users [A]
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                    </span>
                  </Link>
                </>
              )}

              {userRole === 'bar' && (
                <>
                  <Link to="/bar/bar-profile" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                    <span className="relative inline-block z-10">
                      Bar Profile
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                    </span>
                  </Link>
                  <Link to="/bar/bar-events" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                    <span className="relative inline-block z-10">
                      My Events
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                    </span>
                  </Link>
                  <Link to="/bar/account-settings" className="block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative">
                    <span className="relative inline-block z-10">
                      Account
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                    </span>
                  </Link>
                </>
              )}

              {userRole && (
                <Link to="/login" onClick={handleLogout} className="block px-8 py-2 text-lg font-semibold text-red-400 hover:text-red-300 group relative">
                  <span className="relative inline-block z-10">
                    Logout
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green group-hover:w-full transition-all"></span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;