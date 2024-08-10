// In Map.jsx

import React, { useEffect, useRef, useCallback, useContext } from 'react';
import { GoogleMapsContext } from '../contexts/GoogleMapsProvider';

const Map = React.memo(({ bars, center, hoveredBar }) => {
  const { isLoaded } = useContext(GoogleMapsContext);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);

  const defaultIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  const hoveredIcon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';

  const createMarker = useCallback((bar, map) => {
    const marker = new window.google.maps.Marker({
      position: { lat: bar.lat, lng: bar.lng },
      map: map,
      title: bar.name,
      icon: defaultIcon,
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div>
          <strong>${bar.name}</strong><br />
          <a href="https://www.google.com/maps/search/?q=place_id:${bar.place_id}" target="_blank" rel="noopener noreferrer">
            View on Google Maps
          </a>
        </div>
      `,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    return marker;
  }, [defaultIcon]);

  useEffect(() => {
    if (!isLoaded) {
      console.error('Google Maps JavaScript API not loaded');
      return;
    }

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false
      });
    }

    // Clear old markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add new markers
    bars.forEach((bar) => {
      const marker = createMarker(bar, mapInstance.current);
      markers.current.push(marker);
    });
  }, [bars, createMarker, isLoaded, center]);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(center);
    }
  }, [center]);

  useEffect(() => {
    markers.current.forEach((marker) => {
      if (hoveredBar && marker.getTitle() === hoveredBar) {
        marker.setIcon(hoveredIcon);
        mapInstance.current.panTo(marker.getPosition());
      } else {
        marker.setIcon(defaultIcon);
      }
    });
  }, [hoveredBar, defaultIcon, hoveredIcon]);

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return <div ref={mapRef} className="h-full w-full rounded-lg overflow-hidden"></div>;
});

export default Map;