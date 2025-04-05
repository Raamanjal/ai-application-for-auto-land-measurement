import React, { useEffect, useRef } from 'react';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import * as maptilersdk from '@maptiler/sdk';
import './MapComponent.css';

maptilersdk.config.apiKey = '0ZYIsIDCWMGd2jLjv9lF'; // Replace with your key

const MapComponent = ({ measurement, location, onMapInit }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.SATELLITE,
      center: [0, 0],
      zoom: 2
    });

    map.current.on('load', () => {
      // Add empty source for measurements
      map.current.addSource('measurement-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Add measurement layer
      map.current.addLayer({
        id: 'measurement-layer',
        type: 'fill',
        source: 'measurement-source',
        paint: {
          'fill-color': '#3bb2d0',
          'fill-opacity': 0.5,
          'fill-outline-color': '#ffffff'
        }
      });

      // Pass map instance to parent
      if (onMapInit) onMapInit(map.current);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMapInit]);

  // Update measurement display
  useEffect(() => {
    if (!map.current || !measurement) return;
    
    const source = map.current.getSource('measurement-source');
    if (source) {
      source.setData(measurement.geojson);
      
      // Zoom to measurement bounds
      const bounds = new maptilersdk.LngLatBounds();
      measurement.geojson.geometry.coordinates[0].forEach(coord => {
        bounds.extend(coord);
      });
      map.current.fitBounds(bounds, { padding: 20 });
    }
  }, [measurement]);

  // Center map on GPS location
  useEffect(() => {
    if (!map.current || !location) return;
    
    map.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 16
    });
  }, [location]);

  return <div ref={mapContainer} className="map-container" />;
};

export default MapComponent;