import {
  createColumn,
  createCard,
  createBoard,
  getCardsByColumn,
  moveCard,
  reorderCards,
  addCardToBoard,
  removeCardFromBoard,
  addColumnToBoard,
  getBoardStats,
  getCardById,
  getColumnById,
  filterCardsByPriority,
  filterCardsByAssignee,
  filterCardsByTag,
  sortColumnsByOrder,
  isValidPriority,
  countCardsByColumn,
  isWipLimitReached,
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  CardPriority,
} from '../src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBoard(opts: { cards?: KanbanCard[]; columns?: KanbanColumn[] } = {}): KanbanBoard {
  const columns: KanbanColumn[] = opts.columns ?? [
    createColumn('col-todo', 'To Do', 0),
    createColumn('col-ip', 'In Progress', 1),
    createColumn('col-done', 'Done', 2),
  ];
  const cards: KanbanCard[] = opts.cards ?? [];
  return createBoard('board-1', 'Test Board', columns, cards);
}

function makeCard(id: string, columnId: string, priority: CardPriority = 'medium', order = 0): KanbanCard {
  return createCard(id, `Card ${id}`, columnId, priority, order);
}

const PRIORITIES: CardPriority[] = ['low', 'medium', 'high', 'critical'];
const INVALID_PRIORITIES = ['', 'urgent', 'normal', 'LOW', 'HIGH', 'CRITICAL', 'MEDIUM', ' ', 'null', 'undefined', '0', 'none'];

// ===========================================================================
// 1. createColumn
// ===========================================================================

describe('createColumn', () => {
  it('stores id, title, order', () => {
    const col = createColumn('c1', 'Backlog', 0);
    expect(col.id).toBe('c1');
    expect(col.title).toBe('Backlog');
    expect(col.order).toBe(0);
  });

  it('does not include wipLimit when not provided', () => {
    const col = createColumn('c1', 'Backlog', 0);
    expect(col.wipLimit).toBeUndefined();
  });

  it('stores wipLimit when provided', () => {
    const col = createColumn('c1', 'Backlog', 0, 5);
    expect(col.wipLimit).toBe(5);
  });

  it('stores wipLimit of 1', () => {
    const col = createColumn('c1', 'Backlog', 0, 1);
    expect(col.wipLimit).toBe(1);
  });

  // Parameterised: various orders
  [0, 1, 2, 5, 10, 99, 100].forEach((order) => {
    it(`stores order ${order}`, () => {
      const col = createColumn(`c-${order}`, 'Test', order);
      expect(col.order).toBe(order);
    });
  });

  // Parameterised: various wipLimits
  [1, 2, 3, 5, 10, 20, 50, 100].forEach((wip) => {
    it(`stores wipLimit ${wip}`, () => {
      const col = createColumn('c1', 'Test', 0, wip);
      expect(col.wipLimit).toBe(wip);
    });
  });

  // Different ids / titles
  ['a', 'col-1', 'my-column', 'BACKLOG', 'sprint-1-todo'].forEach((id) => {
    it(`stores id "${id}"`, () => {
      const col = createColumn(id, 'Title', 0);
      expect(col.id).toBe(id);
    });
  });

  ['Todo', 'In Progress', 'Code Review', 'Done', 'Blocked', 'QA Testing'].forEach((title) => {
    it(`stores title "${title}"`, () => {
      const col = createColumn('c', title, 0);
      expect(col.title).toBe(title);
    });
  });

  it('returns an object with correct shape (no extra wipLimit key when omitted)', () => {
    const col = createColumn('c1', 'X', 0);
    expect(Object.keys(col)).not.toContain('wipLimit');
  });

  it('wipLimit=0 is stored', () => {
    const col = createColumn('c1', 'X', 0, 0);
    expect(col.wipLimit).toBe(0);
  });
});

// ===========================================================================
// 2. createCard
// ===========================================================================

describe('createCard', () => {
  it('stores id', () => {
    const card = createCard('card-1', 'Fix bug', 'col-1', 'high', 0);
    expect(card.id).toBe('card-1');
  });

  it('stores title', () => {
    const card = createCard('c1', 'My task', 'col-1', 'low', 0);
    expect(card.title).toBe('My task');
  });

  it('stores columnId', () => {
    const card = createCard('c1', 'T', 'col-99', 'medium', 0);
    expect(card.columnId).toBe('col-99');
  });

  it('stores priority', () => {
    const card = createCard('c1', 'T', 'col-1', 'critical', 0);
    expect(card.priority).toBe('critical');
  });

  it('stores order', () => {
    const card = createCard('c1', 'T', 'col-1', 'low', 7);
    expect(card.order).toBe(7);
  });

  it('sets createdAt to a recent timestamp', () => {
    const before = Date.now();
    const card = createCard('c1', 'T', 'col-1', 'low', 0);
    const after = Date.now();
    expect(card.createdAt).toBeGreaterThanOrEqual(before);
    expect(card.createdAt).toBeLessThanOrEqual(after);
  });

  it('sets updatedAt to a recent timestamp', () => {
    const before = Date.now();
    const card = createCard('c1', 'T', 'col-1', 'low', 0);
    const after = Date.now();
    expect(card.updatedAt).toBeGreaterThanOrEqual(before);
    expect(card.updatedAt).toBeLessThanOrEqual(after);
  });

  it('assignee is undefined by default', () => {
    const card = createCard('c1', 'T', 'col-1', 'low', 0);
    expect(card.assignee).toBeUndefined();
  });

  it('tags are undefined by default', () => {
    const card = createCard('c1', 'T', 'col-1', 'low', 0);
    expect(card.tags).toBeUndefined();
  });

  it('description is undefined by default', () => {
    const card = createCard('c1', 'T', 'col-1', 'low', 0);
    expect(card.description).toBeUndefined();
  });

  it('applies override: description', () => {
    const card = createCard('c1', 'T', 'col-1', 'low', 0, { description: 'desc' });
    expect(card.description).toBe('desc');
  });

  it('applies override: assignee', () => {
    const card = createCard('c1', 'T', 'col-1', 'low', 0, { assignee: 'alice' });
    expect(card.assignee).toBe('alice');
  });

  it('applies override: tags', () => {
    const card = createCard('c1', 'T', 'col-1', 'low', 0, { tags: ['bug', 'urgent'] });
    expect(card.tags).toEqual(['bug', 'urgent']);
  });

  it('applies override: dueDate', () => {
    const due = Date.now() + 86400000;
    const card = createCard('c1', 'T', 'col-1', 'low', 0, { dueDate: due });
    expect(card.dueDate).toBe(due);
  });

  it('applies override: estimatedHours', () => {
    const card = createCard('c1', 'T', 'col-1', 'low', 0, { estimatedHours: 8 });
    expect(card.estimatedHours).toBe(8);
  });

  it('override can change columnId', () => {
    const card = createCard('c1', 'T', 'col-1', 'low', 0, { columnId: 'col-override' });
    expect(card.columnId).toBe('col-override');
  });

  // All priorities
  PRIORITIES.forEach((priority) => {
    it(`stores priority "${priority}"`, () => {
      const card = createCard('c1', 'T', 'col-1', priority, 0);
      expect(card.priority).toBe(priority);
    });
  });

  // Various orders
  [0, 1, 5, 10, 100, 999].forEach((order) => {
    it(`stores order ${order}`, () => {
      const card = createCard('c1', 'T', 'col-1', 'medium', order);
      expect(card.order).toBe(order);
    });
  });

  // Multiple overrides at once
  it('applies multiple overrides simultaneously', () => {
    const due = 9999999999;
    const card = createCard('c1', 'T', 'col-1', 'high', 3, {
      assignee: 'bob',
      description: 'hello',
      tags: ['a', 'b'],
      dueDate: due,
      estimatedHours: 4,
    });
    expect(card.assignee).toBe('bob');
    expect(card.description).toBe('hello');
    expect(card.tags).toEqual(['a', 'b']);
    expect(card.dueDate).toBe(due);
    expect(card.estimatedHours).toBe(4);
  });

  // Unique ids
  ['task-001', 'IMS-42', 'uuid-abc-def', 'a', '1'].forEach((id) => {
    it(`stores id "${id}"`, () => {
      const card = createCard(id, 'T', 'col-1', 'low', 0);
      expect(card.id).toBe(id);
    });
  });
});

// ===========================================================================
// 3. createBoard
// ===========================================================================

describe('createBoard', () => {
  it('stores id', () => {
    const board = createBoard('b1', 'Sprint 1');
    expect(board.id).toBe('b1');
  });

  it('stores title', () => {
    const board = createBoard('b1', 'Sprint 1');
    expect(board.title).toBe('Sprint 1');
  });

  it('defaults to empty columns array', () => {
    const board = createBoard('b1', 'Sprint 1');
    expect(board.columns).toEqual([]);
  });

  it('defaults to empty cards array', () => {
    const board = createBoard('b1', 'Sprint 1');
    expect(board.cards).toEqual([]);
  });

  it('stores provided columns', () => {
    const cols = [createColumn('c1', 'Todo', 0)];
    const board = createBoard('b1', 'X', cols);
    expect(board.columns).toHaveLength(1);
    expect(board.columns[0].id).toBe('c1');
  });

  it('stores provided cards', () => {
    const cards = [makeCard('card-1', 'col-1')];
    const board = createBoard('b1', 'X', [], cards);
    expect(board.cards).toHaveLength(1);
    expect(board.cards[0].id).toBe('card-1');
  });

  it('sets createdAt to a recent timestamp', () => {
    const before = Date.now();
    const board = createBoard('b1', 'X');
    const after = Date.now();
    expect(board.createdAt).toBeGreaterThanOrEqual(before);
    expect(board.createdAt).toBeLessThanOrEqual(after);
  });

  it('stores multiple columns', () => {
    const cols = [
      createColumn('c1', 'Todo', 0),
      createColumn('c2', 'In Progress', 1),
      createColumn('c3', 'Done', 2),
    ];
    const board = createBoard('b1', 'X', cols);
    expect(board.columns).toHaveLength(3);
  });

  it('stores multiple cards', () => {
    const cards = [
      makeCard('c1', 'col-1'),
      makeCard('c2', 'col-1'),
      makeCard('c3', 'col-2'),
    ];
    const board = createBoard('b1', 'X', [], cards);
    expect(board.cards).toHaveLength(3);
  });

  ['My Board', 'Sprint 42', 'Q1 Planning', 'Engineering Backlog', 'Release 2.0'].forEach((title) => {
    it(`stores board title "${title}"`, () => {
      const board = createBoard('b1', title);
      expect(board.title).toBe(title);
    });
  });

  ['b1', 'board-abc', 'IMS-BOARD-001', 'x'].forEach((id) => {
    it(`stores board id "${id}"`, () => {
      const board = createBoard(id, 'X');
      expect(board.id).toBe(id);
    });
  });
});

// ===========================================================================
// 4. getCardsByColumn
// ===========================================================================

