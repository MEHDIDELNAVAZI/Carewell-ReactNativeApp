import { print } from '@gorhom/bottom-sheet/lib/typescript/utilities/logger';
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

import {
  initialize,
  requestPermission,
  getGrantedPermissions,
  readRecords,
} from 'react-native-health-connect';

export type SleepStage = {
  stage: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
};

export type SleepStageSummary = {
  awakeMinutes: number;
  lightMinutes: number;
  deepMinutes: number;
  remMinutes: number;
  unknownMinutes: number;
};

export type HeartRatePoint = {
  time: string;
  bpm: number;
};

export type DayHealthData = {
  date: string;
  steps: number;
  sleepHours: number | null;
  sleepStages: SleepStage[];
  sleepStageSummary: SleepStageSummary; // ← add
  heartRateTimeline: HeartRatePoint[];
  avgHeartRate: number | null;
  minHeartRate: number | null;
  maxHeartRate: number | null;
  avgOxygen: number | null;
  minOxygen: number | null;
  maxOxygen: number | null;
};
export type HealthData = {
  days: DayHealthData[];
};

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const HEALTH_SYNC_ORIGIN = 'nl.appyhapps.healthsync';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function buildEmpty(): HealthData {
  return { days: [] };
}

function makeRange(start: Date, end: Date) {
  return {
    operator: 'between' as const,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };
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

function sleepBelongsToDay(recordEnd: Date, dayStart: Date): boolean {
  return sameLocalDay(recordEnd, dayStart);
}

function mapSleepStage(stage: number): string {
  switch (stage) {
    case 1:
      return 'awake';
    case 4:
      return 'light';
    case 5:
      return 'deep';
    case 6:
      return 'rem';
    default:
      return 'unknown';
  }
}
async function safeRead<T extends string>(
  recordType: T,
  options: Parameters<typeof readRecords>[1],
): Promise<any[]> {
  let allRecords: any[] = [];
  let pageToken: string | undefined = undefined;

  try {
    do {
      const result: any = await readRecords(recordType as any, {
        ...options,
        pageToken,
      });
      allRecords = allRecords.concat(result.records ?? []);
      pageToken = (result as any).pageToken || undefined;
    } while (pageToken);
  } catch (e: any) {
    console.warn(
      `[Health] readRecords(${recordType}) failed:`,
      e?.message ?? e,
    );
  }

  return allRecords;
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

// ─────────────────────────────────────────────────────────────
// CORE BUILD FUNCTION (shared logic)
// ─────────────────────────────────────────────────────────────
async function buildHealthData(
  daysBack: number,
  isBackground: boolean,
): Promise<HealthData> {
  if (Platform.OS !== 'android') return buildEmpty();

  const initialized = await initialize();
  if (!initialized) return buildEmpty();

  // ── PERMISSIONS ───────────────────────────────────────────
  let hasPermissions = false;

  if (isBackground) {
    const granted = await getGrantedPermissions();
    hasPermissions = granted.some((p: any) =>
      ['Steps', 'HeartRate', 'SleepSession', 'OxygenSaturation'].includes(
        p.recordType,
      ),
    );
  } else {
    const granted = await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'HeartRate' },
      { accessType: 'read', recordType: 'SleepSession' },
      { accessType: 'read', recordType: 'OxygenSaturation' },
      { accessType: 'read', recordType: 'BackgroundAccessPermission' },
    ] as any);
    hasPermissions = granted && granted.length > 0;
  }

  if (!hasPermissions) {
    console.warn('[Health] No permissions, skipping');
    return buildEmpty();
  }

  // ── RANGE ─────────────────────────────────────────────────
  const now = new Date();
  const rangeStart = localMidnight(daysBack);
  const range = makeRange(rangeStart, now);

  // Sleep records often start the NIGHT BEFORE the range we ask for
  // (e.g. going to bed at 11PM the previous day). If we ask Health
  // Connect for data only starting at "rangeStart", it clips or drops
  // those records. So for sleep specifically, we ask for 1 extra day
  // further back, then let sleepBelongsToDay() sort it into the right day.
  const sleepRangeStart = localMidnight(daysBack + 1);
  const sleepRange = makeRange(sleepRangeStart, now);

  console.log(`[Health] DATE RANGE (${daysBack + 1} days):`, range);
  console.log(`[Health] SLEEP DATE RANGE (padded +1 day):`, sleepRange);

  const options = {
    timeRangeFilter: range,
    dataOriginFilter: [HEALTH_SYNC_ORIGIN],
    pageSize: 2000,
  };

  const sleepOptions = {
    timeRangeFilter: sleepRange,
    dataOriginFilter: [HEALTH_SYNC_ORIGIN],
    pageSize: 2000,
  };

  const [stepsRecords, heartRateRecords, sleepRecords, oxygenRecords] =
    await Promise.all([
      safeRead('Steps', options),
      safeRead('HeartRate', options),
      safeRead('SleepSession', sleepOptions),
      safeRead('OxygenSaturation', options),
    ]);
  console.log('[Health] STEP RECORDS:', stepsRecords.length);
  console.log('[Health] HEART RATE RECORDS:', heartRateRecords.length);
  console.log('[Health] SLEEP RECORDS:', sleepRecords.length);
  console.log('[Health] OXYGEN RECORDS:', oxygenRecords.length);

  // ── BUILD DAYS ────────────────────────────────────────────
  const days: DayHealthData[] = [];

  for (let i = daysBack; i >= 0; i--) {
    const dayStart = localMidnight(i);
    const dayEnd = localEndOfDay(i);
    const dateStr = localDateOnly(dayStart);

    console.log('\n======== DAY:', dateStr, '========');

    // ── STEPS ──────────────────────────────────────────────
    let daySteps = 0;
    for (const record of stepsRecords as any[]) {
      const recStart = new Date(record.startTime);
      const recEnd = new Date(record.endTime);
      if (!(recStart < dayEnd && recEnd > dayStart)) continue;
      const totalMs = recEnd.getTime() - recStart.getTime();
      const overlapMs =
        Math.min(recEnd.getTime(), dayEnd.getTime()) -
        Math.max(recStart.getTime(), dayStart.getTime());
      const fraction = totalMs > 0 ? overlapMs / totalMs : 1;
      daySteps += Math.round((record.count ?? 0) * fraction);
    }
    // console.log('[STEPS]', dateStr, '->', daySteps);

    // ── HEART RATE ─────────────────────────────────────────
    const heartRateTimeline: HeartRatePoint[] = [];
    for (const record of heartRateRecords as any[]) {
      for (const sample of record.samples ?? []) {
        const sampleDate = new Date(sample.time);
        if (sameLocalDay(sampleDate, dayStart)) {
          heartRateTimeline.push({
            time: sample.time,
            bpm: sample.beatsPerMinute,
          });
        }
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
    //   '[HEART RATE]',
    //   dateStr,
    //   '-> avg:',
    //   avgHeartRate,
    //   'min:',
    //   minHeartRate,
    //   'max:',
    //   maxHeartRate,
    // );

    // ── SLEEP ──────────────────────────────────────────────
    const sleepStages: SleepStage[] = [];

    console.log('\n');
    console.log('══════════════════════════════════════════════════════');
    console.log('🛌 SLEEP DEBUG START');
    console.log('══════════════════════════════════════════════════════');

    console.log('📅 dayStart:', dayStart);
    console.log('📅 dayStart ISO:', dayStart.toISOString());
    console.log('📅 dayStart local:', dayStart.toLocaleString());
    console.log('📅 dayStart timezone offset:', dayStart.getTimezoneOffset());

    console.log(
      '🌍 Current timezone:',
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );

    console.log('📦 Total sleep records:', sleepRecords?.length ?? 0);

    for (const [recordIndex, record] of (sleepRecords as any[]).entries()) {
      console.log('\n');
      console.log('──────────────────────────────────────────────────────');
      console.log(`🛌 SLEEP RECORD #${recordIndex}`);
      console.log('──────────────────────────────────────────────────────');

      console.log('RAW RECORD:', record);

      console.log('➡️ raw startTime:', record.startTime);
      console.log('➡️ raw endTime:', record.endTime);

      const recordStart = new Date(record.startTime);
      const recordEnd = new Date(record.endTime);

      console.log('\n⏰ PARSED DATES');
      console.log('recordStart:', recordStart);
      console.log('recordStart ISO:', recordStart.toISOString());
      console.log('recordStart local:', recordStart.toLocaleString());
      console.log('recordStart timestamp:', recordStart.getTime());

      console.log('recordEnd:', recordEnd);
      console.log('recordEnd ISO:', recordEnd.toISOString());
      console.log('recordEnd local:', recordEnd.toLocaleString());
      console.log('recordEnd timestamp:', recordEnd.getTime());

      console.log('\n⏱️ RECORD DURATION');

      const recordDurationMs = recordEnd.getTime() - recordStart.getTime();
      const recordDurationMinutes = recordDurationMs / 60000;

      console.log('duration ms:', recordDurationMs);
      console.log('duration minutes:', recordDurationMinutes);
      console.log('duration hours:', recordDurationMinutes / 60);

      console.log('\n📅 DAY COMPARISON');

      console.log('dayStart ISO:', dayStart.toISOString());
      console.log('recordStart ISO:', recordStart.toISOString());
      console.log('recordEnd ISO:', recordEnd.toISOString());

      console.log('recordStart local date:', recordStart.toLocaleDateString());
      console.log('recordEnd local date:', recordEnd.toLocaleDateString());
      console.log('dayStart local date:', dayStart.toLocaleDateString());

      console.log('\n🔍 sleepBelongsToDay CHECK');

      const belongsToDay = sleepBelongsToDay(recordEnd, dayStart);

      console.log('recordEnd:', recordEnd.toLocaleString());
      console.log('dayStart:', dayStart.toLocaleString());
      console.log('RESULT:', belongsToDay);

      if (!belongsToDay) {
        console.log('❌ THIS RECORD DOES NOT BELONG TO THIS DAY');
        console.log('❌ SKIPPING RECORD');
        continue;
      }

      console.log('✅ THIS RECORD BELONGS TO THIS DAY');

      console.log('\n🌙 SLEEP STAGES');

      console.log('number of stages:', record.stages?.length ?? 0);

      for (const [stageIndex, stage] of (record.stages ?? []).entries()) {
        console.log('\n');
        console.log(`🌙 STAGE #${stageIndex}`);

        console.log('RAW STAGE:', stage);

        const stageStart = new Date(stage.startTime);
        const stageEnd = new Date(stage.endTime);

        const stageDurationMs = stageEnd.getTime() - stageStart.getTime();
        const stageDurationMinutes = stageDurationMs / 60000;

        sleepStages.push({
          stage: mapSleepStage(stage.stage),
          startTime: stageStart.toLocaleString(),
          endTime: stageEnd.toLocaleString(),
          durationMinutes: Math.round(stageDurationMinutes),
        });
      }
    }

    sleepStages.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

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

    // total sleep = everything except awake time
    const actualSleepMinutes =
      sleepStageSummary.lightMinutes +
      sleepStageSummary.deepMinutes +
      sleepStageSummary.remMinutes +
      sleepStageSummary.unknownMinutes;

    const sleepHours =
      actualSleepMinutes > 0 ? ((actualSleepMinutes / 60) * 10) / 10 : null;

    console.log('Sleep hour which we shodul see to debug ', sleepHours);
    console.log(
      '[SLEEP]',
      dateStr,
      '-> hours:',
      sleepHours,
      '| summary:',
      sleepStageSummary,
    );
    // ── OXYGEN ─────────────────────────────────────────────
    const oxygenValues: number[] = [];
    for (const record of oxygenRecords as any[]) {
      const recDate = new Date(record.time);
      if (sameLocalDay(recDate, dayStart)) {
        oxygenValues.push(record.percentage);
      }
    }
    const avgOxygen = avg(oxygenValues);
    const minOxygen =
      oxygenValues.length > 0 ? Math.min(...oxygenValues) : null;
    const maxOxygen =
      oxygenValues.length > 0 ? Math.max(...oxygenValues) : null;
    console.log(
      '[OXYGEN]',
      dateStr,
      '-> avg:',
      avgOxygen,
      'min:',
      minOxygen,
      'max:',
      maxOxygen,
    );

    // ── SKIP if no data ────────────────────────────────────
    // const hasAnyData =
    //   daySteps > 0 ||
    //   avgHeartRate !== null ||
    //   sleepHours !== null ||
    //   avgOxygen !== null;
    // if (!hasAnyData) {
    //   console.warn('[Health] No data for', dateStr, '— skipping');
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

    console.log('[Health] DAY ADDED:', dateStr);
  }

  console.log('[Health] Total days with data:', days.length);
  return { days };
}

// ─────────────────────────────────────────────────────────────
// FETCH FOR BACKGROUND SYNC — today + yesterday only
// ─────────────────────────────────────────────────────────────

export async function fetchHealthData(
  isBackground: boolean = false,
): Promise<HealthData> {
  return buildHealthData(1, isBackground); // 1 = yesterday + today
}

// ─────────────────────────────────────────────────────────────
// HOOK — 7 days for UI components
// ─────────────────────────────────────────────────────────────
export function useHealthData() {
  const [data, setData] = useState<HealthData>(buildEmpty());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    console.log('[HealthKit] useHealthData hook fired');
    setLoading(true);
    setError(null);
    try {
      const result = await buildHealthData(3, false);
      setData(result);
      console.log('[HealthKit] Final data:', JSON.stringify(result, null, 2));
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
