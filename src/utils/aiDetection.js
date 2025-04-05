import * as turf from '@turf/turf';

// Enhanced boundary detection with all features
export const detectBoundariesFromImage = async (imageSrc, model, canvas) => {
  // Load image
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve) => { img.onload = resolve; });

  // Set canvas dimensions (limit size for performance)
  const maxDimension = 1024;
  const scale = Math.min(maxDimension / img.width, maxDimension / img.height);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Detect objects
  const predictions = await model.detect(canvas);
  
  // Enhanced land-related object filtering
  const LAND_OBJECTS = [
    'building', 'fence', 'house', 'bridge', 'wall',
    'hedge', 'shed', 'garage', 'barn', 'landmark'
  ];
  
  const landPredictions = predictions.filter(pred => 
    LAND_OBJECTS.includes(pred.class.toLowerCase()) && 
    pred.score > 0.5 // Confidence threshold
  );

  // Create visualization canvas
  const visualizationCanvas = document.createElement('canvas');
  visualizationCanvas.width = canvas.width;
  visualizationCanvas.height = canvas.height;
  const vizCtx = visualizationCanvas.getContext('2d');
  vizCtx.drawImage(canvas, 0, 0);

  // Draw detections on visualization
  landPredictions.forEach(pred => {
    vizCtx.strokeStyle = '#FF0000';
    vizCtx.lineWidth = 2;
    vizCtx.strokeRect(pred.bbox[0], pred.bbox[1], pred.bbox[2], pred.bbox[3]);
    vizCtx.fillStyle = '#FF0000';
    vizCtx.fillText(
      `${pred.class} (${(pred.score * 100).toFixed(1)}%)`,
      pred.bbox[0],
      pred.bbox[1] > 10 ? pred.bbox[1] - 5 : 10
    );
  });

  // Improved boundary calculation
  if (landPredictions.length === 0) {
    return getWholeImageAsBoundary(canvas, visualizationCanvas);
  }

  // Calculate convex hull of all detection points
  const allPoints = landPredictions.flatMap(pred => [
    [pred.bbox[0], pred.bbox[1]], // Top-left
    [pred.bbox[0] + pred.bbox[2], pred.bbox[1]], // Top-right
    [pred.bbox[0], pred.bbox[1] + pred.bbox[3]], // Bottom-left
    [pred.bbox[0] + pred.bbox[2], pred.bbox[1] + pred.bbox[3]] // Bottom-right
  ]);

  const hull = calculateConvexHull(allPoints);
  
  // Draw boundary on visualization
  vizCtx.strokeStyle = '#00FF00';
  vizCtx.lineWidth = 3;
  vizCtx.beginPath();
  hull.forEach((point, i) => {
    if (i === 0) vizCtx.moveTo(point[0], point[1]);
    else vizCtx.lineTo(point[0], point[1]);
  });
  vizCtx.closePath();
  vizCtx.stroke();

  // Calculate area within hull
  const areaPx = calculatePolygonArea(hull);
  
  // Improved scaling - estimate based on common object sizes
  const avgObjectSize = estimateObjectScale(landPredictions);
  const pxToMeter = avgObjectSize ? (avgObjectSize / 100) : 0.01; // Fallback: 100px = 1m
  
  return {
    boundaries: hull,
    areaSquareMeters: areaPx * pxToMeter * pxToMeter,
    areaHectares: (areaPx * pxToMeter * pxToMeter) / 10000,
    detectedObjects: landPredictions,
    scaleFactor: pxToMeter,
    visualization: {
      original: canvas.toDataURL('image/jpeg'),
      detections: visualizationCanvas.toDataURL('image/jpeg'),
      boundary: visualizationCanvas.toDataURL('image/jpeg')
    }
  };
};

// Helper functions
function calculateConvexHull(points) {
  if (points.length < 3) return points;
  
  // Andrew's monotone chain algorithm
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  
  const lower = [];
  for (const p of points) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  
  const upper = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function calculatePolygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  return Math.abs(area / 2);
}

function estimateObjectScale(objects) {
  // Estimate real-world size based on detected objects
  const fence = objects.find(o => o.class.toLowerCase() === 'fence');
  if (fence) return 2 / (fence.bbox[2] / 100); // 2m / (width in px/100)
  
  const building = objects.find(o => o.class.toLowerCase() === 'building');
  if (building) return 10 / (building.bbox[2] / 100); // Assume 10m building
  
  return null;
}

function getWholeImageAsBoundary(canvas, visualizationCanvas) {
  const vizCtx = visualizationCanvas.getContext('2d');
  vizCtx.strokeStyle = '#0000FF';
  vizCtx.lineWidth = 3;
  vizCtx.strokeRect(0, 0, canvas.width, canvas.height);
  
  return {
    boundaries: [
      [0, 0],
      [canvas.width, 0],
      [canvas.width, canvas.height],
      [0, canvas.height],
      [0, 0]
    ],
    areaSquareMeters: (canvas.width * canvas.height) / 10000, // Using default scale
    areaHectares: (canvas.width * canvas.height) / 100000000,
    detectedObjects: [],
    scaleFactor: 0.01,
    visualization: {
      original: canvas.toDataURL('image/jpeg'),
      detections: visualizationCanvas.toDataURL('image/jpeg'),
      boundary: visualizationCanvas.toDataURL('image/jpeg')
    }
  };
}