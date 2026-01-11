
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
  date: string; // ISO format: YYYY-MM-DD
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
