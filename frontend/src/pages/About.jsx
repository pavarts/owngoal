import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="w-4/5 mx-auto">
        <Logo />
      </div>

      <hr className="border-gray-200 my-8" />
      
      <h1 className="text-4xl font-bold mb-8 mt- text-center">About Us</h1>
      
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4">Our Purpose</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-blue-900 bg-opacity-30 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">For Fans</h3>
            <p>Discover the best places to watch your favorite teams and find a community of other supporters. Never miss a match again!</p>
          </div>
          <div className="bg-blue-900 bg-opacity-30 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">For Bars</h3>
            <p>Attract passionate soccer fans and boost your business during match days. Showcase your venue to a dedicated audience.</p>
            <Link to="/forbars" className="inline-block mt-4 bg-lime-green text-blue-900 font-bold py-2 px-4 rounded hover:bg-lime-600 transition duration-300">
              Register Your Bar
            </Link>
          </div>
          <div className="bg-blue-900 bg-opacity-30 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">For Clubs</h3>
            <p>Help your supporters find official club bars and grow your fanbase in new locations across the US. Strengthen your community connections.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
        <p className="text-lg leading-relaxed">
          <strong>OwnGoal</strong> was born from the passion of an Arsenal fan (COYG!) who wanted to find a home to watch matches 
          with the electric atmosphere of a proper supporter's bar. Unfortunately, this proved harder than expected - bars didn't always post
          what matches they were showing, and if they did, some didn't play them with sound or have the right atmosphere.
          Forget about when travelling in a new place or for those 7:30am games you're actually willing to get up for!
          <br />
          <br />This quest for the perfect soccer bar led to the creation of <strong>OwnGoal</strong> –  
          <span className="text-lime-green font-bold"> a platform designed to 
          connect soccer fans with the ideal venues to watch their favorite teams. </span>
        </p>
      </section>
      
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4">Our Journey</h2>
        <p className="text-lg leading-relaxed">
          <strong>OwnGoal</strong> is a labor of love, developed and maintained by a single passionate fan. It's currently in the pilot phase, 
          live in Raleigh-Durham, NC. However, our vision extends far beyond – we're excited about the prospect of expanding to more cities soon, bringing soccer fans and great venues together across the US.
        </p>
      </section>

      <hr className="border-gray-200 my-8" />
      
      <section className="text-center">
        <h2 className="text-3xl font-semibold mb-4">Get in Touch</h2>
        <p className="text-lg">
          We value your input! If you have any questions, feedback, or just want to chat about soccer, don't hesitate to reach out at{' '}
          <span className="text-lime-green font-semibold">contact@owngoalproject.com</span>.
        </p>
      </section>
    </div>
  );
};

export default About;