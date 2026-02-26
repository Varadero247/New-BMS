// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Confidential and proprietary information of Nexara DMCC.

/**
 * animation-utils — Pure math animation utilities (no DOM dependency).
 * All easing functions take t in [0, 1] and return a value in [0, 1].
 */

const PI = Math.PI;
const HALF_PI = PI / 2;

// ---------------------------------------------------------------------------
// Easing functions
// ---------------------------------------------------------------------------

/** Linear — no easing. */
export function linear(t: number): number {
  return t;
}

/** Ease In Quad — accelerating from zero velocity. */
export function easeInQuad(t: number): number {
  return t * t;
}

/** Ease Out Quad — decelerating to zero velocity. */
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/** Ease In-Out Quad — acceleration until halfway, then deceleration. */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/** Ease In Cubic. */
export function easeInCubic(t: number): number {
  return t * t * t;
}

/** Ease Out Cubic. */
export function easeOutCubic(t: number): number {
  const u = t - 1;
  return u * u * u + 1;
}

/** Ease In-Out Cubic. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

/** Ease In Sine. */
export function easeInSine(t: number): number {
  return 1 - Math.cos(t * HALF_PI);
}

/** Ease Out Sine. */
export function easeOutSine(t: number): number {
  return Math.sin(t * HALF_PI);
}

/** Ease In-Out Sine. */
export function easeInOutSine(t: number): number {
  return -(Math.cos(PI * t) - 1) / 2;
}

/** Ease In Exponential. */
export function easeInExpo(t: number): number {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

/** Ease Out Exponential. */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Ease In Back — slight overshoot. */
export function easeInBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
}

/** Ease Out Back — slight overshoot. */
export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Ease Out Bounce helper. */
export function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    const u = t - 1.5 / d1;
    return n1 * u * u + 0.75;
  } else if (t < 2.5 / d1) {
    const u = t - 2.25 / d1;
    return n1 * u * u + 0.9375;
  } else {
    const u = t - 2.625 / d1;
    return n1 * u * u + 0.984375;
  }
}

/** Ease In Bounce. */
export function easeInBounce(t: number): number {
  return 1 - easeOutBounce(1 - t);
}

/** Ease In Elastic. */
export function easeInElastic(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  const c4 = (2 * PI) / 3;
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
}

/** Ease Out Elastic. */
export function easeOutElastic(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  const c4 = (2 * PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// ---------------------------------------------------------------------------
// Interpolation utilities
// ---------------------------------------------------------------------------

/** Linear interpolation between a and b at position t. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp t to the range [0, 1]. */
export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

/**
 * Ping-pong — maps t to a 0→1→0 triangle wave.
 * Period is 2: t=0→0, t=0.5→1, t=1→0, t=1.5→1, t=2→0 …
 */
export function pingPong(t: number): number {
  const mod = t % 2;
  return mod <= 1 ? mod : 2 - mod;
}

/** Smoothstep (Hermite interpolation): 3t² − 2t³, clamped to [0,1]. */
export function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** Smootherstep (Ken Perlin's improved): 6t⁵ − 15t⁴ + 10t³, clamped. */
export function smootherstep(t: number): number {
  const c = clamp01(t);
  return c * c * c * (c * (c * 6 - 15) + 10);
}

// ---------------------------------------------------------------------------
// Keyframe interpolation
// ---------------------------------------------------------------------------

export interface Keyframe {
  time: number;
  value: number;
}

/**
 * Linearly interpolate over a sorted keyframe array at time t.
 * Returns the first keyframe value for t ≤ first keyframe time,
 * and the last keyframe value for t ≥ last keyframe time.
 */
export function interpolateKeyframes(keyframes: Keyframe[], t: number): number {
  if (keyframes.length === 0) return 0;
  if (keyframes.length === 1) return keyframes[0].value;

  if (t <= keyframes[0].time) return keyframes[0].value;
  if (t >= keyframes[keyframes.length - 1].time) return keyframes[keyframes.length - 1].value;

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (t >= a.time && t <= b.time) {
      const span = b.time - a.time;
      if (span === 0) return a.value;
      const localT = (t - a.time) / span;
      return lerp(a.value, b.value, localT);
    }
  }
  return keyframes[keyframes.length - 1].value;
}

// ---------------------------------------------------------------------------
// Spring physics
// ---------------------------------------------------------------------------

/**
 * Advance a damped spring by dt seconds.
 * Returns the new { value, velocity }.
 */
export function springValue(
  current: number,
  target: number,
  velocity: number,
  stiffness: number,
  damping: number,
  dt: number,
): { value: number; velocity: number } {
  const force = -stiffness * (current - target) - damping * velocity;
  const newVelocity = velocity + force * dt;
  const newValue = current + newVelocity * dt;
  return { value: newValue, velocity: newVelocity };
}

// ---------------------------------------------------------------------------
// Duration helpers
// ---------------------------------------------------------------------------

/** Convert milliseconds to frames at the given fps (default 60). */
export function msToFrames(ms: number, fps = 60): number {
  return (ms / 1000) * fps;
}

/** Convert frames to milliseconds at the given fps (default 60). */
export function framesToMs(frames: number, fps = 60): number {
  return (frames / fps) * 1000;
}

/** Convert seconds to milliseconds. */
export function secondsToMs(s: number): number {
  return s * 1000;
}

/** Convert milliseconds to seconds. */
export function msToSeconds(ms: number): number {
  return ms / 1000;
}
