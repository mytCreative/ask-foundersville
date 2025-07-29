import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Image } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoSelect: (file: File | null) => void;
  selectedPhoto: File | null;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoSelect, selectedPhoto }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Please select an image smaller than 5MB');
        return;
      }
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onPhotoSelect(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      setIsCapturing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            onPhotoSelect(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const removePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onPhotoSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Add a Photo (Optional)
      </label>
      
      {!previewUrl && !isCapturing && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={triggerFileInput}
            className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex-1"
          >
            <Upload className="w-5 h-5 mr-2 text-gray-500" />
            <span className="text-gray-600">Upload Photo</span>
          </button>
          
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex-1"
          >
            <Camera className="w-5 h-5 mr-2 text-gray-500" />
            <span className="text-gray-600">Take Photo</span>
          </button>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="bg-white text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="bg-red-500 text-white px-6 py-2 rounded-full font-medium hover:bg-red-600 transition-colors shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="relative">
          <div className="relative bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={previewUrl}
              alt="Review photo preview"
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2 flex items-center">
            <Image className="w-4 h-4 mr-1" />
            Photo ready to upload with your review
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <canvas ref={canvasRef} className="hidden" />
      
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF. Maximum size: 5MB
      </p>
    </div>
  );
};