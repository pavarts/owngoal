import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForBars = () => {
  const [formData, setFormData] = useState({
    barName: '',
    city: '',
    state: '',
    email: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const timestamp = new Date().toISOString();
      await axios.post('http://localhost:3000/bar-signup', { ...formData, timestamp });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 
    'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 
    'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-normal text-white mb-12 text-center">
        <i>Tired of showing games to an empty bar?</i>
      </h1>
      <div className="flex flex-wrap -mx-4">
        
        {/* Left side - Information */}
        <div className="w-full md:w-1/2 px-4 mb-12 md:mb-0">
          <div className="text-white bg-blue-900 bg-opacity-30 backdrop-filter backdrop-blur-sm p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-lime-green">Join us!</h2>
            <ul className="space-y-4 text-lg">
              <li className="flex items-start">
                <span className="text-2xl mr-2">⚽</span>
                <span>Easily advertise soccer matches your bar is showing</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-2">💰</span>
                <span>Increase foot traffic and sales during match days</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-2">🍻</span>
                <span>Connect with passionate soccer fans in your area</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-2">🏟️</span>
                <span>Be part of a growing community of soccer-friendly establishments</span>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-2">🫶🏻</span>
                <span>Free registration during our pilot phase</span>
              </li>
            </ul>
            <p className="mt-6 text-xl font-semibold">
              With OwnGoal, you're creating a space where soccer fans can come together, 
              enjoy their favorite matches, and support local businesses like yours. <br />
              <span className="text-lime-green"> It's a win-win for everyone!</span>
            </p>
          </div>
        </div>

        
        {/* Right side - Form */}
        <div className="w-full md:w-1/2 px-4">
          <div className="bg-blue-900 bg-opacity-30 backdrop-filter backdrop-blur-sm p-8 rounded-lg shadow-lg h-full flex flex-col justify-between">
            {isSubmitted ? (
              <div className="text-white text-center flex flex-col justify-center h-full">
                <h2 className="text-3xl font-bold mb-4">Thank You for Signing Up!</h2>
                <p className="text-xl">We've received your information and will be in touch soon to set up your account.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <h2 className="text-3xl font-bold mb-6 text-white">Register Your Bar</h2>
                <div className="flex-grow">
                  <div className="mb-4">
                    <label htmlFor="barName" className="block text-white mb-2">Bar Name</label>
                    <input
                      type="text"
                      id="barName"
                      name="barName"
                      value={formData.barName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-blue-800 bg-opacity-50 text-white rounded"
                    />
                  </div>
                  <div className="mb-4 mt-8 flex space-x-4">
                    <div className="flex-grow">
                      <label htmlFor="city" className="block text-white mb-2">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-blue-800 bg-opacity-50 text-white rounded"
                      />
                    </div>
                    <div className="w-1/3">
                      <label htmlFor="state" className="block text-white mb-2">State</label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-blue-800 bg-opacity-50 text-white rounded appearance-none"
                        style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFFFFF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em 1em' }}
                      >
                        <option value="">Select</option>
                        {usStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-6 mt-8">
                    <label htmlFor="email" className="block text-white mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-blue-800 bg-opacity-50 text-white rounded"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-lime-green hover:bg-lime-600 text-blue-900 font-bold py-3 px-4 rounded transition duration-300 mt-auto">
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <hr className="mt-12 border-gray-200" />

      {/* Login CTA */}
      <div className="mt-8 text-center">
        <h3 className="text-2xl font-semibold text-white mb-4">Already a member?</h3>
        <button 
          onClick={() => navigate('/login')} 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-xl transition duration-300"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default ForBars;