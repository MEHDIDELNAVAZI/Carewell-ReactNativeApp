import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar, ProgressChart } from '../../components/physioeye';
import { colors, getScoreColor } from '../../components/physioeye/theme';
import { RootStackParamList } from '../../../App';
import { getPhysioMetric, PhysioMetricResponse } from '../../api/physioeye.api';
import { METRIC_CONFIG } from './metricDetail.config';
import {
  getApiMetric,
  getMetricData,
  getScoreStatus,
} from './metricDetail.helpers';
import { styles } from './metricDetail.styles';
import MetricDetailCard from './MetricDetailCard';
import { SubMetric } from './metricDetail.types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type MetricDetailRouteProp = RouteProp<RootStackParamList, 'MetricDetail'>;

export default function MetricDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MetricDetailRouteProp>();
  const { metric } = route.params;
  const config = METRIC_CONFIG[metric];

  const [response, setResponse] = useState<PhysioMetricResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMetric = async () => {
      try {
        setLoading(true);
        setError(null);
        setResponse(null);

        const apiMetric = getApiMetric(metric);

        if (!apiMetric) throw new Error(`Unsupported metric: ${metric}`);

        console.log(`[PhysioEye] Fetching metric: ${apiMetric}`);

        const data = await getPhysioMetric(apiMetric);

        console.log(
          `[PhysioEye] Response for ${apiMetric}:`,
          JSON.stringify(data, null, 2),
        );

        if (mounted) setResponse(data);
      } catch (err) {
        console.error(`[PhysioEye] Failed to fetch ${metric}:`, err);
        if (mounted) setError('Unable to load your assessment data.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMetric();

    return () => {
      mounted = false;
    };
  }, [metric]);

  const metricData = useMemo(() => {
    if (!response) return null;

    try {
      return getMetricData(metric, response);
    } catch (err) {
      console.error('[PhysioEye] Failed to extract metric data:', err);
      return null;
    }
  }, [metric, response]);

  const score = metricData?.average ?? null;

  const delta = useMemo(() => {
    if (!metricData?.progress || metricData.progress.length < 2) return null;

    const validProgress = metricData.progress.filter(
      item => item.average !== null,
    );
    if (validProgress.length < 2) return null;

    const first = validProgress[0].average;
    const latest = validProgress[validProgress.length - 1].average;

    if (first === null || latest === null) return null;

    return latest - first;
  }, [metricData]);

  const subMetrics: SubMetric[] = useMemo(() => {
    if (!metricData) return [];

    return config.metrics.map(item => ({
      title: item.title,
      score:
        (metricData.latest as unknown as Record<string, number | null>)[
          item.key
        ] ?? null,
      icon: item.icon,
    }));
  }, [config, metricData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ink} />
          <Text style={styles.loadingText}>Loading your assessment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.errorContainer}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={10}
          >
            <ArrowLeft size={26} color={colors.ink} strokeWidth={2} />
          </Pressable>
          <Text style={styles.errorTitle}>Unable to load data</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!metricData) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.errorContainer}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={10}
          >
            <ArrowLeft size={26} color={colors.ink} strokeWidth={2} />
          </Pressable>
          <Text style={styles.errorTitle}>No assessment data</Text>
          <Text style={styles.errorText}>
            There is no assessment data available for this metric yet.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={26} color={colors.ink} strokeWidth={2} />
          </Pressable>
          <View style={styles.headerIcon}>{config.icon}</View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <Text style={styles.score}>{score ?? '—'}</Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>

          {score !== null && (
            <ProgressBar
              value={score}
              colors={[getScoreColor(score)]}
              trackColor={colors.track}
              height={9}
              style={styles.mainProgress}
            />
          )}

          {delta !== null && (
            <View style={styles.deltaRow}>
              <Text
                style={[styles.deltaArrow, delta < 0 && styles.deltaNegative]}
              >
                {delta >= 0 ? '↑' : '↓'}
              </Text>
              <Text style={styles.deltaText}>
                {Math.abs(delta)} points since your first assessment
              </Text>
            </View>
          )}

          <Text style={styles.status}>{getScoreStatus(score)}</Text>
        </View>

        {metricData.progress.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {metricData.progress.length}{' '}
                  {metricData.progress.length === 1
                    ? 'assessment'
                    : 'assessments'}
                </Text>
              </View>
            </View>

            <ProgressChart data={metricData.progress} />
          </View>
        )}

        <View style={styles.metricsGrid}>
          {subMetrics.map(item => (
            <MetricDetailCard
              key={item.title}
              title={item.title}
              score={item.score}
              icon={item.icon}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
