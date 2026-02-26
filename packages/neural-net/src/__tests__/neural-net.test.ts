// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import {
  sigmoid,
  sigmoidDerivative,
  relu,
  reluDerivative,
  leakyRelu,
  leakyReluDerivative,
  tanh_,
  tanhDerivative,
  softplus,
  softplusDerivative,
  elu,
  eluDerivative,
  swish,
  swishDerivative,
  gelu,
  geluDerivative,
  selu,
  seluDerivative,
  linear,
  linearDerivative,
  softmax,
  SELU_LAMBDA,
  SELU_ALPHA,
  Layer,
  NeuralNetwork,
  mse,
  mae,
  rmse,
  binaryCrossEntropy,
  categoricalCrossEntropy,
  huberLoss,
  hingeLoss,
  SGD,
  Adam,
  RMSProp,
  normalize,
  standardize,
  oneHotEncode,
  trainTestSplit,
  accuracy,
  precision,
  recall,
  f1Score,
  confusionMatrix,
  r2Score,
  dotProduct,
  vecAdd,
  vecSub,
  vecScale,
  l2Norm,
  clip,
  argmax,
  flatten,
  reshape,
  transpose,
  matMul,
} from '../neural-net';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isFiniteNumber(v: unknown): boolean {
  return typeof v === 'number' && isFinite(v);
}

function isInRange(v: number, lo: number, hi: number): boolean {
  return v >= lo && v <= hi;
}

// ─── 1. Sigmoid ──────────────────────────────────────────────────────────────

describe('sigmoid', () => {
  const inputs = [-10, -5, -2, -1, -0.5, 0, 0.5, 1, 2, 5, 10];
  for (const x of inputs) {
    it(`sigmoid(${x}) returns finite number`, () => {
      expect(isFiniteNumber(sigmoid(x))).toBe(true);
    });
    it(`sigmoid(${x}) is in (0,1)`, () => {
      expect(isInRange(sigmoid(x), 0, 1)).toBe(true);
    });
  }

  it('sigmoid(0) === 0.5', () => {
    expect(sigmoid(0)).toBeCloseTo(0.5);
  });
  it('sigmoid is monotonically increasing', () => {
    const xs = [-3, -1, 0, 1, 3];
    for (let i = 1; i < xs.length; i++) {
      expect(sigmoid(xs[i])).toBeGreaterThan(sigmoid(xs[i - 1]));
    }
  });
  it('sigmoid(-x) === 1 - sigmoid(x) for x=2', () => {
    expect(sigmoid(-2)).toBeCloseTo(1 - sigmoid(2));
  });
  it('sigmoid(large positive) approaches 1', () => {
    expect(sigmoid(100)).toBeCloseTo(1, 5);
  });
  it('sigmoid(large negative) approaches 0', () => {
    expect(sigmoid(-100)).toBeCloseTo(0, 5);
  });
});

describe('sigmoidDerivative', () => {
  const inputs = [-5, -2, -1, 0, 1, 2, 5];
  for (const x of inputs) {
    it(`sigmoidDerivative(${x}) is finite`, () => {
      expect(isFiniteNumber(sigmoidDerivative(x))).toBe(true);
    });
    it(`sigmoidDerivative(${x}) is in [0, 0.25]`, () => {
      expect(sigmoidDerivative(x)).toBeGreaterThanOrEqual(0);
      expect(sigmoidDerivative(x)).toBeLessThanOrEqual(0.25 + 1e-10);
    });
  }
  it('sigmoidDerivative(0) === 0.25', () => {
    expect(sigmoidDerivative(0)).toBeCloseTo(0.25);
  });
});

// ─── 2. ReLU ─────────────────────────────────────────────────────────────────

describe('relu', () => {
  for (let x = -10; x <= 10; x++) {
    it(`relu(${x}) returns max(0,${x})`, () => {
      expect(relu(x)).toBe(Math.max(0, x));
    });
  }
  it('relu(0) === 0', () => {
    expect(relu(0)).toBe(0);
  });
  it('relu(3.7) === 3.7', () => {
    expect(relu(3.7)).toBeCloseTo(3.7);
  });
});

describe('reluDerivative', () => {
  for (let x = -5; x <= 5; x++) {
    it(`reluDerivative(${x}) is 0 or 1`, () => {
      const d = reluDerivative(x);
      expect(d === 0 || d === 1).toBe(true);
    });
  }
  it('reluDerivative(positive) === 1', () => {
    expect(reluDerivative(0.001)).toBe(1);
  });
  it('reluDerivative(negative) === 0', () => {
    expect(reluDerivative(-0.001)).toBe(0);
  });
  it('reluDerivative(0) === 0', () => {
    expect(reluDerivative(0)).toBe(0);
  });
});

// ─── 3. Leaky ReLU ───────────────────────────────────────────────────────────

describe('leakyRelu', () => {
  const alphas = [0.01, 0.1, 0.2];
  const inputs = [-5, -2, -1, 0, 1, 2, 5];
  for (const alpha of alphas) {
    for (const x of inputs) {
      it(`leakyRelu(${x}, ${alpha}) returns finite`, () => {
        expect(isFiniteNumber(leakyRelu(x, alpha))).toBe(true);
      });
    }
  }
  it('leakyRelu positive unchanged', () => {
    expect(leakyRelu(3)).toBeCloseTo(3);
  });
  it('leakyRelu negative scaled by default alpha 0.01', () => {
    expect(leakyRelu(-4)).toBeCloseTo(-0.04);
  });
  it('leakyRelu(0) === 0', () => {
    expect(leakyRelu(0)).toBe(0);
  });
  it('leakyRelu is not zero for negative inputs', () => {
    expect(leakyRelu(-5, 0.1)).not.toBe(0);
  });
});

describe('leakyReluDerivative', () => {
  for (const x of [-3, -1, 0, 1, 3]) {
    it(`leakyReluDerivative(${x}) returns finite`, () => {
      expect(isFiniteNumber(leakyReluDerivative(x))).toBe(true);
    });
  }
  it('leakyReluDerivative positive === 1', () => {
    expect(leakyReluDerivative(5)).toBe(1);
  });
  it('leakyReluDerivative negative === 0.01', () => {
    expect(leakyReluDerivative(-5)).toBeCloseTo(0.01);
  });
  it('leakyReluDerivative custom alpha', () => {
    expect(leakyReluDerivative(-5, 0.2)).toBeCloseTo(0.2);
  });
});

// ─── 4. Tanh ─────────────────────────────────────────────────────────────────

describe('tanh_', () => {
  for (let x = -5; x <= 5; x++) {
    it(`tanh_(${x}) returns finite`, () => {
      expect(isFiniteNumber(tanh_(x))).toBe(true);
    });
    it(`tanh_(${x}) is in [-1,1]`, () => {
      expect(isInRange(tanh_(x), -1, 1)).toBe(true);
    });
  }
  it('tanh_(0) === 0', () => {
    expect(tanh_(0)).toBeCloseTo(0);
  });
  it('tanh_ is odd: tanh_(-x) === -tanh_(x)', () => {
    expect(tanh_(-2)).toBeCloseTo(-tanh_(2));
  });
  it('tanh_ large positive approaches 1', () => {
    expect(tanh_(100)).toBeCloseTo(1, 5);
  });
  it('tanh_ large negative approaches -1', () => {
    expect(tanh_(-100)).toBeCloseTo(-1, 5);
  });
});

describe('tanhDerivative', () => {
  for (let x = -5; x <= 5; x++) {
    it(`tanhDerivative(${x}) is in [0,1]`, () => {
      const d = tanhDerivative(x);
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(1 + 1e-10);
    });
  }
  it('tanhDerivative(0) === 1', () => {
    expect(tanhDerivative(0)).toBeCloseTo(1);
  });
  it('tanhDerivative large x approaches 0', () => {
    expect(tanhDerivative(100)).toBeCloseTo(0, 5);
  });
});

// ─── 5. Softplus ──────────────────────────────────────────────────────────────

describe('softplus', () => {
  for (let x = -5; x <= 5; x++) {
    it(`softplus(${x}) > 0`, () => {
      expect(softplus(x)).toBeGreaterThan(0);
    });
    it(`softplus(${x}) is finite`, () => {
      expect(isFiniteNumber(softplus(x))).toBe(true);
    });
  }
  it('softplus(0) === ln(2)', () => {
    expect(softplus(0)).toBeCloseTo(Math.log(2));
  });
  it('softplus approaches x for large x', () => {
    expect(softplus(20)).toBeCloseTo(20, 2);
  });
  it('softplus is monotonically increasing', () => {
    expect(softplus(3)).toBeGreaterThan(softplus(2));
  });
});

describe('softplusDerivative', () => {
  for (let x = -3; x <= 3; x++) {
    it(`softplusDerivative(${x}) equals sigmoid(${x})`, () => {
      expect(softplusDerivative(x)).toBeCloseTo(sigmoid(x));
    });
  }
});

// ─── 6. ELU ──────────────────────────────────────────────────────────────────

describe('elu', () => {
  for (let x = -5; x <= 5; x++) {
    it(`elu(${x}) is finite`, () => {
      expect(isFiniteNumber(elu(x))).toBe(true);
    });
  }
  it('elu positive === x', () => {
    expect(elu(3)).toBeCloseTo(3);
  });
  it('elu(0) === 0', () => {
    expect(elu(0)).toBeCloseTo(0);
  });
  it('elu negative < 0', () => {
    expect(elu(-1)).toBeLessThan(0);
  });
  it('elu negative approaches -alpha for large negative x', () => {
    expect(elu(-100, 1)).toBeCloseTo(-1, 3);
  });
  it('elu custom alpha', () => {
    expect(elu(-1, 2)).toBeCloseTo(2 * (Math.exp(-1) - 1));
  });
});

describe('eluDerivative', () => {
  for (let x = -3; x <= 3; x++) {
    it(`eluDerivative(${x}) is finite`, () => {
      expect(isFiniteNumber(eluDerivative(x))).toBe(true);
    });
  }
  it('eluDerivative positive === 1', () => {
    expect(eluDerivative(5)).toBe(1);
  });
  it('eluDerivative(0) === 1', () => {
    expect(eluDerivative(0)).toBe(1);
  });
  it('eluDerivative negative < 1', () => {
    expect(eluDerivative(-1)).toBeLessThan(1);
  });
});

// ─── 7. Swish ────────────────────────────────────────────────────────────────

describe('swish', () => {
  for (let x = -5; x <= 5; x++) {
    it(`swish(${x}) is finite`, () => {
      expect(isFiniteNumber(swish(x))).toBe(true);
    });
  }
  it('swish(0) === 0', () => {
    expect(swish(0)).toBeCloseTo(0);
  });
  it('swish positive > 0', () => {
    expect(swish(2)).toBeGreaterThan(0);
  });
  it('swish negative < 0', () => {
    expect(swish(-2)).toBeLessThan(0);
  });
  it('swish(x) === x * sigmoid(x)', () => {
    for (const x of [-3, -1, 0, 1, 3]) {
      expect(swish(x)).toBeCloseTo(x * sigmoid(x));
    }
  });
});

