export interface UserProfile {
  name: string;
  avatar: string;
  appName: string;
  theme: 'dark' | 'light';
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string; // e.g. '#7C6AF7'
  history: { [dateStr: string]: boolean }; // YYYY-MM-DD -> completed
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string; // Background color hex or designation
  pinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
  tasks: TaskItem[];
}

export interface Photo {
  id: string;
  url: string; // base64 data URL
  caption: string;
  uploadedAt: string;
}

export interface PhotoFolder {
  id: string;
  name: string;
  emoji: string;
  photos: Photo[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  category: 'personal' | 'work' | 'health' | 'social' | 'other';
  notes?: string;
}

export interface Reminder {
  id: string;
  message: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'random';
  category: 'motivation' | 'affirmation' | 'chore' | 'reflection';
  favorite: boolean;
}

export interface GoalStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  status: 'progress' | 'completed' | 'paused';
  progress: number; // 0 - 100
  steps: GoalStep[];
  notes?: string;
}
