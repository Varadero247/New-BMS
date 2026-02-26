// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential.

export function mean(data: number[]): number {
  if (!data.length) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

export function variance(data: number[]): number {
  if (data.length < 2) return 0;
  const m = mean(data);
  return data.reduce((s, x) => s + (x - m) ** 2, 0) / data.length;
}

export function stdDev(data: number[]): number {
  return Math.sqrt(variance(data));
}

export function normalize(data: number[]): number[] {
  const min = Math.min(...data);
  const max = Math.max(...data);
  if (max === min) return data.map(() => 0);
  return data.map(x => (x - min) / (max - min));
}

export function movingAverage(data: number[], windowSize: number): number[] {
  if (windowSize <= 0 || data.length === 0) return [];
  const result: number[] = [];
  for (let i = 0; i <= data.length - windowSize; i++) {
    const window = data.slice(i, i + windowSize);
    result.push(window.reduce((a, b) => a + b, 0) / windowSize);
  }
  return result;
}

export function exponentialMovingAverage(data: number[], alpha: number): number[] {
  if (!data.length) return [];
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

export function convolve(signal: number[], kernel: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < signal.length + kernel.length - 1; i++) {
    let sum = 0;
    for (let j = 0; j < kernel.length; j++) {
      const si = i - j;
      if (si >= 0 && si < signal.length) sum += signal[si] * kernel[j];
    }
    result.push(sum);
  }
  return result;
}

export function crossCorrelation(a: number[], b: number[]): number[] {
  const n = a.length;
  const result: number[] = [];
  for (let lag = -(n - 1); lag < n; lag++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const j = i + lag;
      if (j >= 0 && j < b.length) sum += a[i] * b[j];
    }
    result.push(sum);
  }
  return result;
}

export function autoCorrelation(data: number[]): number[] {
  return crossCorrelation(data, data);
}

export function peakDetect(data: number[], threshold = 0): number[] {
  const peaks: number[] = [];
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > threshold) {
      peaks.push(i);
    }
  }
  return peaks;
}

export function zeroCrossings(data: number[]): number {
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    if ((data[i - 1] >= 0 && data[i] < 0) || (data[i - 1] < 0 && data[i] >= 0)) count++;
  }
  return count;
}

export function rms(data: number[]): number {
  if (!data.length) return 0;
  return Math.sqrt(data.reduce((s, x) => s + x ** 2, 0) / data.length);
}

export function snr(signal: number[], noise: number[]): number {
  const sigPow = rms(signal);
  const noisePow = rms(noise);
  if (noisePow === 0) return Infinity;
  return 20 * Math.log10(sigPow / noisePow);
}

export function downsample(data: number[], factor: number): number[] {
  if (factor <= 0) return [...data];
  return data.filter((_, i) => i % factor === 0);
}

export function upsample(data: number[], factor: number): number[] {
  const result: number[] = [];
  for (const val of data) {
    result.push(val);
    for (let i = 1; i < factor; i++) result.push(0);
  }
  return result;
}

export function hammingWindow(n: number): number[] {
  return Array.from({ length: n }, (_, i) => 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (n - 1)));
}

export function hannWindow(n: number): number[] {
  return Array.from({ length: n }, (_, i) => 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1))));
}

export function applyWindow(data: number[], window: number[]): number[] {
  return data.map((v, i) => v * (window[i] ?? 0));
}

export function magnitude(data: number[]): number {
  return Math.sqrt(data.reduce((s, x) => s + x ** 2, 0));
}

export function dotProduct(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function quantize(value: number, levels: number): number {
  return Math.round(value * levels) / levels;
}