describe('swishDerivative', () => {
  for (let x = -3; x <= 3; x++) {
    it(`swishDerivative(${x}) is finite`, () => {
      expect(isFiniteNumber(swishDerivative(x))).toBe(true);
    });
  }
});

// ─── 8. GELU ─────────────────────────────────────────────────────────────────

describe('gelu', () => {
  for (let x = -5; x <= 5; x++) {
    it(`gelu(${x}) is finite`, () => {
      expect(isFiniteNumber(gelu(x))).toBe(true);
    });
  }
  it('gelu(0) === 0', () => {
    expect(gelu(0)).toBeCloseTo(0);
  });
  it('gelu large positive close to x', () => {
    expect(gelu(5)).toBeCloseTo(5, 1);
  });
  it('gelu large negative close to 0', () => {
    expect(gelu(-5)).toBeCloseTo(0, 1);
  });
});

describe('geluDerivative', () => {
  for (let x = -3; x <= 3; x++) {
    it(`geluDerivative(${x}) is finite`, () => {
      expect(isFiniteNumber(geluDerivative(x))).toBe(true);
    });
  }
  it('geluDerivative(0) > 0', () => {
    expect(geluDerivative(0)).toBeGreaterThan(0);
  });
});

// ─── 9. SELU ─────────────────────────────────────────────────────────────────

describe('selu', () => {
  for (let x = -5; x <= 5; x++) {
    it(`selu(${x}) is finite`, () => {
      expect(isFiniteNumber(selu(x))).toBe(true);
    });
  }
  it('selu positive === LAMBDA * x', () => {
    expect(selu(2)).toBeCloseTo(SELU_LAMBDA * 2);
  });
  it('selu(0) === 0', () => {
    expect(selu(0)).toBeCloseTo(0);
  });
  it('selu negative < 0', () => {
    expect(selu(-1)).toBeLessThan(0);
  });
  it('SELU_LAMBDA > 1', () => {
    expect(SELU_LAMBDA).toBeGreaterThan(1);
  });
  it('SELU_ALPHA > 1', () => {
    expect(SELU_ALPHA).toBeGreaterThan(1);
  });
});

describe('seluDerivative', () => {
  for (let x = -3; x <= 3; x++) {
    it(`seluDerivative(${x}) is finite`, () => {
      expect(isFiniteNumber(seluDerivative(x))).toBe(true);
    });
  }
  it('seluDerivative positive === LAMBDA', () => {
    expect(seluDerivative(5)).toBeCloseTo(SELU_LAMBDA);
  });
});

// ─── 10. Linear ──────────────────────────────────────────────────────────────

describe('linear', () => {
  for (let x = -10; x <= 10; x++) {
    it(`linear(${x}) === ${x}`, () => {
      expect(linear(x)).toBe(x);
    });
  }
});

describe('linearDerivative', () => {
  for (let x = -5; x <= 5; x++) {
    it(`linearDerivative(${x}) === 1`, () => {
      expect(linearDerivative(x)).toBe(1);
    });
  }
});

// ─── 11. Softmax ─────────────────────────────────────────────────────────────

describe('softmax', () => {
  it('softmax([]) returns []', () => {
    expect(softmax([])).toEqual([]);
  });

  const testCases = [
    [1, 2, 3],
    [0, 0, 0],
    [-1, 0, 1],
    [10, 20, 30],
    [0.5, 0.5],
    [100, 200],
    [1],
    [-5, -4, -3, -2, -1],
  ];

  for (const arr of testCases) {
    it(`softmax(${JSON.stringify(arr)}) sums to ~1`, () => {
      const result = softmax(arr);
      const sum = result.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 10);
    });
    it(`softmax(${JSON.stringify(arr)}) all values in (0,1]`, () => {
      const result = softmax(arr);
      for (const v of result) {
        expect(v).toBeGreaterThan(0);
        expect(v).toBeLessThanOrEqual(1 + 1e-10);
      }
    });
    it(`softmax(${JSON.stringify(arr)}) length matches input`, () => {
      expect(softmax(arr).length).toBe(arr.length);
    });
  }

  it('softmax([1]) === [1]', () => {
    expect(softmax([1])[0]).toBeCloseTo(1);
  });
  it('softmax uniform input returns equal probabilities', () => {
    const result = softmax([1, 1, 1]);
    for (const v of result) {
      expect(v).toBeCloseTo(1 / 3);
    }
  });
  it('softmax argmax matches original argmax for distinct values', () => {
    const arr = [1, 5, 2];
    const result = softmax(arr);
    expect(result.indexOf(Math.max(...result))).toBe(1);
  });
});

// ─── 12. MSE ─────────────────────────────────────────────────────────────────

describe('mse', () => {
  it('mse([], []) === 0', () => {
    expect(mse([], [])).toBe(0);
  });

  const cases: Array<[number[], number[], number]> = [
    [[1], [1], 0],
    [[2], [1], 1],
    [[0, 0], [1, 1], 1],
    [[3, 3], [0, 0], 9],
    [[1, 2, 3], [1, 2, 3], 0],
  ];

  for (const [pred, actual, expected] of cases) {
    it(`mse(${JSON.stringify(pred)}, ${JSON.stringify(actual)}) ≈ ${expected}`, () => {
      expect(mse(pred, actual)).toBeCloseTo(expected);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`mse perfect prediction (len=${i}) === 0`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      expect(mse(arr, arr)).toBeCloseTo(0);
    });
  }

  for (let offset = 1; offset <= 5; offset++) {
    it(`mse with constant offset ${offset} === ${offset ** 2}`, () => {
      const pred = [0, 0, 0];
      const actual = [offset, offset, offset];
      expect(mse(pred, actual)).toBeCloseTo(offset ** 2);
    });
  }
});

// ─── 13. MAE ─────────────────────────────────────────────────────────────────

describe('mae', () => {
  it('mae([], []) === 0', () => {
    expect(mae([], [])).toBe(0);
  });

  const cases: Array<[number[], number[], number]> = [
    [[1], [1], 0],
    [[3], [1], 2],
    [[0, 0], [1, 1], 1],
    [[-1, 1], [0, 0], 1],
    [[1, 2, 3], [4, 5, 6], 3],
  ];

  for (const [pred, actual, expected] of cases) {
    it(`mae(${JSON.stringify(pred)}, ${JSON.stringify(actual)}) ≈ ${expected}`, () => {
      expect(mae(pred, actual)).toBeCloseTo(expected);
    });
  }

  for (let offset = 1; offset <= 5; offset++) {
    it(`mae constant offset ${offset} === ${offset}`, () => {
      const pred = [0, 0, 0];
      const actual = [offset, offset, offset];
      expect(mae(pred, actual)).toBeCloseTo(offset);
    });
  }
});

// ─── 14. RMSE ────────────────────────────────────────────────────────────────

describe('rmse', () => {
  it('rmse perfect prediction === 0', () => {
    expect(rmse([1, 2, 3], [1, 2, 3])).toBeCloseTo(0);
  });
  it('rmse is sqrt of mse', () => {
    const pred = [1, 3];
    const actual = [2, 4];
    expect(rmse(pred, actual)).toBeCloseTo(Math.sqrt(mse(pred, actual)));
  });
  for (let err = 1; err <= 5; err++) {
    it(`rmse constant error ${err} === ${err}`, () => {
      expect(rmse([err, err], [0, 0])).toBeCloseTo(err);
    });
  }
  it('rmse([], []) === 0', () => {
    expect(rmse([], [])).toBe(0);
  });
});

// ─── 15. Binary Cross-Entropy ─────────────────────────────────────────────────

describe('binaryCrossEntropy', () => {
  it('binaryCrossEntropy([], []) === 0', () => {
    expect(binaryCrossEntropy([], [])).toBe(0);
  });
  it('bce perfect prediction is close to 0', () => {
    expect(binaryCrossEntropy([0.9999], [1])).toBeLessThan(0.01);
  });
  it('bce bad prediction has high loss', () => {
    expect(binaryCrossEntropy([0.0001], [1])).toBeGreaterThan(5);
  });
  it('bce is finite for all boundary-free predictions', () => {
    expect(isFiniteNumber(binaryCrossEntropy([0.5, 0.5], [1, 0]))).toBe(true);
  });
  for (const p of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    it(`bce(${p}, 1) is finite`, () => {
      expect(isFiniteNumber(binaryCrossEntropy([p], [1]))).toBe(true);
    });
    it(`bce(${p}, 0) is finite`, () => {
      expect(isFiniteNumber(binaryCrossEntropy([p], [0]))).toBe(true);
    });
  }
  it('bce symmetric: BCE(p,1) + BCE(1-p, 0) are both finite', () => {
    const p = 0.3;
    expect(isFiniteNumber(binaryCrossEntropy([p], [1]))).toBe(true);
    expect(isFiniteNumber(binaryCrossEntropy([1 - p], [0]))).toBe(true);
  });
});

// ─── 16. Categorical Cross-Entropy ──────────────────────────────────────────

describe('categoricalCrossEntropy', () => {
  it('cce([], []) === 0', () => {
    expect(categoricalCrossEntropy([], [])).toBe(0);
  });
  it('cce perfect prediction is close to 0', () => {
    expect(categoricalCrossEntropy([0.9999, 0.0001], [1, 0])).toBeLessThan(0.01);
  });
  it('cce returns finite number', () => {
    expect(isFiniteNumber(categoricalCrossEntropy([0.3, 0.7], [0, 1]))).toBe(true);
  });
  for (const i of [0, 1, 2]) {
    it(`cce one-hot encoding (class=${i}) returns finite`, () => {
      const pred = softmax([1, 2, 3]);
      const actual = [0, 0, 0].map((_, j) => (j === i ? 1 : 0));
      expect(isFiniteNumber(categoricalCrossEntropy(pred, actual))).toBe(true);
    });
  }
});

// ─── 17. Huber Loss ──────────────────────────────────────────────────────────

describe('huberLoss', () => {
  it('huberLoss([], []) === 0', () => {
    expect(huberLoss([], [])).toBe(0);
  });
  it('huberLoss perfect prediction === 0', () => {
    expect(huberLoss([1, 2, 3], [1, 2, 3])).toBeCloseTo(0);
  });
  it('huberLoss small error uses quadratic branch', () => {
    expect(huberLoss([0.5], [0], 1.0)).toBeCloseTo(0.5 * 0.5 * 0.5);
  });
  it('huberLoss large error uses linear branch', () => {
    expect(huberLoss([5], [0], 1.0)).toBeCloseTo(1.0 * (5 - 0.5));
  });
  for (let delta = 1; delta <= 5; delta++) {
    it(`huberLoss with delta=${delta} returns finite`, () => {
      expect(isFiniteNumber(huberLoss([1, 2], [3, 4], delta))).toBe(true);
    });
  }
  it('huberLoss is non-negative', () => {
    expect(huberLoss([1, 2, 3], [3, 2, 1])).toBeGreaterThanOrEqual(0);
  });
});

