import React, { useState, useCallback } from 'react';
import MapComponent from './components/MapComponent';
import MeasurementTools from './components/MeasurementTools';
import GPSLocation from './components/GPSLocation';
import ImageUpload from './components/ImageUpload';
import ResultsPanel from './components/ResultsPanel';
import './App.css';

function App() {
  const [measurement, setMeasurement] = useState(null);
  const [location, setLocation] = useState(null);
  const [imageResults, setImageResults] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const handleMapInit = useCallback((map) => {
    setMapInstance(map);
  }, []);

  return (
    <div className="app-container">
      <h1>AI Land Area Measurement</h1>
      <div className="main-content">
        <div className="map-section">
          <MapComponent 
            measurement={measurement}
            location={location}
            onMapInit={handleMapInit}
          />
          {mapInstance && (
            <MeasurementTools 
              onMeasure={setMeasurement}
              map={mapInstance}
            />
          )}
        </div>
        <div className="tools-section">
          <GPSLocation onLocationChange={setLocation} />
          <ImageUpload onResults={setImageResults} />
          <ResultsPanel 
            measurement={measurement}
            location={location}
            imageResults={imageResults}
          />
        </div>
      </div>
    </div>
  );
}

export default App;