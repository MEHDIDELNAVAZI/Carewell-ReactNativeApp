import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Moon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  sleepHours: number | null;
}

const NO_DATA_LEVEL = {
  label: 'No data',
  gradientColors: ['#9ca3af', '#6b7280', '#4b5563'] as string[],
  barColor: '#9ca3af',
  barTrack: '#e5e7eb',
  iconBg: '#9ca3af',
  score: null as number | null,
};

function getSleepLevel(sleepHours: number | null) {
  if (sleepHours === null) return NO_DATA_LEVEL;

  if (sleepHours >= 8)
    return {
      label: 'Well rested',
      gradientColors: ['#16a34a', '#15803d', '#14532d'] as string[],
      barColor: '#16a34a',
      barTrack: '#bbf7d0',
      iconBg: '#16a34a',
      score: Math.min(100, Math.round((sleepHours / 9) * 100)) as number | null,
    };
  if (sleepHours >= 6)
    return {
      label: 'Moderate',
      gradientColors: ['#d97706', '#b45309', '#92400e'] as string[],
      barColor: '#d97706',
      barTrack: '#fef08a',
      iconBg: '#d97706',
      score: Math.min(100, Math.round((sleepHours / 9) * 100)) as number | null,
    };
  return {
    label: 'Low',
    gradientColors: ['#dc2626', '#b91c1c', '#991b1b'] as string[],
    barColor: '#dc2626',
    barTrack: '#fecaca',
    iconBg: '#dc2626',
    score: Math.min(100, Math.round((sleepHours / 9) * 100)) as number | null,
  };
}

export default function SleepCard({ sleepHours }: Props) {
  const { t } = useTranslation();
  const level = getSleepLevel(sleepHours);
  const hasData = sleepHours !== null;
  const hours = hasData ? Math.floor(sleepHours) : null;
  const mins = hasData ? Math.round((sleepHours % 1) * 60) : null;
  const displayVal = hasData ? `${hours}h ${mins}m` : '—';
  const barWidth = hasData ? `${Math.min((sleepHours / 9) * 100, 100)}%` : '0%';

  return (
    <View
      style={[
        styles.card,
        Platform.OS === 'ios' && { shadowColor: level.gradientColors[0] },
      ]}
    >
      <View style={styles.clip}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {t('Sleep')}
              {'\n'}
              {t('Summary')}
            </Text>
            <View style={[styles.iconBadge, { backgroundColor: level.iconBg }]}>
              <Moon size={13} color="#ffffff" fill="#ffffff" strokeWidth={0} />
            </View>
          </View>

          <Text style={styles.mainVal} numberOfLines={1}>
            {displayVal}
          </Text>

          <View style={[styles.barTrack, { backgroundColor: level.barTrack }]}>
            <View
              style={[
                styles.barFill,
                { width: barWidth as any, backgroundColor: level.barColor },
              ]}
            />
          </View>
        </View>

        <View style={styles.badge}>
          <LinearGradient
            colors={level.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.badgeLabel} numberOfLines={1}>
            {hasData ? t(level.label) : t('No data today')}
          </Text>
          {hasData && (
            <Text style={styles.badgeScore} numberOfLines={1}>
              {level.score}/100
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    minHeight: 100,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
      },
      android: { elevation: 4 },
    }),
  },
  clip: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#4b44d1',
  },
  inner: {
    backgroundColor: 'white',
    width: '100%',
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.4,
    lineHeight: 12,
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mainVal: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0f172a',
  },
  barTrack: {
    borderRadius: 99,
    height: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: 5,
    borderRadius: 99,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  badgeLabel: {
    fontSize: 10,
    color: '#e0f2fe',
    fontWeight: '600',
    flexShrink: 1,
  },
  badgeScore: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    flexShrink: 0,
  },
});
