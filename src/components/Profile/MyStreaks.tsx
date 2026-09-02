import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Streak = {
  id: string;
  icon: string;
  iconColor: string;
  days: number;
  label: string;
};

type Props = {
  streaks: Streak[];
};

function StreakCard({ streak }: { streak: Streak }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.icon, { color: streak.iconColor }]}>{streak.icon}</Text>
      <Text style={[styles.days, { color: streak.iconColor }]}>{streak.days} days</Text>
      <Text style={styles.label}>{streak.label}</Text>
    </View>
  );
}

export default function MyStreaks({ streaks }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Streaks</Text>
      <View style={styles.grid}>
        {streaks.map((streak) => (
          <StreakCard key={streak.id} streak={streak} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    flexGrow: 1,
  },
  icon: {
    fontSize: 26,
    marginBottom: 4,
  },
  days: {
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
