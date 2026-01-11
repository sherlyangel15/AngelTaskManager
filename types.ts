
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum Category {
  WORK = 'Work',
  STUDY = 'Study',
  PERSONAL = 'Personal',
  HEALTH = 'Health',
  FINANCE = 'Finance',
  OTHER = 'Other'
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  time?: string;
  date: string; // ISO format: YYYY-MM-DD (kept for backward compatibility)
  dates?: string[]; // Multiple dates (ISO format: YYYY-MM-DD)
  everyday?: boolean; // If true, task appears on all dates
  completedDates?: string[]; // For everyday tasks: dates when this task was completed (ISO format: YYYY-MM-DD)
  createdAt: number;
}

export interface User {
  username: string;
  password?: string;
  tasks: Task[];
}

export interface AuthSession {
  username: string;
}
