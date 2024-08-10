import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faPhone, faTv } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';

const BarHeader = ({ bar, placeId }) => {
  const Map = ({ placeId }) => {
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=place_id:${placeId}`;
    return (
      <iframe
        title="Bar Location"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={mapUrl}
        allowFullScreen
      ></iframe>
    );
  };

  return (
    <div className="bg-gray-800 bg-opacity-60 flex relative z-0"> {/* Keep relative positioning and z-index */}
      <div className="flex flex-row w-full">
        <div className="flex flex-col p-8 w-1/2 items-center justify-start text-center">
          <h2 className="text-5xl font-bold mb-4 text-white">{bar.name}</h2>
          <div className="flex items-center justify-center space-x-4 mb-4 relative z-10"> {/* Keep relative positioning and z-index */}
            <a href={bar.website} target="_blank" rel="noopener noreferrer" className="z-10">
              <FontAwesomeIcon icon={faGlobe} className="text-lime-green text-xl" />
            </a>
            <span className="font-extrabold text-white z-10">·</span>
            <a href={bar.instagram} target="_blank" rel="noopener noreferrer" className="z-10">
              <FontAwesomeIcon icon={faInstagram} className="text-lime-green text-xl" />
            </a>
            <span className="font-extrabold text-white z-10">·</span>
            <div className="relative group flex items-center z-10">
              <a href={`tel:${bar.phone}`} className="relative z-10 flex items-center whitespace-nowrap">
                <span className="transition-opacity duration-300 text-lime-green text-xl group-hover:opacity-0">
                  <FontAwesomeIcon icon={faPhone} className="transform translate-y-[-2px]" />
                </span>
                <span className="absolute left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 text-lime-green">
                  {bar.phone}
                </span>
              </a>
            </div>
          </div>
          <p className="mt-2 mb-4 text-white">{bar.bio}</p>
          <hr className="w-full border-lime-green mb-4" />
          <div className="text-white flex items-center justify-center">
            {bar.supportedTeams?.length > 0 && (
              <div className="flex items-center">
                <span className="font-semibold mr-2">Supports:</span>
                {bar.supportedTeams.map((team, index) => (
                  <span key={team.id} className="inline-flex items-center">
                    {index > 0 && <span className="mx-1">,</span>}
                    {team.logo && (
                      <img src={team.logo} alt={team.name} className="w-4 h-4 object-contain mr-1" />
                    )}
                    {team.name}
                  </span>
                ))}
              </div>
            )}
            {bar.hasOutdoorSpace && (
              <>
                {bar.supportedTeams?.length > 0 && <div className="mx-4 h-6 w-px bg-lime-green"></div>}
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faTv} className="mr-2" />
                  <span>Outdoor TVs</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="w-1/2 flex"> {/* Add flex to ensure full height */}
          <div className="flex-grow"> {/* This div will grow to fill available space */}
            <Map placeId={placeId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarHeader;