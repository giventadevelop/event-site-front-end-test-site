"use client";

import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface QrScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: Error) => void;
  delay?: number;
  facingMode?: 'user' | 'environment';
}

export default function QrScanner({
  onScan,
  onError,
  delay = 300,
  facingMode: initialFacingMode = 'environment'
}: QrScannerProps) {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacingMode);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedDataRef = useRef<string | null>(null);

  useEffect(() => {
    // Check camera permissions
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode === 'user' ? 'user' : 'environment' }
        });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately after checking
        setHasPermission(true);
      } catch (err: any) {
        console.error('Camera permission error:', err);
        setHasPermission(false);

        // Provide more specific error messages
        let errorMessage = 'Camera permission denied. Please enable camera access in your browser settings.';
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera access in your browser settings and reload the page.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please ensure your device has a camera.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not supported. Try switching cameras or using a different device.';
        }

        onError(new Error(errorMessage));
      }
    };

    checkPermissions();
  }, [facingMode, onError]);

  useEffect(() => {
    if (hasPermission === true && videoRef.current) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [hasPermission, facingMode]);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();
      console.log('Available video devices:', videoInputDevices);

      // Find device with matching facing mode
      let selectedDeviceId: string | undefined;
      if (facingMode === 'user') {
        selectedDeviceId = videoInputDevices.find(device =>
          device.label.toLowerCase().includes('front') ||
          device.label.toLowerCase().includes('user') ||
          device.label.toLowerCase().includes('facing')
        )?.deviceId;
      } else {
        selectedDeviceId = videoInputDevices.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('environment') ||
          device.label.toLowerCase().includes('rear')
        )?.deviceId || videoInputDevices[0]?.deviceId;
      }

      // Start decoding from video
      const startDecoding = () => {
        if (!videoRef.current) return;

        const scan = async () => {
          try {
            if (!codeReaderRef.current || !videoRef.current) return;

            const result = await codeReaderRef.current.decodeFromVideoDevice(
              selectedDeviceId,
              videoRef.current,
              (result, error) => {
                if (result) {
                  const text = result.getText();
                  // Prevent duplicate scans
                  if (text !== lastScannedDataRef.current) {
                    lastScannedDataRef.current = text;
                    onScan(text);
                  }
                }
                if (error && error.name !== 'NotFoundException') {
                  // NotFoundException is normal when no QR code is detected
                  console.error('QR scan error:', error);
                }
              }
            );
          } catch (err: any) {
            console.error('Decoding error:', err);
            // NotFoundException is normal when no QR code is detected - don't show error
            if (err.name !== 'NotFoundException' && err.name !== 'NoQRCodeFound') {
              let errorMessage = `Scanning error: ${err.message}`;
              if (err.name === 'NotAllowedError') {
                errorMessage = 'Camera access denied. Please allow camera access and reload.';
              } else if (err.name === 'NotFoundError') {
                errorMessage = 'Camera not found. Please check your device.';
              } else if (err.name === 'NotReadableError') {
                errorMessage = 'Camera is in use by another application.';
              }
              onError(new Error(errorMessage));
            }
          }
        };

        scan();
      };

      // Wait for video to be ready
      videoRef.current.addEventListener('loadedmetadata', startDecoding, { once: true });

      // Fallback: start after a short delay
      setTimeout(startDecoding, 500);

    } catch (err: any) {
      console.error('Failed to start scanning:', err);
      setIsScanning(false);
      onError(new Error(`Failed to start camera: ${err.message}`));
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (err) {
        console.error('Error resetting code reader:', err);
      }
      codeReaderRef.current = null;
    }
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current);
      scanningIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleCamera = () => {
    stopScanning();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    lastScannedDataRef.current = null; // Reset last scanned data
  };

  if (hasPermission === false) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-600 font-semibold mb-2">Camera Permission Denied</p>
        <p className="text-gray-600 text-sm">Please enable camera access in your browser settings to scan QR codes.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{
            // Mobile optimization: ensure video fills container on mobile
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Scanning overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Responsive scanning frame - smaller on mobile */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 border-4 border-blue-500 rounded-lg">
            <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-blue-500"></div>
            <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-r-4 border-blue-500"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-l-4 border-blue-500"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-blue-500"></div>
          </div>
          {isScanning && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold">
              Scanning...
            </div>
          )}
        </div>
      </div>
      <button
        onClick={toggleCamera}
        className="mt-4 w-full px-4 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
        type="button"
        disabled={!hasPermission}
        style={{
          // Mobile optimization: larger touch target
          minHeight: '44px', // iOS recommended minimum touch target
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="hidden sm:inline">Switch Camera</span>
        <span className="sm:hidden">Switch</span>
        <span className="text-xs sm:text-sm">({facingMode === 'user' ? 'Front' : 'Back'})</span>
      </button>
    </div>
  );
}
