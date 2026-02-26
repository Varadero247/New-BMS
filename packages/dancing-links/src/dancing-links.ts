// Copyright (c) 2026 Nexara DMCC. All rights reserved.

interface DLXNode {
  L: DLXNode; R: DLXNode; U: DLXNode; D: DLXNode;
  C: DLXNode;  // column header
  rowIndex: number;
  colIndex: number;
  count: number; // only valid on column headers
  name: string;  // only valid on column headers
}

export class DancingLinks {
  private header: DLXNode;
  private solutions: number[][];
  private maxSolutions: number;

  constructor(matrix: number[][], maxSolutions = Infinity) {
    this.solutions = [];
    this.maxSolutions = maxSolutions;
    this.header = this.buildDLX(matrix);
  }

  private makeNode(): DLXNode {
    const n: DLXNode = {} as DLXNode;
    n.L = n; n.R = n; n.U = n; n.D = n;
    n.C = n; n.rowIndex = -1; n.colIndex = -1; n.count = 0; n.name = '';
    return n;
  }

  private buildDLX(matrix: number[][]): DLXNode {
    const rows = matrix.length;
    const cols = rows > 0 ? matrix[0].length : 0;
    const header = this.makeNode();
    header.name = 'header';
    // Create column headers
    const colHeaders: DLXNode[] = [];
    let prev = header;
    for (let j = 0; j < cols; j++) {
      const col = this.makeNode();
      col.name = `c${j}`;
      col.colIndex = j;
      col.C = col;
      col.U = col; col.D = col;
      // Insert into header row
      col.L = prev; col.R = header;
      prev.R = col; header.L = col;
      prev = col;
      colHeaders.push(col);
    }
    // Add rows
    for (let i = 0; i < rows; i++) {
      let rowFirst: DLXNode | null = null;
      let rowPrev: DLXNode | null = null;
      for (let j = 0; j < cols; j++) {
        if (matrix[i][j] === 0) continue;
        const node = this.makeNode();
        node.rowIndex = i;
        node.colIndex = j;
        node.C = colHeaders[j];
        // Insert into column
        node.U = colHeaders[j].U; node.D = colHeaders[j];
        colHeaders[j].U.D = node; colHeaders[j].U = node;
        colHeaders[j].count++;
        // Link into row
        if (!rowFirst) { rowFirst = node; rowPrev = node; }
        else {
          node.L = rowPrev!; node.R = rowFirst;
          rowPrev!.R = node; rowFirst.L = node;
          rowPrev = node;
        }
      }
    }
    return header;
  }

  private cover(col: DLXNode): void {
    col.R.L = col.L; col.L.R = col.R;
    for (let i = col.D; i !== col; i = i.D) {
      for (let j = i.R; j !== i; j = j.R) {
        j.D.U = j.U; j.U.D = j.D;
        j.C.count--;
      }
    }
  }

  private uncover(col: DLXNode): void {
    for (let i = col.U; i !== col; i = i.U) {
      for (let j = i.L; j !== i; j = j.L) {
        j.C.count++;
        j.D.U = j; j.U.D = j;
      }
    }
    col.R.L = col; col.L.R = col;
  }

  private search(k: number, partial: number[]): void {
    if (this.solutions.length >= this.maxSolutions) return;
    if (this.header.R === this.header) {
      this.solutions.push([...partial]);
      return;
    }
    // Choose column with minimum count (S heuristic)
    let col = this.header.R;
    for (let j = col.R; j !== this.header; j = j.R) {
      if (j.count < col.count) col = j;
    }
    this.cover(col);
    for (let r = col.D; r !== col; r = r.D) {
      partial.push(r.rowIndex);
      for (let j = r.R; j !== r; j = j.R) this.cover(j.C);
      this.search(k + 1, partial);
      for (let j = r.L; j !== r; j = j.L) this.uncover(j.C);
      partial.pop();
    }
    this.uncover(col);
  }

