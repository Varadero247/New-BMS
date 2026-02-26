import { BoardStats, CardPriority, KanbanBoard, KanbanCard, KanbanColumn, MoveCardResult } from './types';

export function createColumn(id: string, title: string, order: number, wipLimit?: number): KanbanColumn {
  return { id, title, order, ...(wipLimit !== undefined ? { wipLimit } : {}) };
}

export function createCard(
  id: string, title: string, columnId: string, priority: CardPriority, order: number,
  overrides: Partial<KanbanCard> = {}
): KanbanCard {
  const now = Date.now();
  return { id, title, columnId, priority, order, createdAt: now, updatedAt: now, ...overrides };
}

export function createBoard(id: string, title: string, columns: KanbanColumn[] = [], cards: KanbanCard[] = []): KanbanBoard {
  return { id, title, columns, cards, createdAt: Date.now() };
}

export function getCardsByColumn(board: KanbanBoard, columnId: string): KanbanCard[] {
  return board.cards.filter(c => c.columnId === columnId).sort((a, b) => a.order - b.order);
}

export function moveCard(board: KanbanBoard, cardId: string, targetColumnId: string): MoveCardResult {
  const card = board.cards.find(c => c.id === cardId);
  if (!card) return { card: {} as KanbanCard, fromColumnId: '', toColumnId: targetColumnId, success: false, reason: 'Card not found' };
  const targetColumn = board.columns.find(c => c.id === targetColumnId);
  if (!targetColumn) return { card, fromColumnId: card.columnId, toColumnId: targetColumnId, success: false, reason: 'Column not found' };
  if (targetColumn.wipLimit !== undefined) {
    const currentCount = board.cards.filter(c => c.columnId === targetColumnId).length;
    if (currentCount >= targetColumn.wipLimit) {
      return { card, fromColumnId: card.columnId, toColumnId: targetColumnId, success: false, reason: 'WIP limit reached' };
    }
  }
  const fromColumnId = card.columnId;
  const updatedCard = { ...card, columnId: targetColumnId, updatedAt: Date.now() };
  return { card: updatedCard, fromColumnId, toColumnId: targetColumnId, success: true };
}

export function reorderCards(cards: KanbanCard[]): KanbanCard[] {
  return [...cards].sort((a, b) => a.order - b.order);
}

export function addCardToBoard(board: KanbanBoard, card: KanbanCard): KanbanBoard {
  return { ...board, cards: [...board.cards, card] };
}

export function removeCardFromBoard(board: KanbanBoard, cardId: string): KanbanBoard {
  return { ...board, cards: board.cards.filter(c => c.id !== cardId) };
}

export function addColumnToBoard(board: KanbanBoard, column: KanbanColumn): KanbanBoard {
  return { ...board, columns: [...board.columns, column] };
}

export function getBoardStats(board: KanbanBoard): BoardStats {
  const cardsByColumn: Record<string, number> = {};
  for (const col of board.columns) cardsByColumn[col.id] = 0;
  const cardsByPriority: Record<CardPriority, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  const now = Date.now();
  let overdueCards = 0;
  let blockedCards = 0;
  for (const card of board.cards) {
    cardsByColumn[card.columnId] = (cardsByColumn[card.columnId] ?? 0) + 1;
    cardsByPriority[card.priority]++;
    if (card.dueDate && card.dueDate < now) overdueCards++;
  }
  return { totalCards: board.cards.length, cardsByColumn, cardsByPriority, overdueCards, blockedCards };
}

export function getCardById(board: KanbanBoard, cardId: string): KanbanCard | undefined {
  return board.cards.find(c => c.id === cardId);
}

export function getColumnById(board: KanbanBoard, columnId: string): KanbanColumn | undefined {
  return board.columns.find(c => c.id === columnId);
}

export function filterCardsByPriority(board: KanbanBoard, priority: CardPriority): KanbanCard[] {
  return board.cards.filter(c => c.priority === priority);
}

export function filterCardsByAssignee(board: KanbanBoard, assignee: string): KanbanCard[] {
  return board.cards.filter(c => c.assignee === assignee);
}

export function filterCardsByTag(board: KanbanBoard, tag: string): KanbanCard[] {
  return board.cards.filter(c => c.tags?.includes(tag));
}

export function sortColumnsByOrder(board: KanbanBoard): KanbanBoard {
  return { ...board, columns: [...board.columns].sort((a, b) => a.order - b.order) };
}

export function isValidPriority(p: string): p is CardPriority {
  return ['low', 'medium', 'high', 'critical'].includes(p);
}

export function countCardsByColumn(board: KanbanBoard, columnId: string): number {
  return board.cards.filter(c => c.columnId === columnId).length;
}

export function isWipLimitReached(board: KanbanBoard, columnId: string): boolean {
  const col = board.columns.find(c => c.id === columnId);
  if (!col || col.wipLimit === undefined) return false;
  return countCardsByColumn(board, columnId) >= col.wipLimit;
}
