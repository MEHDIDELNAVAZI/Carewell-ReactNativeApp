import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  MetricGrid,
  MovementScoreCard,
  ProgressChart,
} from '../../components/physioeye';

import { PhysioOverviewData, getPhysioOverview } from '../../api/physioeye.api';

import { colors, spacing } from '../../components/physioeye/theme';

export default function PhysioScreen() {
  const [overview, setOverview] = useState<PhysioOverviewData | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * ============================================================
   * FETCH OVERVIEW
   * ============================================================
   */

  const fetchOverview = useCallback(async () => {
    try {
      setError(null);

      const response = await getPhysioOverview();

      setOverview(response.overview);
    } catch (err) {
      console.error('Failed to fetch PhysioEye overview:', err);

      setError('Unable to load your PhysioEye data.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  /**
   * ============================================================
   * REFRESH
   * ============================================================
   */

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await getPhysioOverview();

      setOverview(response.overview);
    } catch (err) {
      console.error('Failed to refresh PhysioEye overview:', err);

      setError('Unable to refresh your PhysioEye data.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  /**
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.deep} />
        </View>
      </SafeAreaView>
    );
  }

  /**
   * ============================================================
   * ERROR / EMPTY
   * ============================================================
   */

  if (!overview) {
    return (
      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error ?? 'No PhysioEye data available.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * ============================================================
   * DELTA
   * ============================================================
   *
   * Latest progress average - previous progress average
   *
   * Example:
   *
   * 44 - 50 = -6
   *
   * ============================================================
   */

  let delta = 0;

  if (overview.progress.length >= 2) {
    const previous = overview.progress[overview.progress.length - 2].average;

    const latest = overview.progress[overview.progress.length - 1].average;

    if (previous !== null && latest !== null) {
      delta = latest - previous;
    }
  }

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.deep}
          />
        }
      >
        <MovementScoreCard score={overview.average} delta={delta} />

        <MetricGrid latest={overview.latest} />

        {overview.progress.length > 1 && (
          <ProgressChart data={overview.progress} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.screen,
  },

  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 32,
    gap: spacing.section,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
  },

  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
});
