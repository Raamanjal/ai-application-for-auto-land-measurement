import React from 'react';
import './ResultsPanel.css';

const ResultsPanel = ({ measurement, location, imageResults }) => {
  return (
    <div className="results-panel">
      <h3>Measurement Results</h3>
      
      <div className="results-section">
        {measurement && (
          <div className="result-card">
            <h4>Manual Measurement</h4>
            <div className="result-grid">
              <span>Area:</span>
              <span>{measurement.area.toFixed(4)} hectares</span>
              <span>Points:</span>
              <span>{measurement.points.length}</span>
            </div>
          </div>
        )}
        
        {location && (
          <div className="result-card">
            <h4>GPS Location</h4>
            <div className="result-grid">
              <span>Latitude:</span>
              <span>{location.latitude.toFixed(6)}</span>
              <span>Longitude:</span>
              <span>{location.longitude.toFixed(6)}</span>
              {location.accuracy && (
                <>
                  <span>Accuracy:</span>
                  <span>±{location.accuracy.toFixed(2)} meters</span>
                </>
              )}
            </div>
          </div>
        )}
        
        {imageResults && (
          <div className="result-card">
            <h4>AI Analysis</h4>
            <div className="result-grid">
              <span>Area:</span>
              <span>{imageResults.areaHectares.toFixed(4)} ha</span>
              <span>Scale:</span>
              <span>1px ≈ {(imageResults.scaleFactor * 100).toFixed(2)} cm</span>
              <span>Objects:</span>
              <span>{imageResults.detectedObjects.length}</span>
            </div>
          </div>
        )}
        
        {!measurement && !location && !imageResults && (
          <div className="empty-state">
            <p>No measurements yet. Use the tools above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;