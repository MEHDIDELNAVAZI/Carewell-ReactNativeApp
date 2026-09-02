import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type RankingUser = {
  id: string;
  initials: string;
  name: string;
  ward: string;
  points: number;
  delta: string;
  isMe?: boolean;
};

type Props = {
  top3: RankingUser[];
};

const PODIUM_COLORS: Record<number, { ring: string; badge: string; bg: string }> = {
  1: { ring: '#f99f03', badge: '#f59e0b', bg: '#faefc2' },
  2: { ring: '#9ca3af', badge: '#9ca3af', bg: '#cfe5fa' },
  3: { ring: '#f97316', badge: '#f97316', bg: '#fae0c0' },
};

// Heights for podium steps: 1st tallest
const PODIUM_HEIGHT: Record<number, number> = { 1: 90, 2: 70, 3: 60 };
const ORDER = [2, 1, 3]; // display order: 2nd left, 1st center, 3rd right

export default function PodiumRow({ top3 }: Props) {
  return (
    <View style={styles.container}>
      {ORDER.map((rank) => {
        const user = top3[rank - 1];
        if (!user) return null;
        const c = PODIUM_COLORS[rank];
        return (
          <View key={user.id} style={styles.column}>
            {/* Avatar */}
            <View style={[styles.avatarRing, { borderColor: c.ring }]}>
              <View style={[styles.avatar, user.isMe && styles.avatarMe]}>
                <Text style={styles.avatarText}>{user.initials}</Text>
              </View>
            </View>
            <Text style={styles.userName} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
            <Text style={styles.userPoints}>{user.points.toLocaleString()}</Text>

            {/* Podium block */}
            <View style={[styles.podiumBlock, { height: PODIUM_HEIGHT[rank], backgroundColor: c.bg, borderColor: c.ring }]}>
              <View style={[styles.rankBadge, { backgroundColor: c.badge }]}>
                <Text style={styles.rankBadgeText}>#{rank}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMe: {
    backgroundColor: '#2d6a4f',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  crown: {
    position: 'absolute',
    top: -14,
    fontSize: 16,
  },
  userName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 1,
  },
  userPoints: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2d6a4f',
    marginBottom: 6,
  },
  podiumBlock: {
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
});
