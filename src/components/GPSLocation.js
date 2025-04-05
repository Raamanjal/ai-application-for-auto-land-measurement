import React, { useState, useEffect } from 'react';
import './GPSLocation.css';

const GPSLocation = ({ onLocationChange }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const watchId = React.useRef(null);

  const handleSuccess = (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    const newLocation = { latitude, longitude, accuracy };
    
    setLocation(newLocation);
    setAccuracy(accuracy);
    onLocationChange(newLocation);
  };

  const handleError = (err) => {
    setError(err.message);
    setIsWatching(false);
  };

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsWatching(true);
    setError(null);
    watchId.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );
  };

  const stopWatching = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsWatching(false);
  };

  useEffect(() => {
    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <div className="gps-location-card">
      <h3>GPS Location Tracking</h3>
      <div className="gps-controls">
        {!isWatching ? (
          <button 
            onClick={startWatching}
            className="gps-button start-button"
          >
            Start GPS Tracking
          </button>
        ) : (
          <button 
            onClick={stopWatching}
            className="gps-button stop-button"
          >
            Stop GPS Tracking
          </button>
        )}
      </div>

      {location && (
        <div className="location-data">
          <div className="location-row">
            <span className="location-label">Latitude:</span>
            <span className="location-value">
              {location.latitude.toFixed(6)}
            </span>
          </div>
          <div className="location-row">
            <span className="location-label">Longitude:</span>
            <span className="location-value">
              {location.longitude.toFixed(6)}
            </span>
          </div>
          {accuracy && (
            <div className="location-row">
              <span className="location-label">Accuracy:</span>
              <span className="location-value">
                ±{accuracy.toFixed(2)} meters
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <p>Make sure location services are enabled.</p>
        </div>
      )}

      {!location && !error && (
        <div className="location-instructions">
          <p>Click "Start GPS Tracking" to get your current location.</p>
          <p>The map will automatically center on your position.</p>
        </div>
      )}
    </div>
  );
};

export default GPSLocation;