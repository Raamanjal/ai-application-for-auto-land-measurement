import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { detectBoundariesFromImage } from '../utils/aiDetection';
import './ImageUpload.css';

const ImageUpload = ({ onResults }) => {
  const [image, setImage] = useState(null);
  const [detectionData, setDetectionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // Load model with progress tracking
  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        setIsLoading(true);
        setProgress(0);
        
        await tf.ready();
        setProgress(30);
        
        // Load model with progress callback
        const model = await cocoSsd.load({
          base: 'lite_mobilenet_v2',
          onProgress: (p) => {
            setProgress(30 + Math.floor(p * 70));
          }
        });
        
        if (isMounted) {
          setModel(model);
          setProgress(100);
          setTimeout(() => setProgress(0), 1000);
        }
      } catch (err) {
        if (isMounted) {
          setError(`Model failed to load: ${err.message}`);
          setProgress(0);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadModel();
    return () => { isMounted = false; };
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !model) return;

    try {
      setIsLoading(true);
      setError(null);
      setDetectionData(null);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          setImage(event.target.result);
          setProgress(30);
          
          const results = await detectBoundariesFromImage(
            event.target.result, 
            model, 
            canvasRef.current
          );
          
          setProgress(100);
          setDetectionData(results);
          onResults(results);
          
          setTimeout(() => setProgress(0), 1000);
        } catch (err) {
          setError(`Detection failed: ${err.message}`);
          setProgress(0);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(`File reading failed: ${err.message}`);
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="image-upload-container">
      <div className="upload-controls">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          disabled={isLoading || !model}
          style={{ display: 'none' }}
        />
        <button 
          onClick={() => fileInputRef.current.click()}
          disabled={isLoading || !model}
          className="upload-button"
        >
          {isLoading ? 'Processing...' : 'Upload Land Image'}
        </button>
        {!model && <span className="model-loading">(Loading AI model...)</span>}
      </div>

      {progress > 0 && (
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {detectionData && (
        <div className="detection-results">
          <h3>AI Detection Results</h3>
          <div className="image-comparison">
            <div className="image-column">
              <h4>Original</h4>
              <img 
                src={detectionData.visualization.original} 
                alt="Original land" 
              />
            </div>
            <div className="image-column">
              <h4>Detected Objects</h4>
              <img 
                src={detectionData.visualization.detections} 
                alt="With object detection" 
              />
            </div>
            <div className="image-column">
              <h4>Calculated Boundary</h4>
              <img 
                src={detectionData.visualization.boundary} 
                alt="With boundary overlay" 
              />
            </div>
          </div>
          <div className="measurement-results">
            <h4>Measurement Data</h4>
            <table>
              <tbody>
                <tr>
                  <td>Estimated Area:</td>
                  <td>{detectionData.areaSquareMeters.toFixed(2)} m²</td>
                </tr>
                <tr>
                  <td>In Hectares:</td>
                  <td>{detectionData.areaHectares.toFixed(4)} ha</td>
                </tr>
                <tr>
                  <td>Scale Factor:</td>
                  <td>1px ≈ {(detectionData.scaleFactor * 100).toFixed(2)} cm</td>
                </tr>
                <tr>
                  <td>Objects Detected:</td>
                  <td>{detectionData.detectedObjects.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageUpload;