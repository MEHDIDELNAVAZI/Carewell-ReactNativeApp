import BackgroundFetch from 'react-native-background-fetch';
import api from './client';
import { HealthData, fetchHealthData } from '../hooks/useHealthData';

export async function sendHealthDataToDjango(data: HealthData): Promise<void> {
  await api.post('/health/sync/', {
    synced_at: new Date().toISOString(),
    days: data.days,
  });
  console.log('[HealthSync] Successfully sent health data to Django');
}

export async function runHealthSync(): Promise<void> {
  console.log('[HealthSync] Starting sync...');
  try {
    const data = await fetchHealthData(true);
    if (data.days.length === 0) {
      console.warn('[HealthSync] No health data, skipping');
      return;
    }
    await sendHealthDataToDjango(data);
    console.log('[HealthSync] Sync complete ✓');
  } catch (e: any) {
    console.error('[HealthSync] Sync failed:', e?.message ?? e);
  }
}

export async function registerBackgroundSync(): Promise<void> {
  const status = await BackgroundFetch.configure(
    {
      minimumFetchInterval: 15,
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
    },
    async (taskId: any) => {
      console.log('[HealthSync] Background task fired:', taskId);
      try {
        await runHealthSync();
      } catch (e) {
        console.error('[HealthSync] Background task error:', e);
      } finally {
        BackgroundFetch.finish(taskId);
      }
    },
    (taskId: any) => {
      console.log('[HealthSync] Timeout:', taskId);
      BackgroundFetch.finish(taskId);
    },
  );
}

export const HeadlessHealthSyncTask = async (event: { taskId: string }) => {
  console.log('[HEADLESS_TEST] Task fired, taskId:', event.taskId);
  try {
    await runHealthSync();
  } catch (e) {
    console.error('[HealthSync] Headless task error:', e);
  } finally {
    BackgroundFetch.finish(event.taskId);
  }
};
