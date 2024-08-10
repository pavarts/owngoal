import React, { useState } from 'react';
import axios from 'axios';

const ForBars = () => {
  const [formData, setFormData] = useState({
    barName: '',
    city: '',
    state: '',
    email: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Join Our Soccer Community</h1>
      <div className="flex flex-wrap -mx-4">
        {/* Left side - Information */}
        <div className="w-full md:w-1/2 px-4 mb-8 md:mb-0">
          <div className="text-white">
            <h2 className="text-2xl font-semibold mb-4">Why Join Us?</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Connect with passionate soccer fans in your area</li>
              <li>Increase foot traffic and sales during match days</li>
              <li>Be part of a growing community of soccer-friendly establishments</li>
              <li>Free registration during our beta phase</li>
            </ul>
            <p className="mt-4">
              By joining our platform, you're creating a space where soccer fans can come together, 
              enjoy their favorite matches, and support local businesses like yours. It's a win-win 
              for everyone involved!
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 px-4">
          <div className="bg-blue-900 bg-opacity-30 backdrop-filter backdrop-blur-sm p-6 rounded-lg">
            {isSubmitted ? (
              <div className="text-white text-center">
                <h2 className="text-2xl font-semibold mb-4">Thank You for Signing Up!</h2>
                <p>We've received your information and will be in touch soon to set up your account.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-semibold mb-4 text-white">Register Your Bar</h2>
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
                <div className="mb-4 flex space-x-4">
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
                      className="w-full px-3 py-2 bg-blue-800 bg-opacity-50 text-white rounded"
                    >
                      <option value="">Select</option>
                      {usStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
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
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForBars;