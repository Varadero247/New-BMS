export type CardPriority = 'low' | 'medium' | 'high' | 'critical';
export type CardStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority: CardPriority;
  assignee?: string;
  tags?: string[];
  order: number;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  estimatedHours?: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  wipLimit?: number;
  color?: string;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: KanbanColumn[];
  cards: KanbanCard[];
  createdAt: number;
}

export interface MoveCardResult {
  card: KanbanCard;
  fromColumnId: string;
  toColumnId: string;
  success: boolean;
  reason?: string;
}

export interface BoardStats {
  totalCards: number;
  cardsByColumn: Record<string, number>;
  cardsByPriority: Record<CardPriority, number>;
  overdueCards: number;
  blockedCards: number;
}
