// ─── Types ────────────────────────────────────────────────────────────────────
// correct
export interface Program {
  id: number;
  name: string;
  type: 'corrective' | 'strength' | 'lifestyle' | 'general';
  target: string;
  instruction: string;
  video_link: string | null;
  points: number;
}

export interface AssignmentDate {
  id: number;
  date: string;
  completed: boolean;
  completed_at: string | null;
}

export interface UserAssignment {
  assignment_id: number;
  status: 'active' | 'completed' | 'paused';
  notes: string;
  created_at: string;
  active_today: 0 | 1;
  program: Program;
  dates: AssignmentDate[];
  upcomingsessions: AssignmentDate[];
}
