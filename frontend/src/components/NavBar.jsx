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

  // Open menu by default for bar users
  useEffect(() => {
    if (userRole === 'bar') {
      setIsMenuOpen(true);
    }
  }, [userRole, setIsMenuOpen]);

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

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`block px-8 py-2 text-lg font-semibold text-white hover:text-white group relative ${
        isActive(to) ? 'nav-active' : ''
      }`}
    >
      <span className="relative inline-block z-10">
        {children}
        <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-custom-blue to-lime-green ${
          isActive(to) ? 'w-full' : 'group-hover:w-full'
        } transition-all`}></span>
      </span>
    </Link>
  );

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
              <NavLink to="/matches">Matches</NavLink>
              <NavLink to="/teams">Teams</NavLink>
              <NavLink to="/bars">Bars</NavLink>
              <hr className="my-2 border-gray-500" />
              <NavLink to="/about">About</NavLink>
              <NavLink to="/forbars">I'm a Bar</NavLink>

              {(userRole === 'admin' || userRole === 'bar') && (
                <hr className="my-2 border-gray-500" />
              )}
              
              {userRole === 'admin' && (
                <>
                  <NavLink to="/admin/teams">Teams [A]</NavLink>
                  <NavLink to="/admin/matches">Matches [A]</NavLink>
                  <NavLink to="/admin/bars">Bars [A]</NavLink>
                  <NavLink to="/admin/events">Events [A]</NavLink>
                  <NavLink to="/admin/competitions">Competitions [A]</NavLink>
                  <NavLink to="/admin/users">Users [A]</NavLink>
                </>
              )}

              {userRole === 'bar' && (
                <>
                  <NavLink to="/bar/bar-profile">Bar Profile</NavLink>
                  <NavLink to="/bar/bar-events">My Events</NavLink>
                  <NavLink to="/bar/account-settings">Account</NavLink>
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