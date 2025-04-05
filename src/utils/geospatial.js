import * as turf from '@turf/turf';

// Calculate area from GeoJSON in hectares
export const calculateArea = (geojson) => {
  if (!geojson) return 0;
  return turf.area(geojson) / 10000;
};

// Convert coordinates to GeoJSON point
export const coordinatesToPoint = (lat, lng) => {
  return turf.point([lng, lat]);
};

// Create buffer around a point (meters)
export const createBuffer = (point, radius) => {
  return turf.buffer(point, radius, { units: 'meters' });
};

// Calculate distance between two points (meters)
export const calculateDistance = (point1, point2) => {
  return turf.distance(point1, point2, { units: 'meters' });
};

// Convert polygon coordinates to GeoJSON
export const createGeoJSONPolygon = (coordinates) => {
  return turf.polygon([coordinates]);
};

// Calculate centroid of a polygon
export const calculateCentroid = (geojson) => {
  return turf.centroid(geojson);
};

// Check if point is within polygon
export const pointInPolygon = (point, polygon) => {
  return turf.booleanPointInPolygon(point, polygon);
};

// Simplify polygon geometry
export const simplifyPolygon = (geojson, tolerance = 0.01) => {
  return turf.simplify(geojson, { tolerance, highQuality: true });
};

// Calculate bounding box
export const calculateBoundingBox = (geojson) => {
  return turf.bbox(geojson);
};

// Convert meters to hectares
export const metersToHectares = (squareMeters) => {
  return squareMeters / 10000;
};