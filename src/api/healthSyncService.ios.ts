import api from './client';
import { HealthData, fetchHealthData } from '../hooks/useHealthData';
import { subscribeToChanges } from '@kingstinct/react-native-healthkit';

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

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSync() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    console.log('[HealthSync] Debounced sync firing...');
    await runHealthSync();
  }, 3000);
}

export async function registerBackgroundSync(): Promise<void> {
  console.log('[HealthSync] Registering HealthKit observers...');

  const types = [
    'HKQuantityTypeIdentifierStepCount',
    'HKQuantityTypeIdentifierHeartRate',
    'HKQuantityTypeIdentifierOxygenSaturation',
    'HKCategoryTypeIdentifierSleepAnalysis',
  ] as const;

  for (const type of types) {
    await subscribeToChanges(type, () => {
      console.log('[HealthSync] Change detected:', type);
      debouncedSync();
    });
  }
  console.log('[HealthSync] All observers registered ✓');
}