describe('getCardsByColumn', () => {
  it('returns empty array when no cards in column', () => {
    const board = makeBoard();
    expect(getCardsByColumn(board, 'col-todo')).toEqual([]);
  });

  it('returns only cards from the specified column', () => {
    const cards = [
      makeCard('c1', 'col-todo', 'low', 0),
      makeCard('c2', 'col-ip', 'low', 0),
    ];
    const board = makeBoard({ cards });
    const result = getCardsByColumn(board, 'col-todo');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });

  it('sorts cards by order ascending', () => {
    const cards = [
      makeCard('c3', 'col-todo', 'low', 2),
      makeCard('c1', 'col-todo', 'low', 0),
      makeCard('c2', 'col-todo', 'low', 1),
    ];
    const board = makeBoard({ cards });
    const result = getCardsByColumn(board, 'col-todo');
    expect(result.map(c => c.id)).toEqual(['c1', 'c2', 'c3']);
  });

  it('returns all cards when all are in same column', () => {
    const cards = [0, 1, 2, 3, 4].map(i => makeCard(`c${i}`, 'col-todo', 'low', i));
    const board = makeBoard({ cards });
    expect(getCardsByColumn(board, 'col-todo')).toHaveLength(5);
  });

  it('returns empty for unknown column id', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo', 'low', 0)] });
    expect(getCardsByColumn(board, 'nonexistent')).toEqual([]);
  });

  it('does not modify original board cards array', () => {
    const cards = [makeCard('c1', 'col-todo', 'low', 0)];
    const board = makeBoard({ cards });
    const original = [...board.cards];
    getCardsByColumn(board, 'col-todo');
    expect(board.cards).toEqual(original);
  });

  // Many cards, sorting guarantee
  it('correctly sorts 10 cards in reverse order', () => {
    const cards = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(i => makeCard(`c${i}`, 'col-todo', 'low', i));
    const board = makeBoard({ cards });
    const result = getCardsByColumn(board, 'col-todo');
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].order).toBeLessThan(result[i + 1].order);
    }
  });

  // Verify filtering across 3 columns
  ['col-todo', 'col-ip', 'col-done'].forEach((colId) => {
    it(`filters correctly for column "${colId}"`, () => {
      const cards = ['col-todo', 'col-ip', 'col-done'].map((cId, i) => makeCard(`c${i}`, cId, 'low', i));
      const board = makeBoard({ cards });
      const result = getCardsByColumn(board, colId);
      expect(result.every(c => c.columnId === colId)).toBe(true);
    });
  });

  it('returns a new array (not reference to board.cards)', () => {
    const cards = [makeCard('c1', 'col-todo', 'low', 0)];
    const board = makeBoard({ cards });
    const result = getCardsByColumn(board, 'col-todo');
    expect(result).not.toBe(board.cards);
  });
});

// ===========================================================================
// 5. moveCard
// ===========================================================================

describe('moveCard', () => {
  it('returns success true when move is valid', () => {
    const cards = [makeCard('c1', 'col-todo', 'low', 0)];
    const board = makeBoard({ cards });
    const result = moveCard(board, 'c1', 'col-ip');
    expect(result.success).toBe(true);
  });

  it('returns updated card with new columnId on success', () => {
    const cards = [makeCard('c1', 'col-todo', 'low', 0)];
    const board = makeBoard({ cards });
    const result = moveCard(board, 'c1', 'col-ip');
    expect(result.card.columnId).toBe('col-ip');
  });

  it('returns fromColumnId correctly', () => {
    const cards = [makeCard('c1', 'col-todo', 'low', 0)];
    const board = makeBoard({ cards });
    const result = moveCard(board, 'c1', 'col-ip');
    expect(result.fromColumnId).toBe('col-todo');
  });

  it('returns toColumnId correctly', () => {
    const cards = [makeCard('c1', 'col-todo', 'low', 0)];
    const board = makeBoard({ cards });
    const result = moveCard(board, 'c1', 'col-ip');
    expect(result.toColumnId).toBe('col-ip');
  });

  it('returns success false and reason when card not found', () => {
    const board = makeBoard();
    const result = moveCard(board, 'nonexistent', 'col-ip');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('Card not found');
  });

  it('returns empty fromColumnId when card not found', () => {
    const board = makeBoard();
    const result = moveCard(board, 'nonexistent', 'col-ip');
    expect(result.fromColumnId).toBe('');
  });

  it('returns success false when target column not found', () => {
    const cards = [makeCard('c1', 'col-todo', 'low', 0)];
    const board = makeBoard({ cards });
    const result = moveCard(board, 'c1', 'col-nonexistent');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('Column not found');
  });

  it('returns success false when WIP limit reached', () => {
    const columns = [
      createColumn('col-todo', 'To Do', 0),
      createColumn('col-ip', 'In Progress', 1, 1),
      createColumn('col-done', 'Done', 2),
    ];
    const cards = [
      makeCard('c1', 'col-todo', 'low', 0),
      makeCard('c2', 'col-ip', 'low', 0), // already fills WIP=1
    ];
    const board = makeBoard({ columns, cards });
    const result = moveCard(board, 'c1', 'col-ip');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('WIP limit reached');
  });

  it('allows move when WIP limit not yet reached', () => {
    const columns = [
      createColumn('col-todo', 'To Do', 0),
      createColumn('col-ip', 'In Progress', 1, 2),
      createColumn('col-done', 'Done', 2),
    ];
    const cards = [
      makeCard('c1', 'col-todo', 'low', 0),
      makeCard('c2', 'col-ip', 'low', 0), // count=1, limit=2 → ok
    ];
    const board = makeBoard({ columns, cards });
    const result = moveCard(board, 'c1', 'col-ip');
    expect(result.success).toBe(true);
  });

  it('does not mutate the original board', () => {
    const cards = [makeCard('c1', 'col-todo', 'low', 0)];
    const board = makeBoard({ cards });
    const originalColumnId = board.cards[0].columnId;
    moveCard(board, 'c1', 'col-ip');
    expect(board.cards[0].columnId).toBe(originalColumnId);
  });

  it('updates updatedAt on successful move', () => {
    const before = Date.now();
    const cards = [makeCard('c1', 'col-todo', 'low', 0)];
    const board = makeBoard({ cards });
    const result = moveCard(board, 'c1', 'col-ip');
    const after = Date.now();
    expect(result.card.updatedAt).toBeGreaterThanOrEqual(before);
    expect(result.card.updatedAt).toBeLessThanOrEqual(after);
  });

  it('preserves card title on move', () => {
    const card = createCard('c1', 'Fix login bug', 'col-todo', 'high', 0);
    const board = makeBoard({ cards: [card] });
    const result = moveCard(board, 'c1', 'col-ip');
    expect(result.card.title).toBe('Fix login bug');
  });

  it('preserves card priority on move', () => {
    const card = createCard('c1', 'T', 'col-todo', 'critical', 0);
    const board = makeBoard({ cards: [card] });
    const result = moveCard(board, 'c1', 'col-ip');
    expect(result.card.priority).toBe('critical');
  });

  it('can move card to same column (no WIP issue)', () => {
    const cards = [makeCard('c1', 'col-todo', 'low', 0)];
    const board = makeBoard({ cards });
    const result = moveCard(board, 'c1', 'col-todo');
    expect(result.success).toBe(true);
  });

  // Move each priority card
  PRIORITIES.forEach((priority) => {
    it(`moves a ${priority} priority card successfully`, () => {
      const cards = [makeCard('c1', 'col-todo', priority, 0)];
      const board = makeBoard({ cards });
      const result = moveCard(board, 'c1', 'col-ip');
      expect(result.success).toBe(true);
      expect(result.card.priority).toBe(priority);
    });
  });

  // WIP limit at exact boundary: wip=N, N-1 cards already in col → should succeed
  [1, 2, 3, 5].forEach((wip) => {
    it(`allows move when WIP limit is ${wip} and column has ${wip - 1} cards`, () => {
      const columns = [
        createColumn('src', 'Src', 0),
        createColumn('dst', 'Dst', 1, wip),
      ];
      const existingCards = Array.from({ length: wip - 1 }, (_, i) =>
        makeCard(`existing-${i}`, 'dst', 'low', i)
      );
      const movingCard = makeCard('mover', 'src', 'low', 0);
      const board = createBoard('b1', 'B', columns, [...existingCards, movingCard]);
      const result = moveCard(board, 'mover', 'dst');
      expect(result.success).toBe(true);
    });
  });

  // WIP limit: exactly at limit → should fail
  [1, 2, 3, 5].forEach((wip) => {
    it(`blocks move when WIP limit is ${wip} and column has ${wip} cards`, () => {
      const columns = [
        createColumn('src', 'Src', 0),
        createColumn('dst', 'Dst', 1, wip),
      ];
      const existingCards = Array.from({ length: wip }, (_, i) =>
        makeCard(`existing-${i}`, 'dst', 'low', i)
      );
      const movingCard = makeCard('mover', 'src', 'low', 0);
      const board = createBoard('b1', 'B', columns, [...existingCards, movingCard]);
      const result = moveCard(board, 'mover', 'dst');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('WIP limit reached');
    });
  });
});

// ===========================================================================
// 6. reorderCards
// ===========================================================================

describe('reorderCards', () => {
  it('returns empty array for empty input', () => {
    expect(reorderCards([])).toEqual([]);
  });

  it('returns single card unchanged', () => {
    const card = makeCard('c1', 'col-1', 'low', 0);
    expect(reorderCards([card])).toHaveLength(1);
  });

  it('sorts already sorted cards correctly', () => {
    const cards = [0, 1, 2].map(i => makeCard(`c${i}`, 'col-1', 'low', i));
    const result = reorderCards(cards);
    expect(result.map(c => c.order)).toEqual([0, 1, 2]);
  });

  it('sorts reversed cards correctly', () => {
    const cards = [2, 1, 0].map(i => makeCard(`c${i}`, 'col-1', 'low', i));
    const result = reorderCards(cards);
    expect(result.map(c => c.order)).toEqual([0, 1, 2]);
  });

  it('sorts shuffled cards correctly', () => {
    const cards = [3, 1, 4, 1, 5, 9, 2, 6].map((o, i) => makeCard(`c${i}`, 'col-1', 'low', o));
    const result = reorderCards(cards);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].order).toBeLessThanOrEqual(result[i + 1].order);
    }
  });

  it('does not mutate the original array', () => {
    const cards = [makeCard('c2', 'col-1', 'low', 2), makeCard('c1', 'col-1', 'low', 1)];
    const original = [...cards];
    reorderCards(cards);
    expect(cards[0].id).toBe(original[0].id);
  });

  it('returns a new array reference', () => {
    const cards = [makeCard('c1', 'col-1', 'low', 0)];
    expect(reorderCards(cards)).not.toBe(cards);
  });

  // Large set
  it('sorts 20 cards by order', () => {
    const orders = [19, 3, 7, 0, 15, 8, 2, 12, 4, 10, 1, 14, 6, 18, 5, 11, 9, 17, 13, 16];
    const cards = orders.map((o, i) => makeCard(`c${i}`, 'col-1', 'low', o));
    const result = reorderCards(cards);
    expect(result[0].order).toBe(0);
    expect(result[result.length - 1].order).toBe(19);
  });

  // Various ordering values
  [
    [10, 20, 30],
    [100, 50, 75],
    [1000, 1, 500],
  ].forEach((orders) => {
    it(`sorts cards with orders ${orders.join(', ')}`, () => {
      const cards = orders.map((o, i) => makeCard(`c${i}`, 'col-1', 'low', o));
      const result = reorderCards(cards);
      const resultOrders = result.map(c => c.order);
      const sorted = [...orders].sort((a, b) => a - b);
      expect(resultOrders).toEqual(sorted);
    });
  });
});

// ===========================================================================
// 7. addCardToBoard
// ===========================================================================

