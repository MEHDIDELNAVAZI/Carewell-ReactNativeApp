import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Challenge = {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  participants: number;
  progressPercent: number;
  endsDate: string;
};

type Props = {
  challenge: Challenge;
};

function ProgressBar({ percent }: { percent: number }) {
  const color = percent >= 70 ? '#22c55e' : percent >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function ChallengeCard({ challenge }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {/* Icon */}
        <View style={[styles.iconWrapper, { backgroundColor: challenge.iconBg }]}>
          <Text style={styles.icon}>{challenge.icon}</Text>
        </View>

        {/* Title + description */}
        <View style={styles.content}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {challenge.description}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <ProgressBar percent={challenge.progressPercent} />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.participants}>
          👥 {challenge.participants} participants
        </Text>
        <View style={styles.footerRight}>
          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>{challenge.progressPercent}% complete</Text>
          </View>
          <Text style={styles.endsDate}>🗓 Ends {challenge.endsDate}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 17,
  },
  barTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barFill: {
    height: '100%',
    borderRadius: 50,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  participants: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 50,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2d6a4f',
  },
  endsDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
