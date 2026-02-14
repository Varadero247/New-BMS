'use client';

import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from './utils';

// ── QR Code Generation (simple implementation, no external deps) ──────────────
// Uses a deterministic bit-matrix derived from the value string hash.
// This produces a QR-like visual pattern. For production scanning,
// pair with a dedicated QR library or server-side generation.

function hashString(str: string): number[] {
  const hashes: number[] = [];
  for (let round = 0; round < 4; round++) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i) + round;
      h = Math.imul(h, 0x01000193);
    }
    hashes.push(h >>> 0);
  }
  return hashes;
}

function generateQRMatrix(value: string, size: number): boolean[][] {
  const hashes = hashString(value);
  const matrix: boolean[][] = [];

  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x++) {
      // finder patterns (three corners)
      const inTopLeft = x < 7 && y < 7;
      const inTopRight = x >= size - 7 && y < 7;
      const inBottomLeft = x < 7 && y >= size - 7;

      if (inTopLeft || inTopRight || inBottomLeft) {
        const lx = inTopRight ? x - (size - 7) : x;
        const ly = inBottomLeft ? y - (size - 7) : y;
        // Standard QR finder pattern
        const isOuter = lx === 0 || lx === 6 || ly === 0 || ly === 6;
        const isInner = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
        row.push(isOuter || isInner);
      } else {
        // data area - seeded pseudo-random from hash
        const idx = (y * size + x) % 128;
        const hashIdx = Math.floor(idx / 32);
        const bitIdx = idx % 32;
        row.push(((hashes[hashIdx] >> bitIdx) & 1) === 1);
      }
    }
    matrix.push(row);
  }
  return matrix;
}

// ── QRCodeDisplay ─────────────────────────────────────────────────────────────

export interface QRCodeDisplayProps {
  /** URL or text to encode in the QR pattern */
  value: string;
  /** Label shown below the QR code */
  label?: string;
  /** Size in pixels (default 200) */
  size?: number;
  className?: string;
}

export function QRCodeDisplay({
  value,
  label,
  size = 200,
  className,
}: QRCodeDisplayProps) {
  const gridSize = 25;
  const cellSize = size / gridSize;
  const matrix = generateQRMatrix(value, gridSize);

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridSize} ${gridSize}" width="${size}" height="${size}">
        <rect width="${gridSize}" height="${gridSize}" fill="white"/>
        ${matrix
          .flatMap((row, y) =>
            row.map((cell, x) =>
              cell ? `<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>` : ''
            )
          )
          .filter(Boolean)
          .join('')}
      </svg>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>QR Label - ${label || value}</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
        ${svgContent}
        ${label ? `<p style="margin-top:12px;font-size:14px;font-weight:600;">${label}</p>` : ''}
        <p style="margin-top:4px;font-size:10px;color:#666;word-break:break-all;max-width:300px;text-align:center;">${value}</p>
        <script>window.print();window.close();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, [value, label, size, matrix, gridSize]);

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)} data-qr-value={value}>
      {/* QR code as SVG */}
      <svg
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        width={size}
        height={size}
        className="border border-border rounded-lg bg-white"
        role="img"
        aria-label={`QR code for: ${label || value}`}
      >
        {matrix.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="black" />
            ) : null
          )
        )}
      </svg>

      {/* Label */}
      {label && (
        <p className="text-sm font-medium text-foreground text-center">{label}</p>
      )}

      {/* Value (truncated) */}
      <p className="text-xs text-muted-foreground text-center max-w-[200px] truncate">
        {value}
      </p>

      {/* Print button */}
      <button
        type="button"
        onClick={handlePrint}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
          'border border-border bg-card text-foreground',
          'hover:bg-muted transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        {/* Printer icon */}
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print QR Label
      </button>
    </div>
  );
}

// ── QRScanner ─────────────────────────────────────────────────────────────────

export interface QRScannerProps {
  /** Callback when a code is scanned or entered manually */
  onScan: (value: string) => void;
  /** Callback on error */
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({
  onScan,
  onError,
  className,
}: QRScannerProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    } catch {
      const msg = 'Camera unavailable. Enter the code manually below.';
      setCameraError(msg);
      onError?.(msg);
    }
  }, [onError]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Try BarcodeDetector API if available
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;

    let cancelled = false;

    const tryDetect = async () => {
      // Check for BarcodeDetector API (Chrome 83+, Edge, Android)
      if (!('BarcodeDetector' in window)) return;

      try {
        // @ts-expect-error BarcodeDetector is not in all TS libs
        const detector = new BarcodeDetector({ formats: ['qr_code'] });
        const interval = setInterval(async () => {
          if (cancelled || !videoRef.current) {
            clearInterval(interval);
            return;
          }
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              clearInterval(interval);
              stopCamera();
              onScan(barcodes[0].rawValue);
            }
          } catch {
            // frame not ready, skip
          }
        }, 500);
      } catch {
        // BarcodeDetector not supported for qr_code format
      }
    };

    tryDetect();

    return () => {
      cancelled = true;
    };
  }, [cameraActive, onScan, stopCamera]);

  const handleManualSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = manualInput.trim();
      if (trimmed) {
        onScan(trimmed);
        setManualInput('');
      }
    },
    [manualInput, onScan]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Camera view */}
      {cameraActive && (
        <div className="relative rounded-xl overflow-hidden border border-border bg-black">
          <video
            ref={videoRef}
            className="w-full max-h-80 object-contain"
            playsInline
            muted
            autoPlay
          />
          {/* Scan overlay crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-white/60 rounded-xl" />
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center">
            <button
              type="button"
              onClick={stopCamera}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium',
                'bg-card border border-border text-foreground',
                'hover:bg-muted transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              Close Camera
            </button>
          </div>
          <p className="absolute top-3 left-0 right-0 text-center text-xs text-white/80 font-medium">
            Point camera at QR code
          </p>
        </div>
      )}

      {/* Scan button */}
      {!cameraActive && (
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
          {/* QR code icon */}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan QR Code
        </button>
      )}

      {cameraError && (
        <p className="text-xs text-amber-600 dark:text-amber-400">{cameraError}</p>
      )}

      {/* Manual input fallback */}
      <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Enter code manually"
          className={cn(
            'flex-1 rounded-lg border border-border bg-card px-3 py-2',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-brand-500'
          )}
        />
        <button
          type="submit"
          disabled={!manualInput.trim()}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium',
            'border border-border bg-card text-foreground',
            'hover:bg-muted transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
