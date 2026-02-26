// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// ─── Activation Functions ────────────────────────────────────────────────────

/** Sigmoid activation: 1 / (1 + e^-x) */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** Derivative of sigmoid: sigmoid(x) * (1 - sigmoid(x)) */
export function sigmoidDerivative(x: number): number {
  const s = sigmoid(x);
  return s * (1 - s);
}

/** Rectified Linear Unit: max(0, x) */
export function relu(x: number): number {
  return Math.max(0, x);
}

/** Derivative of ReLU: 1 if x > 0, else 0 */
export function reluDerivative(x: number): number {
  return x > 0 ? 1 : 0;
}

/** Leaky ReLU: x if x > 0, else alpha * x */
export function leakyRelu(x: number, alpha = 0.01): number {
  return x > 0 ? x : alpha * x;
}

/** Derivative of Leaky ReLU */
export function leakyReluDerivative(x: number, alpha = 0.01): number {
  return x > 0 ? 1 : alpha;
}

/** Hyperbolic tangent activation */
export function tanh_(x: number): number {
  return Math.tanh(x);
}

/** Derivative of tanh: 1 - tanh(x)^2 */
export function tanhDerivative(x: number): number {
  const t = Math.tanh(x);
  return 1 - t * t;
}

/** Softplus: ln(1 + e^x), numerically stable */
export function softplus(x: number): number {
  if (x > 20) return x; // avoid overflow: log(1 + e^x) ≈ x for large x
  return Math.log(1 + Math.exp(x));
}

/** Derivative of Softplus: sigmoid(x) */
export function softplusDerivative(x: number): number {
  return sigmoid(x);
}

/** Exponential Linear Unit */
export function elu(x: number, alpha = 1.0): number {
  return x >= 0 ? x : alpha * (Math.exp(x) - 1);
}

/** Derivative of ELU */
export function eluDerivative(x: number, alpha = 1.0): number {
  return x >= 0 ? 1 : alpha * Math.exp(x);
}

/** Swish: x * sigmoid(x) */
export function swish(x: number): number {
  return x * sigmoid(x);
}

/** Derivative of Swish */
export function swishDerivative(x: number): number {
  const s = sigmoid(x);
  return s + x * s * (1 - s);
}

/** Gaussian Error Linear Unit (approximation) */
export function gelu(x: number): number {
  return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)));
}

/** Derivative of GELU (approximate) */
export function geluDerivative(x: number): number {
  const cdf = 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)));
  const pdf = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  return cdf + x * pdf;
}

/** Scaled Exponential Linear Unit */
export const SELU_LAMBDA = 1.0507009873554804934193349852946;
export const SELU_ALPHA = 1.6732632423543772848170429916717;

export function selu(x: number): number {
  return SELU_LAMBDA * (x >= 0 ? x : SELU_ALPHA * (Math.exp(x) - 1));
}

/** Derivative of SELU */
export function seluDerivative(x: number): number {
  return SELU_LAMBDA * (x >= 0 ? 1 : SELU_ALPHA * Math.exp(x));
}

/** Linear (identity) activation */
export function linear(x: number): number {
  return x;
}

/** Derivative of linear */
export function linearDerivative(_x: number): number {
  return 1;
}

