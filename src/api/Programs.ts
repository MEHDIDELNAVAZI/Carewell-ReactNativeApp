// api/programs.ts

import { UserAssignment } from '../types/programs';
import api from './client';

// ─── Endpoints ────────────────────────────────────────────────────────────────

// all assigned programs for the authenticated user
export const getMyAssignments = async (): Promise<UserAssignment[]> => {
  const { data } = await api.get('assignments/my-assignments/');
  return data;
};

// only programs that have a task scheduled for today
export const getTodayAssignments = async (): Promise<UserAssignment[]> => {
  const { data } = await api.get<UserAssignment[]>(
    'assignments/my-assignments/',
  );
  return data.filter(a => a.active_today === 1);
};
