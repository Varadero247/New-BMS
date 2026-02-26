// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/**
 * Hungarian algorithm (Kuhn-Munkres) for optimal assignment problems.
 * Solves the assignment problem in O(n³).
 */

/**
 * Pad a non-square matrix to square by adding rows/columns filled with `value`.
 */
export function paddedMatrix(matrix: number[][], value: number = 0): number[][] {
  if (matrix.length === 0) return [];
  const rows = matrix.length;
  const cols = matrix[0].length;
  const n = Math.max(rows, cols);
  const result: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i < rows && j < cols) {
        row.push(matrix[i][j]);
      } else {
        row.push(value);
      }
    }
    result.push(row);
  }
  return result;
}

/**
 * Core Hungarian algorithm implementation.
 * Returns assignment array where assignment[i] = column assigned to row i.
 */
function hungarianCore(costMatrix: number[][]): number[] {
  const n = costMatrix.length;
  if (n === 0) return [];

  // Work on a copy
  const c: number[][] = costMatrix.map(row => [...row]);

  // Step 1: Subtract row minima
  for (let i = 0; i < n; i++) {
    const minVal = Math.min(...c[i]);
    for (let j = 0; j < n; j++) {
      c[i][j] -= minVal;
    }
  }

  // Step 2: Subtract column minima
  for (let j = 0; j < n; j++) {
    let minVal = Infinity;
    for (let i = 0; i < n; i++) {
      if (c[i][j] < minVal) minVal = c[i][j];
    }
    for (let i = 0; i < n; i++) {
      c[i][j] -= minVal;
    }
  }

  // Arrays for the assignment tracking
  // rowCover[i] = true if row i is covered
  // colCover[j] = true if col j is covered
  // mask[i][j] = 1 if starred, 2 if primed
  const mask: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const rowCover: boolean[] = new Array(n).fill(false);
  const colCover: boolean[] = new Array(n).fill(false);

  // Step 3: Star zeros
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (c[i][j] === 0 && !rowCover[i] && !colCover[j]) {
        mask[i][j] = 1;
        rowCover[i] = true;
        colCover[j] = true;
      }
    }
  }
  rowCover.fill(false);
  colCover.fill(false);

  // Main loop
  let step = 4;
  let pathRow0 = 0;
  let pathCol0 = 0;

  while (step !== 7) {
    if (step === 4) {
      // Cover columns with starred zeros; if n columns covered, done
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (mask[i][j] === 1) colCover[j] = true;
        }
      }
      let coveredCount = 0;
      for (let j = 0; j < n; j++) {
        if (colCover[j]) coveredCount++;
      }
      if (coveredCount >= n) {
        step = 7;
      } else {
        step = 5;
      }
    } else if (step === 5) {
      // Find uncovered zero and prime it
      let done = false;
      while (!done) {
        // Find uncovered zero
        let row = -1;
        let col = -1;
        outer5:
        for (let i = 0; i < n; i++) {
          if (!rowCover[i]) {
            for (let j = 0; j < n; j++) {
              if (c[i][j] === 0 && !colCover[j]) {
                row = i;
                col = j;
                break outer5;
              }
            }
          }
        }
        if (row === -1) {
          // No uncovered zero found
          done = true;
          step = 6;
        } else {
          mask[row][col] = 2; // prime it
          // Is there a starred zero in this row?
          let starCol = -1;
          for (let j = 0; j < n; j++) {
            if (mask[row][j] === 1) {
              starCol = j;
              break;
            }
          }
          if (starCol !== -1) {
            rowCover[row] = true;
            colCover[starCol] = false;
          } else {
            pathRow0 = row;
            pathCol0 = col;
            done = true;
            step = 5.5 as any; // augmenting path step
          }
        }
      }
      if (step === (5.5 as any)) {
        // Augment: build alternating path and flip starred/primed
        const path: [number, number][] = [[pathRow0, pathCol0]];
        let done2 = false;
        while (!done2) {
          // Find starred zero in column of last path element
          const lastCol = path[path.length - 1][1];
          let starRow = -1;
          for (let i = 0; i < n; i++) {
            if (mask[i][lastCol] === 1) {
              starRow = i;
              break;
            }
          }
          if (starRow === -1) {
            done2 = true;
          } else {
            path.push([starRow, lastCol]);
            // Find primed zero in row of starred zero
            const lastRow = path[path.length - 1][0];
            let primeCol = -1;
            for (let j = 0; j < n; j++) {
              if (mask[lastRow][j] === 2) {
                primeCol = j;
                break;
              }
            }
            // There must be a primed zero
            path.push([lastRow, primeCol]);
          }
        }
        // Flip: star primed, unstar starred
        for (const [r, cc] of path) {
          if (mask[r][cc] === 1) mask[r][cc] = 0;
          else if (mask[r][cc] === 2) mask[r][cc] = 1;
        }
        // Erase all primes and uncover all rows/cols
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (mask[i][j] === 2) mask[i][j] = 0;
          }
        }
        rowCover.fill(false);
        colCover.fill(false);
        step = 4;
      }
    } else if (step === 6) {
      // Add/subtract minimum uncovered value
      let minVal = Infinity;
      for (let i = 0; i < n; i++) {
        if (!rowCover[i]) {
          for (let j = 0; j < n; j++) {
            if (!colCover[j]) {
              if (c[i][j] < minVal) minVal = c[i][j];
            }
          }
        }
      }
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (rowCover[i]) c[i][j] += minVal;
          if (!colCover[j]) c[i][j] -= minVal;
        }
      }
      step = 5;
    }
  }

  // Extract assignment from starred zeros
  const assignment: number[] = new Array(n).fill(-1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (mask[i][j] === 1) {
        assignment[i] = j;
        break;
      }
    }
  }
  return assignment;
}

