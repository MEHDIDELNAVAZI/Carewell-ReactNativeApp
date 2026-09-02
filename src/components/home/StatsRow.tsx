import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

interface StatItem {
  value: string | number;
  label: string;
  icon?: string;
}

interface StatsRowProps {
  stats: StatItem[];
}

export default function StatsRow({ stats }: StatsRowProps) {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          {stat.icon && <Text style={styles.icon}>{stat.icon}</Text>}
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
