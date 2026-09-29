import React from 'react';

import { StyleSheet, View } from 'react-native';

import { MetricCard } from './MetricCard';

import { PhysioOverviewLatest } from '../../api/physioeye.api';

import { spacing } from './theme';

interface Props {
  latest: PhysioOverviewLatest;
}

export function MetricGrid({ latest }: Props) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <MetricCard
          metric={{
            key: 'posture',
            title: 'Posture',
            score: latest.posture ?? 0,
          }}
          animationDelay={300}
        />
      </View>

      <View style={styles.row}>
        <MetricCard
          metric={{
            key: 'alignment',
            title: 'Alignment',
            score: latest.alignment ?? 0,
          }}
          animationDelay={390}
        />
      </View>

      <View style={styles.row}>
        <MetricCard
          metric={{
            key: 'upperBody',
            title: 'Upper Body',
            score: latest.upper_body ?? 0,
          }}
          animationDelay={480}
        />
      </View>

      <View style={styles.row}>
        <MetricCard
          metric={{
            key: 'lowerBody',
            title: 'Lower Body',
            score: latest.lower_body ?? 0,
          }}
          animationDelay={570}
        />
      </View>

      <View style={styles.row}>
        <MetricCard
          metric={{
            key: 'functional',
            title: 'Functional Movement',
            score: latest.functional_movement ?? 0,
          }}
          animationDelay={660}
        />
      </View>

      <View style={styles.row}>
        <MetricCard
          metric={{
            key: 'walking',
            title: 'Walking',
            score: latest.walking ?? 0,
          }}
          animationDelay={750}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.gap,
  },

  row: {
    width: '100%',
  },
});
