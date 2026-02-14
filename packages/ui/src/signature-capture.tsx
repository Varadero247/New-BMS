'use client';

import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from './utils';

export interface SignatureData {
  imageBase64: string;
  signedAt: string;
}

export interface SignatureCaptureProps {
  /** Callback when signature is confirmed */
  onSign: (signatureData: SignatureData) => void;
  /** Name of the signer (shown above canvas) */
  signerName?: string;
  /** Purpose of the signature */
  purpose?: 'approval' | 'sign_off' | 'acknowledgement';
  /** Canvas width in pixels (default 400) */
  width?: number;
  /** Canvas height in pixels (default 200) */
  height?: number;
  /** Existing signature base64 to display (read-only) */
  existingSignature?: string;
  className?: string;
}

interface Point {
  x: number;
  y: number;
  time: number;
}

type Stroke = Point[];

const purposeLabels: Record<string, string> = {
  approval: 'Approval',
  sign_off: 'Sign-off',
  acknowledgement: 'Acknowledgement',
};

export function SignatureCapture({
  onSign,
  signerName,
  purpose,
  width = 400,
  height = 200,
  existingSignature,
  className,
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[] | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const isDrawingRef = useRef(false);

  // ── Drawing helpers ───────────────────────────────────────────────────────

  const getCanvasPoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0, time: Date.now() };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        time: Date.now(),
      };
    },
    []
  );

  const redrawCanvas = useCallback(
    (allStrokes: Stroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Signature line
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(20, canvas.height - 30);
      ctx.lineTo(canvas.width - 20, canvas.height - 30);
      ctx.stroke();

      // "Sign here" placeholder
      if (allStrokes.length === 0) {
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sign here', canvas.width / 2, canvas.height / 2);
      }

      // Draw strokes
      ctx.strokeStyle = '#1F2937';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const stroke of allStrokes) {
        if (stroke.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          // Variable width based on speed
          const dx = stroke[i].x - stroke[i - 1].x;
          const dy = stroke[i].y - stroke[i - 1].y;
          const dt = Math.max(stroke[i].time - stroke[i - 1].time, 1);
          const speed = Math.sqrt(dx * dx + dy * dy) / dt;
          ctx.lineWidth = Math.max(1.5, Math.min(4, 3 - speed * 0.5));
          ctx.lineTo(stroke[i].x, stroke[i].y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(stroke[i].x, stroke[i].y);
        }
      }
    },
    []
  );

  // Initial draw
  useEffect(() => {
    if (!existingSignature) {
      redrawCanvas([]);
    }
  }, [existingSignature, redrawCanvas]);

  // ── Pointer handlers ──────────────────────────────────────────────────────

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (existingSignature) return;
      e.preventDefault();
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      const point = getCanvasPoint(e);
      setCurrentStroke([point]);
    },
    [existingSignature, getCanvasPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || existingSignature) return;
      e.preventDefault();
      const point = getCanvasPoint(e);
      setCurrentStroke((prev) => {
        if (!prev) return [point];
        const updated = [...prev, point];
        // Draw incrementally
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx && prev.length > 0) {
            const last = prev[prev.length - 1];
            const dx = point.x - last.x;
            const dy = point.y - last.y;
            const dt = Math.max(point.time - last.time, 1);
            const speed = Math.sqrt(dx * dx + dy * dy) / dt;
            ctx.strokeStyle = '#1F2937';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = Math.max(1.5, Math.min(4, 3 - speed * 0.5));
            ctx.beginPath();
            ctx.moveTo(last.x, last.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        }
        return updated;
      });
    },
    [existingSignature, getCanvasPoint]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      isDrawingRef.current = false;
      setCurrentStroke((prev) => {
        if (prev && prev.length > 1) {
          setStrokes((s) => [...s, prev]);
          setHasDrawn(true);
        }
        return null;
      });
    },
    []
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleUndo = useCallback(() => {
    setStrokes((prev) => {
      const updated = prev.slice(0, -1);
      redrawCanvas(updated);
      if (updated.length === 0) setHasDrawn(false);
      return updated;
    });
  }, [redrawCanvas]);

  const handleClear = useCallback(() => {
    setStrokes([]);
    setHasDrawn(false);
    redrawCanvas([]);
  }, [redrawCanvas]);

  const handleConfirm = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const imageBase64 = canvas.toDataURL('image/png');
    onSign({
      imageBase64,
      signedAt: new Date().toISOString(),
    });
  }, [hasDrawn, onSign]);

  // ── Render ────────────────────────────────────────────────────────────────

  // Read-only mode: display existing signature
  if (existingSignature) {
    return (
      <div className={cn('space-y-2', className)}>
        {signerName && (
          <p className="text-sm font-medium text-foreground">{signerName}</p>
        )}
        {purpose && (
          <p className="text-xs text-muted-foreground">
            {purposeLabels[purpose] || purpose}
          </p>
        )}
        <div
          className="rounded-xl border border-border overflow-hidden bg-white inline-block"
          style={{ width, height }}
        >
          <img
            src={existingSignature}
            alt={`Signature of ${signerName || 'signer'}`}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {signerName && (
            <p className="text-sm font-medium text-foreground">{signerName}</p>
          )}
          {purpose && (
            <p className="text-xs text-muted-foreground">
              {purposeLabels[purpose] || purpose}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Undo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className={cn(
              'inline-flex items-center justify-center h-8 w-8 rounded-lg',
              'border border-border bg-card text-foreground',
              'hover:bg-muted transition-colors',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-label="Undo last stroke"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
            </svg>
          </button>
          {/* Clear */}
          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0}
            className={cn(
              'inline-flex items-center justify-center h-8 w-8 rounded-lg',
              'border border-border bg-card text-foreground',
              'hover:bg-muted transition-colors',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-label="Clear signature"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={cn(
          'rounded-xl border border-border cursor-crosshair touch-none',
          'max-w-full'
        )}
        style={{ width, height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="img"
        aria-label="Signature canvas"
      />

      {/* Confirm button */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!hasDrawn}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
          'bg-brand-600 text-white hover:bg-brand-700 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          'dark:bg-brand-500 dark:hover:bg-brand-400'
        )}
      >
        {/* Check icon */}
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Confirm Signature
      </button>
    </div>
  );
}
