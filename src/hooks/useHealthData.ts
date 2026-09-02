/**
 * useHealthData.ts  —  unified entry point
 *
 * Import from here everywhere in the app.
 * Platform routing happens here so no component ever needs a Platform.OS check.
 *
 * Usage (components / screens):
 *   import { useHealthData } from '@/hooks/useHealthData';
 *   const { data, loading, error } = useHealthData();
 *
 * Usage (background fetch task):
 *   import { fetchHealthData } from '@/hooks/useHealthData';
 *   const result = await fetchHealthData(true);
 */

import { Platform } from 'react-native';

// Re-export shared types so consumers only need one import path
export type {
  DayHealthData,
  HealthData,
  HeartRatePoint,
  SleepStage,
  SleepStageSummary,
} from './useHealthData.android';

// ── Platform-specific implementations ─────────────────────────

console.log('Platform =', Platform.OS);
console.log('hey this is the health file');
const { useHealthData: _useHealthData, fetchHealthData: _fetchHealthData } =
  Platform.OS === 'ios'
    ? require('./useHealthData.ios')
    : require('./useHealthData.android');

export const useHealthData: () => {
  data: import('./useHealthData.android').HealthData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} = _useHealthData;

export const fetchHealthData: (
  isBackground?: boolean,
) => Promise<import('./useHealthData.android').HealthData> = _fetchHealthData; // we just import the type in her from the file