  solve(): number[][] {
    this.solutions = [];
    this.search(0, []);
    return this.solutions;
  }

  /** Find first solution only */
  findFirst(): number[] | null {
    this.maxSolutions = 1;
    this.solutions = [];
    this.search(0, []);
    this.maxSolutions = Infinity;
    return this.solutions.length > 0 ? this.solutions[0] : null;
  }

  get numSolutions(): number { return this.solutions.length; }
}

/** Solve exact cover: given universe and subsets, find subsets that cover each element exactly once */
export function exactCover(universe: number[], subsets: number[][]): number[][] | null {
  const n = universe.length;
  const idx = new Map(universe.map((v, i) => [v, i]));
  const matrix = subsets.map(s => {
    const row = new Array(n).fill(0);
    s.forEach(v => { if (idx.has(v)) row[idx.get(v)!] = 1; });
    return row;
  });
  const dlx = new DancingLinks(matrix, 1);
  const sol = dlx.findFirst();
  if (!sol) return null;
  return sol.map(i => subsets[i]);
}

/** Solve N-Queens problem using DLX (exact cover representation) */
export function solveNQueens(n: number, maxSolutions = Infinity): number[][] {
  // Columns: n row-constraints + n col-constraints + (2n-1) diag1 + (2n-1) diag2
  // But only row and col are mandatory (primary); diags are secondary (optional)
  // For simplicity, we encode only the 2n primary constraints and 4n-2 secondary
  // We'll use a manual backtracking approach for correctness
  const solutions: number[][] = [];
  const board = new Array(n).fill(-1);
  const cols = new Set<number>();
  const diag1 = new Set<number>();
  const diag2 = new Set<number>();

  function bt(row: number) {
    if (solutions.length >= maxSolutions) return;
    if (row === n) { solutions.push([...board]); return; }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;
      board[row] = col;
      cols.add(col); diag1.add(row - col); diag2.add(row + col);
      bt(row + 1);
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);
    }
  }
  bt(0);
  return solutions;
}

/** Check if a placement is a valid N-queens solution */
export function isValidNQueens(placement: number[]): boolean {
  const n = placement.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (placement[i] === placement[j]) return false;
      if (Math.abs(placement[i] - placement[j]) === Math.abs(i - j)) return false;
    }
  }
  return true;
}

/** Solve Sudoku using DLX (exact cover representation) */
export function solveSudoku(grid: number[][]): number[][] | null {
  // Build exact cover matrix for standard 9x9 Sudoku
  const N = 9, B = 3;
  const rows: number[] = [];
  const cols = 4 * N * N; // 4 constraint types * 81 cells each
  const matrix: number[][] = [];

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const digits = grid[r][c] === 0 ? Array.from({length: N}, (_, i) => i + 1) : [grid[r][c]];
      for (const d of digits) {
        const row = new Array(cols).fill(0);
        // Cell constraint: one digit per cell
        row[r * N + c] = 1;
        // Row constraint: each digit once per row
        row[N * N + r * N + (d - 1)] = 1;
        // Col constraint: each digit once per col
        row[2 * N * N + c * N + (d - 1)] = 1;
        // Box constraint: each digit once per box
        const box = Math.floor(r / B) * B + Math.floor(c / B);
        row[3 * N * N + box * N + (d - 1)] = 1;
        matrix.push(row);
        rows.push(r * N * N + c * N + (d - 1));
      }
    }
  }

  const dlx = new DancingLinks(matrix, 1);
  const sol = dlx.findFirst();
  if (!sol) return null;

  const result = Array.from({length: N}, () => new Array(N).fill(0));
  for (const rowIdx of sol) {
    const origRow = rows[rowIdx];
    const r = Math.floor(origRow / (N * N));
    const c = Math.floor((origRow % (N * N)) / N);
    const d = (origRow % N) + 1;
    result[r][c] = d;
  }
  return result;
}
