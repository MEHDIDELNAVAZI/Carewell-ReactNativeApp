import React, { useState, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';

import colors from '../../theme/colors';
import VitalSigns from '../../components/health/Vitals/Vitalsignes';
import WeeklyActivity from '../../components/health/Vitals/WeekActivity';
import SleepQuality from '../../components/health/Vitals/SleepQuality';
import { useHealthData } from '../../hooks/useHealthData';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function normalizeDateKey(value: string | Date): string {
  if (value instanceof Date) {
    return getLocalDateKey(value);
  }

  // Handles:
  // 2026-08-18
  // 2026-08-18T00:00:00Z
  // 2026-08-18T12:00:00+00:00

  return String(value).split('T')[0];
}

function getWeekday(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
  });
}

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────

export default function VitalSignesScreen() {
  const { data, loading, error, refetch } = useHealthData();

  // ─────────────────────────────────────────
  // REFRESH
  // ─────────────────────────────────────────

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // ─────────────────────────────────────────
  // TODAY
  // ─────────────────────────────────────────

  const todayDate = useMemo(() => {
    return getLocalDateKey();
  }, []);

  // ─────────────────────────────────────────
  // TODAY DATA
  // ─────────────────────────────────────────

  const today = useMemo(() => {
    if (!data?.days?.length) {
      return undefined;
    }

    return data.days.find(item => {
      if (!item?.date) {
        return false;
      }

      return normalizeDateKey(item.date) === todayDate;
    });
  }, [data?.days, todayDate]);

  // ─────────────────────────────────────────
  // WEEKLY DATA
  // ─────────────────────────────────────────

  const weeklySteps = useMemo(() => {
    if (!data?.days?.length) {
      return [];
    }

    /*
     * Keep the actual date.
     *
     * DO NOT only pass:
     *
     * {
     *   day: 'Tue',
     *   steps: 0
     * }
     *
     * because Tue alone cannot tell us whether
     * it is this Tuesday or last Tuesday.
     */

    return data.days.map(item => {
      const date = normalizeDateKey(item.date);

      return {
        date,
        day: getWeekday(date),
        steps: Math.max(item.steps ?? 0, 0),
      };
    });
  }, [data?.days]);

  // ─────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  // ─────────────────────────────────────────
  // ERROR
  // ─────────────────────────────────────────

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // ─────────────────────────────────────────
  // MAIN
  // ─────────────────────────────────────────

  return (
    <ScrollView
      style={styles.safeArea}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* ─────────────────────────────────────
          VITAL SIGNS
      ───────────────────────────────────── */}

      <VitalSigns
        avgHeartRate={today?.avgHeartRate ?? null}
        minHeartRate={today?.minHeartRate ?? null}
        maxHeartRate={today?.maxHeartRate ?? null}
        maxoxygenlevel={today?.maxOxygen ?? null}
        minoxygenlevel={today?.minOxygen ?? null}
      />

      {/* ─────────────────────────────────────
          WEEKLY ACTIVITY
      ───────────────────────────────────── */}

      <WeeklyActivity data={weeklySteps} />

      {/* ─────────────────────────────────────
          SLEEP
      ───────────────────────────────────── */}

      <SleepQuality
        sleepHours={today?.sleepHours ?? null}
        sleepStages={today?.sleepStages ?? []}
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  contentContainer: {
    paddingTop: 0,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  errorText: {
    color: '#ef4444',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  bottomPadding: {
    height: 40,
  },
});
