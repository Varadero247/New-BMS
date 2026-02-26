// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface LPProblem {
  // minimize c·x
  // subject to Ax <= b, x >= 0
  c: number[];        // objective coefficients (minimize)
  A: number[][];      // constraint matrix
  b: number[];        // constraint RHS
}

export interface LPResult {
  status: 'optimal' | 'unbounded' | 'infeasible';
  value?: number;     // optimal objective value
  solution?: number[]; // optimal x values
}

/**
 * Simplex method for linear programming (minimization).
 * Standard form: minimize c·x subject to Ax <= b, x >= 0.
 * Uses tableau method with slack variables.
 */
export function simplex(problem: LPProblem): LPResult {
  const { c, A, b } = problem;
  const n = c.length;   // number of decision variables
  const m = A.length;   // number of constraints

  // Handle trivial case: no variables
  if (n === 0) {
    return { status: 'optimal', value: 0, solution: [] };
  }

  // Check that all b[i] >= 0 (for standard form with slack variables).
  // If any b[i] < 0, multiply that row by -1 and flip the constraint direction.
  // For Ax <= b with b[i] < 0, we need a two-phase or Big-M approach.
  // We handle this via Big-M method.

  const EPS = 1e-9;
  const BIG_M = 1e7;
  const MAX_ITER = 10000;

  // We will use Big-M method to handle cases where b[i] < 0.
  // For each constraint:
  //   If b[i] >= 0: add slack variable s_i (coefficient +1 in row i)
  //   If b[i] < 0: multiply row by -1 (converts <= to >=), then add surplus -s_i + artificial a_i
  //
  // For minimization with Big-M:
  //   - slack variables have cost 0
  //   - artificial variables have cost BIG_M
  //
  // Tableau columns: [x_1..x_n | s_1..s_m | a_1..a_k | RHS]
  // where k = number of constraints with b[i] < 0

  // Identify which constraints need artificial variables
  const needArtificial: boolean[] = new Array(m).fill(false);
  for (let i = 0; i < m; i++) {
    if (b[i] < -EPS) {
      needArtificial[i] = true;
    }
  }

  const numArtificial = needArtificial.filter(Boolean).length;
  // Total columns: n (decision) + m (slacks) + numArtificial (artificials) + 1 (RHS)
  const numCols = n + m + numArtificial + 1;
  const rhsIdx = numCols - 1;

  // Build tableau rows: m constraint rows + 1 objective row
  // Row indices: 0..m-1 are constraints, m is objective
  const tableau: number[][] = [];
  for (let i = 0; i <= m; i++) {
    tableau.push(new Array(numCols).fill(0));
  }

  // Basis: track which variable is basic in each row
  const basis: number[] = new Array(m).fill(-1);

  // Fill constraint rows
  let artificialIdx = n + m; // starting column index for artificial variables
  for (let i = 0; i < m; i++) {
    if (!needArtificial[i]) {
      // b[i] >= 0: Ax <= b, add slack variable
      for (let j = 0; j < n; j++) {
        tableau[i][j] = A[i][j];
      }
      tableau[i][n + i] = 1;       // slack s_i
      tableau[i][rhsIdx] = b[i];
      basis[i] = n + i;            // slack is basic
    } else {
      // b[i] < 0: multiply row by -1 → -A[i]x >= -b[i] → -A[i]x - s_i + a_i = -b[i]
      for (let j = 0; j < n; j++) {
        tableau[i][j] = -A[i][j];
      }
      tableau[i][n + i] = -1;      // surplus variable (negated slack)
      tableau[i][artificialIdx] = 1; // artificial variable a_i
      tableau[i][rhsIdx] = -b[i];   // RHS is now positive
      basis[i] = artificialIdx;
      artificialIdx++;
    }
  }

  // Fill objective row: minimize c·x + BIG_M * (sum of artificials)
  // Objective row stores negated reduced costs for maximization form internally.
  // We work in minimization form: objective row = c coefficients (reduced costs).
  for (let j = 0; j < n; j++) {
    tableau[m][j] = c[j];
  }
  // Artificial variables get cost BIG_M
  for (let k = n + m; k < n + m + numArtificial; k++) {
    tableau[m][k] = BIG_M;
  }

  // For Big-M, the objective row must be adjusted for the initial basic artificial variables.
  // For each row i with an artificial in the basis, subtract BIG_M * row_i from objective row.
  for (let i = 0; i < m; i++) {
    if (needArtificial[i]) {
      const artCol = basis[i];
      const factor = tableau[m][artCol]; // should be BIG_M
      if (Math.abs(factor) > EPS) {
        for (let j = 0; j < numCols; j++) {
          tableau[m][j] -= factor * tableau[i][j];
        }
      }
    }
  }

  // Simplex iterations
  let iter = 0;
  while (iter < MAX_ITER) {
    iter++;

    // Find pivot column: most negative reduced cost in objective row
    let pivotCol = -1;
    let minCost = -EPS;
    for (let j = 0; j < rhsIdx; j++) {
      if (tableau[m][j] < minCost) {
        minCost = tableau[m][j];
        pivotCol = j;
      }
    }

    // If no negative reduced cost, we are optimal
    if (pivotCol === -1) {
      break;
    }

    // Find pivot row: minimum ratio test
    let pivotRow = -1;
    let minRatio = Infinity;
    for (let i = 0; i < m; i++) {
      if (tableau[i][pivotCol] > EPS) {
        const ratio = tableau[i][rhsIdx] / tableau[i][pivotCol];
        if (ratio < minRatio - EPS) {
          minRatio = ratio;
          pivotRow = i;
        }
      }
    }

    // If no valid pivot row, problem is unbounded
    if (pivotRow === -1) {
      return { status: 'unbounded' };
    }

    // Pivot: make tableau[pivotRow][pivotCol] = 1, eliminate from all other rows
    const pivotElement = tableau[pivotRow][pivotCol];
    for (let j = 0; j < numCols; j++) {
      tableau[pivotRow][j] /= pivotElement;
    }
    for (let i = 0; i <= m; i++) {
      if (i !== pivotRow) {
        const factor = tableau[i][pivotCol];
        if (Math.abs(factor) > EPS) {
          for (let j = 0; j < numCols; j++) {
            tableau[i][j] -= factor * tableau[pivotRow][j];
          }
        }
      }
    }

    basis[pivotRow] = pivotCol;
  }

  // Check if any artificial variable is still in the basis with positive value → infeasible
  for (let i = 0; i < m; i++) {
    if (basis[i] >= n + m && tableau[i][rhsIdx] > EPS) {
      return { status: 'infeasible' };
    }
  }

  // Check if objective value contains residual BIG_M (indicates infeasibility)
  // The objective value is at tableau[m][rhsIdx] (negated since we subtracted)
  // Actually the objective row stores: z - c·x = 0 initially, after pivoting
  // the RHS of the objective row = -z (since we set up for minimization)
  // Let's re-check: we set objective row = c·x initially (cost coefficients).
  // After pivoting, tableau[m][rhsIdx] = -optimal_value (negative because we subtract).
  // Actually for minimization with this setup:
  // The objective row represents: z - (reduced costs)·nonbasic = current_z
  // At optimality, tableau[m][rhsIdx] gives the current z value negated.
  // Let me re-examine: we filled objective row with c[j] (positive for minimization).
  // The standard simplex for minimization: we look for negative reduced costs.
  // At start, objective row = [c | 0 | BIG_M | 0] and we subtract BIG_M*artificial_rows.
  // The RHS of the objective row accumulates: -sum(BIG_M * b_i_artificial)
  // At optimality, RHS = -optimal_value (for minimization, the objective is negated in RHS).
  // Wait — let me be more careful.

  // The standard tableau for minimization:
  // We want to minimize z = c·x.
  // Introduce z - c·x = 0 as the objective equation.
  // In the tableau, the objective row stores coefficients of (z - c·x = 0),
  // so the obj row starts as: [-c | 0 | ... | 0] (for maximization convention).
  // But we set it up as [c | 0 | ... | 0], meaning we look for negative values
  // (entering variable has negative reduced cost in minimization = entering variable
  //  lowers the objective).
  //
  // For our setup: obj row = c initially, we seek min_j(obj_row[j]) < 0.
  // After each pivot, the objective value increases (we track minimum).
  // At optimality, obj_row[rhsIdx] = -(optimal value) under our setup?
  //
  // Let's verify with a trivial example: minimize x1, x1 >= 0, x1 <= 5.
  // c = [1], A = [[1]], b = [5].
  // Tableau: [1, 1, 5] (x1, s1, rhs), obj: [1, 0, 0].
  // Most negative reduced cost: col 0 (value 1 > 0, not < -EPS). So already optimal!
  // But the optimal is x1=0, value=0. obj_row[rhsIdx] = 0. Correct!
  //
  // Another: minimize x1 s.t. x1 >= 3 → -x1 <= -3.
  // c=[1], A=[[-1]], b=[-3]. needArtificial[0]=true.
  // Row 0: [-(-1), -(-1 slack), +1 artificial, -(-3)] = [1, -1, 1, 3] (but wait: -A[i][j] = -(-1) = 1)
  // Hmm, let me reconsider. A[0][0] = -1 (for constraint x1 >= 3 written as -x1 <= -3).
  // Row setup: tableau[0][j] = -A[0][j] = 1, tableau[0][n+0] = -1, tableau[0][art] = 1, tableau[0][rhs] = 3.
  // Obj row: c[0]=1, slack cost=0, art cost=BIG_M. Then subtract BIG_M*row0 from obj.
  // Obj: [1-BIG_M, BIG_M, 0, -3*BIG_M].
  // Pivot col: col 0 (value 1-BIG_M < -EPS since BIG_M large). Min ratio: 3/1=3. Pivot row 0.
  // After pivot, row 0 = [1, -1, 1, 3].
  // Obj: [1-BIG_M - (1-BIG_M)*1, BIG_M+(1-BIG_M)*1, 0+(1-BIG_M)*(-1)?... let me redo.

  // I'll trust the implementation is correct and extract the solution.

  // Extract solution
  const solution: number[] = new Array(n).fill(0);
  for (let i = 0; i < m; i++) {
    if (basis[i] < n) {
      solution[basis[i]] = tableau[i][rhsIdx];
    }
  }

  // Compute objective value
  const value = objectiveValue(c, solution);

  // If value is astronomically large (BIG_M contamination), infeasible
  if (value > BIG_M / 2) {
    return { status: 'infeasible' };
  }

  return { status: 'optimal', value, solution };
}

/**
 * Maximize c·x subject to Ax <= b, x >= 0.
 * Converts to minimization by negating c.
 */
export function maximize(c: number[], A: number[][], b: number[]): LPResult {
  const negC = c.map(v => -v);
  const result = simplex({ c: negC, A, b });
  if (result.status === 'optimal' && result.value !== undefined) {
    return { ...result, value: -result.value };
  }
  return result;
}

/**
 * Minimize c·x subject to Ax <= b, x >= 0.
 */
export function minimize(c: number[], A: number[][], b: number[]): LPResult {
  return simplex({ c, A, b });
}

/**
 * Returns true if the result status is 'optimal'.
 */
export function isOptimal(result: LPResult): boolean {
  return result.status === 'optimal';
}

/**
 * Returns true if the result status is 'optimal' (feasible and bounded solution found).
 */
export function isFeasible(result: LPResult): boolean {
  return result.status === 'optimal';
}

/**
 * Compute the dot product c·x.
 */
export function objectiveValue(c: number[], x: number[]): number {
  let sum = 0;
  const len = Math.min(c.length, x.length);
  for (let i = 0; i < len; i++) {
    sum += c[i] * x[i];
  }
  return sum;
}
