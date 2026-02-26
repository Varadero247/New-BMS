// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// ─── Complex number type ────────────────────────────────────────────────────

export type Complex = { re: number; im: number };

// ─── Complex arithmetic ─────────────────────────────────────────────────────

export function complexAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function complexSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function complexMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function complexDiv(a: Complex, b: Complex): Complex {
  const denom = b.re * b.re + b.im * b.im;
  if (denom === 0) throw new Error('Division by zero complex number');
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

export function complexMag(c: Complex): number {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

export function complexPhase(c: Complex): number {
  return Math.atan2(c.im, c.re);
}

export function complexConj(c: Complex): Complex {
  return { re: c.re, im: c.im === 0 ? 0 : -c.im };
}

export function complexFromPolar(r: number, theta: number): Complex {
  return { re: r * Math.cos(theta), im: r * Math.sin(theta) };
}

// ─── Utility helpers ─────────────────────────────────────────────────────────

export function nextPow2(n: number): number {
  if (n <= 0) return 1;
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

export function zeroPad(signal: number[], length: number): number[] {
  if (signal.length >= length) return signal.slice(0, length);
  return [...signal, ...new Array(length - signal.length).fill(0)];
}

// ─── Cooley-Tukey radix-2 FFT ────────────────────────────────────────────────

function _fftInPlace(re: Float64Array, im: Float64Array, inverse: boolean): void {
  const n = re.length;
  // Bit-reversal permutation
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  // Butterfly operations
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (2 * Math.PI) / len * (inverse ? 1 : -1);
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        const nextIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
        curIm = nextIm;
      }
    }
  }
  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

export function fft(signal: number[]): Complex[] {
  const n = nextPow2(signal.length);
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < signal.length; i++) re[i] = signal[i];
  _fftInPlace(re, im, false);
  const out: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) out[i] = { re: re[i], im: im[i] };
  return out;
}

export function ifft(spectrum: Complex[]): number[] {
  const n = spectrum.length;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    re[i] = spectrum[i].re;
    im[i] = spectrum[i].im;
  }
  _fftInPlace(re, im, true);
  return Array.from(re);
}

// ─── Convenience real-signal FFT ────────────────────────────────────────────

export function fftReal(
  signal: number[],
  sampleRate = 1,
): { magnitudes: number[]; phases: number[]; frequencies: number[] } {
  const spectrum = fft(signal);
  const n = spectrum.length;
  const half = Math.floor(n / 2) + 1;
  const magnitudes: number[] = new Array(half);
  const phases: number[] = new Array(half);
  const frequencies: number[] = new Array(half);
  for (let i = 0; i < half; i++) {
    magnitudes[i] = complexMag(spectrum[i]);
    phases[i] = complexPhase(spectrum[i]);
    frequencies[i] = (i * sampleRate) / n;
  }
  return { magnitudes, phases, frequencies };
}

// ─── Naive DFT / IDFT ────────────────────────────────────────────────────────

export function dft(signal: number[]): Complex[] {
  const n = signal.length;
  const out: Complex[] = new Array(n);
  for (let k = 0; k < n; k++) {
    let re = 0;
    let im = 0;
    for (let t = 0; t < n; t++) {
      const angle = (2 * Math.PI * k * t) / n;
      re += signal[t] * Math.cos(angle);
      im -= signal[t] * Math.sin(angle);
    }
    out[k] = { re, im };
  }
  return out;
}

export function idft(spectrum: Complex[]): number[] {
  const n = spectrum.length;
  const out: number[] = new Array(n);
  for (let t = 0; t < n; t++) {
    let val = 0;
    for (let k = 0; k < n; k++) {
      const angle = (2 * Math.PI * k * t) / n;
      val += spectrum[k].re * Math.cos(angle) - spectrum[k].im * Math.sin(angle);
    }
    out[t] = val / n;
  }
  return out;
}

// ─── Power spectrum ──────────────────────────────────────────────────────────

export function powerSpectrum(signal: number[]): number[] {
  const spectrum = fft(signal);
  return spectrum.map((c) => c.re * c.re + c.im * c.im);
}

// ─── Spectral features ───────────────────────────────────────────────────────

export function spectralCentroid(signal: number[], sampleRate: number): number {
  const n = nextPow2(signal.length);
  const spectrum = fft(signal);
  const half = Math.floor(n / 2) + 1;
  let weightedSum = 0;
  let magnitudeSum = 0;
  for (let i = 0; i < half; i++) {
    const mag = complexMag(spectrum[i]);
    const freq = (i * sampleRate) / n;
    weightedSum += freq * mag;
    magnitudeSum += mag;
  }
  if (magnitudeSum === 0) return 0;
  return weightedSum / magnitudeSum;
}

export function spectralRolloff(
  signal: number[],
  sampleRate: number,
  rolloffPercent = 0.85,
): number {
  const n = nextPow2(signal.length);
  const spectrum = fft(signal);
  const half = Math.floor(n / 2) + 1;
  const magnitudes: number[] = new Array(half);
  let totalEnergy = 0;
  for (let i = 0; i < half; i++) {
    magnitudes[i] = complexMag(spectrum[i]);
    totalEnergy += magnitudes[i];
  }
  const threshold = rolloffPercent * totalEnergy;
  let cumulative = 0;
  for (let i = 0; i < half; i++) {
    cumulative += magnitudes[i];
    if (cumulative >= threshold) return (i * sampleRate) / n;
  }
  return ((half - 1) * sampleRate) / n;
}

