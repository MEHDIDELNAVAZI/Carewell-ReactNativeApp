import { useState, useEffect, useCallback } from 'react';
import {
  requestAuthorization,
  queryQuantitySamples,
  queryCategorySamples,
  CategoryValueSleepAnalysis,
  isHealthDataAvailable,
} from '@kingstinct/react-native-healthkit';

import type {
  DayHealthData,
  HealthData,
  HeartRatePoint,
  SleepStage,
  SleepStageSummary,
} from './useHealthData.android';

// ─────────────────────────────────────────────────────────────
// SOURCE FILTERING — DISABLED FOR NOW
// ─────────────────────────────────────────────────────────────
// We were filtering to only accept data written by the Huawei Health app,
// but this broke for users on region variants (e.g. "Huawei Health Europe")
// whose source name/bundleIdentifier didn't match our "huawei" check, so
// their data was silently dropped and nothing showed up.
//
// Disabling the filter for now — we just accept ALL sources. Once we know
// the exact name/bundleIdentifier strings across regions (check the
// "Unique source seen" logs below), we can turn this back on with a
// broader match.
function isHuaweiSource(
  source: { name?: string; bundleIdentifier?: string } | undefined,
): boolean {
  if (!source) return false;

  const name = source.name?.toLowerCase() ?? '';
  const bundleId = source.bundleIdentifier?.toLowerCase() ?? '';

  // Huawei Health — regular/global version
  const isRegularHuawei =
    name.includes('huawei health') || bundleId.includes('huawei');

  // Huawei Health — Europe / regional version
  const isHuaweiEurope =
    name.includes('huawei health: europe') ||
    bundleId === 'com.aspiegel.health';

  return isRegularHuawei || isHuaweiEurope;
}

function filterToHuaweiSource<
  T extends {
    sourceRevision?: {
      source?: {
        name?: string;
        bundleIdentifier?: string;
      };
    };
  },
>(records: readonly T[], label: string): T[] {
  return records.filter(record => {
    const source = record.sourceRevision?.source;

    const isHuawei = isHuaweiSource(source);

    console.log(`[HealthKit] ${label} source:`, source, '→ Huawei:', isHuawei);

    return isHuawei;
  });
}
// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function buildEmpty(): HealthData {
  return { days: [] };
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return (
    Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
  );
}

function localDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sameLocalDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function localMidnight(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d;
}

function localEndOfDay(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(23, 59, 59, 999);
  return d;
}

function mapHKSleepStage(value: number): string {
  switch (value) {
    case CategoryValueSleepAnalysis.inBed:
      return 'unknown';
    case CategoryValueSleepAnalysis.asleepUnspecified:
      return 'light';
    case CategoryValueSleepAnalysis.awake:
      return 'awake';
    case CategoryValueSleepAnalysis.asleepCore:
      return 'light';
    case CategoryValueSleepAnalysis.asleepDeep:
      return 'deep';
    case CategoryValueSleepAnalysis.asleepREM:
      return 'rem';
    default:
      return 'unknown';
  }
}

// ─────────────────────────────────────────────────────────────
// PERMISSIONS
// ─────────────────────────────────────────────────────────────

