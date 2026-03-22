export type TodoStatus = 'active' | 'completed';

export type FilterOption = 'all' | 'active' | 'completed';

export interface TodoItem {
  id: string;
  text: string;
  status: TodoStatus;
  createdAt: string; // ISO 8601
  completedAt: string | null;
}
