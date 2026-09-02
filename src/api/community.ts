import api from './client';

export interface RankingUser {
  id: number;
  full_name: string;
  initials: string;
  department: string;
  work_shift: string | null;
  points: number;
  is_me: boolean;
  rank: number;
}

export interface CommunityLeaderboardResponse {
  rankings: RankingUser[];
  top3: RankingUser[];
  me: RankingUser | null;
}

export async function fetchCommunityLeaderboard(): Promise<CommunityLeaderboardResponse> {
  const response = await api.get<CommunityLeaderboardResponse>(
    '/core/leaderboard/',
  );
  return response.data;
}
