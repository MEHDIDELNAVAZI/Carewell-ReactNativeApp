import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  completedLessons: number;
  totalLessons: number;
  xp: number;
};

export default function LearnProgressCard({ completedLessons, totalLessons, xp }: Props) {
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Your Progress</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>{xp} XP</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{completedLessons} of {totalLessons} lessons completed</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.percent}>{percent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  xpBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  xpText: { fontSize: 13, fontWeight: '700', color: '#2d6a4f' },
  subtitle: { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
  barTrack: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: { height: '100%', backgroundColor: '#2d6a4f', borderRadius: 50 },
  percent: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
});