/** Softmax over an array, returns probability distribution */
export function softmax(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

// ─── Activation Registry ─────────────────────────────────────────────────────

type ActivationFn = (x: number) => number;

interface ActivationPair {
  fn: ActivationFn;
  derivative: ActivationFn;
}

function getActivation(name: string): ActivationPair {
  switch (name) {
    case 'sigmoid':
      return { fn: sigmoid, derivative: sigmoidDerivative };
    case 'relu':
      return { fn: relu, derivative: reluDerivative };
    case 'leakyRelu':
      return { fn: leakyRelu, derivative: leakyReluDerivative };
    case 'tanh_':
      return { fn: tanh_, derivative: tanhDerivative };
    case 'softplus':
      return { fn: softplus, derivative: softplusDerivative };
    case 'elu':
      return { fn: elu, derivative: eluDerivative };
    case 'swish':
      return { fn: swish, derivative: swishDerivative };
    case 'gelu':
      return { fn: gelu, derivative: geluDerivative };
    case 'selu':
      return { fn: selu, derivative: seluDerivative };
    case 'linear':
    default:
      return { fn: linear, derivative: linearDerivative };
  }
}

// ─── Weight Initialisation ───────────────────────────────────────────────────

/** He initialisation for ReLU-family activations */
function heInit(fanIn: number): number {
  return (Math.random() * 2 - 1) * Math.sqrt(2 / fanIn);
}

/** Xavier/Glorot initialisation for symmetric activations */
function xavierInit(fanIn: number, fanOut: number): number {
  const limit = Math.sqrt(6 / (fanIn + fanOut));
  return (Math.random() * 2 - 1) * limit;
}

function useHeInit(activation: string): boolean {
  return ['relu', 'leakyRelu', 'elu', 'selu', 'gelu', 'swish'].includes(activation);
}

// ─── Layer ───────────────────────────────────────────────────────────────────

export class Layer {
  private weights: number[][];
  private biases: number[];
  private lastInput: number[] = [];
  private lastPreActivation: number[] = [];
  private activation: string;
  private activationFn: ActivationFn;
  private activationDeriv: ActivationFn;

  constructor(
    public readonly inputSize: number,
    public readonly outputSize: number,
    activation = 'relu',
  ) {
    this.activation = activation;
    const pair = getActivation(activation);
    this.activationFn = pair.fn;
    this.activationDeriv = pair.derivative;

    // Initialise weights
    this.weights = [];
    for (let o = 0; o < outputSize; o++) {
      const row: number[] = [];
      for (let i = 0; i < inputSize; i++) {
        row.push(
          useHeInit(activation) ? heInit(inputSize) : xavierInit(inputSize, outputSize),
        );
      }
      this.weights.push(row);
    }

    // Initialise biases to zero
    this.biases = new Array(outputSize).fill(0);
  }

  /** Forward pass: returns activated output */
  forward(input: number[]): number[] {
    this.lastInput = [...input];
    const preActivation: number[] = [];
    for (let o = 0; o < this.outputSize; o++) {
      let sum = this.biases[o];
      for (let i = 0; i < this.inputSize; i++) {
        sum += this.weights[o][i] * input[i];
      }
      preActivation.push(sum);
    }
    this.lastPreActivation = [...preActivation];
    return preActivation.map(this.activationFn);
  }

  /**
   * Backward pass: gradient is dL/d(activated output) for each output neuron.
   * Returns dL/d(input) for the previous layer.
   * Updates weights and biases by gradient descent.
   */
  backward(gradient: number[], learningRate: number): number[] {
    // Gradient through activation: dL/d(pre-activation)
    const delta = gradient.map((g, i) => g * this.activationDeriv(this.lastPreActivation[i]));

    // Update weights and biases
    for (let o = 0; o < this.outputSize; o++) {
      for (let i = 0; i < this.inputSize; i++) {
        this.weights[o][i] -= learningRate * delta[o] * this.lastInput[i];
      }
      this.biases[o] -= learningRate * delta[o];
    }

    // Propagate gradient to previous layer: dL/d(input[i])
    const inputGradient = new Array(this.inputSize).fill(0);
    for (let i = 0; i < this.inputSize; i++) {
      for (let o = 0; o < this.outputSize; o++) {
        inputGradient[i] += this.weights[o][i] * delta[o];
      }
    }
    return inputGradient;
  }

  getWeights(): number[][] {
    return this.weights.map((row) => [...row]);
  }

  getBiases(): number[] {
    return [...this.biases];
  }

  setWeights(w: number[][]): void {
    this.weights = w.map((row) => [...row]);
  }

  setBiases(b: number[]): void {
    this.biases = [...b];
  }

  getActivationName(): string {
    return this.activation;
  }
}

// ─── Neural Network ──────────────────────────────────────────────────────────

export class NeuralNetwork {
  private layers: Layer[];

  /**
   * @param layerSizes  e.g. [2, 4, 1] → input=2, hidden=4, output=1
   * @param activations e.g. ['relu', 'sigmoid']  — length = layerSizes.length - 1
   */
  constructor(layerSizes: number[], activations: string[]) {
    if (layerSizes.length < 2) {
      throw new Error('NeuralNetwork requires at least 2 layer sizes (input and output).');
    }
    if (activations.length !== layerSizes.length - 1) {
      throw new Error('activations.length must equal layerSizes.length - 1');
    }
    this.layers = layerSizes.slice(0, -1).map(
      (inSize, idx) => new Layer(inSize, layerSizes[idx + 1], activations[idx]),
    );
  }

  get numLayers(): number {
    return this.layers.length;
  }

  getLayer(index: number): Layer {
    if (index < 0 || index >= this.layers.length) {
      throw new RangeError(`Layer index ${index} out of range [0, ${this.layers.length - 1}]`);
    }
    return this.layers[index];
  }

  /** Forward pass through all layers */
  predict(input: number[]): number[] {
    let current = input;
    for (const layer of this.layers) {
      current = layer.forward(current);
    }
    return current;
  }

  /**
   * Single sample training step using MSE loss.
   * Returns the scalar loss.
   */
  train(input: number[], target: number[], learningRate: number): number {
    // Forward pass
    const output = this.predict(input);

    // MSE loss
    const loss = mse(output, target);

    // dL/d(output) for MSE: 2*(predicted - actual) / n
    const n = output.length;
    let gradient = output.map((o, i) => (2 * (o - target[i])) / n);

    // Backward pass (reverse through layers)
    for (let i = this.layers.length - 1; i >= 0; i--) {
      gradient = this.layers[i].backward(gradient, learningRate);
    }

    return loss;
  }

  /**
   * Mini-batch training over multiple epochs.
   * Returns loss history (one value per epoch).
   */
  trainBatch(
    inputs: number[][],
    targets: number[][],
    learningRate: number,
    epochs: number,
  ): number[] {
    const history: number[] = [];
    for (let e = 0; e < epochs; e++) {
      let epochLoss = 0;
      for (let i = 0; i < inputs.length; i++) {
        epochLoss += this.train(inputs[i], targets[i], learningRate);
      }
      history.push(epochLoss / inputs.length);
    }
    return history;
  }
}

// ─── Loss Functions ──────────────────────────────────────────────────────────

/** Mean Squared Error */
export function mse(predicted: number[], actual: number[]): number {
  const n = predicted.length;
  if (n === 0) return 0;
  const sum = predicted.reduce((acc, p, i) => acc + (p - actual[i]) ** 2, 0);
  return sum / n;
}

/** Mean Absolute Error */
export function mae(predicted: number[], actual: number[]): number {
  const n = predicted.length;
  if (n === 0) return 0;
  const sum = predicted.reduce((acc, p, i) => acc + Math.abs(p - actual[i]), 0);
  return sum / n;
}

/** Root Mean Squared Error */
export function rmse(predicted: number[], actual: number[]): number {
  return Math.sqrt(mse(predicted, actual));
}

/** Binary Cross-Entropy loss (element-wise, returns mean) */
export function binaryCrossEntropy(predicted: number[], actual: number[]): number {
  const n = predicted.length;
  if (n === 0) return 0;
  const eps = 1e-12;
  const sum = predicted.reduce(
    (acc, p, i) =>
      acc -
      (actual[i] * Math.log(Math.max(p, eps)) +
        (1 - actual[i]) * Math.log(Math.max(1 - p, eps))),
    0,
  );
  return sum / n;
}

/** Categorical Cross-Entropy (expects probability distributions) */
export function categoricalCrossEntropy(predicted: number[], actual: number[]): number {
  const n = predicted.length;
  if (n === 0) return 0;
  const eps = 1e-12;
  const sum = actual.reduce((acc, a, i) => acc - a * Math.log(Math.max(predicted[i], eps)), 0);
  return sum;
}

/** Huber Loss (smooth L1) */
export function huberLoss(predicted: number[], actual: number[], delta = 1.0): number {
  const n = predicted.length;
  if (n === 0) return 0;
  const sum = predicted.reduce((acc, p, i) => {
    const diff = Math.abs(p - actual[i]);
    return acc + (diff <= delta ? 0.5 * diff * diff : delta * (diff - 0.5 * delta));
  }, 0);
  return sum / n;
}

/** Hinge Loss (for SVM-style classification, labels should be ±1) */
export function hingeLoss(predicted: number[], actual: number[]): number {
  const n = predicted.length;
  if (n === 0) return 0;
  const sum = predicted.reduce((acc, p, i) => acc + Math.max(0, 1 - actual[i] * p), 0);
  return sum / n;
}

// ─── Optimisers ──────────────────────────────────────────────────────────────

export class SGD {
  update(weights: number[][], gradients: number[][], lr: number): number[][] {
    return weights.map((row, i) => row.map((w, j) => w - lr * gradients[i][j]));
  }
}

export class Adam {
  private m: number[][] = [];
  private v: number[][] = [];
  private t = 0;

  update(
    weights: number[][],
    gradients: number[][],
    lr: number,
    beta1 = 0.9,
    beta2 = 0.999,
    epsilon = 1e-8,
  ): number[][] {
    this.t += 1;

    // Initialise moment estimates if needed
    if (this.m.length === 0) {
      this.m = weights.map((row) => new Array(row.length).fill(0));
      this.v = weights.map((row) => new Array(row.length).fill(0));
    }

    return weights.map((row, i) =>
      row.map((w, j) => {
        this.m[i][j] = beta1 * this.m[i][j] + (1 - beta1) * gradients[i][j];
        this.v[i][j] = beta2 * this.v[i][j] + (1 - beta2) * gradients[i][j] ** 2;
        const mHat = this.m[i][j] / (1 - Math.pow(beta1, this.t));
        const vHat = this.v[i][j] / (1 - Math.pow(beta2, this.t));
        return w - (lr * mHat) / (Math.sqrt(vHat) + epsilon);
      }),
    );
  }

  reset(): void {
    this.m = [];
    this.v = [];
    this.t = 0;
  }
}

export class RMSProp {
  private cache: number[][] = [];

  update(
    weights: number[][],
    gradients: number[][],
    lr: number,
    decay = 0.9,
    epsilon = 1e-8,
  ): number[][] {
    if (this.cache.length === 0) {
      this.cache = weights.map((row) => new Array(row.length).fill(0));
    }
    return weights.map((row, i) =>
      row.map((w, j) => {
        this.cache[i][j] = decay * this.cache[i][j] + (1 - decay) * gradients[i][j] ** 2;
        return w - (lr * gradients[i][j]) / (Math.sqrt(this.cache[i][j]) + epsilon);
      }),
    );
  }

  reset(): void {
    this.cache = [];
  }
}

// ─── Preprocessing ───────────────────────────────────────────────────────────

export interface NormalizeResult {
  normalized: number[];
  min: number;
  max: number;
}

/** Min-max normalisation to [0, 1] */
export function normalize(data: number[]): NormalizeResult {
  if (data.length === 0) return { normalized: [], min: 0, max: 0 };
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  if (range === 0) return { normalized: data.map(() => 0), min, max };
  return { normalized: data.map((v) => (v - min) / range), min, max };
}

export interface StandardizeResult {
  standardized: number[];
  mean: number;
  std: number;
}

/** Z-score standardisation */
export function standardize(data: number[]): StandardizeResult {
  const n = data.length;
  if (n === 0) return { standardized: [], mean: 0, std: 0 };
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const variance = data.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  if (std === 0) return { standardized: data.map(() => 0), mean, std };
  return { standardized: data.map((v) => (v - mean) / std), mean, std };
}

/** One-hot encode a list of integer labels */
export function oneHotEncode(labels: number[], numClasses: number): number[][] {
  return labels.map((label) => {
    const row = new Array(numClasses).fill(0);
    if (label >= 0 && label < numClasses) row[label] = 1;
    return row;
  });
}

export interface TrainTestSplit {
  train: { data: number[][]; labels: number[][] };
  test: { data: number[][]; labels: number[][] };
}

/** Split dataset into training and test sets */
export function trainTestSplit(
  data: number[][],
  labels: number[][],
  ratio: number,
): TrainTestSplit {
  const n = data.length;
  const trainSize = Math.floor(n * ratio);
  return {
    train: { data: data.slice(0, trainSize), labels: labels.slice(0, trainSize) },
    test: { data: data.slice(trainSize), labels: labels.slice(trainSize) },
  };
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

/** Classification accuracy */
export function accuracy(predicted: number[], actual: number[]): number {
  if (predicted.length === 0) return 0;
  const correct = predicted.filter((p, i) => p === actual[i]).length;
  return correct / predicted.length;
}

/** Precision for a given class label */
export function precision(predicted: number[], actual: number[], label: number): number {
  const tp = predicted.filter((p, i) => p === label && actual[i] === label).length;
  const fp = predicted.filter((p, i) => p === label && actual[i] !== label).length;
  const denom = tp + fp;
  return denom === 0 ? 0 : tp / denom;
}

/** Recall for a given class label */
export function recall(predicted: number[], actual: number[], label: number): number {
  const tp = predicted.filter((p, i) => p === label && actual[i] === label).length;
  const fn = predicted.filter((p, i) => p !== label && actual[i] === label).length;
  const denom = tp + fn;
  return denom === 0 ? 0 : tp / denom;
}

/** F1 Score for a given class label */
export function f1Score(predicted: number[], actual: number[], label: number): number {
  const prec = precision(predicted, actual, label);
  const rec = recall(predicted, actual, label);
  const denom = prec + rec;
  return denom === 0 ? 0 : (2 * prec * rec) / denom;
}

/** Confusion matrix: rows = actual, cols = predicted */
export function confusionMatrix(
  predicted: number[],
  actual: number[],
  numClasses: number,
): number[][] {
  const matrix: number[][] = Array.from({ length: numClasses }, () =>
    new Array(numClasses).fill(0),
  );
  for (let i = 0; i < predicted.length; i++) {
    const a = actual[i];
    const p = predicted[i];
    if (a >= 0 && a < numClasses && p >= 0 && p < numClasses) {
      matrix[a][p] += 1;
    }
  }
  return matrix;
}

/** R² coefficient of determination */
export function r2Score(predicted: number[], actual: number[]): number {
  const n = actual.length;
  if (n === 0) return 0;
  const meanActual = actual.reduce((a, b) => a + b, 0) / n;
  const ssTot = actual.reduce((acc, a) => acc + (a - meanActual) ** 2, 0);
  const ssRes = predicted.reduce((acc, p, i) => acc + (actual[i] - p) ** 2, 0);
  if (ssTot === 0) return 1;
  return 1 - ssRes / ssTot;
}

// ─── Utility Helpers ─────────────────────────────────────────────────────────

/** Dot product of two vectors */
export function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, ai, i) => sum + ai * b[i], 0);
}

