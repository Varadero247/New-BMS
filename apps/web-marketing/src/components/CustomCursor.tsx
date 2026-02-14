'use client';
import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide on touch devices
    if ('ontouchstart' in window) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Make cursors visible
    dot.style.opacity = '1';
    ring.style.opacity = '1';

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows instantly
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    window.addEventListener('mousemove', onMouseMove);

    // Hover state
    const hoverTargets = document.querySelectorAll('a, button, [data-cursor-hover]');

    const onMouseEnter = () => {
      dot.classList.add('hover');
      ring.classList.add('hover');
    };

    const onMouseLeave = () => {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    };

    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
      hoverTargets.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <style>{`
        body { cursor: none; }
        .cursor-dot {
          position: fixed;
          top: 0;
          left: 0;
          width: 8px;
          height: 8px;
          background: var(--color-teal, #2DD4BF);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          opacity: 0;
          transition: opacity 0.3s, width 0.2s, height 0.2s, background 0.2s;
          will-change: transform;
        }
        .cursor-dot.hover {
          width: 12px;
          height: 12px;
          background: var(--color-teal-bright, #5EEAD4);
        }
        .cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          width: 40px;
          height: 40px;
          border: 1.5px solid var(--color-teal, #2DD4BF);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          opacity: 0;
          transition: opacity 0.3s, width 0.3s, height 0.3s, border-color 0.3s;
          will-change: transform;
        }
        .cursor-ring.hover {
          width: 56px;
          height: 56px;
          border-color: var(--color-teal-bright, #5EEAD4);
          opacity: 0.5;
        }
        @media (hover: none) and (pointer: coarse) {
          body { cursor: auto; }
          .cursor-dot, .cursor-ring { display: none; }
        }
      `}</style>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
