import React, { useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import './MeasurementTools.css';

const MeasurementTools = ({ onMeasure, map }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [area, setArea] = useState(null);

  const handleMapClick = (e) => {
    if (!isDrawing || !map) return;
    
    const newPoint = [e.lngLat.lng, e.lngLat.lat];
    setPoints(prev => [...prev, newPoint]);
  };

  const startDrawing = () => {
    if (!map) return;
    
    setPoints([]);
    setArea(null);
    setIsDrawing(true);
    map.on('click', handleMapClick);
  };

  const finishDrawing = () => {
    if (!map || points.length < 3) return;
    
    const polygonPoints = [...points, points[0]]; // Close polygon
    const polygon = turf.polygon([polygonPoints]);
    const areaHectares = turf.area(polygon) / 10000;
    
    setArea(areaHectares);
    setIsDrawing(false);
    onMeasure({
      geojson: polygon,
      area: areaHectares,
      points: polygonPoints
    });
    
    map.off('click', handleMapClick);
  };

  const cancelDrawing = () => {
    if (!map) return;
    
    setPoints([]);
    setArea(null);
    setIsDrawing(false);
    map.off('click', handleMapClick);
  };

  useEffect(() => {
    return () => {
      if (map) {
        map.off('click', handleMapClick);
      }
    };
  }, [map]);

  return (
    <div className="measurement-tools">
      {!isDrawing ? (
        <button onClick={startDrawing} className="start-button">
          Start Measuring
        </button>
      ) : (
        <div className="drawing-controls">
          <button onClick={finishDrawing} className="finish-button">
            Finish ({points.length} points)
          </button>
          <button onClick={cancelDrawing} className="cancel-button">
            Cancel
          </button>
        </div>
      )}
      {area && (
        <div className="measurement-result">
          Area: {area.toFixed(4)} hectares
        </div>
      )}
    </div>
  );
};

export default MeasurementTools;