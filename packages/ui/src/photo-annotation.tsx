'use client';

import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from './utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnnotationTool = 'rectangle' | 'circle' | 'arrow' | 'freehand' | 'text';
export type AnnotationColor = '#ef4444' | '#eab308' | '#22c55e' | '#ffffff';

interface Point { x: number; y: number }

interface Annotation {
  id: string;
  tool: AnnotationTool;
  color: AnnotationColor;
  points: Point[];
  text?: string;
}

export interface PhotoAnnotationProps {
  /** Base64 or URL of the image to annotate */
  imageSrc: string;
  /** Called with the final annotated image as base64 JPEG */
  onSave: (annotatedImage: string) => void;
  /** Called when user cancels annotation */
  onCancel: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS: { value: AnnotationColor; label: string }[] = [
  { value: '#ef4444', label: 'Red' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#ffffff', label: 'White' },
];

const TOOLS: { value: AnnotationTool; label: string; icon: string }[] = [
  { value: 'rectangle', label: 'Rectangle', icon: '▭' },
  { value: 'circle', label: 'Circle', icon: '○' },
  { value: 'arrow', label: 'Arrow', icon: '→' },
  { value: 'freehand', label: 'Pen', icon: '✎' },
  { value: 'text', label: 'Text', icon: 'T' },
];

const LINE_WIDTH = 3;

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function drawAnnotation(ctx: CanvasRenderingContext2D, a: Annotation) {
  ctx.strokeStyle = a.color;
  ctx.fillStyle = a.color;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (a.tool) {
    case 'rectangle': {
      if (a.points.length < 2) break;
      const [p1, p2] = a.points;
      ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      break;
    }
    case 'circle': {
      if (a.points.length < 2) break;
      const [c, edge] = a.points;
      const rx = Math.abs(edge.x - c.x);
      const ry = Math.abs(edge.y - c.y);
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'arrow': {
      if (a.points.length < 2) break;
      const [from, to] = a.points;
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      const headLen = 15;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      // arrowhead
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
      break;
    }
    case 'freehand': {
      if (a.points.length < 2) break;
      ctx.beginPath();
      ctx.moveTo(a.points[0].x, a.points[0].y);
      for (let i = 1; i < a.points.length; i++) {
        ctx.lineTo(a.points[i].x, a.points[i].y);
      }
      ctx.stroke();
      break;
    }
    case 'text': {
      if (a.points.length < 1 || !a.text) break;
      ctx.font = 'bold 16px sans-serif';
      // Draw background for readability
      const metrics = ctx.measureText(a.text);
      const padding = 4;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(
        a.points[0].x - padding,
        a.points[0].y - 16 - padding,
        metrics.width + padding * 2,
        20 + padding * 2,
      );
      ctx.fillStyle = a.color;
      ctx.fillText(a.text, a.points[0].x, a.points[0].y);
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PhotoAnnotation({ imageSrc, onSave, onCancel, className }: PhotoAnnotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<AnnotationTool>('rectangle');
  const [currentColor, setCurrentColor] = useState<AnnotationColor>('#ef4444');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw canvas whenever annotations change
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    for (const a of annotations) {
      drawAnnotation(ctx, a);
    }
    if (currentAnnotation) {
      drawAnnotation(ctx, currentAnnotation);
    }
  }, [annotations, currentAnnotation]);

  useEffect(() => {
    if (imageLoaded) redraw();
  }, [imageLoaded, redraw]);

  // Get canvas-relative coordinates
  const getPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getPoint(e);

    if (currentTool === 'text') {
      setTextPosition(pt);
      return;
    }

    const newAnnotation: Annotation = {
      id: `a-${Date.now()}`,
      tool: currentTool,
      color: currentColor,
      points: [pt],
    };
    setCurrentAnnotation(newAnnotation);
    setIsDrawing(true);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }, [currentTool, currentColor, getPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return;
    const pt = getPoint(e);

    if (currentAnnotation.tool === 'freehand') {
      setCurrentAnnotation(prev => prev ? { ...prev, points: [...prev.points, pt] } : null);
    } else {
      // For rectangle/circle/arrow, update the second point
      setCurrentAnnotation(prev => prev ? { ...prev, points: [prev.points[0], pt] } : null);
    }
  }, [isDrawing, currentAnnotation, getPoint]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || !currentAnnotation) return;
    setIsDrawing(false);

    // Only add if there's meaningful content
    if (currentAnnotation.points.length >= 2) {
      setAnnotations(prev => [...prev, currentAnnotation]);
    }
    setCurrentAnnotation(null);
  }, [isDrawing, currentAnnotation]);

