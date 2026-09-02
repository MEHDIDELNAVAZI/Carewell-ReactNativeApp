// api/programs.ts

import { UserAssignment } from "../types/programs";
import api from "./client";

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const completeAssignmentDate = async (dateId: number): Promise<void> => {
  await api.patch(`assignments/assignment-dates/${dateId}/complete/`);
};