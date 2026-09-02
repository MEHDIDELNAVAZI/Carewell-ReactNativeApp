import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  title: string;
  description: string;
  duration: string;
  xp: number;
  timeRemaining: number; // seconds
  onPress: () => void;
};

const formatTimeRemaining = (seconds: number): string => {
  if (seconds === 0) return 'Expired';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
};

export default function MicroLearningBanner({ title, description, duration, xp, timeRemaining, onPress }: Props) {
  const isExpiringSoon = timeRemaining > 0 && timeRemaining < 86400; // less than 1 day

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.88}>
      {/* Badge */}
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>◎</Text>
          <Text style={styles.badgeText}>Up Next</Text>
        </View>
        <View style={[styles.deadlineBadge, isExpiringSoon && styles.deadlineBadgeUrgent]}>
          <Text style={[styles.deadlineText, isExpiringSoon && styles.deadlineTextUrgent]}>
            ⏰ {formatTimeRemaining(timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>{description}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.meta}>⏱ {duration} min</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{xp} XP</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e4d8c',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  badgeIcon: { fontSize: 11, color: '#93c5fd' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#93c5fd', letterSpacing: 0.3 },
  deadlineBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  deadlineBadgeUrgent: {
    backgroundColor: '#fee2e2',
  },
  deadlineText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  deadlineTextUrgent: { color: '#dc2626' },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 26,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 19,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 50,
  },
  xpText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
});