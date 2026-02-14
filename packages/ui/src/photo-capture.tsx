'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { cn } from './utils';

export interface PhotoCaptureProps {
  /** Callback with base64 JPEG data when a photo is captured or uploaded */
  onCapture: (imageData: string) => void;
  /** Maximum number of photos allowed (default 5) */
  maxPhotos?: number;
  /** URLs or base64 strings of existing photos */
  existingPhotos?: string[];
  /** Callback when a photo is removed by index */
  onRemove?: (index: number) => void;
  /** Alt text per photo keyed by index */
  altTexts?: Record<number, string>;
  /** Callback when alt text changes */
  onAltTextChange?: (index: number, text: string) => void;
  className?: string;
}

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 0.8;

function resizeAndCompress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function PhotoCapture({
  onCapture,
  maxPhotos = 5,
  existingPhotos = [],
  onRemove,
  altTexts = {},
  onAltTextChange,
  className,
}: PhotoCaptureProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const photoCount = existingPhotos.length;
  const canAdd = photoCount < maxPhotos;

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      for (let i = 0; i < files.length; i++) {
        if (existingPhotos.length + i >= maxPhotos) break;
        try {
          const base64 = await resizeAndCompress(files[i]);
          onCapture(base64);
        } catch {
          // silently skip failed files
        }
      }
      // reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [onCapture, existingPhotos.length, maxPhotos]
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraActive(true);
      // wait for videoRef to be available
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    } catch {
      setCameraError('Camera unavailable. Use the upload button instead.');
      // fallback to file input
      fileInputRef.current?.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const captureFromCamera = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    // resize if needed
    let { width, height } = canvas;
    if (width > MAX_WIDTH) {
      const resized = document.createElement('canvas');
      height = Math.round((height * MAX_WIDTH) / width);
      width = MAX_WIDTH;
      resized.width = width;
      resized.height = height;
      const rctx = resized.getContext('2d');
      if (rctx) {
        rctx.drawImage(canvas, 0, 0, width, height);
        onCapture(resized.toDataURL('image/jpeg', JPEG_QUALITY));
      }
    } else {
      onCapture(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    }
    stopCamera();
  }, [onCapture, stopCamera]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Camera view overlay */}
      {cameraActive && (
        <div className="relative rounded-xl overflow-hidden border border-border bg-black">
          <video
            ref={videoRef}
            className="w-full max-h-80 object-contain"
            playsInline
            muted
            autoPlay
          />
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={captureFromCamera}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                'bg-brand-600 text-white hover:bg-brand-700 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
              )}
            >
              {/* Camera icon */}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Capture
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                'bg-card border border-border text-foreground hover:bg-muted transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {canAdd && !cameraActive && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              'border border-border bg-card text-foreground',
              'hover:bg-muted transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            {/* Upload icon */}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Photo
          </button>
          <button
            type="button"
            onClick={startCamera}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              'bg-brand-600 text-white hover:bg-brand-700 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              'dark:bg-brand-500 dark:hover:bg-brand-400'
            )}
          >
            {/* Camera icon */}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Take Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload photos"
          />
        </div>
      )}

      {cameraError && (
        <p className="text-xs text-amber-600 dark:text-amber-400">{cameraError}</p>
      )}

      {/* Counter */}
      <p className="text-xs text-muted-foreground">
        {photoCount} of {maxPhotos} photos
      </p>

      {/* Thumbnail grid or empty state */}
      {photoCount === 0 ? (
        <div
          className={cn(
            'flex flex-col items-center justify-center py-12 px-4',
            'border-2 border-dashed border-border rounded-xl',
            'text-muted-foreground'
          )}
        >
          <svg className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm font-medium">No photos captured</p>
          <p className="text-xs mt-0.5">Upload or take a photo to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {existingPhotos.map((src, idx) => (
            <div key={idx} className="relative group">
              <button
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="block w-full aspect-square rounded-lg overflow-hidden border border-border hover:border-brand-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <img
                  src={src}
                  alt={altTexts[idx] || `Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className={cn(
                    'absolute top-1 right-1 h-6 w-6 rounded-full',
                    'bg-red-500 text-white flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
                  )}
                  aria-label={`Remove photo ${idx + 1}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {onAltTextChange && (
                <input
                  type="text"
                  value={altTexts[idx] || ''}
                  onChange={(e) => onAltTextChange(idx, e.target.value)}
                  placeholder="Alt text"
                  className={cn(
                    'mt-1 w-full rounded-md border border-border bg-card px-2 py-1',
                    'text-xs text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-1 focus:ring-brand-500'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && existingPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-label={`Photo ${lightboxIndex + 1} full view`}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close lightbox"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={existingPhotos[lightboxIndex]}
            alt={altTexts[lightboxIndex] || `Photo ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