  const handleTextSubmit = useCallback(() => {
    if (!textPosition || !textInput.trim()) {
      setTextPosition(null);
      setTextInput('');
      return;
    }
    const annotation: Annotation = {
      id: `a-${Date.now()}`,
      tool: 'text',
      color: currentColor,
      points: [textPosition],
      text: textInput.trim(),
    };
    setAnnotations(prev => [...prev, annotation]);
    setTextPosition(null);
    setTextInput('');
  }, [textPosition, textInput, currentColor]);

  const handleUndo = useCallback(() => {
    setAnnotations(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setAnnotations([]);
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Ensure final redraw without currentAnnotation
    const img = imageRef.current;
    if (!img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    for (const a of annotations) {
      drawAnnotation(ctx, a);
    }
    onSave(canvas.toDataURL('image/jpeg', 0.9));
  }, [annotations, onSave]);

  const btnBase = cn(
    'inline-flex items-center justify-center h-9 px-3 rounded-lg text-sm font-medium',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tool selection */}
        <div className="flex items-center gap-1 border border-border rounded-lg p-1">
          {TOOLS.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setCurrentTool(t.value)}
              title={t.label}
              className={cn(
                'h-8 w-8 rounded-md flex items-center justify-center text-sm transition-colors',
                currentTool === t.value
                  ? 'bg-brand-600 text-white dark:bg-brand-500'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Color selection */}
        <div className="flex items-center gap-1 border border-border rounded-lg p-1">
          {COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCurrentColor(c.value)}
              title={c.label}
              className={cn(
                'h-8 w-8 rounded-md flex items-center justify-center transition-all',
                currentColor === c.value ? 'ring-2 ring-brand-500 ring-offset-1' : '',
              )}
            >
              <span
                className="h-5 w-5 rounded-full border border-border"
                style={{ backgroundColor: c.value }}
              />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <button type="button" onClick={handleUndo} disabled={annotations.length === 0}
            className={cn(btnBase, 'border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40')}>
            Undo
          </button>
          <button type="button" onClick={handleClear} disabled={annotations.length === 0}
            className={cn(btnBase, 'border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40')}>
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative border border-border rounded-xl overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full max-h-[70vh] object-contain cursor-crosshair touch-none"
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        {!imageLoaded && (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            Loading image...
          </div>
        )}

        {/* Text input overlay */}
        {textPosition && (
          <div className="absolute inset-0 flex items-start justify-start" style={{ pointerEvents: 'none' }}>
            <div className="absolute bg-card border border-border rounded-lg p-2 shadow-lg" style={{ pointerEvents: 'auto', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <label className="block text-xs font-medium text-foreground mb-1">Add label text</label>
              <input
                type="text"
                autoFocus
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTextSubmit(); if (e.key === 'Escape') { setTextPosition(null); setTextInput(''); } }}
                placeholder="Type label..."
                className={cn(
                  'w-48 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground',
                  'placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-500',
                )}
              />
              <div className="flex items-center gap-1 mt-1.5">
                <button type="button" onClick={handleTextSubmit}
                  className={cn(btnBase, 'h-7 px-2 text-xs bg-brand-600 text-white hover:bg-brand-700')}>
                  Add
                </button>
                <button type="button" onClick={() => { setTextPosition(null); setTextInput(''); }}
                  className={cn(btnBase, 'h-7 px-2 text-xs border border-border bg-card text-foreground hover:bg-muted')}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Annotation count */}
      <p className="text-xs text-muted-foreground">
        {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
      </p>

      {/* Save / Cancel */}
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel}
          className={cn(btnBase, 'border border-border bg-card text-foreground hover:bg-muted')}>
          Cancel
        </button>
        <button type="button" onClick={handleSave}
          className={cn(btnBase, 'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400')}>
          Save Annotated Photo
        </button>
      </div>
    </div>
  );
}