// ─── Window functions ────────────────────────────────────────────────────────

export function hammingWindow(n: number): number[] {
  if (n === 1) return [1];
  return Array.from({ length: n }, (_, i) => 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (n - 1)));
}

export function hannWindow(n: number): number[] {
  if (n === 1) return [1];
  return Array.from({ length: n }, (_, i) => 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1))));
}

export function blackmanWindow(n: number): number[] {
  if (n === 1) return [1];
  return Array.from(
    { length: n },
    (_, i) =>
      0.42 -
      0.5 * Math.cos((2 * Math.PI * i) / (n - 1)) +
      0.08 * Math.cos((4 * Math.PI * i) / (n - 1)),
  );
}

export function rectangularWindow(n: number): number[] {
  return new Array(n).fill(1);
}

export function applyWindow(signal: number[], window: number[]): number[] {
  const len = Math.min(signal.length, window.length);
  return Array.from({ length: len }, (_, i) => signal[i] * window[i]);
}

// ─── Convolution & Correlation ───────────────────────────────────────────────

export function convolve(a: number[], b: number[]): number[] {
  const resultLen = a.length + b.length - 1;
  const n = nextPow2(resultLen);
  const A = fft(zeroPad(a, n));
  const B = fft(zeroPad(b, n));
  const C: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) C[i] = complexMul(A[i], B[i]);
  const full = ifft(C);
  return full.slice(0, resultLen);
}

export function correlate(a: number[], b: number[]): number[] {
  // Cross-correlation: use conjugate of B in frequency domain
  const resultLen = a.length + b.length - 1;
  const n = nextPow2(resultLen);
  const A = fft(zeroPad(a, n));
  const B = fft(zeroPad(b, n));
  const C: Complex[] = new Array(n);
  for (let i = 0; i < n; i++) C[i] = complexMul(A[i], complexConj(B[i]));
  const full = ifft(C);
  // Rearrange so zero-lag is in the centre (return full length)
  return full.slice(0, resultLen);
}

// ─── Frequency-domain brick-wall filters ────────────────────────────────────

function _brickwallFilter(
  signal: number[],
  keepBin: (bin: number, n: number) => boolean,
): number[] {
  const spectrum = fft(signal);
  const n = spectrum.length;
  for (let i = 0; i < n; i++) {
    if (!keepBin(i, n)) {
      spectrum[i] = { re: 0, im: 0 };
      // Also zero the mirror bin
      const mirror = n - i;
      if (mirror < n && mirror > 0 && !keepBin(mirror, n)) {
        spectrum[mirror] = { re: 0, im: 0 };
      }
    }
  }
  const recovered = ifft(spectrum);
  return recovered.slice(0, signal.length);
}

export function lowPassFilter(
  signal: number[],
  cutoff: number,
  sampleRate: number,
): number[] {
  const n = nextPow2(signal.length);
  const cutoffBin = Math.round((cutoff / sampleRate) * n);
  const spectrum = fft(zeroPad(signal, n));
  for (let i = 0; i < n; i++) {
    const bin = i <= n / 2 ? i : n - i;
    if (bin > cutoffBin) spectrum[i] = { re: 0, im: 0 };
  }
  const recovered = ifft(spectrum);
  return recovered.slice(0, signal.length);
}

export function highPassFilter(
  signal: number[],
  cutoff: number,
  sampleRate: number,
): number[] {
  const n = nextPow2(signal.length);
  const cutoffBin = Math.round((cutoff / sampleRate) * n);
  const spectrum = fft(zeroPad(signal, n));
  for (let i = 0; i < n; i++) {
    const bin = i <= n / 2 ? i : n - i;
    if (bin < cutoffBin) spectrum[i] = { re: 0, im: 0 };
  }
  const recovered = ifft(spectrum);
  return recovered.slice(0, signal.length);
}

export function bandPassFilter(
  signal: number[],
  low: number,
  high: number,
  sampleRate: number,
): number[] {
  const n = nextPow2(signal.length);
  const lowBin = Math.round((low / sampleRate) * n);
  const highBin = Math.round((high / sampleRate) * n);
  const spectrum = fft(zeroPad(signal, n));
  for (let i = 0; i < n; i++) {
    const bin = i <= n / 2 ? i : n - i;
    if (bin < lowBin || bin > highBin) spectrum[i] = { re: 0, im: 0 };
  }
  const recovered = ifft(spectrum);
  return recovered.slice(0, signal.length);
}

// ─── Signal generation ───────────────────────────────────────────────────────

export function generateTone(
  freq: number,
  sampleRate: number,
  duration: number,
  amplitude = 1,
): number[] {
  const samples = Math.round(sampleRate * duration);
  return Array.from(
    { length: samples },
    (_, i) => amplitude * Math.sin((2 * Math.PI * freq * i) / sampleRate),
  );
}

export function generateNoise(length: number, amplitude = 1): number[] {
  return Array.from({ length }, () => amplitude * (Math.random() * 2 - 1));
}

// ─── Signal statistics ───────────────────────────────────────────────────────

export function rms(signal: number[]): number {
  if (signal.length === 0) return 0;
  const sumSq = signal.reduce((acc, v) => acc + v * v, 0);
  return Math.sqrt(sumSq / signal.length);
}

export function snr(signal: number[], noise: number[]): number {
  const signalPower = rms(signal);
  const noisePower = rms(noise);
  if (noisePower === 0) return Infinity;
  return 20 * Math.log10(signalPower / noisePower);
}
