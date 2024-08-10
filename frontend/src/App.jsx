import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import ForBars from './pages/ForBars.jsx';
import UpcomingMatchesTable from './components/UpcomingMatchesTable.jsx';
import MatchDetails from './components/MatchDetails.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './components/Login.jsx';
import Teams from './components/admin/Teams';
import Matches from './components/admin/Matches';
import Bars from './components/admin/Bars';
import Competitions from './components/admin/Competitions';
import Events from './components/admin/Events';
import Users from './components/admin/Users';
import BarDetails from './components/BarDetails';
import { GoogleMapsProvider } from './contexts/GoogleMapsProvider';
import TeamDetails from './components/TeamDetails';
import AllTeams from './components/AllTeams';
import AllMatches from './components/AllMatches';
import AllBars from './components/AllBars';
import SetPassword from './components/SetPassword';
import BarProfile from './components/bar/BarProfile';
import BarEvents from './components/bar/BarEvents';
import AccountSettings from './components/bar/AccountSettings';


function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <GoogleMapsProvider>
      <Router>
        <div className="flex flex-col h-screen overflow-hidden">
          <NavBar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <div className="flex flex-1 overflow-hidden">
            <div className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto ${isMenuOpen ? 'mr-44' : ''}`}>
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 min-h-full">
                <Routes>
              <Route path="/" element={<Home />} />

              {/* Info routes */}
              <Route path="/about" element={<About />} />
              <Route path="/forBars" element={<ForBars />} />

              {/* Object-summary routes */}
              <Route path="/teams" element={<AllTeams />} />
              <Route path="/matches" element={<AllMatches />} />
              <Route path="/bars" element={<AllBars />} />

              {/* Object-specific routes */}
              <Route path="/matches/:matchId" element={<MatchDetails />} />
              <Route path="/bars/:place_id" element={<BarDetails />} />
              <Route path="/teams/:id" element={<TeamDetails />} />

              {/* Account login routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/set-password/:token" element={<SetPassword />} />

              {/* Admin routes */}
              <Route path="/admin/teams" element={<ProtectedRoute component={Teams} requiredRole="admin" />} />
              <Route path="/admin/matches" element={<ProtectedRoute component={Matches} requiredRole="admin" />} />
              <Route path="/admin/bars" element={<ProtectedRoute component={Bars} requiredRole="admin" />} />
              <Route path="/admin/competitions" element={<ProtectedRoute component={Competitions} requiredRole="admin" />} />
              <Route path="/admin/users" element={<ProtectedRoute component={Users} requiredRole="admin" />} />
              <Route path="/admin/events" element={<ProtectedRoute component={Events} requiredRole="admin" />} />
              
              {/* Bar routes */}
              <Route path="/bar/bar-profile" element={<ProtectedRoute component={BarProfile} requiredRole="bar" />} />
              <Route path="/bar/bar-events" element={<ProtectedRoute component={BarEvents} requiredRole="bar" />} />
              <Route path="/bar/account-settings" element={<ProtectedRoute component={AccountSettings} requiredRole="bar" />} />

            </Routes>
              </div>
            </div>
          </div>
          <div className={`fixed top-[64px] right-0 w-44 h-[calc(100%-64px)] bg-gray-900 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Menu items go here */}
          </div>
        </div>
      </Router>
    </GoogleMapsProvider>
  );
}


export default App;