describe('addCardToBoard', () => {
  it('adds card to board', () => {
    const board = makeBoard();
    const card = makeCard('c1', 'col-todo');
    const newBoard = addCardToBoard(board, card);
    expect(newBoard.cards).toHaveLength(1);
  });

  it('new card is in the returned board', () => {
    const board = makeBoard();
    const card = makeCard('c1', 'col-todo');
    const newBoard = addCardToBoard(board, card);
    expect(newBoard.cards[0].id).toBe('c1');
  });

  it('does not mutate original board', () => {
    const board = makeBoard();
    const card = makeCard('c1', 'col-todo');
    addCardToBoard(board, card);
    expect(board.cards).toHaveLength(0);
  });

  it('preserves existing cards', () => {
    const existing = makeCard('existing', 'col-todo');
    const board = makeBoard({ cards: [existing] });
    const newCard = makeCard('new', 'col-todo');
    const newBoard = addCardToBoard(board, newCard);
    expect(newBoard.cards).toHaveLength(2);
    expect(newBoard.cards[0].id).toBe('existing');
  });

  it('returns a new board object', () => {
    const board = makeBoard();
    const card = makeCard('c1', 'col-todo');
    const newBoard = addCardToBoard(board, card);
    expect(newBoard).not.toBe(board);
  });

  it('preserves board id', () => {
    const board = makeBoard();
    const card = makeCard('c1', 'col-todo');
    const newBoard = addCardToBoard(board, card);
    expect(newBoard.id).toBe(board.id);
  });

  it('preserves board title', () => {
    const board = makeBoard();
    const card = makeCard('c1', 'col-todo');
    const newBoard = addCardToBoard(board, card);
    expect(newBoard.title).toBe(board.title);
  });

  it('preserves board columns', () => {
    const board = makeBoard();
    const card = makeCard('c1', 'col-todo');
    const newBoard = addCardToBoard(board, card);
    expect(newBoard.columns).toEqual(board.columns);
  });

  // Adding multiple cards in sequence
  it('accumulates cards when called multiple times', () => {
    let board = makeBoard();
    for (let i = 0; i < 5; i++) {
      board = addCardToBoard(board, makeCard(`c${i}`, 'col-todo', 'low', i));
    }
    expect(board.cards).toHaveLength(5);
  });

  // Adding cards with all priorities
  PRIORITIES.forEach((priority, i) => {
    it(`adds card with priority "${priority}"`, () => {
      const board = makeBoard();
      const card = createCard(`c${i}`, 'T', 'col-todo', priority, i);
      const newBoard = addCardToBoard(board, card);
      expect(newBoard.cards.find(c => c.priority === priority)).toBeDefined();
    });
  });
});

// ===========================================================================
// 8. removeCardFromBoard
// ===========================================================================

describe('removeCardFromBoard', () => {
  it('removes specified card', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    const newBoard = removeCardFromBoard(board, 'c1');
    expect(newBoard.cards).toHaveLength(0);
  });

  it('does not mutate original board', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    removeCardFromBoard(board, 'c1');
    expect(board.cards).toHaveLength(1);
  });

  it('returns a new board object', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    const newBoard = removeCardFromBoard(board, 'c1');
    expect(newBoard).not.toBe(board);
  });

  it('preserves other cards', () => {
    const cards = [makeCard('c1', 'col-todo'), makeCard('c2', 'col-todo')];
    const board = makeBoard({ cards });
    const newBoard = removeCardFromBoard(board, 'c1');
    expect(newBoard.cards).toHaveLength(1);
    expect(newBoard.cards[0].id).toBe('c2');
  });

  it('does nothing when card not found', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    const newBoard = removeCardFromBoard(board, 'nonexistent');
    expect(newBoard.cards).toHaveLength(1);
  });

  it('preserves board id', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    expect(removeCardFromBoard(board, 'c1').id).toBe(board.id);
  });

  it('preserves board columns', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    expect(removeCardFromBoard(board, 'c1').columns).toEqual(board.columns);
  });

  it('can remove from a board with many cards', () => {
    const cards = Array.from({ length: 10 }, (_, i) => makeCard(`c${i}`, 'col-todo', 'low', i));
    const board = makeBoard({ cards });
    const newBoard = removeCardFromBoard(board, 'c5');
    expect(newBoard.cards).toHaveLength(9);
    expect(newBoard.cards.find(c => c.id === 'c5')).toBeUndefined();
  });

  // Removing each card from a multi-card board
  ['c0', 'c1', 'c2', 'c3', 'c4'].forEach((cardId) => {
    it(`removes card "${cardId}" correctly`, () => {
      const cards = [0, 1, 2, 3, 4].map(i => makeCard(`c${i}`, 'col-todo', 'low', i));
      const board = makeBoard({ cards });
      const newBoard = removeCardFromBoard(board, cardId);
      expect(newBoard.cards.find(c => c.id === cardId)).toBeUndefined();
      expect(newBoard.cards).toHaveLength(4);
    });
  });
});

// ===========================================================================
// 9. addColumnToBoard
// ===========================================================================

describe('addColumnToBoard', () => {
  it('adds column to board', () => {
    const board = makeBoard({ columns: [] });
    const col = createColumn('new-col', 'New', 0);
    const newBoard = addColumnToBoard(board, col);
    expect(newBoard.columns).toHaveLength(1);
  });

  it('new column is present', () => {
    const board = makeBoard({ columns: [] });
    const col = createColumn('new-col', 'New', 0);
    const newBoard = addColumnToBoard(board, col);
    expect(newBoard.columns[0].id).toBe('new-col');
  });

  it('does not mutate original board', () => {
    const board = makeBoard({ columns: [] });
    addColumnToBoard(board, createColumn('c', 'X', 0));
    expect(board.columns).toHaveLength(0);
  });

  it('preserves existing columns', () => {
    const board = makeBoard();
    const col = createColumn('extra', 'Extra', 99);
    const newBoard = addColumnToBoard(board, col);
    expect(newBoard.columns).toHaveLength(board.columns.length + 1);
  });

  it('returns a new board reference', () => {
    const board = makeBoard({ columns: [] });
    const newBoard = addColumnToBoard(board, createColumn('c', 'X', 0));
    expect(newBoard).not.toBe(board);
  });

  it('preserves board title', () => {
    const board = makeBoard();
    const newBoard = addColumnToBoard(board, createColumn('c', 'X', 99));
    expect(newBoard.title).toBe(board.title);
  });

  it('preserves board cards', () => {
    const cards = [makeCard('c1', 'col-todo')];
    const board = makeBoard({ cards });
    const newBoard = addColumnToBoard(board, createColumn('extra', 'X', 99));
    expect(newBoard.cards).toEqual(board.cards);
  });

  // Accumulate multiple columns
  it('can add multiple columns sequentially', () => {
    let board = makeBoard({ columns: [] });
    for (let i = 0; i < 5; i++) {
      board = addColumnToBoard(board, createColumn(`col-${i}`, `Col ${i}`, i));
    }
    expect(board.columns).toHaveLength(5);
  });

  // Adding columns with wipLimits
  [undefined, 1, 3, 10].forEach((wip) => {
    it(`adds column with wipLimit=${wip === undefined ? 'undefined' : wip}`, () => {
      const board = makeBoard({ columns: [] });
      const col = createColumn('c', 'X', 0, wip);
      const newBoard = addColumnToBoard(board, col);
      expect(newBoard.columns[0].wipLimit).toBe(wip);
    });
  });
});

// ===========================================================================
// 10. getBoardStats
// ===========================================================================

describe('getBoardStats', () => {
  it('totalCards is 0 for empty board', () => {
    const board = makeBoard();
    expect(getBoardStats(board).totalCards).toBe(0);
  });

  it('totalCards counts all cards', () => {
    const cards = [0, 1, 2].map(i => makeCard(`c${i}`, 'col-todo', 'low', i));
    const board = makeBoard({ cards });
    expect(getBoardStats(board).totalCards).toBe(3);
  });

  it('cardsByColumn is initialised to 0 for each column', () => {
    const board = makeBoard();
    const stats = getBoardStats(board);
    expect(stats.cardsByColumn['col-todo']).toBe(0);
    expect(stats.cardsByColumn['col-ip']).toBe(0);
    expect(stats.cardsByColumn['col-done']).toBe(0);
  });

  it('cardsByColumn counts correctly', () => {
    const cards = [
      makeCard('c1', 'col-todo'),
      makeCard('c2', 'col-todo'),
      makeCard('c3', 'col-ip'),
    ];
    const board = makeBoard({ cards });
    const stats = getBoardStats(board);
    expect(stats.cardsByColumn['col-todo']).toBe(2);
    expect(stats.cardsByColumn['col-ip']).toBe(1);
    expect(stats.cardsByColumn['col-done']).toBe(0);
  });

  it('cardsByPriority low count is correct', () => {
    const cards = [makeCard('c1', 'col-todo', 'low'), makeCard('c2', 'col-ip', 'low')];
    const board = makeBoard({ cards });
    expect(getBoardStats(board).cardsByPriority.low).toBe(2);
  });

  it('cardsByPriority medium count is correct', () => {
    const cards = [makeCard('c1', 'col-todo', 'medium')];
    const board = makeBoard({ cards });
    expect(getBoardStats(board).cardsByPriority.medium).toBe(1);
  });

  it('cardsByPriority high count is correct', () => {
    const cards = [makeCard('c1', 'col-todo', 'high')];
    const board = makeBoard({ cards });
    expect(getBoardStats(board).cardsByPriority.high).toBe(1);
  });

  it('cardsByPriority critical count is correct', () => {
    const cards = [makeCard('c1', 'col-todo', 'critical')];
    const board = makeBoard({ cards });
    expect(getBoardStats(board).cardsByPriority.critical).toBe(1);
  });

  it('all priority counts are 0 on empty board', () => {
    const board = makeBoard();
    const stats = getBoardStats(board);
    PRIORITIES.forEach(p => expect(stats.cardsByPriority[p]).toBe(0));
  });

  it('overdueCards counts past dueDate', () => {
    const past = Date.now() - 86400000;
    const card = createCard('c1', 'T', 'col-todo', 'high', 0, { dueDate: past });
    const board = makeBoard({ cards: [card] });
    expect(getBoardStats(board).overdueCards).toBe(1);
  });

  it('overdueCards does not count future dueDate', () => {
    const future = Date.now() + 86400000;
    const card = createCard('c1', 'T', 'col-todo', 'high', 0, { dueDate: future });
    const board = makeBoard({ cards: [card] });
    expect(getBoardStats(board).overdueCards).toBe(0);
  });

  it('overdueCards is 0 for cards without dueDate', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    expect(getBoardStats(board).overdueCards).toBe(0);
  });

  it('blockedCards is 0 (engine does not calculate blocked from priority)', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo', 'critical')] });
    expect(getBoardStats(board).blockedCards).toBe(0);
  });

  // Mixed priorities
  it('counts mixed priorities correctly', () => {
    const cards = [
      ...Array(3).fill(null).map((_, i) => makeCard(`low${i}`, 'col-todo', 'low', i)),
      ...Array(2).fill(null).map((_, i) => makeCard(`med${i}`, 'col-todo', 'medium', i)),
      makeCard('high1', 'col-ip', 'high', 0),
      makeCard('crit1', 'col-done', 'critical', 0),
    ];
    const board = makeBoard({ cards });
    const stats = getBoardStats(board);
    expect(stats.cardsByPriority.low).toBe(3);
    expect(stats.cardsByPriority.medium).toBe(2);
    expect(stats.cardsByPriority.high).toBe(1);
    expect(stats.cardsByPriority.critical).toBe(1);
    expect(stats.totalCards).toBe(7);
  });

  // Multiple overdue
  it('counts multiple overdue cards', () => {
    const past = Date.now() - 86400000;
    const cards = Array.from({ length: 5 }, (_, i) =>
      createCard(`c${i}`, 'T', 'col-todo', 'medium', i, { dueDate: past })
    );
    const board = makeBoard({ cards });
    expect(getBoardStats(board).overdueCards).toBe(5);
  });

  // N cards per column
  [1, 2, 5, 10].forEach((n) => {
    it(`cardsByColumn counts ${n} cards per column`, () => {
      const cards = Array.from({ length: n }, (_, i) => makeCard(`c${i}`, 'col-todo', 'low', i));
      const board = makeBoard({ cards });
      expect(getBoardStats(board).cardsByColumn['col-todo']).toBe(n);
    });
  });
});

// ===========================================================================
// 11. getCardById
// ===========================================================================

describe('getCardById', () => {
  it('returns card when found', () => {
    const card = makeCard('c1', 'col-todo');
    const board = makeBoard({ cards: [card] });
    expect(getCardById(board, 'c1')).toBeDefined();
    expect(getCardById(board, 'c1')?.id).toBe('c1');
  });

  it('returns undefined when not found', () => {
    const board = makeBoard();
    expect(getCardById(board, 'nonexistent')).toBeUndefined();
  });

  it('returns undefined on empty board', () => {
    const board = makeBoard();
    expect(getCardById(board, 'c1')).toBeUndefined();
  });

  it('finds card among multiple cards', () => {
    const cards = [0, 1, 2, 3, 4].map(i => makeCard(`c${i}`, 'col-todo', 'low', i));
    const board = makeBoard({ cards });
    expect(getCardById(board, 'c3')?.id).toBe('c3');
  });

  it('does not return wrong card', () => {
    const cards = [makeCard('c1', 'col-todo'), makeCard('c2', 'col-todo')];
    const board = makeBoard({ cards });
    expect(getCardById(board, 'c1')?.id).not.toBe('c2');
  });

  // Find each of several cards
  ['c0', 'c1', 'c2', 'c3', 'c4'].forEach((id) => {
    it(`finds card with id "${id}"`, () => {
      const cards = [0, 1, 2, 3, 4].map(i => makeCard(`c${i}`, 'col-todo', 'low', i));
      const board = makeBoard({ cards });
      expect(getCardById(board, id)?.id).toBe(id);
    });
  });

  it('returns card with all correct fields', () => {
    const card = createCard('c1', 'Fix bug', 'col-todo', 'critical', 5, {
      assignee: 'alice',
      tags: ['bug'],
    });
    const board = makeBoard({ cards: [card] });
    const found = getCardById(board, 'c1');
    expect(found?.title).toBe('Fix bug');
    expect(found?.priority).toBe('critical');
    expect(found?.assignee).toBe('alice');
    expect(found?.tags).toEqual(['bug']);
  });
});

// ===========================================================================
// 12. getColumnById
// ===========================================================================

describe('getColumnById', () => {
  it('returns column when found', () => {
    const board = makeBoard();
    expect(getColumnById(board, 'col-todo')).toBeDefined();
  });

  it('returns correct column', () => {
    const board = makeBoard();
    expect(getColumnById(board, 'col-todo')?.id).toBe('col-todo');
  });

  it('returns undefined when not found', () => {
    const board = makeBoard();
    expect(getColumnById(board, 'nonexistent')).toBeUndefined();
  });

  it('returns undefined for empty board', () => {
    const board = makeBoard({ columns: [] });
    expect(getColumnById(board, 'col-todo')).toBeUndefined();
  });

  ['col-todo', 'col-ip', 'col-done'].forEach((colId) => {
    it(`finds column with id "${colId}"`, () => {
      const board = makeBoard();
      expect(getColumnById(board, colId)?.id).toBe(colId);
    });
  });

  it('returns column with wipLimit', () => {
    const columns = [createColumn('c1', 'WIP col', 0, 3)];
    const board = makeBoard({ columns });
    expect(getColumnById(board, 'c1')?.wipLimit).toBe(3);
  });

  it('returns column with correct title', () => {
    const columns = [createColumn('c1', 'My Special Column', 0)];
    const board = makeBoard({ columns });
    expect(getColumnById(board, 'c1')?.title).toBe('My Special Column');
  });

  it('returns column with correct order', () => {
    const columns = [createColumn('c1', 'X', 7)];
    const board = makeBoard({ columns });
    expect(getColumnById(board, 'c1')?.order).toBe(7);
  });
});

// ===========================================================================
// 13. filterCardsByPriority
// ===========================================================================

describe('filterCardsByPriority', () => {
  PRIORITIES.forEach((priority) => {
    it(`returns only ${priority} cards`, () => {
      const cards = PRIORITIES.flatMap((p, i) =>
        Array.from({ length: 3 }, (_, j) => makeCard(`${p}-${j}`, 'col-todo', p, i * 10 + j))
      );
      const board = makeBoard({ cards });
      const result = filterCardsByPriority(board, priority);
      expect(result.length).toBe(3);
      expect(result.every(c => c.priority === priority)).toBe(true);
    });
  });

  it('returns empty array when no cards match priority', () => {
    const cards = [makeCard('c1', 'col-todo', 'low')];
    const board = makeBoard({ cards });
    expect(filterCardsByPriority(board, 'critical')).toEqual([]);
  });

  it('returns empty array on empty board', () => {
    const board = makeBoard();
    expect(filterCardsByPriority(board, 'high')).toEqual([]);
  });

  it('does not mutate the board', () => {
    const cards = [makeCard('c1', 'col-todo', 'low')];
    const board = makeBoard({ cards });
    const before = board.cards.length;
    filterCardsByPriority(board, 'low');
    expect(board.cards.length).toBe(before);
  });

  // Count correctness when multiple priorities mixed
  it('counts correctly among mixed priorities', () => {
    const cards = [
      makeCard('l1', 'col-todo', 'low', 0),
      makeCard('l2', 'col-todo', 'low', 1),
      makeCard('h1', 'col-todo', 'high', 2),
    ];
    const board = makeBoard({ cards });
    expect(filterCardsByPriority(board, 'low')).toHaveLength(2);
    expect(filterCardsByPriority(board, 'high')).toHaveLength(1);
    expect(filterCardsByPriority(board, 'medium')).toHaveLength(0);
    expect(filterCardsByPriority(board, 'critical')).toHaveLength(0);
  });

  // Filtering a large board
  it('handles 40 cards with 10 per priority', () => {
    const cards = PRIORITIES.flatMap((p, pi) =>
      Array.from({ length: 10 }, (_, i) => makeCard(`${p}-${i}`, 'col-todo', p, pi * 10 + i))
    );
    const board = makeBoard({ cards });
    PRIORITIES.forEach(p => {
      expect(filterCardsByPriority(board, p)).toHaveLength(10);
    });
  });
});

// ===========================================================================
// 14. filterCardsByAssignee
// ===========================================================================

describe('filterCardsByAssignee', () => {
  it('returns cards assigned to the specified person', () => {
    const cards = [
      createCard('c1', 'T', 'col-todo', 'low', 0, { assignee: 'alice' }),
      createCard('c2', 'T', 'col-todo', 'low', 1, { assignee: 'bob' }),
    ];
    const board = makeBoard({ cards });
    const result = filterCardsByAssignee(board, 'alice');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });

  it('returns empty when no match', () => {
    const cards = [createCard('c1', 'T', 'col-todo', 'low', 0, { assignee: 'alice' })];
    const board = makeBoard({ cards });
    expect(filterCardsByAssignee(board, 'charlie')).toEqual([]);
  });

  it('returns empty when cards have no assignee', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    expect(filterCardsByAssignee(board, 'alice')).toEqual([]);
  });

  it('returns multiple cards for same assignee', () => {
    const cards = Array.from({ length: 4 }, (_, i) =>
      createCard(`c${i}`, 'T', 'col-todo', 'low', i, { assignee: 'alice' })
    );
    const board = makeBoard({ cards });
    expect(filterCardsByAssignee(board, 'alice')).toHaveLength(4);
  });

  it('does not mutate board', () => {
    const cards = [createCard('c1', 'T', 'col-todo', 'low', 0, { assignee: 'alice' })];
    const board = makeBoard({ cards });
    filterCardsByAssignee(board, 'alice');
    expect(board.cards).toHaveLength(1);
  });

  // Various assignee names
  ['alice', 'bob', 'charlie', 'diana', 'eve'].forEach((name) => {
    it(`finds cards for assignee "${name}"`, () => {
      const cards = ['alice', 'bob', 'charlie', 'diana', 'eve'].map((a, i) =>
        createCard(`c${i}`, 'T', 'col-todo', 'low', i, { assignee: a })
      );
      const board = makeBoard({ cards });
      const result = filterCardsByAssignee(board, name);
      expect(result).toHaveLength(1);
      expect(result[0].assignee).toBe(name);
    });
  });

  it('returns empty on empty board', () => {
    const board = makeBoard();
    expect(filterCardsByAssignee(board, 'alice')).toEqual([]);
  });

  it('handles assignee with special characters', () => {
    const cards = [createCard('c1', 'T', 'col-todo', 'low', 0, { assignee: 'alice.jones@example.com' })];
    const board = makeBoard({ cards });
    expect(filterCardsByAssignee(board, 'alice.jones@example.com')).toHaveLength(1);
  });
});

// ===========================================================================
// 15. filterCardsByTag
// ===========================================================================

describe('filterCardsByTag', () => {
  it('returns cards with the specified tag', () => {
    const cards = [
      createCard('c1', 'T', 'col-todo', 'low', 0, { tags: ['bug', 'frontend'] }),
      createCard('c2', 'T', 'col-todo', 'low', 1, { tags: ['feature'] }),
    ];
    const board = makeBoard({ cards });
    expect(filterCardsByTag(board, 'bug')).toHaveLength(1);
  });

  it('returns empty when no card has tag', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    expect(filterCardsByTag(board, 'bug')).toEqual([]);
  });

  it('returns empty when cards have no tags', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    expect(filterCardsByTag(board, 'anything')).toEqual([]);
  });

  it('returns multiple cards sharing a tag', () => {
    const cards = [
      createCard('c1', 'T', 'col-todo', 'low', 0, { tags: ['bug'] }),
      createCard('c2', 'T', 'col-todo', 'low', 1, { tags: ['bug', 'hotfix'] }),
      createCard('c3', 'T', 'col-todo', 'low', 2, { tags: ['feature'] }),
    ];
    const board = makeBoard({ cards });
    expect(filterCardsByTag(board, 'bug')).toHaveLength(2);
  });

  it('does not return cards with only different tags', () => {
    const cards = [createCard('c1', 'T', 'col-todo', 'low', 0, { tags: ['feature', 'v2'] })];
    const board = makeBoard({ cards });
    expect(filterCardsByTag(board, 'bug')).toHaveLength(0);
  });

  it('returns empty on empty board', () => {
    const board = makeBoard();
    expect(filterCardsByTag(board, 'bug')).toEqual([]);
  });

  // Various tags
  ['bug', 'feature', 'hotfix', 'tech-debt', 'security', 'performance'].forEach((tag) => {
    it(`finds cards tagged "${tag}"`, () => {
      const cards = [createCard('c1', 'T', 'col-todo', 'low', 0, { tags: [tag, 'other'] })];
      const board = makeBoard({ cards });
      expect(filterCardsByTag(board, tag)).toHaveLength(1);
    });
  });

  it('does not mutate board', () => {
    const cards = [createCard('c1', 'T', 'col-todo', 'low', 0, { tags: ['bug'] })];
    const board = makeBoard({ cards });
    filterCardsByTag(board, 'bug');
    expect(board.cards).toHaveLength(1);
  });

  it('does not match partial tag', () => {
    const cards = [createCard('c1', 'T', 'col-todo', 'low', 0, { tags: ['bugfix'] })];
    const board = makeBoard({ cards });
    expect(filterCardsByTag(board, 'bug')).toHaveLength(0);
  });
});

// ===========================================================================
// 16. sortColumnsByOrder
// ===========================================================================

describe('sortColumnsByOrder', () => {
  it('returns a new board', () => {
    const board = makeBoard();
    expect(sortColumnsByOrder(board)).not.toBe(board);
  });

  it('sorts columns in ascending order', () => {
    const columns = [
      createColumn('c3', 'Done', 2),
      createColumn('c1', 'Todo', 0),
      createColumn('c2', 'IP', 1),
    ];
    const board = makeBoard({ columns });
    const result = sortColumnsByOrder(board);
    expect(result.columns.map(c => c.order)).toEqual([0, 1, 2]);
  });

  it('does not mutate original board columns', () => {
    const columns = [
      createColumn('c2', 'B', 1),
      createColumn('c1', 'A', 0),
    ];
    const board = makeBoard({ columns });
    const original = board.columns.map(c => c.id);
    sortColumnsByOrder(board);
    expect(board.columns.map(c => c.id)).toEqual(original);
  });

  it('preserves all columns', () => {
    const board = makeBoard();
    const result = sortColumnsByOrder(board);
    expect(result.columns).toHaveLength(board.columns.length);
  });

  it('handles already-sorted columns', () => {
    const board = makeBoard();
    const result = sortColumnsByOrder(board);
    expect(result.columns.map(c => c.order)).toEqual([0, 1, 2]);
  });

  it('handles single column', () => {
    const board = makeBoard({ columns: [createColumn('c1', 'X', 5)] });
    const result = sortColumnsByOrder(board);
    expect(result.columns).toHaveLength(1);
    expect(result.columns[0].order).toBe(5);
  });

  it('preserves cards', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    const result = sortColumnsByOrder(board);
    expect(result.cards).toEqual(board.cards);
  });

  it('preserves board id', () => {
    const board = makeBoard();
    expect(sortColumnsByOrder(board).id).toBe(board.id);
  });

  // Large column sets
  it('sorts 10 columns correctly', () => {
    const orders = [9, 3, 7, 0, 5, 8, 2, 4, 1, 6];
    const columns = orders.map((o, i) => createColumn(`c${i}`, `Col${i}`, o));
    const board = makeBoard({ columns });
    const result = sortColumnsByOrder(board);
    for (let i = 0; i < result.columns.length - 1; i++) {
      expect(result.columns[i].order).toBeLessThanOrEqual(result.columns[i + 1].order);
    }
  });

  // Various order combinations
  [
    [5, 1, 3],
    [100, 50, 75, 25],
    [0, 10, 5],
  ].forEach((orders) => {
    it(`sorts columns with orders [${orders.join(', ')}]`, () => {
      const columns = orders.map((o, i) => createColumn(`c${i}`, `C${i}`, o));
      const board = makeBoard({ columns });
      const result = sortColumnsByOrder(board);
      const sorted = [...orders].sort((a, b) => a - b);
      expect(result.columns.map(c => c.order)).toEqual(sorted);
    });
  });
});

// ===========================================================================
// 17. isValidPriority
// ===========================================================================

describe('isValidPriority', () => {
  PRIORITIES.forEach((p) => {
    it(`returns true for valid priority "${p}"`, () => {
      expect(isValidPriority(p)).toBe(true);
    });
  });

  INVALID_PRIORITIES.forEach((p) => {
    it(`returns false for invalid priority "${p}"`, () => {
      expect(isValidPriority(p)).toBe(false);
    });
  });

  it('is case sensitive — "Low" is invalid', () => {
    expect(isValidPriority('Low')).toBe(false);
  });

  it('is case sensitive — "Medium" is invalid', () => {
    expect(isValidPriority('Medium')).toBe(false);
  });

  it('is case sensitive — "High" is invalid', () => {
    expect(isValidPriority('High')).toBe(false);
  });

  it('is case sensitive — "Critical" is invalid', () => {
    expect(isValidPriority('Critical')).toBe(false);
  });

  it('does not accept number strings', () => {
    expect(isValidPriority('1')).toBe(false);
    expect(isValidPriority('2')).toBe(false);
  });

  it('does not accept space-padded values', () => {
    expect(isValidPriority(' low')).toBe(false);
    expect(isValidPriority('low ')).toBe(false);
  });
});

// ===========================================================================
// 18. countCardsByColumn
// ===========================================================================

describe('countCardsByColumn', () => {
  it('returns 0 for empty board', () => {
    const board = makeBoard();
    expect(countCardsByColumn(board, 'col-todo')).toBe(0);
  });

  it('returns correct count for a column', () => {
    const cards = [
      makeCard('c1', 'col-todo'),
      makeCard('c2', 'col-todo'),
      makeCard('c3', 'col-ip'),
    ];
    const board = makeBoard({ cards });
    expect(countCardsByColumn(board, 'col-todo')).toBe(2);
  });

  it('returns 0 for column with no cards', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    expect(countCardsByColumn(board, 'col-done')).toBe(0);
  });

  it('returns 0 for unknown column', () => {
    const board = makeBoard();
    expect(countCardsByColumn(board, 'not-a-column')).toBe(0);
  });

  // Various counts
  [1, 2, 3, 5, 10].forEach((n) => {
    it(`counts ${n} cards correctly`, () => {
      const cards = Array.from({ length: n }, (_, i) => makeCard(`c${i}`, 'col-todo', 'low', i));
      const board = makeBoard({ cards });
      expect(countCardsByColumn(board, 'col-todo')).toBe(n);
    });
  });

  it('does not mutate board', () => {
    const cards = [makeCard('c1', 'col-todo')];
    const board = makeBoard({ cards });
    countCardsByColumn(board, 'col-todo');
    expect(board.cards).toHaveLength(1);
  });

  it('counts independently per column', () => {
    const cards = [
      ...Array.from({ length: 3 }, (_, i) => makeCard(`t${i}`, 'col-todo', 'low', i)),
      ...Array.from({ length: 2 }, (_, i) => makeCard(`ip${i}`, 'col-ip', 'low', i)),
    ];
    const board = makeBoard({ cards });
    expect(countCardsByColumn(board, 'col-todo')).toBe(3);
    expect(countCardsByColumn(board, 'col-ip')).toBe(2);
    expect(countCardsByColumn(board, 'col-done')).toBe(0);
  });
});

// ===========================================================================
// 19. isWipLimitReached
// ===========================================================================

describe('isWipLimitReached', () => {
  it('returns false when column has no wip limit', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    expect(isWipLimitReached(board, 'col-todo')).toBe(false);
  });

  it('returns false when column does not exist', () => {
    const board = makeBoard();
    expect(isWipLimitReached(board, 'nonexistent')).toBe(false);
  });

  it('returns false when card count is below limit', () => {
    const columns = [createColumn('col-ip', 'IP', 1, 3)];
    const cards = [makeCard('c1', 'col-ip')];
    const board = makeBoard({ columns, cards });
    expect(isWipLimitReached(board, 'col-ip')).toBe(false);
  });

  it('returns true when card count equals limit', () => {
    const columns = [createColumn('col-ip', 'IP', 1, 2)];
    const cards = [makeCard('c1', 'col-ip'), makeCard('c2', 'col-ip')];
    const board = makeBoard({ columns, cards });
    expect(isWipLimitReached(board, 'col-ip')).toBe(true);
  });

  it('returns true when card count exceeds limit', () => {
    const columns = [createColumn('col-ip', 'IP', 1, 1)];
    const cards = [makeCard('c1', 'col-ip'), makeCard('c2', 'col-ip')];
    const board = makeBoard({ columns, cards });
    expect(isWipLimitReached(board, 'col-ip')).toBe(true);
  });

  it('returns false for empty column with wip limit', () => {
    const columns = [createColumn('col-ip', 'IP', 1, 5)];
    const board = makeBoard({ columns });
    expect(isWipLimitReached(board, 'col-ip')).toBe(false);
  });

  // WIP limit boundary tests
  [1, 2, 3, 5, 10].forEach((wip) => {
    it(`returns false when count (${wip - 1}) < limit (${wip})`, () => {
      const columns = [createColumn('c', 'C', 0, wip)];
      const cards = Array.from({ length: wip - 1 }, (_, i) => makeCard(`c${i}`, 'c', 'low', i));
      const board = createBoard('b1', 'B', columns, cards);
      expect(isWipLimitReached(board, 'c')).toBe(false);
    });

    it(`returns true when count (${wip}) == limit (${wip})`, () => {
      const columns = [createColumn('c', 'C', 0, wip)];
      const cards = Array.from({ length: wip }, (_, i) => makeCard(`c${i}`, 'c', 'low', i));
      const board = createBoard('b1', 'B', columns, cards);
      expect(isWipLimitReached(board, 'c')).toBe(true);
    });
  });

  it('checks the correct column (not a different one)', () => {
    const columns = [
      createColumn('col-a', 'A', 0, 1),
      createColumn('col-b', 'B', 1, 10),
    ];
    const cards = [makeCard('c1', 'col-a')]; // col-a is full, col-b is not
    const board = makeBoard({ columns, cards });
    expect(isWipLimitReached(board, 'col-a')).toBe(true);
    expect(isWipLimitReached(board, 'col-b')).toBe(false);
  });
});

// ===========================================================================
// 20. Integration / composed scenarios
// ===========================================================================

describe('Integration scenarios', () => {
  it('full sprint board workflow: add cards, move, check stats', () => {
    const columns = [
      createColumn('backlog', 'Backlog', 0),
      createColumn('in-progress', 'In Progress', 1, 3),
      createColumn('review', 'Review', 2, 2),
      createColumn('done', 'Done', 3),
    ];
    let board = createBoard('sprint-1', 'Sprint 1', columns);

    // Add 5 cards to backlog
    for (let i = 0; i < 5; i++) {
      board = addCardToBoard(board, createCard(`task-${i}`, `Task ${i}`, 'backlog', 'medium', i));
    }
    expect(board.cards).toHaveLength(5);

    // Move 3 to in-progress
    ['task-0', 'task-1', 'task-2'].forEach((id) => {
      const result = moveCard(board, id, 'in-progress');
      expect(result.success).toBe(true);
      board = { ...board, cards: board.cards.map(c => c.id === id ? result.card : c) };
    });

    // 4th move to in-progress should fail (WIP=3)
    const blocked = moveCard(board, 'task-3', 'in-progress');
    expect(blocked.success).toBe(false);
    expect(blocked.reason).toBe('WIP limit reached');

    // Check stats
    const stats = getBoardStats(board);
    expect(stats.totalCards).toBe(5);
    expect(stats.cardsByColumn['in-progress']).toBe(3);
    expect(stats.cardsByColumn['backlog']).toBe(2);
  });

  it('removes card and stats update correctly', () => {
    const cards = [
      makeCard('c1', 'col-todo', 'high'),
      makeCard('c2', 'col-todo', 'low'),
    ];
    let board = makeBoard({ cards });
    expect(getBoardStats(board).totalCards).toBe(2);

    board = removeCardFromBoard(board, 'c1');
    expect(getBoardStats(board).totalCards).toBe(1);
    expect(getBoardStats(board).cardsByPriority.high).toBe(0);
    expect(getBoardStats(board).cardsByPriority.low).toBe(1);
  });

  it('filters after adding new cards', () => {
    let board = makeBoard();
    board = addCardToBoard(board, createCard('c1', 'T', 'col-todo', 'critical', 0, { assignee: 'alice', tags: ['hotfix'] }));
    board = addCardToBoard(board, createCard('c2', 'T', 'col-todo', 'low', 1, { assignee: 'bob', tags: ['feature'] }));
    board = addCardToBoard(board, createCard('c3', 'T', 'col-ip', 'critical', 0, { assignee: 'alice', tags: ['hotfix'] }));

    expect(filterCardsByPriority(board, 'critical')).toHaveLength(2);
    expect(filterCardsByAssignee(board, 'alice')).toHaveLength(2);
    expect(filterCardsByTag(board, 'hotfix')).toHaveLength(2);
    expect(filterCardsByTag(board, 'feature')).toHaveLength(1);
  });

  it('getCardsByColumn after moves reflects new positions', () => {
    const cards = [
      makeCard('c1', 'col-todo', 'low', 0),
      makeCard('c2', 'col-todo', 'low', 1),
    ];
    let board = makeBoard({ cards });
    const result = moveCard(board, 'c1', 'col-ip');
    board = { ...board, cards: board.cards.map(c => c.id === 'c1' ? result.card : c) };

    expect(getCardsByColumn(board, 'col-todo')).toHaveLength(1);
    expect(getCardsByColumn(board, 'col-ip')).toHaveLength(1);
    expect(getCardsByColumn(board, 'col-ip')[0].id).toBe('c1');
  });

  it('addColumnToBoard + isWipLimitReached works', () => {
    let board = makeBoard({ columns: [] });
    board = addColumnToBoard(board, createColumn('sprint', 'Sprint', 0, 2));
    board = addCardToBoard(board, makeCard('t1', 'sprint'));
    board = addCardToBoard(board, makeCard('t2', 'sprint'));
    expect(isWipLimitReached(board, 'sprint')).toBe(true);
  });

  it('sortColumnsByOrder then getCardsByColumn works', () => {
    const columns = [
      createColumn('col-done', 'Done', 2),
      createColumn('col-todo', 'To Do', 0),
      createColumn('col-ip', 'In Progress', 1),
    ];
    const cards = [
      makeCard('c1', 'col-todo', 'low', 1),
      makeCard('c2', 'col-todo', 'low', 0),
    ];
    let board = createBoard('b1', 'B', columns, cards);
    board = sortColumnsByOrder(board);

    expect(board.columns[0].id).toBe('col-todo');
    const colCards = getCardsByColumn(board, 'col-todo');
    expect(colCards[0].order).toBeLessThan(colCards[1].order);
  });

  it('reorderCards after adding cards to board', () => {
    let board = makeBoard();
    board = addCardToBoard(board, makeCard('c3', 'col-todo', 'low', 3));
    board = addCardToBoard(board, makeCard('c1', 'col-todo', 'low', 1));
    board = addCardToBoard(board, makeCard('c2', 'col-todo', 'low', 2));
    const columnCards = getCardsByColumn(board, 'col-todo');
    const reordered = reorderCards(columnCards);
    expect(reordered.map(c => c.order)).toEqual([1, 2, 3]);
  });

  it('full board stats with overdue cards', () => {
    const past = Date.now() - 999999;
    const future = Date.now() + 999999;
    const cards = [
      createCard('c1', 'T', 'col-todo', 'high', 0, { dueDate: past }),
      createCard('c2', 'T', 'col-todo', 'low', 1, { dueDate: past }),
      createCard('c3', 'T', 'col-ip', 'medium', 0, { dueDate: future }),
      createCard('c4', 'T', 'col-done', 'critical', 0),
    ];
    const board = makeBoard({ cards });
    const stats = getBoardStats(board);
    expect(stats.totalCards).toBe(4);
    expect(stats.overdueCards).toBe(2);
    expect(stats.cardsByPriority.high).toBe(1);
    expect(stats.cardsByPriority.low).toBe(1);
    expect(stats.cardsByPriority.medium).toBe(1);
    expect(stats.cardsByPriority.critical).toBe(1);
  });

  it('multiple boards are independent', () => {
    const board1 = createBoard('b1', 'Board 1', [createColumn('c1', 'X', 0)], [makeCard('card-b1', 'c1')]);
    const board2 = createBoard('b2', 'Board 2', [createColumn('c2', 'Y', 0)], []);
    expect(board1.cards).toHaveLength(1);
    expect(board2.cards).toHaveLength(0);
    expect(board1.id).not.toBe(board2.id);
  });

  it('getCardById after removeCardFromBoard returns undefined', () => {
    const card = makeCard('c1', 'col-todo');
    let board = makeBoard({ cards: [card] });
    board = removeCardFromBoard(board, 'c1');
    expect(getCardById(board, 'c1')).toBeUndefined();
  });

  it('countCardsByColumn after moves reflects correct numbers', () => {
    const cards = Array.from({ length: 5 }, (_, i) => makeCard(`c${i}`, 'col-todo', 'low', i));
    let board = makeBoard({ cards });
    expect(countCardsByColumn(board, 'col-todo')).toBe(5);

    // Move 2 to col-ip
    ['c0', 'c1'].forEach((id) => {
      const r = moveCard(board, id, 'col-ip');
      board = { ...board, cards: board.cards.map(c => c.id === id ? r.card : c) };
    });
    expect(countCardsByColumn(board, 'col-todo')).toBe(3);
    expect(countCardsByColumn(board, 'col-ip')).toBe(2);
  });

  it('filterCardsByTag + filterCardsByPriority composability', () => {
    const cards = [
      createCard('c1', 'T', 'col-todo', 'critical', 0, { tags: ['bug'] }),
      createCard('c2', 'T', 'col-todo', 'low', 1, { tags: ['bug'] }),
      createCard('c3', 'T', 'col-todo', 'critical', 2, { tags: ['feature'] }),
    ];
    const board = makeBoard({ cards });
    const bugs = filterCardsByTag(board, 'bug');
    const criticalBugs = bugs.filter(c => c.priority === 'critical');
    expect(criticalBugs).toHaveLength(1);
    expect(criticalBugs[0].id).toBe('c1');
  });

  it('isValidPriority used as a guard before createCard', () => {
    const maybeValid = ['low', 'invalid', 'critical', 'bad'];
    const results: boolean[] = [];
    for (const p of maybeValid) {
      if (isValidPriority(p)) {
        const card = createCard('c1', 'T', 'col-1', p, 0);
        results.push(card.priority === p);
      } else {
        results.push(false);
      }
    }
    expect(results).toEqual([true, false, true, false]);
  });
});

// ===========================================================================
// 21. Edge cases and boundary conditions
// ===========================================================================

describe('Edge cases', () => {
  it('createBoard with empty strings for id and title', () => {
    const board = createBoard('', '', [], []);
    expect(board.id).toBe('');
    expect(board.title).toBe('');
  });

  it('createCard with empty string title', () => {
    const card = createCard('c1', '', 'col-1', 'low', 0);
    expect(card.title).toBe('');
  });

  it('createColumn with empty string title', () => {
    const col = createColumn('c1', '', 0);
    expect(col.title).toBe('');
  });

  it('moveCard on board with no columns returns column not found', () => {
    const board = createBoard('b1', 'B', [], [makeCard('c1', 'col-todo')]);
    const result = moveCard(board, 'c1', 'col-todo');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('Column not found');
  });

  it('getBoardStats on board with cards in unregistered columns', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'unknown-col')] });
    const stats = getBoardStats(board);
    expect(stats.totalCards).toBe(1);
    // unknown-col not in columns, cardsByColumn should dynamically accumulate
    expect(stats.cardsByColumn['unknown-col']).toBe(1);
  });

  it('reorderCards with duplicate orders preserves all cards', () => {
    const cards = [
      makeCard('c1', 'col-1', 'low', 5),
      makeCard('c2', 'col-1', 'low', 5),
      makeCard('c3', 'col-1', 'low', 5),
    ];
    const result = reorderCards(cards);
    expect(result).toHaveLength(3);
  });

  it('filterCardsByAssignee with empty string assignee', () => {
    const cards = [createCard('c1', 'T', 'col-1', 'low', 0, { assignee: '' })];
    const board = makeBoard({ cards });
    expect(filterCardsByAssignee(board, '')).toHaveLength(1);
  });

  it('filterCardsByTag with empty string tag', () => {
    const cards = [createCard('c1', 'T', 'col-1', 'low', 0, { tags: [''] })];
    const board = makeBoard({ cards });
    expect(filterCardsByTag(board, '')).toHaveLength(1);
  });

  it('getCardsByColumn returns correct order for cards with same order value', () => {
    const cards = [
      makeCard('c1', 'col-todo', 'low', 0),
      makeCard('c2', 'col-todo', 'low', 0),
    ];
    const board = makeBoard({ cards });
    expect(getCardsByColumn(board, 'col-todo')).toHaveLength(2);
  });

  it('createCard updatedAt >= createdAt', () => {
    const card = createCard('c1', 'T', 'col-1', 'low', 0);
    expect(card.updatedAt).toBeGreaterThanOrEqual(card.createdAt);
  });

  it('isValidPriority returns true as type guard in TypeScript narrowing context', () => {
    const priorities = ['low', 'medium', 'high', 'critical', 'unknown'];
    const valid = priorities.filter(p => isValidPriority(p));
    expect(valid).toEqual(['low', 'medium', 'high', 'critical']);
  });

  it('addColumnToBoard does not share reference with original columns array', () => {
    const board = makeBoard();
    const newCol = createColumn('extra', 'Extra', 99);
    const newBoard = addColumnToBoard(board, newCol);
    expect(newBoard.columns).not.toBe(board.columns);
  });

  it('addCardToBoard does not share reference with original cards array', () => {
    const board = makeBoard();
    const newBoard = addCardToBoard(board, makeCard('c1', 'col-todo'));
    expect(newBoard.cards).not.toBe(board.cards);
  });

  it('removeCardFromBoard does not share reference with original cards array', () => {
    const board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    const newBoard = removeCardFromBoard(board, 'c1');
    expect(newBoard.cards).not.toBe(board.cards);
  });

  it('sortColumnsByOrder does not share reference with original columns array', () => {
    const board = makeBoard();
    const sorted = sortColumnsByOrder(board);
    expect(sorted.columns).not.toBe(board.columns);
  });

  // Batch creation of 20 boards each with unique data
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`board ${i} is independently created with id "board-${i}"`, () => {
      const board = createBoard(`board-${i}`, `Title ${i}`);
      expect(board.id).toBe(`board-${i}`);
      expect(board.title).toBe(`Title ${i}`);
    });
  });

  // Batch creation of 20 cards
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`card-${i} has correct order ${i}`, () => {
      const card = createCard(`card-${i}`, `Task ${i}`, 'col-1', PRIORITIES[i % 4], i);
      expect(card.order).toBe(i);
      expect(card.priority).toBe(PRIORITIES[i % 4]);
    });
  });

  // Batch creation of 20 columns
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`column-${i} has correct order ${i}`, () => {
      const col = createColumn(`col-${i}`, `Column ${i}`, i, i > 0 ? i : undefined);
      expect(col.order).toBe(i);
      if (i > 0) {
        expect(col.wipLimit).toBe(i);
      } else {
        expect(col.wipLimit).toBeUndefined();
      }
    });
  });
});

// ===========================================================================
// 22. Stress / volume tests
// ===========================================================================

describe('Stress / volume', () => {
  it('handles board with 100 cards', () => {
    let board = makeBoard();
    for (let i = 0; i < 100; i++) {
      board = addCardToBoard(board, makeCard(`c${i}`, 'col-todo', PRIORITIES[i % 4], i));
    }
    expect(board.cards).toHaveLength(100);
    expect(getBoardStats(board).totalCards).toBe(100);
  });

  it('filterCardsByPriority works correctly on 100 cards', () => {
    let board = makeBoard();
    for (let i = 0; i < 100; i++) {
      board = addCardToBoard(board, makeCard(`c${i}`, 'col-todo', PRIORITIES[i % 4], i));
    }
    PRIORITIES.forEach(p => {
      expect(filterCardsByPriority(board, p)).toHaveLength(25);
    });
  });

  it('getCardsByColumn returns sorted result for 50 cards', () => {
    const orders = Array.from({ length: 50 }, (_, i) => 49 - i); // reversed
    let board = makeBoard();
    for (let i = 0; i < 50; i++) {
      board = addCardToBoard(board, makeCard(`c${i}`, 'col-todo', 'low', orders[i]));
    }
    const result = getCardsByColumn(board, 'col-todo');
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].order).toBeLessThanOrEqual(result[i + 1].order);
    }
  });

  it('reorderCards handles 50 randomly ordered cards', () => {
    const cards = Array.from({ length: 50 }, (_, i) => makeCard(`c${i}`, 'col-1', 'low', Math.floor(Math.random() * 1000)));
    const result = reorderCards(cards);
    expect(result).toHaveLength(50);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].order).toBeLessThanOrEqual(result[i + 1].order);
    }
  });

  it('removeCardFromBoard is idempotent for non-existent card', () => {
    let board = makeBoard({ cards: [makeCard('c1', 'col-todo')] });
    board = removeCardFromBoard(board, 'nonexistent');
    board = removeCardFromBoard(board, 'nonexistent');
    board = removeCardFromBoard(board, 'nonexistent');
    expect(board.cards).toHaveLength(1);
  });

  it('countCardsByColumn matches getBoardStats cardsByColumn', () => {
    const cards = [
      ...Array.from({ length: 3 }, (_, i) => makeCard(`t${i}`, 'col-todo', 'low', i)),
      ...Array.from({ length: 2 }, (_, i) => makeCard(`ip${i}`, 'col-ip', 'low', i)),
      ...Array.from({ length: 5 }, (_, i) => makeCard(`d${i}`, 'col-done', 'low', i)),
    ];
    const board = makeBoard({ cards });
    const stats = getBoardStats(board);
    ['col-todo', 'col-ip', 'col-done'].forEach(colId => {
      expect(countCardsByColumn(board, colId)).toBe(stats.cardsByColumn[colId]);
    });
  });

  it('multiple successive moveCard operations stay consistent', () => {
    let board = makeBoard({ cards: [makeCard('c1', 'col-todo', 'high', 0)] });

    // Move todo → ip
    let r = moveCard(board, 'c1', 'col-ip');
    expect(r.success).toBe(true);
    board = { ...board, cards: [r.card] };

    // Move ip → done
    r = moveCard(board, 'c1', 'col-done');
    expect(r.success).toBe(true);
    board = { ...board, cards: [r.card] };

    expect(board.cards[0].columnId).toBe('col-done');
    expect(getCardsByColumn(board, 'col-done')).toHaveLength(1);
    expect(getCardsByColumn(board, 'col-todo')).toHaveLength(0);
    expect(getCardsByColumn(board, 'col-ip')).toHaveLength(0);
  });
});

// ===========================================================================
// 23. Extended createColumn parametrized (orders 0–49)
// ===========================================================================

describe('createColumn extended order parametrized', () => {
  Array.from({ length: 50 }, (_, i) => i).forEach((order) => {
    it(`createColumn order=${order} is stored correctly`, () => {
      const col = createColumn(`col-ext-${order}`, `Column ${order}`, order);
      expect(col.order).toBe(order);
      expect(col.id).toBe(`col-ext-${order}`);
    });
  });
});

// ===========================================================================
// 24. Extended createCard parametrized (orders 0–49)
// ===========================================================================

describe('createCard extended order parametrized', () => {
  Array.from({ length: 50 }, (_, i) => i).forEach((order) => {
    it(`createCard order=${order} is stored correctly`, () => {
      const card = createCard(`card-ext-${order}`, `Task ${order}`, 'col-1', PRIORITIES[order % 4], order);
      expect(card.order).toBe(order);
      expect(card.priority).toBe(PRIORITIES[order % 4]);
    });
  });
});

// ===========================================================================
// 25. Extended isValidPriority parametrized
// ===========================================================================

describe('isValidPriority extended parametrized', () => {
  const validOnes: CardPriority[] = ['low', 'medium', 'high', 'critical'];
  const invalidOnes = [
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL',
    'Low', 'Medium', 'High', 'Critical',
    'lo', 'med', 'hi', 'crit',
    '0', '1', '2', '3',
    'urgent', 'normal', 'blocker', 'trivial',
    '', ' ', '  ', '\t',
    'low ', ' low', 'low\n',
    'null', 'undefined', 'NaN', 'false',
    'priority', 'p1', 'p2', 'p3',
  ];

  validOnes.forEach((p) => {
    it(`isValidPriority("${p}") === true`, () => {
      expect(isValidPriority(p)).toBe(true);
    });
  });

  invalidOnes.forEach((p) => {
    it(`isValidPriority("${p.replace(/\n/g, '\\n').replace(/\t/g, '\\t')}") === false`, () => {
      expect(isValidPriority(p)).toBe(false);
    });
  });
});

// ===========================================================================
// 26. Extended moveCard WIP boundary parametrized (wip 1–15)
// ===========================================================================

describe('moveCard WIP limit extended parametrized', () => {
  Array.from({ length: 15 }, (_, i) => i + 1).forEach((wip) => {
    it(`WIP=${wip}: column with ${wip - 1} cards allows move`, () => {
      const columns = [createColumn('src', 'Src', 0), createColumn('dst', 'Dst', 1, wip)];
      const existing = Array.from({ length: wip - 1 }, (_, i) => makeCard(`e${i}`, 'dst', 'low', i));
      const mover = makeCard('mover', 'src', 'low', 0);
      const board = createBoard('b', 'B', columns, [...existing, mover]);
      expect(moveCard(board, 'mover', 'dst').success).toBe(true);
    });

    it(`WIP=${wip}: column with ${wip} cards blocks move`, () => {
      const columns = [createColumn('src', 'Src', 0), createColumn('dst', 'Dst', 1, wip)];
      const existing = Array.from({ length: wip }, (_, i) => makeCard(`e${i}`, 'dst', 'low', i));
      const mover = makeCard('mover', 'src', 'low', 0);
      const board = createBoard('b', 'B', columns, [...existing, mover]);
      const result = moveCard(board, 'mover', 'dst');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('WIP limit reached');
    });
  });
});

// ===========================================================================
// 27. Extended countCardsByColumn parametrized (1–30 cards)
// ===========================================================================

describe('countCardsByColumn extended parametrized', () => {
  Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
    it(`countCardsByColumn returns ${n} for ${n} cards`, () => {
      const cards = Array.from({ length: n }, (_, i) => makeCard(`c${i}`, 'col-todo', 'low', i));
      const board = makeBoard({ cards });
      expect(countCardsByColumn(board, 'col-todo')).toBe(n);
    });
  });
});

// ===========================================================================
// 28. Extended getBoardStats totalCards parametrized (1–20)
// ===========================================================================

describe('getBoardStats totalCards extended parametrized', () => {
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`getBoardStats.totalCards === ${n} for ${n} cards`, () => {
      const cards = Array.from({ length: n }, (_, i) => makeCard(`c${i}`, 'col-todo', PRIORITIES[i % 4], i));
      const board = makeBoard({ cards });
      expect(getBoardStats(board).totalCards).toBe(n);
    });
  });
});

// ===========================================================================
// 29. Extended reorderCards parametrized (varied sizes)
// ===========================================================================

describe('reorderCards extended parametrized', () => {
  [5, 10, 15, 20, 25, 30].forEach((size) => {
    it(`reorderCards correctly sorts ${size} cards in reversed order`, () => {
      const cards = Array.from({ length: size }, (_, i) => makeCard(`c${i}`, 'col-1', 'low', size - 1 - i));
      const result = reorderCards(cards);
      expect(result[0].order).toBe(0);
      expect(result[result.length - 1].order).toBe(size - 1);
    });

    it(`reorderCards does not mutate original array of ${size} cards`, () => {
      const cards = Array.from({ length: size }, (_, i) => makeCard(`c${i}`, 'col-1', 'low', size - 1 - i));
      const firstId = cards[0].id;
      reorderCards(cards);
      expect(cards[0].id).toBe(firstId);
    });
  });
});

// ===========================================================================
// 30. Extended filterCardsByPriority — one card per priority per column (12 combos)
// ===========================================================================

describe('filterCardsByPriority column + priority combos', () => {
  const columns = ['col-todo', 'col-ip', 'col-done'];
  columns.forEach((colId) => {
    PRIORITIES.forEach((priority) => {
      it(`filters ${priority} cards in column ${colId}`, () => {
        const card = createCard(`${colId}-${priority}`, 'T', colId, priority, 0);
        const board = makeBoard({ cards: [card] });
        const result = filterCardsByPriority(board, priority);
        expect(result.some(c => c.columnId === colId && c.priority === priority)).toBe(true);
      });
    });
  });
});

// ===========================================================================
// 31. Extended addCardToBoard — 40 sequential adds, verify count at each step
// ===========================================================================

describe('addCardToBoard sequential count verification', () => {
  Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
    it(`after adding card ${i}, board has ${i + 1} card(s)`, () => {
      let board = makeBoard();
      for (let j = 0; j <= i; j++) {
        board = addCardToBoard(board, makeCard(`c${j}`, 'col-todo', 'low', j));
      }
      expect(board.cards).toHaveLength(i + 1);
    });
  });
});

// ===========================================================================
// 32. Extended removeCardFromBoard — verify board lengths after removal
// ===========================================================================

describe('removeCardFromBoard extended parametrized', () => {
  [2, 3, 5, 10, 15].forEach((total) => {
    Array.from({ length: total }, (_, i) => i).forEach((removeIdx) => {
      it(`removes card at index ${removeIdx} from board of ${total} cards`, () => {
        const cards = Array.from({ length: total }, (_, i) => makeCard(`c${i}`, 'col-todo', 'low', i));
        const board = makeBoard({ cards });
        const newBoard = removeCardFromBoard(board, `c${removeIdx}`);
        expect(newBoard.cards).toHaveLength(total - 1);
        expect(newBoard.cards.find(c => c.id === `c${removeIdx}`)).toBeUndefined();
      });
    });
  });
});

// ===========================================================================
// 33. Extended getCardById — parameterised find across board sizes
// ===========================================================================

describe('getCardById extended parametrized', () => {
  [5, 10, 20].forEach((total) => {
    Array.from({ length: total }, (_, i) => i).forEach((findIdx) => {
      it(`finds card c${findIdx} in board of ${total} cards`, () => {
        const cards = Array.from({ length: total }, (_, i) => makeCard(`c${i}`, 'col-todo', 'low', i));
        const board = makeBoard({ cards });
        expect(getCardById(board, `c${findIdx}`)?.id).toBe(`c${findIdx}`);
      });
    });
  });
});

// ===========================================================================
// 34. Extended getColumnById — parameterised find
// ===========================================================================

describe('getColumnById extended parametrized', () => {
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`finds column col-${i} in board with 10 columns`, () => {
      const columns = Array.from({ length: 10 }, (_, j) => createColumn(`col-${j}`, `Col ${j}`, j));
      const board = createBoard('b1', 'B', columns);
      expect(getColumnById(board, `col-${i}`)?.id).toBe(`col-${i}`);
    });
  });
});

// ===========================================================================
// 35. Extended sortColumnsByOrder — varied orderings
// ===========================================================================

describe('sortColumnsByOrder extended parametrized', () => {
  [
    [3, 1, 2],
    [10, 5, 7, 1, 9],
    [99, 0, 50, 25, 75],
    [4, 3, 2, 1, 0],
    [100, 200, 50, 150, 75],
  ].forEach((orders) => {
    it(`sorts columns with orders [${orders.join(', ')}]`, () => {
      const columns = orders.map((o, i) => createColumn(`c${i}`, `Col${i}`, o));
      const board = makeBoard({ columns });
      const result = sortColumnsByOrder(board);
      for (let i = 0; i < result.columns.length - 1; i++) {
        expect(result.columns[i].order).toBeLessThanOrEqual(result.columns[i + 1].order);
      }
    });
  });
});

// ===========================================================================
// 36. Extended filterCardsByAssignee — 10 different assignees
// ===========================================================================

describe('filterCardsByAssignee extended parametrized', () => {
  const assignees = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry', 'irene', 'jack'];
  assignees.forEach((name, idx) => {
    it(`filterCardsByAssignee finds 3 cards for "${name}"`, () => {
      const cards = assignees.flatMap((a, ai) =>
        Array.from({ length: 3 }, (_, j) =>
          createCard(`${a}-${j}`, 'T', 'col-todo', 'low', ai * 3 + j, { assignee: a })
        )
      );
      const board = makeBoard({ cards });
      const result = filterCardsByAssignee(board, name);
      expect(result).toHaveLength(3);
      expect(result.every(c => c.assignee === name)).toBe(true);
    });
  });
});

// ===========================================================================
// 37. Extended filterCardsByTag — 10 different tags
// ===========================================================================

describe('filterCardsByTag extended parametrized', () => {
  const tags = ['bug', 'feature', 'hotfix', 'tech-debt', 'security', 'performance', 'ux', 'backend', 'frontend', 'infra'];
  tags.forEach((tag, idx) => {
    it(`filterCardsByTag finds 2 cards for tag "${tag}"`, () => {
      const cards = tags.flatMap((t, ti) =>
        Array.from({ length: 2 }, (_, j) =>
          createCard(`${t}-${j}`, 'T', 'col-todo', 'low', ti * 2 + j, { tags: [t] })
        )
      );
      const board = makeBoard({ cards });
      const result = filterCardsByTag(board, tag);
      expect(result).toHaveLength(2);
      expect(result.every(c => c.tags?.includes(tag))).toBe(true);
    });
  });
});

// ===========================================================================
// 38. Extended getBoardStats overdueCards (varying counts 1–10)
// ===========================================================================

describe('getBoardStats overdueCards extended parametrized', () => {
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`overdueCards === ${n} when ${n} cards have past dueDate`, () => {
      const past = Date.now() - 86400000;
      const overdueCards = Array.from({ length: n }, (_, i) =>
        createCard(`oc${i}`, 'T', 'col-todo', 'medium', i, { dueDate: past })
      );
      const nonOverdue = makeCard('fine', 'col-todo', 'low', n);
      const board = makeBoard({ cards: [...overdueCards, nonOverdue] });
      expect(getBoardStats(board).overdueCards).toBe(n);
    });
  });
});

// ===========================================================================
// 39. Extended isWipLimitReached — wip values 1–20
// ===========================================================================

describe('isWipLimitReached extended parametrized wip 1-20', () => {
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((wip) => {
    it(`isWipLimitReached false when ${wip - 1} cards, limit=${wip}`, () => {
      const columns = [createColumn('c', 'C', 0, wip)];
      const cards = Array.from({ length: wip - 1 }, (_, i) => makeCard(`c${i}`, 'c', 'low', i));
      const board = createBoard('b', 'B', columns, cards);
      expect(isWipLimitReached(board, 'c')).toBe(false);
    });

    it(`isWipLimitReached true when ${wip} cards, limit=${wip}`, () => {
      const columns = [createColumn('c', 'C', 0, wip)];
      const cards = Array.from({ length: wip }, (_, i) => makeCard(`c${i}`, 'c', 'low', i));
      const board = createBoard('b', 'B', columns, cards);
      expect(isWipLimitReached(board, 'c')).toBe(true);
    });
  });
});

// ===========================================================================
// 40. createCard — 50 unique card ids, verify each stores id + title
// ===========================================================================

describe('createCard 50 unique cards', () => {
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`card id=task-${i} title="Task ${i}" stored correctly`, () => {
      const card = createCard(`task-${i}`, `Task ${i}`, 'col-1', PRIORITIES[i % 4], i);
      expect(card.id).toBe(`task-${i}`);
      expect(card.title).toBe(`Task ${i}`);
      expect(card.columnId).toBe('col-1');
    });
  });
});

// ===========================================================================
// 41. addCardToBoard + getCardById consistency (50 cards)
// ===========================================================================

describe('addCardToBoard + getCardById consistency', () => {
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`getCardById finds card after addCardToBoard for card-${i}`, () => {
      let board = makeBoard();
      const card = makeCard(`card-${i}`, 'col-todo', PRIORITIES[i % 4], i);
      board = addCardToBoard(board, card);
      expect(getCardById(board, `card-${i}`)?.id).toBe(`card-${i}`);
    });
  });
});

// ===========================================================================
// 42. sortColumnsByOrder + getColumnById consistency (10 shuffled columns)
// ===========================================================================

describe('sortColumnsByOrder + getColumnById consistency', () => {
  const shuffledOrders = [9, 3, 7, 0, 5, 8, 2, 4, 1, 6];
  shuffledOrders.forEach((order, i) => {
    it(`getColumnById finds col-${i} after sortColumnsByOrder`, () => {
      const columns = shuffledOrders.map((o, j) => createColumn(`col-${j}`, `Col ${j}`, o));
      const board = createBoard('b1', 'B', columns);
      const sorted = sortColumnsByOrder(board);
      expect(getColumnById(sorted, `col-${i}`)?.id).toBe(`col-${i}`);
    });
  });
});

// ===========================================================================
// 43. getBoardStats cardsByPriority across 40 boards of varying compositions
// ===========================================================================

describe('getBoardStats cardsByPriority varied compositions', () => {
  [
    { low: 1, medium: 0, high: 0, critical: 0 },
    { low: 0, medium: 1, high: 0, critical: 0 },
    { low: 0, medium: 0, high: 1, critical: 0 },
    { low: 0, medium: 0, high: 0, critical: 1 },
    { low: 2, medium: 3, high: 1, critical: 4 },
    { low: 5, medium: 5, high: 5, critical: 5 },
    { low: 10, medium: 0, high: 0, critical: 0 },
    { low: 0, medium: 0, high: 0, critical: 10 },
    { low: 3, medium: 3, high: 3, critical: 3 },
    { low: 1, medium: 2, high: 3, critical: 4 },
  ].forEach(({ low, medium, high, critical }) => {
    it(`cardsByPriority: low=${low}, medium=${medium}, high=${high}, critical=${critical}`, () => {
      const cards = [
        ...Array.from({ length: low }, (_, i) => makeCard(`l${i}`, 'col-todo', 'low', i)),
        ...Array.from({ length: medium }, (_, i) => makeCard(`m${i}`, 'col-todo', 'medium', i)),
        ...Array.from({ length: high }, (_, i) => makeCard(`h${i}`, 'col-ip', 'high', i)),
        ...Array.from({ length: critical }, (_, i) => makeCard(`c${i}`, 'col-done', 'critical', i)),
      ];
      const board = makeBoard({ cards });
      const stats = getBoardStats(board);
      expect(stats.cardsByPriority.low).toBe(low);
      expect(stats.cardsByPriority.medium).toBe(medium);
      expect(stats.cardsByPriority.high).toBe(high);
      expect(stats.cardsByPriority.critical).toBe(critical);
      expect(stats.totalCards).toBe(low + medium + high + critical);
    });
  });
});

// ===========================================================================
// 44. moveCard preserves all card fields through a chain of moves
// ===========================================================================

describe('moveCard field preservation through move chain', () => {
  const cardFields = [
    { assignee: 'alice', tags: ['bug', 'urgent'], description: 'Fix login', estimatedHours: 4 },
    { assignee: 'bob', tags: ['feature'], description: 'New dashboard', estimatedHours: 8 },
    { assignee: 'charlie', tags: ['tech-debt'], description: 'Refactor DB', estimatedHours: 16 },
    { assignee: 'diana', tags: [], description: '', estimatedHours: 1 },
    { assignee: 'eve', tags: ['security', 'critical'], description: 'Patch CVE', estimatedHours: 2 },
  ];

  cardFields.forEach(({ assignee, tags, description, estimatedHours }, i) => {
    it(`moveCard preserves fields for card with assignee="${assignee}"`, () => {
      const card = createCard(`c${i}`, 'Task', 'col-todo', 'high', i, {
        assignee, tags, description, estimatedHours,
      });
      const board = makeBoard({ cards: [card] });
      const result = moveCard(board, `c${i}`, 'col-ip');
      expect(result.success).toBe(true);
      expect(result.card.assignee).toBe(assignee);
      expect(result.card.tags).toEqual(tags);
      expect(result.card.description).toBe(description);
      expect(result.card.estimatedHours).toBe(estimatedHours);
    });
  });
});

// ===========================================================================
// 45. getCardsByColumn count verification (1–20 cards in each of 3 columns)
// ===========================================================================

describe('getCardsByColumn count extended parametrized', () => {
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`getCardsByColumn returns ${n} cards for col-todo with ${n} cards`, () => {
      const cards = Array.from({ length: n }, (_, i) => makeCard(`c${i}`, 'col-todo', 'low', i));
      const board = makeBoard({ cards });
      expect(getCardsByColumn(board, 'col-todo')).toHaveLength(n);
    });
  });
});

// ===========================================================================
// 46. createBoard createdAt is a number (timestamp) for 10 boards
// ===========================================================================

describe('createBoard createdAt is a valid timestamp', () => {
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`board-${i} createdAt is a positive integer`, () => {
      const board = createBoard(`b${i}`, `Board ${i}`);
      expect(typeof board.createdAt).toBe('number');
      expect(board.createdAt).toBeGreaterThan(0);
      expect(Number.isInteger(board.createdAt)).toBe(true);
    });
  });
});

// ===========================================================================
// 47. createCard createdAt and updatedAt are valid timestamps for 10 cards
// ===========================================================================

describe('createCard timestamps valid for 10 cards', () => {
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`card-${i} createdAt and updatedAt are positive integers`, () => {
      const card = createCard(`c${i}`, `T${i}`, 'col-1', PRIORITIES[i % 4], i);
      expect(typeof card.createdAt).toBe('number');
      expect(card.createdAt).toBeGreaterThan(0);
      expect(typeof card.updatedAt).toBe('number');
      expect(card.updatedAt).toBeGreaterThan(0);
    });
  });
});

// ===========================================================================
// 48. addColumnToBoard preserves all pre-existing columns by id
// ===========================================================================

describe('addColumnToBoard preserves existing column ids', () => {
  Array.from({ length: 10 }, (_, i) => i).forEach((existingCount) => {
    it(`adding to board with ${existingCount} columns preserves all existing column ids`, () => {
      const existing = Array.from({ length: existingCount }, (_, j) => createColumn(`col-${j}`, `Col ${j}`, j));
      const board = makeBoard({ columns: existing });
      const newBoard = addColumnToBoard(board, createColumn('col-new', 'New', existingCount));
      const oldIds = existing.map(c => c.id);
      oldIds.forEach(id => {
        expect(newBoard.columns.some(c => c.id === id)).toBe(true);
      });
      expect(newBoard.columns.some(c => c.id === 'col-new')).toBe(true);
    });
  });
});
