export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

export interface Attribute {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[]; // For select type
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: 'todo' | 'in-progress' | 'done';
  color?: string;
  comments: Comment[];
  attributes: Attribute[];
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface RoadmapData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
  presetTasks: Record<string, Omit<Task, 'id' | 'status'>>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Will be hashed before storing
  createdAt: Date;
  updatedAt: Date;
} 