/** Element-wise addition of two vectors */
export function vecAdd(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + b[i]);
}

/** Element-wise subtraction */
export function vecSub(a: number[], b: number[]): number[] {
  return a.map((v, i) => v - b[i]);
}

/** Scalar multiplication of a vector */
export function vecScale(a: number[], scalar: number): number[] {
  return a.map((v) => v * scalar);
}

/** L2 norm of a vector */
export function l2Norm(a: number[]): number {
  return Math.sqrt(a.reduce((acc, v) => acc + v * v, 0));
}

/** Clip a value to [min, max] */
export function clip(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Argmax: index of the maximum value in an array */
export function argmax(arr: number[]): number {
  if (arr.length === 0) return -1;
  let maxIdx = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[maxIdx]) maxIdx = i;
  }
  return maxIdx;
}

/** Flatten a 2D matrix to a 1D array */
export function flatten(matrix: number[][]): number[] {
  return matrix.reduce<number[]>((acc, row) => acc.concat(row), []);
}

/** Reshape a 1D array into a 2D matrix */
export function reshape(arr: number[], rows: number, cols: number): number[][] {
  const result: number[][] = [];
  for (let r = 0; r < rows; r++) {
    result.push(arr.slice(r * cols, r * cols + cols));
  }
  return result;
}

/** Transpose a 2D matrix */
export function transpose(matrix: number[][]): number[][] {
  if (matrix.length === 0) return [];
  const rows = matrix.length;
  const cols = matrix[0].length;
  return Array.from({ length: cols }, (_, c) => Array.from({ length: rows }, (__, r) => matrix[r][c]));
}

/** Matrix multiplication: A (m×k) × B (k×n) → C (m×n) */
export function matMul(a: number[][], b: number[][]): number[][] {
  const m = a.length;
  const k = a[0].length;
  const n = b[0].length;
  const result: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      for (let p = 0; p < k; p++) {
        result[i][j] += a[i][p] * b[p][j];
      }
    }
  }
  return result;
}
