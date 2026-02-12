export interface ChecklistClause {
  clause: string;
  title: string;
  questions: string[];
  evidence: string[];
  mandatory: boolean;
}

export interface StandardChecklist {
  standard: string;
  version: string;
  title: string;
  clauses: ChecklistClause[];
}
