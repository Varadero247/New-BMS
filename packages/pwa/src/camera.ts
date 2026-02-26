// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

/**
 * useCamera — React hook for camera capture (inspection photos, evidence collection)
 * Uses the MediaDevices API to access the camera and capture images.
 */

import { useState, useCallback, useRef } from 'react';

export interface CameraOptions {
  /** Preferred camera: 'user' (front) or 'environment' (rear, default) */
  facingMode?: 'user' | 'environment';
  /** Image quality (0-1) for JPEG compression */
  quality?: number;
  /** Max width in pixels (auto-scales maintaining aspect ratio) */
  maxWidth?: number;
  /** Max height in pixels */
  maxHeight?: number;
}

export interface CapturedImage {
  /** Data URL (base64-encoded image) */
  dataUrl: string;
  /** Image blob for upload */
  blob: Blob;
  /** Image width */
  width: number;
  /** Image height */
  height: number;
  /** Capture timestamp */
  capturedAt: Date;
}

export interface CameraState {
  isSupported: boolean;
  isActive: boolean;
  error: string | null;
  lastCapture: CapturedImage | null;
  startCamera: (videoElement: HTMLVideoElement) => Promise<void>;
  stopCamera: () => void;
  captureImage: (videoElement: HTMLVideoElement) => Promise<CapturedImage | null>;
  captureFromFileInput: (file: File) => Promise<CapturedImage | null>;
}

/**
 * Check if camera access is available in this browser.
 */
export function isCameraSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices
  );
}

export function useCamera(options: CameraOptions = {}): CameraState {
  const { facingMode = 'environment', quality = 0.85, maxWidth = 1920, maxHeight = 1080 } = options;
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCapture, setLastCapture] = useState<CapturedImage | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(
    async (videoElement: HTMLVideoElement) => {
      if (!isCameraSupported()) {
        setError('Camera not supported in this browser');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: maxWidth }, height: { ideal: maxHeight } },
          audio: false,
        });
        videoElement.srcObject = stream;
        await videoElement.play();
        streamRef.current = stream;
        setIsActive(true);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Camera access denied';
        setError(message);
        setIsActive(false);
      }
    },
    [facingMode, maxWidth, maxHeight]
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const captureImage = useCallback(
    async (videoElement: HTMLVideoElement): Promise<CapturedImage | null> => {
      if (!isActive || !videoElement.videoWidth) {
        setError('Camera is not active');
        return null;
      }

      const canvas = document.createElement('canvas');
      let width = videoElement.videoWidth;
      let height = videoElement.videoHeight;

      // Scale down if necessary
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(videoElement, 0, 0, width, height);

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(null);
              return;
            }
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const captured: CapturedImage = {
              dataUrl,
              blob,
              width,
              height,
              capturedAt: new Date(),
            };
            setLastCapture(captured);
            resolve(captured);
          },
          'image/jpeg',
          quality
        );
      });
    },
    [isActive, quality, maxWidth, maxHeight]
  );

  const captureFromFileInput = useCallback(
    async (file: File): Promise<CapturedImage | null> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  resolve(null);
                  return;
                }
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                const captured: CapturedImage = {
                  dataUrl,
                  blob,
                  width,
                  height,
                  capturedAt: new Date(),
                };
                setLastCapture(captured);
                resolve(captured);
              },
              'image/jpeg',
              quality
            );
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    },
    [quality, maxWidth, maxHeight]
  );

  return {
    isSupported: isCameraSupported(),
    isActive,
    error,
    lastCapture,
    startCamera,
    stopCamera,
    captureImage,
    captureFromFileInput,
  };
}
