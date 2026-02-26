// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function clamp01(t: number): number { return Math.max(0, Math.min(1, t)); }
export function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
export function linear(t: number): number { return t; }

export function easeInQuad(t: number): number { return t * t; }
export function easeOutQuad(t: number): number { return 1 - (1 - t) * (1 - t); }
export function easeInOutQuad(t: number): number { return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; }

export function easeInCubic(t: number): number { return t * t * t; }
export function easeOutCubic(t: number): number { return 1 - (1 - t) ** 3; }
export function easeInOutCubic(t: number): number { return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2; }

export function easeInQuart(t: number): number { return t ** 4; }
export function easeOutQuart(t: number): number { return 1 - (1 - t) ** 4; }
export function easeInOutQuart(t: number): number { return t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2; }

export function easeInSine(t: number): number { return 1 - Math.cos(t * Math.PI / 2); }
export function easeOutSine(t: number): number { return Math.sin(t * Math.PI / 2); }
export function easeInOutSine(t: number): number { return -(Math.cos(Math.PI * t) - 1) / 2; }

export function easeInExpo(t: number): number { return t === 0 ? 0 : Math.pow(2, 10 * t - 10); }
export function easeOutExpo(t: number): number { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
export function easeInOutExpo(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

export function easeInCirc(t: number): number { return 1 - Math.sqrt(1 - t ** 2); }
export function easeOutCirc(t: number): number { return Math.sqrt(1 - (t - 1) ** 2); }
export function easeInOutCirc(t: number): number {
  return t < 0.5 ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2;
}

const C4 = (2 * Math.PI) / 3;
const C5 = (2 * Math.PI) / 4.5;
export function easeInElastic(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * C4);
}
export function easeOutElastic(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * C4) + 1;
}
export function easeInOutElastic(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * C5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * C5)) / 2 + 1;
}

const n1 = 7.5625, d1 = 2.75;
export function easeOutBounce(t: number): number {
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
  if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
  t -= 2.625 / d1; return n1 * t * t + 0.984375;
}
export function easeInBounce(t: number): number { return 1 - easeOutBounce(1 - t); }
export function easeInOutBounce(t: number): number {
  return t < 0.5 ? (1 - easeOutBounce(1 - 2 * t)) / 2 : (1 + easeOutBounce(2 * t - 1)) / 2;
}

const C1 = 1.70158, C2 = C1 * 1.525, C3 = C1 + 1;
export function easeInBack(t: number): number { return C3 * t ** 3 - C1 * t ** 2; }
export function easeOutBack(t: number): number { return 1 + C3 * (t - 1) ** 3 + C1 * (t - 1) ** 2; }
export function easeInOutBack(t: number): number {
  return t < 0.5
    ? ((2 * t) ** 2 * ((C2 + 1) * 2 * t - C2)) / 2
    : ((2 * t - 2) ** 2 * ((C2 + 1) * (2 * t - 2) + C2) + 2) / 2;
}

export type EasingName =
  | 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart'
  | 'easeInSine' | 'easeOutSine' | 'easeInOutSine'
  | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
  | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc'
  | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic'
  | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce'
  | 'easeInBack' | 'easeOutBack' | 'easeInOutBack';

const easingMap: Record<EasingName, (t: number) => number> = {
  linear, easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic,
  easeInQuart, easeOutQuart, easeInOutQuart,
  easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo, easeInOutExpo,
  easeInCirc, easeOutCirc, easeInOutCirc,
  easeInElastic, easeOutElastic, easeInOutElastic,
  easeInBounce, easeOutBounce, easeInOutBounce,
  easeInBack, easeOutBack, easeInOutBack,
};

export function getEasingFn(name: EasingName): (t: number) => number {
  return easingMap[name];
}

export function listEasingNames(): EasingName[] {
  return Object.keys(easingMap) as EasingName[];
}
