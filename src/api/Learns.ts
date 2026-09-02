import api from './client';
import { LearnItem, LearnResponse } from '../types/learns';

export const getLearnItems = async (): Promise<LearnResponse> => {
  const response = await api.get('/learn/learns/');
  return response.data;
};

export const completeLearn = async (learnId: number): Promise<void> => {
  await api.post(`/learn/learns/${learnId}/complete/`);
}