async function requestHKPermissions(): Promise<boolean> {
  try {
    // console.log('[HealthKit] ── STEP 1: checking isHealthDataAvailable...');
    const available = await isHealthDataAvailable();
    // console.log('[HealthKit] isHealthDataAvailable =', available);

    if (!available) {
      console.error(
        '[HealthKit] HealthKit is NOT available on this device/simulator.',
      );
      console.error(
        '[HealthKit] → HealthKit only works on a real iPhone, not on simulator.',
      );
      return false;
    }

    // console.log('[HealthKit] ── STEP 2: calling requestAuthorization...');
    const result = await requestAuthorization({
      toRead: [
        'HKQuantityTypeIdentifierStepCount',
        'HKQuantityTypeIdentifierHeartRate',
        'HKQuantityTypeIdentifierOxygenSaturation',
        'HKCategoryTypeIdentifierSleepAnalysis',
      ],
    });
    // console.log('[HealthKit] requestAuthorization result =', result);
    // result is boolean — true means user saw (or already answered) the prompt
    // iOS never tells you what they chose, so we proceed regardless
    return true;
  } catch (e: any) {
    console.error('[HealthKit] ── requestAuthorization THREW an error:');
    console.error('[HealthKit] error message:', e?.message ?? e);
    console.error('[HealthKit] error stack:', e?.stack ?? 'no stack');
    console.error('[HealthKit] COMMON CAUSES:');
    console.error(
      '[HealthKit]   1. NSHealthShareUsageDescription missing from Info.plist',
    );
    console.error(
      '[HealthKit]   2. HealthKit capability not enabled in Xcode → Signing & Capabilities',
    );
    console.error(
      '[HealthKit]   3. Running on simulator (HealthKit unavailable)',
    );
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// CORE BUILD FUNCTION
// ─────────────────────────────────────────────────────────────

async function buildHealthData(
  daysBack: number,
  _isBackground: boolean,
): Promise<HealthData> {
  // console.log('[HealthKit] ════════════════════════════════════════');
  // console.log('[HealthKit] buildHealthData() called, daysBack =', daysBack);
  // console.log('[HealthKit] ════════════════════════════════════════');

  const ok = await requestHKPermissions();
  if (!ok) {
    console.warn(
      '[HealthKit] Permission step returned false — aborting, returning empty.',
    );
    return buildEmpty();
  }

  const rangeStart = localMidnight(daysBack);
  const rangeEnd = new Date();

  // console.log('[HealthKit] ── STEP 3: querying data...');
  // console.log(
  //   '[HealthKit] range:',
  //   rangeStart.toISOString(),
  //   '->',
  //   rangeEnd.toISOString(),
  // );

  const baseOpts = {
    limit: 0, // 0 = no limit
    filter: { date: { startDate: rangeStart, endDate: rangeEnd } },
  };

  let stepsRecords: readonly any[] = [];
  let heartRateRecords: readonly any[] = [];
  let sleepRecords: readonly any[] = [];
  let oxygenRecords: readonly any[] = [];

  // Query each type separately so one failure doesn't kill the rest.
  // Source filtering is currently DISABLED (see filterToHuaweiSource above) —
  // all sources pass through as-is.
  try {
    const raw = await queryQuantitySamples(
      'HKQuantityTypeIdentifierStepCount',
      { ...baseOpts, unit: 'count' },
    );
    stepsRecords = filterToHuaweiSource(raw, 'Steps');
  } catch (e: any) {
    console.error('[HealthKit] Steps query FAILED:', e?.message ?? e);
  }

  try {
    const raw = await queryQuantitySamples(
      'HKQuantityTypeIdentifierHeartRate',
      { ...baseOpts, unit: 'count/min' },
    );
    heartRateRecords = filterToHuaweiSource(raw, 'HeartRate');
  } catch (e: any) {
    console.error('[HealthKit] HeartRate query FAILED:', e?.message ?? e);
  }

  try {
    const raw = await queryCategorySamples(
      'HKCategoryTypeIdentifierSleepAnalysis',
      baseOpts,
    );
    sleepRecords = filterToHuaweiSource(raw, 'Sleep');
    if (sleepRecords.length > 0) {
      // console.log(
      //   '[HealthKit] Sleep sample[0] raw:',
      //   JSON.stringify(sleepRecords[0]),
      // );
    }
  } catch (e: any) {
    console.error('[HealthKit] Sleep query FAILED:', e?.message ?? e);
  }

  try {
    const raw = await queryQuantitySamples(
      'HKQuantityTypeIdentifierOxygenSaturation',
      { ...baseOpts, unit: '%' },
    );
    oxygenRecords = filterToHuaweiSource(raw, 'Oxygen');
  } catch (e: any) {
    console.error('[HealthKit] Oxygen query FAILED:', e?.message ?? e);
  }

  // console.log('[HealthKit] ── STEP 4: building days...');

  // ── BUILD DAYS ────────────────────────────────────────────
  const days: DayHealthData[] = [];

  for (let i = daysBack; i >= 0; i--) {
    const dayStart = localMidnight(i);
    const dayEnd = localEndOfDay(i);
    const dateStr = localDateOnly(dayStart);

    // console.log('\n[HealthKit] ── DAY:', dateStr);

    // ── STEPS ──────────────────────────────────────────────
    let daySteps = 0;
    for (const record of stepsRecords) {
      const recStart = new Date(record.startDate);
      const recEnd = new Date(record.endDate);
      if (!(recStart < dayEnd && recEnd > dayStart)) continue;
      const totalMs = recEnd.getTime() - recStart.getTime();
      const overlapMs =
        Math.min(recEnd.getTime(), dayEnd.getTime()) -
        Math.max(recStart.getTime(), dayStart.getTime());
      const fraction = totalMs > 0 ? overlapMs / totalMs : 1;
      daySteps += Math.round((record.quantity ?? 0) * fraction);
    }
    // console.log('[HealthKit] STEPS ->', daySteps);

    // ── HEART RATE ─────────────────────────────────────────
    const heartRateTimeline: HeartRatePoint[] = [];
    for (const record of heartRateRecords) {
      const sampleDate = new Date(record.startDate);
      if (sameLocalDay(sampleDate, dayStart)) {
        heartRateTimeline.push({
          time:
            record.startDate instanceof Date
              ? record.startDate.toISOString()
              : record.startDate,
          bpm: Math.round(record.quantity),
        });
      }
    }
    heartRateTimeline.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );
    const heartRateValues = heartRateTimeline.map(p => p.bpm);
    const avgHeartRate = avg(heartRateValues);
    const minHeartRate =
      heartRateValues.length > 0 ? Math.min(...heartRateValues) : null;
    const maxHeartRate =
      heartRateValues.length > 0 ? Math.max(...heartRateValues) : null;
    // console.log(
    //   '[HealthKit] HEART RATE -> avg:',
    //   avgHeartRate,
    //   'points:',
    //   heartRateTimeline.length,
    // );

    // ── SLEEP ──────────────────────────────────────────────
    const sleepStages: SleepStage[] = [];
    let totalSleepMs = 0;

    for (const record of sleepRecords) {
      const recStart = new Date(record.startDate);
      const recEnd = new Date(record.endDate);
      if (!sameLocalDay(recEnd, dayStart)) continue;
      const stageName = mapHKSleepStage(record.value as number);
      if (stageName !== 'unknown') {
        totalSleepMs += recEnd.getTime() - recStart.getTime();
      }
      sleepStages.push({
        stage: stageName,
        startTime: recStart.toLocaleString(),
        endTime: recEnd.toLocaleString(),
        durationMinutes: Math.round(
          (recEnd.getTime() - recStart.getTime()) / 60000,
        ),
      });
    }

    sleepStages.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
    const sleepHours =
      totalSleepMs > 0 ? ((totalSleepMs / 3600000) * 10) / 10 : null;

    // ── SLEEP STAGE SUMMARY ────────────────────────────────
    const sleepStageSummary: SleepStageSummary = {
      awakeMinutes: 0,
      lightMinutes: 0,
      deepMinutes: 0,
      remMinutes: 0,
      unknownMinutes: 0,
    };
    for (const stage of sleepStages) {
      switch (stage.stage) {
        case 'awake':
          sleepStageSummary.awakeMinutes += stage.durationMinutes;
          break;
        case 'light':
          sleepStageSummary.lightMinutes += stage.durationMinutes;
          break;
        case 'deep':
          sleepStageSummary.deepMinutes += stage.durationMinutes;
          break;
        case 'rem':
          sleepStageSummary.remMinutes += stage.durationMinutes;
          break;
        default:
          sleepStageSummary.unknownMinutes += stage.durationMinutes;
          break;
      }
    }
    // console.log(
    //   '[HealthKit] SLEEP -> hours:',
    //   sleepHours,
    //   'stages:',
    //   sleepStages.length,
    // );

    // ── OXYGEN ─────────────────────────────────────────────
    const oxygenValues: number[] = [];
    for (const record of oxygenRecords) {
      const recDate = new Date(record.startDate);
      if (sameLocalDay(recDate, dayStart)) {
        const raw = record.quantity as number;
        oxygenValues.push(raw <= 1 ? Math.round(raw * 100) : Math.round(raw));
      }
    }
    const avgOxygen = avg(oxygenValues);
    const minOxygen =
      oxygenValues.length > 0 ? Math.min(...oxygenValues) : null;
    const maxOxygen =
      oxygenValues.length > 0 ? Math.max(...oxygenValues) : null;
    // console.log(
    //   '[HealthKit] OXYGEN -> avg:',
    //   avgOxygen,
    //   'points:',
    //   oxygenValues.length,
    // );

    // ── SKIP if no data ────────────────────────────────────
    // we dont skip the day , just show no data , for that day , cause , if we skip that it just shows the prev day data , if it has.
    // const hasAnyData =
    //   daySteps > 0 ||
    //   avgHeartRate !== null ||
    //   sleepHours !== null ||
    //   avgOxygen !== null;
    // if (!hasAnyData) {
    //   console.warn('[HealthKit] No data for', dateStr, '— skipping day');
    //   continue;
    // }

    days.push({
      date: dateStr,
      steps: daySteps,
      sleepHours,
      sleepStages,
      sleepStageSummary,
      heartRateTimeline,
      avgHeartRate,
      minHeartRate,
      maxHeartRate,
      avgOxygen,
      minOxygen,
      maxOxygen,
    });

    // console.log('[HealthKit] DAY ADDED:', dateStr);
  }

  // console.log('[HealthKit] ── DONE. Total days with data:', days.length);
  if (days.length === 0) {
    // console.warn('[HealthKit] 0 days returned. Possible reasons:');
    // console.warn(
    //   '[HealthKit]   • No health data on this iPhone in range at all',
    // );
    // console.warn('[HealthKit]   • User denied permission on the prompt');
  }
  return { days };
}

// ─────────────────────────────────────────────────────────────
// FETCH FOR BACKGROUND SYNC — today + yesterday only
// ─────────────────────────────────────────────────────────────

export async function fetchHealthData(
  isBackground: boolean = false,
): Promise<HealthData> {
  return buildHealthData(1, isBackground);
}

// ─────────────────────────────────────────────────────────────
// HOOK — 7 days for UI components
// ─────────────────────────────────────────────────────────────
export function useHealthData() {
  const [data, setData] = useState<HealthData>(buildEmpty());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // console.log('[HealthKit] useHealthData hook fired');
    setLoading(true);
    setError(null);
    try {
      const result = await buildHealthData(6, false);
      setData(result);
      // console.log('[HealthKit] Final data:', JSON.stringify(result, null, 2));
    } catch (e: any) {
      console.error('[HealthKit] useHealthData error:', e?.message ?? e);
      setError(e?.message ?? 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
