export type LessonCategory =
  | 'musculoskeletal'
  | 'ergonomics'
  | 'sleep'
  | 'nutrition'
  | 'stress';

export type LearnItem = {
  id: number;
  title: string;
  description: string;
  content: string;
  type: string;
  category: LessonCategory;
  duration: string;
  points: number;
  deadline: string;
  is_active: boolean;
  views: number;
  is_expired: boolean;
  completion_score: number;
  completed: boolean;
  time_remaining: number; // seconds
};

export type LearnProgress = {
  completed: number;
  total: number;
  total_xp: number;
};

export type LearnResponse = {
  learns: LearnItem[];
  spotlight: LearnItem | null;
  progress: LearnProgress;
};