/**
 * Solve the assignment problem (minimization).
 * costMatrix must be square or will be padded.
 * Returns assignment[i] = column for row i, and total minimum cost.
 */
export function hungarian(costMatrix: number[][]): { assignment: number[]; cost: number } {
  if (costMatrix.length === 0) return { assignment: [], cost: 0 };
  const origRows = costMatrix.length;
  const origCols = costMatrix[0].length;
  let matrix = costMatrix;
  if (origRows !== origCols) {
    matrix = paddedMatrix(costMatrix, 0);
  }
  const n = matrix.length;
  const assignment = hungarianCore(matrix);
  // Compute cost using the original matrix dimensions
  let cost = 0;
  for (let i = 0; i < origRows; i++) {
    const j = assignment[i];
    if (j < origCols) {
      cost += costMatrix[i][j];
    }
  }
  return { assignment: assignment.slice(0, origRows), cost };
}

/**
 * Solve the assignment problem (maximization).
 * Negates the matrix then minimizes.
 */
export function maximize(costMatrix: number[][]): { assignment: number[]; benefit: number } {
  if (costMatrix.length === 0) return { assignment: [], benefit: 0 };
  const origRows = costMatrix.length;
  const origCols = costMatrix[0].length;
  const n = Math.max(origRows, origCols);

  // Build padded negated matrix
  const negated: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i < origRows && j < origCols) {
        row.push(-costMatrix[i][j]);
      } else {
        row.push(0);
      }
    }
    negated.push(row);
  }

  const assignment = hungarianCore(negated);

  // Compute benefit using the original matrix
  let benefit = 0;
  for (let i = 0; i < origRows; i++) {
    const j = assignment[i];
    if (j < origCols) {
      benefit += costMatrix[i][j];
    }
  }
  return { assignment: assignment.slice(0, origRows), benefit };
}

/**
 * Compute the total cost of a given assignment on costMatrix.
 */
export function assignmentCost(costMatrix: number[][], assignment: number[]): number {
  let total = 0;
  for (let i = 0; i < assignment.length; i++) {
    const j = assignment[i];
    if (i < costMatrix.length && j >= 0 && j < (costMatrix[i]?.length ?? 0)) {
      total += costMatrix[i][j];
    }
  }
  return total;
}

/**
 * Return array of [row, col] pairs for the optimal assignment.
 */
export function munkres(matrix: number[][]): number[][] {
  if (matrix.length === 0) return [];
  const { assignment } = hungarian(matrix);
  return assignment.map((col, row) => [row, col]);
}

/**
 * Check that assignment is valid: each row has a unique column in [0, n).
 */
export function isValidAssignment(assignment: number[], n: number): boolean {
  if (assignment.length !== n) return false;
  const seen = new Set<number>();
  for (const col of assignment) {
    if (col < 0 || col >= n) return false;
    if (seen.has(col)) return false;
    seen.add(col);
  }
  return true;
}
