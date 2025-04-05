import React from 'react';
import './AIVisualization.css';

const AIVisualization = ({ detectionData }) => {
  if (!detectionData) return null;

  return (
    <div className="ai-visualization">
      <h3>AI Analysis Results</h3>
      <div className="visualization-grid">
        <div className="visualization-item">
          <h4>Original Image</h4>
          <img 
            src={detectionData.visualization.original} 
            alt="Original land" 
            className="visualization-image"
          />
        </div>
        <div className="visualization-item">
          <h4>Detected Objects</h4>
          <img 
            src={detectionData.visualization.detections} 
            alt="With object detection" 
            className="visualization-image"
          />
        </div>
        <div className="visualization-item">
          <h4>Boundary Calculation</h4>
          <img 
            src={detectionData.visualization.boundary} 
            alt="With boundary overlay" 
            className="visualization-image"
          />
        </div>
      </div>
      <div className="measurement-summary">
        <h4>Measurement Summary</h4>
        <div className="measurement-details">
          <div className="measurement-row">
            <span className="measurement-label">Estimated Area:</span>
            <span className="measurement-value">
              {detectionData.areaSquareMeters.toFixed(2)} m²
            </span>
          </div>
          <div className="measurement-row">
            <span className="measurement-label">In Hectares:</span>
            <span className="measurement-value">
              {detectionData.areaHectares.toFixed(4)} ha
            </span>
          </div>
          <div className="measurement-row">
            <span className="measurement-label">Scale Factor:</span>
            <span className="measurement-value">
              1px ≈ {(detectionData.scaleFactor * 100).toFixed(2)} cm
            </span>
          </div>
          <div className="measurement-row">
            <span className="measurement-label">Objects Detected:</span>
            <span className="measurement-value">
              {detectionData.detectedObjects.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVisualization;