// api/homeApi.ts

import api from './client';

export interface StaffProfile {
  first_name: string;
  last_name: string;
  gender: string;
  department: string;
  birth_date: string | null;
  work_shift: string | null;
  points: number;
}

export interface Program {
  id: number;
  name: string;
  type: string;
  target: string;
  instruction: string;
  video_link: string | null;
  points: number;
}

export interface Learn {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  duration: string;
  points: number;
  deadline: string;
}

export interface HomeData {
  user: {
    email: string;
    points: number;
  };
  profile: StaffProfile | null;
  todayPrograms: Program[];
  nearestLearn: Learn | null;
}

export const fetchHomeData = async (): Promise<HomeData> => {
  const response = await api.get<HomeData>('/core/home/');
  return response.data;
};
