import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RankingUser } from './PodiumRow';

type Props = {
  user: RankingUser;
  rank: number;
};

export default function RankingRow({ user, rank }: Props) {
  const isMe = user.isMe;
  const isTop3 = rank <= 3;

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      {/* Rank number */}
      <Text style={[styles.rank, isTop3 && styles.rankTop]}>{rank}</Text>

      {/* Avatar */}
      <View style={[styles.avatar, isMe && styles.avatarMe]}>
        <Text style={[styles.avatarText, isMe && styles.avatarTextMe]}>
          {user.initials}
        </Text>
      </View>

      {/* Name + ward */}
      <View style={styles.info}>
        <Text style={[styles.name, isMe && styles.nameMe]}>
          {user.name}{isMe ? ' (You)' : ''}
        </Text>
        <Text style={styles.ward}>{user.ward}</Text>
      </View>

      {/* Points + delta */}
      <View style={styles.right}>
        <Text style={[styles.points, isMe && styles.pointsMe]}>
          {user.points.toLocaleString()}
        </Text>
        <Text style={[
          styles.delta,
          { color: user.delta.startsWith('+') ? '#22c55e' : '#9ca3af' }
        ]}>
          {user.delta}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
  },
  rowMe: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  rank: {
    width: 22,
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
  },
  rankTop: {
    color: '#1a1a1a',
    fontWeight: '800',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMe: {
    backgroundColor: '#2d6a4f',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  avatarTextMe: {
    color: '#ffffff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 1,
  },
  nameMe: {
    color: '#2d6a4f',
  },
  ward: {
    fontSize: 11,
    color: '#9ca3af',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  points: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  pointsMe: {
    color: '#2d6a4f',
  },
  delta: {
    fontSize: 11,
    fontWeight: '500',
  },
});
