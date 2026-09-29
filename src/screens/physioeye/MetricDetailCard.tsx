import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { ProgressBar } from '../../components/physioeye';
import {
  colors,
  cardShadow,
  getScoreColor,
  tabularNums,
} from '../../components/physioeye/theme';

import { styles } from './metricDetail.styles';

interface MetricDetailCardProps {
  title: string;
  score: number | null;
  icon: ReactNode;
}

export default function MetricDetailCard({
  title,
  score,
  icon,
}: MetricDetailCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>{icon}</View>

      <Text style={styles.metricTitle} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.metricScoreRow}>
        <Text style={styles.metricScore}>{score ?? '—'}</Text>

        <Text style={styles.metricMax}>/100</Text>
      </View>

      {score !== null && (
        <ProgressBar
          value={score}
          colors={[getScoreColor(score)]}
          trackColor={colors.track}
          height={6}
          style={styles.metricProgress}
        />
      )}

      {score === null && (
        <Text style={styles.noDataText}>No data available</Text>
      )}
    </View>
  );
}
