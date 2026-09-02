import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Achievement = {
  id: string;
  icon: string;
  label: string;
  unlocked: boolean;
};

type Props = {
  achievements: Achievement[];
};

function AchievementBadge({ item }: { item: Achievement }) {
  return (
    <View style={[styles.badge, !item.unlocked && styles.badgeLocked]}>
      <Text style={[styles.icon, !item.unlocked && styles.iconLocked]}>
        {item.unlocked ? item.icon : ''}
      </Text>
      <Text style={[styles.label, !item.unlocked && styles.labelLocked]} numberOfLines={2}>
        {item.label}
      </Text>
    </View>
  );
}

export default function AchievementsGrid({ achievements }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.grid}>
        {achievements.map((item) => (
          <AchievementBadge key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    width: '30%',
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    flexGrow: 1,
  },
  badgeLocked: {
    backgroundColor: '#f9fafb',
  },
  icon: {
    fontSize: 28,
  },
  iconLocked: {
    opacity: 0.4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 15,
  },
  labelLocked: {
    color: '#9ca3af',
  },
});