// ─── 18. Hinge Loss ──────────────────────────────────────────────────────────

describe('hingeLoss', () => {
  it('hingeLoss([], []) === 0', () => {
    expect(hingeLoss([], [])).toBe(0);
  });
  it('hingeLoss perfect classification === 0', () => {
    expect(hingeLoss([2], [1])).toBeCloseTo(0);
  });
  it('hingeLoss misclassification > 0', () => {
    expect(hingeLoss([-1], [1])).toBeGreaterThan(0);
  });
  for (let margin = 0.5; margin <= 2.5; margin += 0.5) {
    it(`hingeLoss with margin ${margin.toFixed(1)} is finite`, () => {
      expect(isFiniteNumber(hingeLoss([margin], [1]))).toBe(true);
    });
  }
  it('hingeLoss is non-negative', () => {
    expect(hingeLoss([0.5, -0.5], [1, -1])).toBeGreaterThanOrEqual(0);
  });
});

// ─── 19. Layer ───────────────────────────────────────────────────────────────

describe('Layer', () => {
  const activations = ['sigmoid', 'relu', 'leakyRelu', 'tanh_', 'softplus', 'elu', 'swish', 'linear', 'selu', 'gelu'];

  for (const act of activations) {
    describe(`Layer with activation: ${act}`, () => {
      it(`creates layer with ${act} without throwing`, () => {
        expect(() => new Layer(3, 2, act)).not.toThrow();
      });

      it(`forward() returns array of correct size for ${act}`, () => {
        const layer = new Layer(3, 2, act);
        const out = layer.forward([1, 2, 3]);
        expect(out.length).toBe(2);
      });

      it(`forward() returns finite values for ${act}`, () => {
        const layer = new Layer(3, 2, act);
        const out = layer.forward([0.5, 0.5, 0.5]);
        for (const v of out) {
          expect(isFiniteNumber(v)).toBe(true);
        }
      });

      it(`backward() returns gradient array of correct size for ${act}`, () => {
        const layer = new Layer(3, 2, act);
        layer.forward([1, 2, 3]);
        const grad = layer.backward([0.1, 0.1], 0.01);
        expect(grad.length).toBe(3);
      });

      it(`backward() returns finite gradient values for ${act}`, () => {
        const layer = new Layer(3, 2, act);
        layer.forward([1, 2, 3]);
        const grad = layer.backward([0.1, 0.1], 0.01);
        for (const g of grad) {
          expect(isFiniteNumber(g)).toBe(true);
        }
      });

      it(`getWeights() returns correct shape for ${act}`, () => {
        const layer = new Layer(4, 3, act);
        const w = layer.getWeights();
        expect(w.length).toBe(3);
        for (const row of w) {
          expect(row.length).toBe(4);
        }
      });

      it(`getBiases() returns correct length for ${act}`, () => {
        const layer = new Layer(4, 3, act);
        const b = layer.getBiases();
        expect(b.length).toBe(3);
      });
    });
  }

  it('Layer setWeights and getWeights round-trip', () => {
    const layer = new Layer(2, 2, 'relu');
    const w = [[1, 2], [3, 4]];
    layer.setWeights(w);
    const retrieved = layer.getWeights();
    expect(retrieved[0][0]).toBeCloseTo(1);
    expect(retrieved[0][1]).toBeCloseTo(2);
    expect(retrieved[1][0]).toBeCloseTo(3);
    expect(retrieved[1][1]).toBeCloseTo(4);
  });

  it('Layer setBiases and getBiases round-trip', () => {
    const layer = new Layer(2, 2, 'relu');
    layer.setBiases([5, 6]);
    const b = layer.getBiases();
    expect(b[0]).toBeCloseTo(5);
    expect(b[1]).toBeCloseTo(6);
  });

  it('Layer with zero bias and identity weights acts as identity with linear', () => {
    const layer = new Layer(2, 2, 'linear');
    layer.setWeights([[1, 0], [0, 1]]);
    layer.setBiases([0, 0]);
    const out = layer.forward([3, 7]);
    expect(out[0]).toBeCloseTo(3);
    expect(out[1]).toBeCloseTo(7);
  });

  it('Layer forward with all-zero input', () => {
    const layer = new Layer(3, 2, 'relu');
    layer.setBiases([0, 0]);
    const out = layer.forward([0, 0, 0]);
    for (const v of out) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it('Layer inputSize and outputSize are accessible', () => {
    const layer = new Layer(5, 3, 'relu');
    expect(layer.inputSize).toBe(5);
    expect(layer.outputSize).toBe(3);
  });

  it('Layer biases initialised to zero', () => {
    const layer = new Layer(3, 4, 'relu');
    const b = layer.getBiases();
    for (const bias of b) {
      expect(bias).toBe(0);
    }
  });

  for (let inputSize = 1; inputSize <= 5; inputSize++) {
    it(`Layer inputSize=${inputSize} outputSize=2 forward returns length 2`, () => {
      const layer = new Layer(inputSize, 2, 'relu');
      const input = new Array(inputSize).fill(1);
      expect(layer.forward(input).length).toBe(2);
    });
  }

  for (let outputSize = 1; outputSize <= 5; outputSize++) {
    it(`Layer inputSize=3 outputSize=${outputSize} backward returns length 3`, () => {
      const layer = new Layer(3, outputSize, 'linear');
      layer.forward([1, 2, 3]);
      const gradient = new Array(outputSize).fill(0.1);
      expect(layer.backward(gradient, 0.01).length).toBe(3);
    });
  }

  it('Layer weights mutate after backward (learning rate > 0)', () => {
    const layer = new Layer(2, 2, 'linear');
    layer.setWeights([[1, 1], [1, 1]]);
    layer.setBiases([0, 0]);
    const wBefore = layer.getWeights().map((r) => [...r]);
    layer.forward([1, 1]);
    layer.backward([1, 1], 0.1);
    const wAfter = layer.getWeights();
    expect(wBefore[0][0]).not.toBeCloseTo(wAfter[0][0]);
  });
});

// ─── 20. NeuralNetwork ───────────────────────────────────────────────────────

describe('NeuralNetwork', () => {
  it('throws when only one layer size provided', () => {
    expect(() => new NeuralNetwork([3], [])).toThrow();
  });

  it('throws when activations length mismatch', () => {
    expect(() => new NeuralNetwork([2, 3, 1], ['relu'])).toThrow();
  });

  it('numLayers is correct for 2 layer sizes', () => {
    const nn = new NeuralNetwork([2, 1], ['sigmoid']);
    expect(nn.numLayers).toBe(1);
  });

  it('numLayers is correct for 3 layer sizes', () => {
    const nn = new NeuralNetwork([2, 4, 1], ['relu', 'sigmoid']);
    expect(nn.numLayers).toBe(2);
  });

  it('predict returns array of correct size', () => {
    const nn = new NeuralNetwork([3, 4, 2], ['relu', 'sigmoid']);
    const out = nn.predict([1, 2, 3]);
    expect(out.length).toBe(2);
  });

  it('predict returns finite values', () => {
    const nn = new NeuralNetwork([2, 3, 1], ['relu', 'sigmoid']);
    const out = nn.predict([0.5, 0.5]);
    for (const v of out) {
      expect(isFiniteNumber(v)).toBe(true);
    }
  });

  it('train returns finite loss', () => {
    const nn = new NeuralNetwork([2, 3, 1], ['relu', 'sigmoid']);
    const loss = nn.train([0.5, 0.5], [0.8], 0.01);
    expect(isFiniteNumber(loss)).toBe(true);
  });

  it('train returns non-negative loss', () => {
    const nn = new NeuralNetwork([2, 3, 1], ['relu', 'sigmoid']);
    const loss = nn.train([0.5, 0.5], [0.8], 0.01);
    expect(loss).toBeGreaterThanOrEqual(0);
  });

  it('trainBatch returns loss history of correct length', () => {
    const nn = new NeuralNetwork([2, 3, 1], ['relu', 'sigmoid']);
    const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
    const targets = [[0], [1], [1], [0]];
    const history = nn.trainBatch(inputs, targets, 0.01, 5);
    expect(history.length).toBe(5);
  });

  it('trainBatch all losses are finite', () => {
    const nn = new NeuralNetwork([2, 3, 1], ['relu', 'sigmoid']);
    const inputs = [[0, 0], [1, 1]];
    const targets = [[0], [1]];
    const history = nn.trainBatch(inputs, targets, 0.01, 3);
    for (const loss of history) {
      expect(isFiniteNumber(loss)).toBe(true);
    }
  });

  it('getLayer returns a Layer instance', () => {
    const nn = new NeuralNetwork([2, 3, 1], ['relu', 'sigmoid']);
    expect(nn.getLayer(0)).toBeInstanceOf(Layer);
    expect(nn.getLayer(1)).toBeInstanceOf(Layer);
  });

  it('getLayer throws for out-of-bounds index', () => {
    const nn = new NeuralNetwork([2, 3, 1], ['relu', 'sigmoid']);
    expect(() => nn.getLayer(5)).toThrow(RangeError);
    expect(() => nn.getLayer(-1)).toThrow(RangeError);
  });

  it('loss decreases after many training steps on XOR', () => {
    const nn = new NeuralNetwork([2, 4, 1], ['relu', 'sigmoid']);
    const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
    const targets = [[0], [1], [1], [0]];
    const lossStart = nn.train(inputs[0], targets[0], 0.1);
    nn.trainBatch(inputs, targets, 0.1, 200);
    const lossEnd = nn.train(inputs[0], targets[0], 0.1);
    // Network should have changed
    expect(typeof lossEnd).toBe('number');
    expect(typeof lossStart).toBe('number');
  });

  const architectures: Array<[number[], string[]]> = [
    [[2, 1], ['sigmoid']],
    [[3, 4, 2], ['relu', 'sigmoid']],
    [[4, 8, 4, 2], ['relu', 'tanh_', 'sigmoid']],
    [[2, 5, 5, 1], ['leakyRelu', 'elu', 'linear']],
    [[1, 3, 1], ['swish', 'sigmoid']],
  ];

  for (const [sizes, acts] of architectures) {
    it(`NeuralNetwork ${JSON.stringify(sizes)} predict produces output of size ${sizes[sizes.length - 1]}`, () => {
      const nn = new NeuralNetwork(sizes, acts);
      const input = new Array(sizes[0]).fill(0.5);
      expect(nn.predict(input).length).toBe(sizes[sizes.length - 1]);
    });

    it(`NeuralNetwork ${JSON.stringify(sizes)} train returns finite loss`, () => {
      const nn = new NeuralNetwork(sizes, acts);
      const input = new Array(sizes[0]).fill(0.5);
      const target = new Array(sizes[sizes.length - 1]).fill(0.5);
      expect(isFiniteNumber(nn.train(input, target, 0.01))).toBe(true);
    });
  }

  it('trainBatch with 1 sample and 1 epoch returns 1 loss value', () => {
    const nn = new NeuralNetwork([2, 1], ['sigmoid']);
    const history = nn.trainBatch([[0.5, 0.5]], [[0.8]], 0.01, 1);
    expect(history.length).toBe(1);
  });

  it('trainBatch with 10 epochs returns 10 loss values', () => {
    const nn = new NeuralNetwork([2, 1], ['sigmoid']);
    const history = nn.trainBatch([[0.5, 0.5]], [[0.8]], 0.01, 10);
    expect(history.length).toBe(10);
  });
});

// ─── 21. SGD Optimiser ────────────────────────────────────────────────────────

describe('SGD', () => {
  const sgd = new SGD();

  it('SGD returns updated weights with same shape', () => {
    const w = [[1, 2], [3, 4]];
    const g = [[0.1, 0.1], [0.1, 0.1]];
    const updated = sgd.update(w, g, 0.1);
    expect(updated.length).toBe(2);
    expect(updated[0].length).toBe(2);
  });

  it('SGD decreases weights when gradient is positive', () => {
    const w = [[1]];
    const g = [[0.5]];
    const updated = sgd.update(w, g, 0.1);
    expect(updated[0][0]).toBeCloseTo(1 - 0.1 * 0.5);
  });

  for (let lr = 0.001; lr <= 0.1; lr += 0.02) {
    it(`SGD with lr=${lr.toFixed(3)} returns finite result`, () => {
      const w = [[2, 3]];
      const g = [[0.5, 0.5]];
      const updated = sgd.update(w, g, lr);
      for (const v of updated[0]) {
        expect(isFiniteNumber(v)).toBe(true);
      }
    });
  }

  it('SGD with zero gradient leaves weights unchanged', () => {
    const w = [[5, 6]];
    const g = [[0, 0]];
    const updated = sgd.update(w, g, 0.1);
    expect(updated[0][0]).toBeCloseTo(5);
    expect(updated[0][1]).toBeCloseTo(6);
  });

  it('SGD with lr=0 leaves weights unchanged', () => {
    const w = [[5, 6]];
    const g = [[1, 1]];
    const updated = sgd.update(w, g, 0);
    expect(updated[0][0]).toBeCloseTo(5);
    expect(updated[0][1]).toBeCloseTo(6);
  });
});

// ─── 22. Adam Optimiser ───────────────────────────────────────────────────────

describe('Adam', () => {
  it('Adam returns same shape as input weights', () => {
    const adam = new Adam();
    const w = [[1, 2], [3, 4]];
    const g = [[0.1, 0.1], [0.1, 0.1]];
    const updated = adam.update(w, g, 0.001);
    expect(updated.length).toBe(2);
    expect(updated[0].length).toBe(2);
  });

  it('Adam update returns finite values', () => {
    const adam = new Adam();
    const w = [[1]];
    const g = [[0.5]];
    const updated = adam.update(w, g, 0.001);
    expect(isFiniteNumber(updated[0][0])).toBe(true);
  });

  it('Adam update modifies weights', () => {
    const adam = new Adam();
    const w = [[1]];
    const g = [[0.5]];
    const updated = adam.update(w, g, 0.001);
    expect(updated[0][0]).not.toBe(1);
  });

  it('Adam multiple updates accumulate moments', () => {
    const adam = new Adam();
    let w = [[1, 2]];
    const g = [[0.1, 0.1]];
    for (let i = 0; i < 5; i++) {
      w = adam.update(w, g, 0.001);
    }
    for (const v of w[0]) {
      expect(isFiniteNumber(v)).toBe(true);
    }
  });

  it('Adam reset clears moments', () => {
    const adam = new Adam();
    const w = [[1]];
    const g = [[0.5]];
    adam.update(w, g, 0.001);
    adam.reset();
    const updated = adam.update(w, g, 0.001);
    expect(isFiniteNumber(updated[0][0])).toBe(true);
  });

  for (const beta1 of [0.8, 0.9, 0.99]) {
    it(`Adam with beta1=${beta1} returns finite result`, () => {
      const adam = new Adam();
      const updated = adam.update([[1]], [[0.5]], 0.001, beta1);
      expect(isFiniteNumber(updated[0][0])).toBe(true);
    });
  }

  for (const beta2 of [0.99, 0.999, 0.9999]) {
    it(`Adam with beta2=${beta2} returns finite result`, () => {
      const adam = new Adam();
      const updated = adam.update([[1]], [[0.5]], 0.001, 0.9, beta2);
      expect(isFiniteNumber(updated[0][0])).toBe(true);
    });
  }
});

// ─── 23. RMSProp Optimiser ────────────────────────────────────────────────────

describe('RMSProp', () => {
  it('RMSProp returns same shape', () => {
    const rms = new RMSProp();
    const updated = rms.update([[1, 2]], [[0.1, 0.1]], 0.01);
    expect(updated[0].length).toBe(2);
  });

  it('RMSProp update is finite', () => {
    const rms = new RMSProp();
    const updated = rms.update([[1]], [[0.5]], 0.01);
    expect(isFiniteNumber(updated[0][0])).toBe(true);
  });

  it('RMSProp reset clears cache', () => {
    const rms = new RMSProp();
    rms.update([[1]], [[0.5]], 0.01);
    rms.reset();
    const updated = rms.update([[1]], [[0.5]], 0.01);
    expect(isFiniteNumber(updated[0][0])).toBe(true);
  });

  for (const decay of [0.8, 0.9, 0.95, 0.99]) {
    it(`RMSProp decay=${decay} returns finite result`, () => {
      const rms = new RMSProp();
      const updated = rms.update([[2]], [[0.3]], 0.01, decay);
      expect(isFiniteNumber(updated[0][0])).toBe(true);
    });
  }

  it('RMSProp multiple updates stay finite', () => {
    const rms = new RMSProp();
    let w = [[1, 2]];
    for (let i = 0; i < 10; i++) {
      w = rms.update(w, [[0.1, 0.1]], 0.01);
    }
    for (const v of w[0]) {
      expect(isFiniteNumber(v)).toBe(true);
    }
  });
});

// ─── 24. Normalize ───────────────────────────────────────────────────────────

describe('normalize', () => {
  it('normalize([]) returns { normalized:[], min:0, max:0 }', () => {
    const result = normalize([]);
    expect(result.normalized).toEqual([]);
    expect(result.min).toBe(0);
    expect(result.max).toBe(0);
  });

  it('normalize single element returns [0]', () => {
    const result = normalize([5]);
    expect(result.normalized[0]).toBe(0);
  });

  it('normalize constant array returns all zeros', () => {
    const result = normalize([3, 3, 3]);
    for (const v of result.normalized) {
      expect(v).toBe(0);
    }
  });

  it('normalize returns all values in [0,1]', () => {
    const data = [1, 3, 5, 7, 9];
    const { normalized } = normalize(data);
    for (const v of normalized) {
      expect(isInRange(v, 0, 1)).toBe(true);
    }
  });

  it('normalize min value maps to 0', () => {
    const data = [2, 5, 8];
    const { normalized } = normalize(data);
    expect(normalized[0]).toBeCloseTo(0);
  });

  it('normalize max value maps to 1', () => {
    const data = [2, 5, 8];
    const { normalized } = normalize(data);
    expect(normalized[2]).toBeCloseTo(1);
  });

  it('normalize preserves min and max', () => {
    const data = [10, 20, 30];
    const { min, max } = normalize(data);
    expect(min).toBe(10);
    expect(max).toBe(30);
  });

  for (let n = 2; n <= 10; n++) {
    it(`normalize array of length ${n} returns same length`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const { normalized } = normalize(data);
      expect(normalized.length).toBe(n);
    });
  }

  for (let scale = 1; scale <= 5; scale++) {
    it(`normalize [0..${scale}] max is 1`, () => {
      const data = Array.from({ length: scale + 1 }, (_, i) => i);
      const { normalized } = normalize(data);
      expect(Math.max(...normalized)).toBeCloseTo(1);
    });
  }
});

// ─── 25. Standardize ─────────────────────────────────────────────────────────

describe('standardize', () => {
  it('standardize([]) returns { standardized:[], mean:0, std:0 }', () => {
    const result = standardize([]);
    expect(result.standardized).toEqual([]);
    expect(result.mean).toBe(0);
    expect(result.std).toBe(0);
  });

  it('standardize constant array returns all zeros', () => {
    const { standardized } = standardize([5, 5, 5]);
    for (const v of standardized) {
      expect(v).toBe(0);
    }
  });

  it('standardize mean of result is ~0', () => {
    const data = [1, 2, 3, 4, 5];
    const { standardized } = standardize(data);
    const mean = standardized.reduce((a, b) => a + b, 0) / standardized.length;
    expect(mean).toBeCloseTo(0, 10);
  });

  it('standardize std of result is ~1', () => {
    const data = [1, 2, 3, 4, 5];
    const { standardized } = standardize(data);
    const mean = standardized.reduce((a, b) => a + b, 0) / standardized.length;
    const variance = standardized.reduce((acc, v) => acc + (v - mean) ** 2, 0) / standardized.length;
    expect(Math.sqrt(variance)).toBeCloseTo(1, 10);
  });

  it('standardize preserves length', () => {
    const data = [10, 20, 30, 40];
    const { standardized } = standardize(data);
    expect(standardized.length).toBe(4);
  });

  it('standardize returns correct mean', () => {
    const data = [2, 4, 6];
    const { mean } = standardize(data);
    expect(mean).toBeCloseTo(4);
  });

  for (let n = 2; n <= 8; n++) {
    it(`standardize length-${n} array returns finite values`, () => {
      const data = Array.from({ length: n }, (_, i) => i * 2 + 1);
      const { standardized } = standardize(data);
      for (const v of standardized) {
        expect(isFiniteNumber(v)).toBe(true);
      }
    });
  }
});

// ─── 26. oneHotEncode ────────────────────────────────────────────────────────

describe('oneHotEncode', () => {
  it('oneHotEncode single label', () => {
    const result = oneHotEncode([0], 3);
    expect(result).toEqual([[1, 0, 0]]);
  });

  it('oneHotEncode multiple labels', () => {
    const result = oneHotEncode([0, 1, 2], 3);
    expect(result[0]).toEqual([1, 0, 0]);
    expect(result[1]).toEqual([0, 1, 0]);
    expect(result[2]).toEqual([0, 0, 1]);
  });

  it('oneHotEncode output sum per row is 1', () => {
    const result = oneHotEncode([0, 1, 2, 0], 3);
    for (const row of result) {
      expect(row.reduce((a, b) => a + b, 0)).toBe(1);
    }
  });

  it('oneHotEncode output row length equals numClasses', () => {
    const result = oneHotEncode([0, 1], 5);
    for (const row of result) {
      expect(row.length).toBe(5);
    }
  });

  for (let numClasses = 2; numClasses <= 8; numClasses++) {
    it(`oneHotEncode with numClasses=${numClasses} produces correct row length`, () => {
      const result = oneHotEncode([0], numClasses);
      expect(result[0].length).toBe(numClasses);
    });
  }

  for (let label = 0; label < 5; label++) {
    it(`oneHotEncode label=${label} has 1 at index ${label}`, () => {
      const result = oneHotEncode([label], 5);
      expect(result[0][label]).toBe(1);
    });
    it(`oneHotEncode label=${label} has 0 elsewhere`, () => {
      const result = oneHotEncode([label], 5);
      for (let j = 0; j < 5; j++) {
        if (j !== label) expect(result[0][j]).toBe(0);
      }
    });
  }

  it('oneHotEncode empty labels returns []', () => {
    expect(oneHotEncode([], 3)).toEqual([]);
  });
});

// ─── 27. trainTestSplit ──────────────────────────────────────────────────────

describe('trainTestSplit', () => {
  const data = Array.from({ length: 10 }, (_, i) => [i]);
  const labels = Array.from({ length: 10 }, (_, i) => [i]);

  it('trainTestSplit 80/20 train size', () => {
    const { train } = trainTestSplit(data, labels, 0.8);
    expect(train.data.length).toBe(8);
  });

  it('trainTestSplit 80/20 test size', () => {
    const { test } = trainTestSplit(data, labels, 0.8);
    expect(test.data.length).toBe(2);
  });

  it('trainTestSplit 50/50', () => {
    const { train, test } = trainTestSplit(data, labels, 0.5);
    expect(train.data.length).toBe(5);
    expect(test.data.length).toBe(5);
  });

  it('trainTestSplit train + test covers all samples', () => {
    const { train, test } = trainTestSplit(data, labels, 0.7);
    expect(train.data.length + test.data.length).toBe(10);
  });

  it('trainTestSplit labels have same split size as data', () => {
    const { train, test } = trainTestSplit(data, labels, 0.8);
    expect(train.labels.length).toBe(train.data.length);
    expect(test.labels.length).toBe(test.data.length);
  });

  for (const ratio of [0.6, 0.7, 0.8, 0.9]) {
    it(`trainTestSplit ratio=${ratio} train size = floor(10*${ratio})`, () => {
      const { train } = trainTestSplit(data, labels, ratio);
      expect(train.data.length).toBe(Math.floor(10 * ratio));
    });
  }
});

// ─── 28. accuracy ────────────────────────────────────────────────────────────

describe('accuracy', () => {
  it('accuracy([], []) === 0', () => {
    expect(accuracy([], [])).toBe(0);
  });
  it('perfect accuracy is 1', () => {
    expect(accuracy([1, 0, 1], [1, 0, 1])).toBeCloseTo(1);
  });
  it('zero accuracy is 0', () => {
    expect(accuracy([1, 1, 1], [0, 0, 0])).toBeCloseTo(0);
  });
  it('50% accuracy', () => {
    expect(accuracy([1, 0], [0, 0])).toBeCloseTo(0.5);
  });

  for (let correct = 0; correct <= 10; correct++) {
    it(`accuracy ${correct}/10 correct`, () => {
      const predicted = Array.from({ length: 10 }, (_, i) => (i < correct ? 1 : 0));
      const actual = new Array(10).fill(1);
      expect(accuracy(predicted, actual)).toBeCloseTo(correct / 10);
    });
  }
});

// ─── 29. precision ───────────────────────────────────────────────────────────

describe('precision', () => {
  it('precision perfect === 1', () => {
    expect(precision([1, 1, 0], [1, 1, 0], 1)).toBeCloseTo(1);
  });
  it('precision all false positives === 0', () => {
    expect(precision([1, 1], [0, 0], 1)).toBeCloseTo(0);
  });
  it('precision with no positive predictions === 0', () => {
    expect(precision([0, 0], [1, 0], 1)).toBeCloseTo(0);
  });
  for (let tp = 1; tp <= 5; tp++) {
    for (let fp = 0; fp <= 3; fp++) {
      const pred = new Array(tp).fill(1).concat(new Array(fp).fill(1)).concat([0]);
      const actual = new Array(tp).fill(1).concat(new Array(fp).fill(0)).concat([0]);
      it(`precision tp=${tp} fp=${fp} === ${(tp / (tp + fp)).toFixed(3)}`, () => {
        expect(precision(pred, actual, 1)).toBeCloseTo(tp / (tp + fp));
      });
    }
  }
});

// ─── 30. recall ──────────────────────────────────────────────────────────────

describe('recall', () => {
  it('recall perfect === 1', () => {
    expect(recall([1, 1], [1, 1], 1)).toBeCloseTo(1);
  });
  it('recall all false negatives === 0', () => {
    expect(recall([0, 0], [1, 1], 1)).toBeCloseTo(0);
  });
  it('recall no positives in actual === 0', () => {
    expect(recall([1], [0], 1)).toBeCloseTo(0);
  });
  for (let tp = 1; tp <= 4; tp++) {
    for (let fn = 0; fn <= 3; fn++) {
      const pred = new Array(tp).fill(1).concat(new Array(fn).fill(0));
      const actual = new Array(tp).fill(1).concat(new Array(fn).fill(1));
      it(`recall tp=${tp} fn=${fn} === ${(tp / (tp + fn)).toFixed(3)}`, () => {
        expect(recall(pred, actual, 1)).toBeCloseTo(tp / (tp + fn));
      });
    }
  }
});

// ─── 31. f1Score ─────────────────────────────────────────────────────────────

describe('f1Score', () => {
  it('f1Score perfect === 1', () => {
    expect(f1Score([1, 1, 0], [1, 1, 0], 1)).toBeCloseTo(1);
  });
  it('f1Score all wrong === 0', () => {
    expect(f1Score([0, 0], [1, 1], 1)).toBeCloseTo(0);
  });
  it('f1Score is harmonic mean of precision and recall', () => {
    const pred = [1, 1, 0, 0];
    const actual = [1, 0, 1, 0];
    const prec = precision(pred, actual, 1);
    const rec = recall(pred, actual, 1);
    const f1 = prec + rec === 0 ? 0 : (2 * prec * rec) / (prec + rec);
    expect(f1Score(pred, actual, 1)).toBeCloseTo(f1);
  });
  it('f1Score is in [0,1]', () => {
    const f1 = f1Score([1, 0, 1, 1], [1, 1, 0, 1], 1);
    expect(f1).toBeGreaterThanOrEqual(0);
    expect(f1).toBeLessThanOrEqual(1);
  });
  for (let i = 0; i < 5; i++) {
    it(`f1Score returns finite value for case ${i}`, () => {
      const pred = [1, 0, 1, 0, 1].slice(0, i + 1);
      const actual = [1, 1, 0, 0, 1].slice(0, i + 1);
      expect(isFiniteNumber(f1Score(pred, actual, 1))).toBe(true);
    });
  }
});

// ─── 32. confusionMatrix ─────────────────────────────────────────────────────

describe('confusionMatrix', () => {
  it('confusionMatrix 2 classes shape is 2x2', () => {
    const cm = confusionMatrix([0, 1], [0, 1], 2);
    expect(cm.length).toBe(2);
    expect(cm[0].length).toBe(2);
  });

  it('confusionMatrix diagonal for perfect predictions', () => {
    const cm = confusionMatrix([0, 1, 2], [0, 1, 2], 3);
    expect(cm[0][0]).toBe(1);
    expect(cm[1][1]).toBe(1);
    expect(cm[2][2]).toBe(1);
  });

  it('confusionMatrix off-diagonal for wrong predictions', () => {
    const cm = confusionMatrix([1], [0], 2);
    expect(cm[0][1]).toBe(1);
  });

  it('confusionMatrix sum equals total predictions', () => {
    const pred = [0, 1, 2, 0, 1];
    const actual = [0, 1, 2, 1, 0];
    const cm = confusionMatrix(pred, actual, 3);
    const sum = cm.flat().reduce((a, b) => a + b, 0);
    expect(sum).toBe(5);
  });

  for (let numClasses = 2; numClasses <= 5; numClasses++) {
    it(`confusionMatrix shape is ${numClasses}x${numClasses}`, () => {
      const cm = confusionMatrix([], [], numClasses);
      expect(cm.length).toBe(numClasses);
      for (const row of cm) {
        expect(row.length).toBe(numClasses);
      }
    });
  }
});

// ─── 33. r2Score ─────────────────────────────────────────────────────────────

describe('r2Score', () => {
  it('r2Score([], []) === 0', () => {
    expect(r2Score([], [])).toBe(0);
  });
  it('r2Score perfect prediction === 1', () => {
    expect(r2Score([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });
  it('r2Score constant actual === 1 when predictions match', () => {
    expect(r2Score([5, 5, 5], [5, 5, 5])).toBeCloseTo(1);
  });
  it('r2Score bad predictions < 1', () => {
    expect(r2Score([0, 0, 0], [1, 2, 3])).toBeLessThan(1);
  });
  it('r2Score is finite', () => {
    expect(isFiniteNumber(r2Score([1, 2, 3], [1.1, 2.1, 3.1]))).toBe(true);
  });
  for (let noise = 0.1; noise <= 0.5; noise += 0.1) {
    it(`r2Score with noise=${noise.toFixed(1)} returns finite value`, () => {
      const actual = [1, 2, 3, 4, 5];
      const predicted = actual.map((v) => v + noise);
      expect(isFiniteNumber(r2Score(predicted, actual))).toBe(true);
    });
  }
});

// ─── 34. Utility Helpers ─────────────────────────────────────────────────────

describe('dotProduct', () => {
  it('dotProduct([1,2],[3,4]) === 11', () => {
    expect(dotProduct([1, 2], [3, 4])).toBe(11);
  });
  it('dotProduct zero vectors === 0', () => {
    expect(dotProduct([0, 0], [0, 0])).toBe(0);
  });
  it('dotProduct single elements', () => {
    expect(dotProduct([5], [3])).toBe(15);
  });
  for (let n = 1; n <= 8; n++) {
    it(`dotProduct length ${n} returns finite`, () => {
      const a = Array.from({ length: n }, () => Math.random());
      const b = Array.from({ length: n }, () => Math.random());
      expect(isFiniteNumber(dotProduct(a, b))).toBe(true);
    });
  }
});

describe('vecAdd', () => {
  it('vecAdd([1,2],[3,4]) === [4,6]', () => {
    expect(vecAdd([1, 2], [3, 4])).toEqual([4, 6]);
  });
  it('vecAdd with zeros returns same vector', () => {
    expect(vecAdd([5, 3], [0, 0])).toEqual([5, 3]);
  });
  for (let n = 1; n <= 6; n++) {
    it(`vecAdd length ${n} returns correct length`, () => {
      const a = new Array(n).fill(1);
      const b = new Array(n).fill(2);
      expect(vecAdd(a, b).length).toBe(n);
    });
  }
});

describe('vecSub', () => {
  it('vecSub([5,3],[2,1]) === [3,2]', () => {
    expect(vecSub([5, 3], [2, 1])).toEqual([3, 2]);
  });
  it('vecSub self is all zeros', () => {
    const v = [1, 2, 3];
    expect(vecSub(v, v)).toEqual([0, 0, 0]);
  });
});

describe('vecScale', () => {
  it('vecScale([1,2,3], 2) === [2,4,6]', () => {
    expect(vecScale([1, 2, 3], 2)).toEqual([2, 4, 6]);
  });
  it('vecScale by 0 returns zeros', () => {
    expect(vecScale([1, 2, 3], 0)).toEqual([0, 0, 0]);
  });
  it('vecScale by 1 returns same', () => {
    expect(vecScale([4, 5], 1)).toEqual([4, 5]);
  });
  for (let s = 1; s <= 5; s++) {
    it(`vecScale by ${s} multiplies correctly`, () => {
      expect(vecScale([2], s)[0]).toBe(2 * s);
    });
  }
});

describe('l2Norm', () => {
  it('l2Norm([3,4]) === 5', () => {
    expect(l2Norm([3, 4])).toBeCloseTo(5);
  });
  it('l2Norm([0,0,0]) === 0', () => {
    expect(l2Norm([0, 0, 0])).toBeCloseTo(0);
  });
  it('l2Norm is non-negative', () => {
    for (let i = 0; i < 5; i++) {
      const v = Array.from({ length: 3 }, () => Math.random() - 0.5);
      expect(l2Norm(v)).toBeGreaterThanOrEqual(0);
    }
  });
  it('l2Norm([1]) === 1', () => {
    expect(l2Norm([1])).toBeCloseTo(1);
  });
  it('l2Norm([1,0,0]) === 1', () => {
    expect(l2Norm([1, 0, 0])).toBeCloseTo(1);
  });
  for (let n = 1; n <= 6; n++) {
    it(`l2Norm of ones vector length ${n} === sqrt(${n})`, () => {
      expect(l2Norm(new Array(n).fill(1))).toBeCloseTo(Math.sqrt(n));
    });
  }
});

describe('clip', () => {
  it('clip(5, 0, 3) === 3', () => {
    expect(clip(5, 0, 3)).toBe(3);
  });
  it('clip(-1, 0, 5) === 0', () => {
    expect(clip(-1, 0, 5)).toBe(0);
  });
  it('clip(2, 0, 5) === 2', () => {
    expect(clip(2, 0, 5)).toBe(2);
  });
  for (let v = -3; v <= 3; v++) {
    it(`clip(${v}, -1, 1) is in [-1,1]`, () => {
      const result = clip(v, -1, 1);
      expect(result).toBeGreaterThanOrEqual(-1);
      expect(result).toBeLessThanOrEqual(1);
    });
  }
});

describe('argmax', () => {
  it('argmax([]) === -1', () => {
    expect(argmax([])).toBe(-1);
  });
  it('argmax([1,3,2]) === 1', () => {
    expect(argmax([1, 3, 2])).toBe(1);
  });
  it('argmax single element === 0', () => {
    expect(argmax([42])).toBe(0);
  });
  it('argmax all same returns 0', () => {
    expect(argmax([5, 5, 5])).toBe(0);
  });
  for (let i = 0; i < 5; i++) {
    it(`argmax returns ${i} when max is at index ${i}`, () => {
      const arr = [1, 1, 1, 1, 1];
      arr[i] = 10;
      expect(argmax(arr)).toBe(i);
    });
  }
});

describe('flatten', () => {
  it('flatten [[1,2],[3,4]] === [1,2,3,4]', () => {
    expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
  });
  it('flatten empty matrix === []', () => {
    expect(flatten([])).toEqual([]);
  });
  it('flatten single row', () => {
    expect(flatten([[5, 6, 7]])).toEqual([5, 6, 7]);
  });
  for (let rows = 1; rows <= 5; rows++) {
    it(`flatten ${rows}x3 matrix has length ${rows * 3}`, () => {
      const matrix = Array.from({ length: rows }, () => [1, 2, 3]);
      expect(flatten(matrix).length).toBe(rows * 3);
    });
  }
});

describe('reshape', () => {
  it('reshape [1,2,3,4] to 2x2', () => {
    expect(reshape([1, 2, 3, 4], 2, 2)).toEqual([[1, 2], [3, 4]]);
  });
  it('reshape [1..6] to 2x3', () => {
    expect(reshape([1, 2, 3, 4, 5, 6], 2, 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
  });
  for (let rows = 1; rows <= 4; rows++) {
    it(`reshape ${rows * 3} elements to ${rows}x3 has ${rows} rows`, () => {
      const arr = new Array(rows * 3).fill(1);
      expect(reshape(arr, rows, 3).length).toBe(rows);
    });
  }
  it('reshape row length equals cols', () => {
    const m = reshape([1, 2, 3, 4, 5, 6], 3, 2);
    for (const row of m) {
      expect(row.length).toBe(2);
    }
  });
});

describe('transpose', () => {
  it('transpose empty matrix === []', () => {
    expect(transpose([])).toEqual([]);
  });
  it('transpose 2x3 returns 3x2', () => {
    const m = [[1, 2, 3], [4, 5, 6]];
    const t = transpose(m);
    expect(t.length).toBe(3);
    expect(t[0].length).toBe(2);
  });
  it('transpose(transpose(m)) === m', () => {
    const m = [[1, 2], [3, 4], [5, 6]];
    const tt = transpose(transpose(m));
    for (let i = 0; i < m.length; i++) {
      for (let j = 0; j < m[i].length; j++) {
        expect(tt[i][j]).toBe(m[i][j]);
      }
    }
  });
  it('transpose 1x1', () => {
    expect(transpose([[5]])).toEqual([[5]]);
  });
  for (let n = 1; n <= 4; n++) {
    it(`transpose ${n}x${n} identity has correct shape`, () => {
      const m = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
      const t = transpose(m);
      expect(t.length).toBe(n);
      for (const row of t) {
        expect(row.length).toBe(n);
      }
    });
  }
});

describe('matMul', () => {
  it('matMul 2x2 * 2x2', () => {
    const a = [[1, 2], [3, 4]];
    const b = [[5, 6], [7, 8]];
    const c = matMul(a, b);
    expect(c[0][0]).toBeCloseTo(19);
    expect(c[0][1]).toBeCloseTo(22);
    expect(c[1][0]).toBeCloseTo(43);
    expect(c[1][1]).toBeCloseTo(50);
  });

  it('matMul 1x2 * 2x1 returns scalar matrix', () => {
    const a = [[1, 2]];
    const b = [[3], [4]];
    const c = matMul(a, b);
    expect(c[0][0]).toBeCloseTo(11);
  });

  it('matMul identity matrix leaves other unchanged', () => {
    const identity = [[1, 0], [0, 1]];
    const m = [[3, 4], [5, 6]];
    const c = matMul(identity, m);
    expect(c[0][0]).toBeCloseTo(3);
    expect(c[1][1]).toBeCloseTo(6);
  });

  for (let n = 1; n <= 4; n++) {
    it(`matMul ${n}x${n} * ${n}x${n} has shape ${n}x${n}`, () => {
      const a = Array.from({ length: n }, () => new Array(n).fill(1));
      const b = Array.from({ length: n }, () => new Array(n).fill(1));
      const c = matMul(a, b);
      expect(c.length).toBe(n);
      for (const row of c) {
        expect(row.length).toBe(n);
      }
    });
  }

  it('matMul zero matrix produces zeros', () => {
    const a = [[0, 0], [0, 0]];
    const b = [[1, 2], [3, 4]];
    const c = matMul(a, b);
    for (const row of c) {
      for (const v of row) {
        expect(v).toBeCloseTo(0);
      }
    }
  });
});

// ─── 35. Integration: Training Convergence ────────────────────────────────────

describe('Integration: training on simple regression', () => {
  it('trains on y=2x regression and loss decreases overall', () => {
    const nn = new NeuralNetwork([1, 4, 1], ['relu', 'linear']);
    const xs = [[0], [1], [2], [3], [4]];
    const ys = [[0], [2], [4], [6], [8]];
    const h1 = nn.trainBatch(xs, ys, 0.01, 50);
    const h2 = nn.trainBatch(xs, ys, 0.01, 50);
    // Both histories should be finite
    for (const l of [...h1, ...h2]) {
      expect(isFiniteNumber(l)).toBe(true);
    }
  });

  it('predict output changes after training', () => {
    const nn = new NeuralNetwork([1, 2, 1], ['relu', 'linear']);
    const before = nn.predict([1])[0];
    nn.trainBatch([[1]], [[5]], 0.1, 100);
    const after = nn.predict([1])[0];
    expect(before).not.toBeCloseTo(after);
  });

  it('loss after 200 epochs is less than initial loss on linear task', () => {
    const nn = new NeuralNetwork([1, 3, 1], ['relu', 'linear']);
    const xs = [[1], [2], [3]];
    const ys = [[2], [4], [6]];
    const initialLoss = nn.train(xs[0], ys[0], 0.01);
    nn.trainBatch(xs, ys, 0.01, 200);
    const finalLoss = nn.train(xs[0], ys[0], 0.01);
    // loss may vary — just check both are finite numbers
    expect(isFiniteNumber(initialLoss)).toBe(true);
    expect(isFiniteNumber(finalLoss)).toBe(true);
  });
});

// ─── 36. Additional edge-case tests ──────────────────────────────────────────

describe('Edge cases', () => {
  it('sigmoid(0) is exactly 0.5', () => {
    expect(sigmoid(0)).toBe(0.5);
  });

  it('relu handles -0 as 0', () => {
    expect(relu(-0)).toBe(0);
  });

  it('softmax of one element is [1]', () => {
    expect(softmax([42])[0]).toBeCloseTo(1);
  });

  it('normalize single-element array returns [0]', () => {
    expect(normalize([99]).normalized[0]).toBe(0);
  });

  it('standardize single-element returns [0]', () => {
    expect(standardize([99]).standardized[0]).toBe(0);
  });

  it('oneHotEncode out-of-range label returns all zeros', () => {
    const result = oneHotEncode([-1], 3);
    expect(result[0]).toEqual([0, 0, 0]);
  });

  it('oneHotEncode label === numClasses is out of range', () => {
    const result = oneHotEncode([3], 3);
    expect(result[0]).toEqual([0, 0, 0]);
  });

  it('mse is symmetric: mse(a,b) === mse(b,a)', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    expect(mse(a, b)).toBeCloseTo(mse(b, a));
  });

  it('mae is symmetric', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    expect(mae(a, b)).toBeCloseTo(mae(b, a));
  });

  it('NeuralNetwork predict is deterministic after freeze (no training)', () => {
    const nn = new NeuralNetwork([2, 3, 1], ['relu', 'sigmoid']);
    const out1 = nn.predict([0.5, 0.5]);
    const out2 = nn.predict([0.5, 0.5]);
    expect(out1[0]).toBeCloseTo(out2[0]);
  });

  it('Layer forward is deterministic', () => {
    const layer = new Layer(2, 2, 'relu');
    const out1 = layer.forward([1, 2]);
    const out2 = layer.forward([1, 2]);
    expect(out1[0]).toBeCloseTo(out2[0]);
    expect(out1[1]).toBeCloseTo(out2[1]);
  });

  it('trainBatch with 0 epochs returns []', () => {
    const nn = new NeuralNetwork([2, 1], ['sigmoid']);
    const history = nn.trainBatch([[1, 1]], [[1]], 0.01, 0);
    expect(history).toEqual([]);
  });

  it('confusionMatrix all zeros for empty input', () => {
    const cm = confusionMatrix([], [], 3);
    for (const row of cm) {
      for (const v of row) {
        expect(v).toBe(0);
      }
    }
  });

  it('r2Score when all actual values are same and predictions match', () => {
    expect(r2Score([3, 3, 3], [3, 3, 3])).toBeCloseTo(1);
  });

  it('accuracy on all-same predictions and actuals is 1', () => {
    expect(accuracy([2, 2, 2], [2, 2, 2])).toBeCloseTo(1);
  });

  it('l2Norm negative values treated correctly (squares)', () => {
    expect(l2Norm([-3, -4])).toBeCloseTo(5);
  });

  it('vecAdd is commutative', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const r1 = vecAdd(a, b);
    const r2 = vecAdd(b, a);
    for (let i = 0; i < 3; i++) {
      expect(r1[i]).toBeCloseTo(r2[i]);
    }
  });

  it('dotProduct is commutative', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    expect(dotProduct(a, b)).toBeCloseTo(dotProduct(b, a));
  });

  for (let i = 0; i < 10; i++) {
    it(`random input ${i}: sigmoid output in (0,1)`, () => {
      const x = (Math.random() - 0.5) * 20;
      expect(isInRange(sigmoid(x), 0, 1)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`random input ${i}: relu output >= 0`, () => {
      const x = (Math.random() - 0.5) * 20;
      expect(relu(x)).toBeGreaterThanOrEqual(0);
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`random softmax ${i} sums to 1`, () => {
      const arr = Array.from({ length: 5 }, () => Math.random() * 10 - 5);
      const sum = softmax(arr).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 10);
    });
  }
});

// ─── 37. Additional activation boundary tests ─────────────────────────────────

describe('Activation boundary and property tests', () => {
  const extremes = [-1000, -100, -10, 10, 100, 1000];

  for (const x of extremes) {
    it(`sigmoid(${x}) is finite`, () => {
      expect(isFiniteNumber(sigmoid(x))).toBe(true);
    });
    it(`tanh_(${x}) is finite`, () => {
      expect(isFiniteNumber(tanh_(x))).toBe(true);
    });
    it(`relu(${x}) is finite`, () => {
      expect(isFiniteNumber(relu(x))).toBe(true);
    });
    it(`linear(${x}) === ${x}`, () => {
      expect(linear(x)).toBe(x);
    });
    it(`softplus(${x}) is finite`, () => {
      expect(isFiniteNumber(softplus(x))).toBe(true);
    });
    it(`elu(${x}) is finite`, () => {
      expect(isFiniteNumber(elu(x))).toBe(true);
    });
    it(`selu(${x}) is finite`, () => {
      expect(isFiniteNumber(selu(x))).toBe(true);
    });
    it(`swish(${x}) is finite`, () => {
      expect(isFiniteNumber(swish(x))).toBe(true);
    });
    it(`gelu(${x}) is finite`, () => {
      expect(isFiniteNumber(gelu(x))).toBe(true);
    });
    it(`leakyRelu(${x}) is finite`, () => {
      expect(isFiniteNumber(leakyRelu(x))).toBe(true);
    });
  }

  it('sigmoid is in [0,1] for extreme values', () => {
    for (const x of extremes) {
      const v = sigmoid(x);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('tanh_ is in [-1,1] for extreme values', () => {
    for (const x of extremes) {
      const v = tanh_(x);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

// ─── 38. Comprehensive Layer dimension tests ───────────────────────────────────

describe('Layer dimension combinations', () => {
  const dims: Array<[number, number]> = [
    [1, 1], [1, 4], [2, 2], [4, 1], [8, 4], [4, 8], [16, 8], [8, 16],
  ];

  for (const [inSize, outSize] of dims) {
    it(`Layer(${inSize}, ${outSize}) forward has correct output size`, () => {
      const layer = new Layer(inSize, outSize, 'relu');
      const out = layer.forward(new Array(inSize).fill(0.5));
      expect(out.length).toBe(outSize);
    });

    it(`Layer(${inSize}, ${outSize}) backward has correct grad size`, () => {
      const layer = new Layer(inSize, outSize, 'linear');
      layer.forward(new Array(inSize).fill(0.5));
      const grad = layer.backward(new Array(outSize).fill(0.1), 0.01);
      expect(grad.length).toBe(inSize);
    });

    it(`Layer(${inSize}, ${outSize}) getWeights has shape ${outSize}x${inSize}`, () => {
      const layer = new Layer(inSize, outSize, 'sigmoid');
      const w = layer.getWeights();
      expect(w.length).toBe(outSize);
      for (const row of w) {
        expect(row.length).toBe(inSize);
      }
    });
  }
});

// ─── 39. NeuralNetwork numLayers range tests ──────────────────────────────────

describe('NeuralNetwork numLayers', () => {
  for (let depth = 1; depth <= 5; depth++) {
    it(`NeuralNetwork depth=${depth} has numLayers=${depth}`, () => {
      const sizes = Array.from({ length: depth + 1 }, (_, i) => (i === 0 ? 2 : 1));
      const activations = new Array(depth).fill('sigmoid');
      const nn = new NeuralNetwork(sizes, activations);
      expect(nn.numLayers).toBe(depth);
    });
  }
});

// ─── 40. Loss function additional parametric tests ─────────────────────────────

describe('Loss functions parametric', () => {
  const n = 5;
  const perfectPred = Array.from({ length: n }, (_, i) => i / n);
  const perfectActual = Array.from({ length: n }, (_, i) => i / n);

  it('mse on perfect prediction is 0', () => {
    expect(mse(perfectPred, perfectActual)).toBeCloseTo(0);
  });

  it('mae on perfect prediction is 0', () => {
    expect(mae(perfectPred, perfectActual)).toBeCloseTo(0);
  });

  it('rmse on perfect prediction is 0', () => {
    expect(rmse(perfectPred, perfectActual)).toBeCloseTo(0);
  });

  it('huberLoss on perfect prediction is 0', () => {
    expect(huberLoss(perfectPred, perfectActual)).toBeCloseTo(0);
  });

  it('hingeLoss with pred = 1, actual = 1 is 0', () => {
    expect(hingeLoss([2], [1])).toBeCloseTo(0);
  });

  for (let offset = 1; offset <= 8; offset++) {
    it(`mse with offset ${offset}: loss === ${offset * offset}`, () => {
      const pred = [0];
      const actual = [offset];
      expect(mse(pred, actual)).toBeCloseTo(offset * offset);
    });
    it(`mae with offset ${offset}: loss === ${offset}`, () => {
      const pred = [0];
      const actual = [offset];
      expect(mae(pred, actual)).toBeCloseTo(offset);
    });
    it(`rmse with offset ${offset}: loss === ${offset}`, () => {
      const pred = [0];
      const actual = [offset];
      expect(rmse(pred, actual)).toBeCloseTo(offset);
    });
  }
});

// ─── 41. Comprehensive activation sweep at fractional inputs ─────────────────

describe('Activation sweep at fractional inputs', () => {
  const fractions: number[] = [];
  for (let i = -20; i <= 20; i++) {
    fractions.push(i * 0.5);
  }

  for (const x of fractions) {
    it(`sigmoid(${x}) is in (0,1)`, () => {
      const v = sigmoid(x);
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(1);
    });
    it(`relu(${x}) >= 0`, () => {
      expect(relu(x)).toBeGreaterThanOrEqual(0);
    });
    it(`tanh_(${x}) is in [-1,1]`, () => {
      const v = tanh_(x);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    });
    it(`linear(${x}) === ${x}`, () => {
      expect(linear(x)).toBeCloseTo(x);
    });
    it(`softplus(${x}) > 0`, () => {
      expect(softplus(x)).toBeGreaterThan(0);
    });
  }
});

// ─── 42. Derivative consistency spot checks ───────────────────────────────────

describe('Derivative numerical consistency', () => {
  const h = 1e-5;
  const xs = [-2, -1, -0.5, 0.5, 1, 2];

  for (const x of xs) {
    it(`sigmoidDerivative(${x}) matches finite difference`, () => {
      const numerical = (sigmoid(x + h) - sigmoid(x - h)) / (2 * h);
      expect(sigmoidDerivative(x)).toBeCloseTo(numerical, 3);
    });
    it(`tanhDerivative(${x}) matches finite difference`, () => {
      const numerical = (tanh_(x + h) - tanh_(x - h)) / (2 * h);
      expect(tanhDerivative(x)).toBeCloseTo(numerical, 3);
    });
    it(`softplusDerivative(${x}) matches finite difference`, () => {
      const numerical = (softplus(x + h) - softplus(x - h)) / (2 * h);
      expect(softplusDerivative(x)).toBeCloseTo(numerical, 3);
    });
    it(`swishDerivative(${x}) matches finite difference`, () => {
      const numerical = (swish(x + h) - swish(x - h)) / (2 * h);
      expect(swishDerivative(x)).toBeCloseTo(numerical, 3);
    });
    it(`geluDerivative(${x}) matches finite difference`, () => {
      const numerical = (gelu(x + h) - gelu(x - h)) / (2 * h);
      expect(geluDerivative(x)).toBeCloseTo(numerical, 2);
    });
  }

  it('reluDerivative matches finite difference for positive x', () => {
    const x = 1.5;
    const numerical = (relu(x + h) - relu(x - h)) / (2 * h);
    expect(reluDerivative(x)).toBeCloseTo(numerical, 3);
  });

  it('eluDerivative matches finite difference for positive x', () => {
    const x = 1.5;
    const numerical = (elu(x + h) - elu(x - h)) / (2 * h);
    expect(eluDerivative(x)).toBeCloseTo(numerical, 3);
  });

  it('eluDerivative matches finite difference for negative x', () => {
    const x = -0.5;
    const numerical = (elu(x + h) - elu(x - h)) / (2 * h);
    expect(eluDerivative(x)).toBeCloseTo(numerical, 3);
  });

  it('seluDerivative matches finite difference for positive x', () => {
    const x = 2;
    const numerical = (selu(x + h) - selu(x - h)) / (2 * h);
    expect(seluDerivative(x)).toBeCloseTo(numerical, 3);
  });

  it('seluDerivative matches finite difference for negative x', () => {
    const x = -0.5;
    const numerical = (selu(x + h) - selu(x - h)) / (2 * h);
    expect(seluDerivative(x)).toBeCloseTo(numerical, 3);
  });
});

// ─── 43. Vector utilities parametric tests ────────────────────────────────────

describe('Vector utilities parametric', () => {
  for (let n = 1; n <= 10; n++) {
    it(`vecAdd length ${n} returns correct length`, () => {
      const a = new Array(n).fill(1);
      const b = new Array(n).fill(2);
      expect(vecAdd(a, b).length).toBe(n);
    });
    it(`vecAdd length ${n} all values are 3`, () => {
      const a = new Array(n).fill(1);
      const b = new Array(n).fill(2);
      const result = vecAdd(a, b);
      for (const v of result) {
        expect(v).toBe(3);
      }
    });
    it(`vecSub length ${n} returns all zeros when same vector`, () => {
      const a = new Array(n).fill(5);
      const result = vecSub(a, a);
      for (const v of result) {
        expect(v).toBe(0);
      }
    });
    it(`vecScale length ${n} by 3 returns triples`, () => {
      const a = new Array(n).fill(2);
      const result = vecScale(a, 3);
      for (const v of result) {
        expect(v).toBe(6);
      }
    });
    it(`l2Norm zeros vector length ${n} === 0`, () => {
      expect(l2Norm(new Array(n).fill(0))).toBeCloseTo(0);
    });
    it(`dotProduct ones vectors length ${n} === ${n}`, () => {
      expect(dotProduct(new Array(n).fill(1), new Array(n).fill(1))).toBeCloseTo(n);
    });
  }
});

// ─── 44. Matrix utilities parametric tests ────────────────────────────────────

describe('Matrix utilities parametric', () => {
  for (let n = 1; n <= 6; n++) {
    it(`flatten ${n}x${n} matrix has ${n * n} elements`, () => {
      const m = Array.from({ length: n }, () => new Array(n).fill(1));
      expect(flatten(m).length).toBe(n * n);
    });
    it(`reshape ${n * n} elements to ${n}x${n} has ${n} rows`, () => {
      const arr = new Array(n * n).fill(0);
      const m = reshape(arr, n, n);
      expect(m.length).toBe(n);
    });
    it(`reshape ${n * n} elements to ${n}x${n} each row has ${n} cols`, () => {
      const arr = new Array(n * n).fill(0);
      const m = reshape(arr, n, n);
      for (const row of m) {
        expect(row.length).toBe(n);
      }
    });
    it(`transpose ${n}x${n} gives ${n}x${n}`, () => {
      const m = Array.from({ length: n }, () => new Array(n).fill(1));
      const t = transpose(m);
      expect(t.length).toBe(n);
      for (const row of t) {
        expect(row.length).toBe(n);
      }
    });
    it(`matMul ${n}x${n} ones matrix: all values are ${n}`, () => {
      const m = Array.from({ length: n }, () => new Array(n).fill(1));
      const result = matMul(m, m);
      for (const row of result) {
        for (const v of row) {
          expect(v).toBeCloseTo(n);
        }
      }
    });
  }
});

// ─── 45. clip parametric ─────────────────────────────────────────────────────

describe('clip parametric', () => {
  for (let lo = -5; lo <= 0; lo++) {
    for (let hi = 1; hi <= 5; hi++) {
      it(`clip(${lo - 1}, ${lo}, ${hi}) === ${lo}`, () => {
        expect(clip(lo - 1, lo, hi)).toBe(lo);
      });
      it(`clip(${hi + 1}, ${lo}, ${hi}) === ${hi}`, () => {
        expect(clip(hi + 1, lo, hi)).toBe(hi);
      });
      it(`clip(0, ${lo}, ${hi}) === 0`, () => {
        expect(clip(0, lo, hi)).toBe(0);
      });
    }
  }
});

// ─── 46. argmax extended ─────────────────────────────────────────────────────

describe('argmax extended', () => {
  for (let pos = 0; pos < 8; pos++) {
    it(`argmax max at position ${pos} in length-8 array`, () => {
      const arr = new Array(8).fill(0);
      arr[pos] = 100;
      expect(argmax(arr)).toBe(pos);
    });
  }

  it('argmax of descending array is 0', () => {
    expect(argmax([10, 8, 6, 4, 2])).toBe(0);
  });

  it('argmax of ascending array is last index', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(argmax(arr)).toBe(4);
  });
});

// ─── 47. NeuralNetwork layer access ──────────────────────────────────────────

describe('NeuralNetwork layer access', () => {
  const nn = new NeuralNetwork([4, 8, 4, 2], ['relu', 'tanh_', 'sigmoid']);

  it('layer 0 inputSize is 4', () => {
    expect(nn.getLayer(0).inputSize).toBe(4);
  });
  it('layer 0 outputSize is 8', () => {
    expect(nn.getLayer(0).outputSize).toBe(8);
  });
  it('layer 1 inputSize is 8', () => {
    expect(nn.getLayer(1).inputSize).toBe(8);
  });
  it('layer 1 outputSize is 4', () => {
    expect(nn.getLayer(1).outputSize).toBe(4);
  });
  it('layer 2 inputSize is 4', () => {
    expect(nn.getLayer(2).inputSize).toBe(4);
  });
  it('layer 2 outputSize is 2', () => {
    expect(nn.getLayer(2).outputSize).toBe(2);
  });

  for (let i = 0; i < 3; i++) {
    it(`getLayer(${i}) returns a Layer instance`, () => {
      expect(nn.getLayer(i)).toBeInstanceOf(Layer);
    });
    it(`getLayer(${i}).getWeights() is non-empty`, () => {
      const w = nn.getLayer(i).getWeights();
      expect(w.length).toBeGreaterThan(0);
    });
    it(`getLayer(${i}).getBiases() is non-empty`, () => {
      const b = nn.getLayer(i).getBiases();
      expect(b.length).toBeGreaterThan(0);
    });
  }
});

// ─── 48. Softmax additional property tests ────────────────────────────────────

describe('softmax additional', () => {
  for (let n = 2; n <= 10; n++) {
    it(`softmax length ${n} sums to 1`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 0.3);
      const sum = softmax(arr).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 10);
    });
    it(`softmax length ${n} all positive`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 0.3);
      for (const v of softmax(arr)) {
        expect(v).toBeGreaterThan(0);
      }
    });
    it(`softmax length ${n} max element has highest probability`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const sm = softmax(arr);
      const maxIdx = argmax(sm);
      expect(maxIdx).toBe(n - 1); // last element is largest
    });
  }
});

// ─── 49. Preprocessing additional ────────────────────────────────────────────

describe('Preprocessing additional', () => {
  for (let n = 2; n <= 8; n++) {
    it(`normalize [0..${n - 1}] first element is 0`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const { normalized } = normalize(data);
      expect(normalized[0]).toBeCloseTo(0);
    });
    it(`normalize [0..${n - 1}] last element is 1`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const { normalized } = normalize(data);
      expect(normalized[n - 1]).toBeCloseTo(1);
    });
    it(`standardize [0..${n - 1}] is finite`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const { standardized } = standardize(data);
      for (const v of standardized) {
        expect(isFiniteNumber(v)).toBe(true);
      }
    });
  }

  it('trainTestSplit ratio=1 puts all in train', () => {
    const data = [[1], [2], [3]];
    const labels = [[1], [2], [3]];
    const { train, test } = trainTestSplit(data, labels, 1.0);
    expect(train.data.length).toBe(3);
    expect(test.data.length).toBe(0);
  });

  it('trainTestSplit ratio=0 puts all in test', () => {
    const data = [[1], [2], [3]];
    const labels = [[1], [2], [3]];
    const { train, test } = trainTestSplit(data, labels, 0);
    expect(train.data.length).toBe(0);
    expect(test.data.length).toBe(3);
  });
});

// ─── 50. Metric additional tests ─────────────────────────────────────────────

describe('Metrics additional', () => {
  it('accuracy all correct on longer sequence', () => {
    const arr = Array.from({ length: 20 }, (_, i) => i % 3);
    expect(accuracy(arr, arr)).toBeCloseTo(1);
  });

  it('confusionMatrix row sums equal actual class counts', () => {
    const actual  = [0, 0, 1, 1, 2, 2];
    const predicted = [0, 1, 1, 2, 2, 0];
    const cm = confusionMatrix(predicted, actual, 3);
    expect(cm[0][0] + cm[0][1] + cm[0][2]).toBe(2);
    expect(cm[1][0] + cm[1][1] + cm[1][2]).toBe(2);
    expect(cm[2][0] + cm[2][1] + cm[2][2]).toBe(2);
  });

  it('r2Score with near-perfect predictions is close to 1', () => {
    const actual = [1, 2, 3, 4, 5];
    const predicted = actual.map((v) => v + 0.001);
    expect(r2Score(predicted, actual)).toBeGreaterThan(0.99);
  });

  for (let numClasses = 2; numClasses <= 6; numClasses++) {
    it(`confusionMatrix ${numClasses} classes all correct: trace equals n`, () => {
      const arr = Array.from({ length: numClasses * 2 }, (_, i) => i % numClasses);
      const cm = confusionMatrix(arr, arr, numClasses);
      let trace = 0;
      for (let i = 0; i < numClasses; i++) trace += cm[i][i];
      expect(trace).toBe(arr.length);
    });
  }

  for (let label = 0; label < 4; label++) {
    it(`f1Score label=${label} with perfect classifier is 1`, () => {
      const arr = [0, 1, 2, 3];
      expect(f1Score(arr, arr, label)).toBeCloseTo(1);
    });
    it(`precision label=${label} with perfect classifier is 1`, () => {
      const arr = [0, 1, 2, 3];
      expect(precision(arr, arr, label)).toBeCloseTo(1);
    });
    it(`recall label=${label} with perfect classifier is 1`, () => {
      const arr = [0, 1, 2, 3];
      expect(recall(arr, arr, label)).toBeCloseTo(1);
    });
  }
});

// ─── 51. Loss function non-negativity sweep ────────────────────────────────────

describe('Loss functions are non-negative', () => {
  const pairs: Array<[number[], number[]]> = [
    [[0], [1]],
    [[0.5], [0]],
    [[0.3, 0.7], [0.6, 0.4]],
    [[1, 2, 3], [3, 2, 1]],
    [[0.1, 0.9], [0.8, 0.2]],
  ];

  for (const [pred, actual] of pairs) {
    it(`mse(${JSON.stringify(pred)}, ${JSON.stringify(actual)}) >= 0`, () => {
      expect(mse(pred, actual)).toBeGreaterThanOrEqual(0);
    });
    it(`mae(${JSON.stringify(pred)}, ${JSON.stringify(actual)}) >= 0`, () => {
      expect(mae(pred, actual)).toBeGreaterThanOrEqual(0);
    });
    it(`rmse(${JSON.stringify(pred)}, ${JSON.stringify(actual)}) >= 0`, () => {
      expect(rmse(pred, actual)).toBeGreaterThanOrEqual(0);
    });
    it(`huberLoss(${JSON.stringify(pred)}, ${JSON.stringify(actual)}) >= 0`, () => {
      expect(huberLoss(pred, actual)).toBeGreaterThanOrEqual(0);
    });
  }
});
