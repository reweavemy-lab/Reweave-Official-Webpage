import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const AITryOn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const modelRef = useRef(null);

  const products = [
    {
      id: 'batik-tote',
      name: 'Batik Pickleball Tote',
      image: '/images/products/batik-tote.png',
      price: '$89',
      description: 'Handcrafted with traditional batik patterns'
    },
    {
      id: 'heritage-backpack',
      name: 'Heritage Backpack',
      image: '/images/products/heritage-backpack.png',
      price: '$129',
      description: 'Sustainable materials, timeless design'
    },
    {
      id: 'artisan-crossbody',
      name: 'Artisan Crossbody',
      image: '/images/products/artisan-crossbody.png',
      price: '$79',
      description: 'Perfect for everyday adventures'
    }
  ];

  useEffect(() => {
    // Load pose detection model
    loadPoseModel();
  }, []);

  const loadPoseModel = async () => {
    try {
      setIsLoading(true);
      // Load MoveNet model for pose detection
      const model = await tf.loadLayersModel('/models/movenet/model.json');
      modelRef.current = model;
      console.log('Pose detection model loaded successfully');
    } catch (error) {
      console.error('Error loading pose model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentImage(e.target.result);
        detectPose(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please use file upload instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/png');
      setCurrentImage(imageData);
      detectPose(imageData);
      
      // Stop camera
      const stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const detectPose = async (imageSrc) => {
    if (!modelRef.current) {
      console.error('Model not loaded');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        // Preprocess image for model
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([192, 192])
          .expandDims(0)
          .div(255.0);
        
        // Run pose detection
        const predictions = await modelRef.current.predict(tensor);
        const keypoints = await predictions.data();
        
        // Process keypoints to find shoulder points
        const shoulderPoints = processKeypoints(keypoints);
        setPoseData(shoulderPoints);
        
        // Clean up
        tensor.dispose();
        predictions.dispose();
      };
      
      img.src = imageSrc;
    } catch (error) {
      console.error('Error detecting pose:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processKeypoints = (keypoints) => {
    // MoveNet outputs 17 keypoints
    // Indices: 5 = left shoulder, 6 = right shoulder
    const leftShoulder = {
      x: keypoints[5 * 3],
      y: keypoints[5 * 3 + 1],
      confidence: keypoints[5 * 3 + 2]
    };
    
    const rightShoulder = {
      x: keypoints[6 * 3],
      y: keypoints[6 * 3 + 1],
      confidence: keypoints[6 * 3 + 2]
    };
    
    return { leftShoulder, rightShoulder };
  };

  const performTryOn = () => {
    if (!currentImage || !selectedProduct || !poseData) {
      alert('Please upload an image, select a product, and ensure pose detection is complete.');
      return;
    }

    setIsLoading(true);
    
    // Simulate AI try-on processing
    setTimeout(() => {
      const result = {
        originalImage: currentImage,
        product: selectedProduct,
        poseData: poseData,
        timestamp: new Date().toISOString()
      };
      
      setTryOnResult(result);
      setIsLoading(false);
    }, 2000);
  };

  const downloadResult = () => {
    if (tryOnResult) {
      const link = document.createElement('a');
      link.download = `reweave-tryon-${Date.now()}.png`;
      link.href = tryOnResult.originalImage;
      link.click();
    }
  };

  const shareResult = async () => {
    if (navigator.share && tryOnResult) {
      try {
        await navigator.share({
          title: 'Check out my Reweave try-on!',
          text: `I just tried on the ${tryOnResult.product.name}!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-ivory py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-indigo mb-6">
            AI Try-On
          </h1>
          <p className="text-xl text-pebble max-w-3xl mx-auto">
            Experience our products virtually with AI-powered pose detection. 
            Upload your photo or use your camera to see how our bags look on you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <div className="space-y-8">
            <div className="card p-8">
              <h2 className="text-2xl font-display font-semibold text-indigo mb-6">
                Upload Your Photo
              </h2>
              
              {/* File Upload */}
              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary w-full py-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Image
                </button>
              </div>

              {/* Camera Section */}
              <div className="mb-6">
                <button
                  onClick={startCamera}
                  className="btn btn-outline w-full py-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Use Camera
                </button>
              </div>

              {/* Video Preview */}
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover rounded-xl hidden"
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                {videoRef.current && !videoRef.current.classList.contains('hidden') && (
                  <button
                    onClick={capturePhoto}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 btn btn-primary"
                  >
                    Capture Photo
                  </button>
                )}
              </div>

              {/* Image Preview */}
              {currentImage && (
                <div className="relative">
                  <img
                    src={currentImage}
                    alt="Upload preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  {poseData && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      ✓ Pose Detected
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Selection */}
            <div className="card p-8">
              <h2 className="text-2xl font-display font-semibold text-indigo mb-6">
                Select Product
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedProduct?.id === product.id
                        ? 'border-sage bg-sage/10'
                        : 'border-pebble hover:border-sage'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-indigo">{product.name}</h3>
                        <p className="text-pebble text-sm">{product.description}</p>
                        <p className="text-gold font-semibold">{product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Try-On Results */}
          <div className="space-y-8">
            <div className="card p-8">
              <h2 className="text-2xl font-display font-semibold text-indigo mb-6">
                Try-On Result
              </h2>
              
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="loading-spinner"></div>
                  <span className="ml-3 text-pebble">Processing your try-on...</span>
                </div>
              )}

              {!isLoading && !tryOnResult && (
                <div className="h-64 bg-sand rounded-xl flex items-center justify-center">
                  <p className="text-pebble">Upload an image and select a product to see your try-on result</p>
                </div>
              )}

              {tryOnResult && (
                <div className="space-y-6">
                  <div className="relative">
                    <img
                      src={tryOnResult.originalImage}
                      alt="Try-on result"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    {/* Product overlay would be positioned here based on pose data */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-indigo">
                      {tryOnResult.product.name}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={downloadResult}
                      className="btn btn-primary flex-1"
                    >
                      Download
                    </button>
                    <button
                      onClick={shareResult}
                      className="btn btn-outline flex-1"
                    >
                      Share
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={performTryOn}
                disabled={!currentImage || !selectedProduct || isLoading}
                className="btn btn-primary w-full py-4 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Try It On'}
              </button>
            </div>

            {/* Instructions */}
            <div className="card p-6 bg-sage/10">
              <h3 className="font-semibold text-indigo mb-3">How it works:</h3>
              <ol className="space-y-2 text-sm text-pebble">
                <li>1. Upload a clear photo of yourself or use your camera</li>
                <li>2. Our AI will detect your pose and shoulder points</li>
                <li>3. Select a product from our collection</li>
                <li>4. See how the bag looks on you virtually</li>
                <li>5. Download or share your try-on result</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITryOn;
