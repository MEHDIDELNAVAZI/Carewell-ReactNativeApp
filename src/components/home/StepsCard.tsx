import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Footprints } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  steps: number | null;
  goal?: number;
}

const RING_SIZE = 72;
const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const NO_DATA_LEVEL = {
  label: 'No data',
  color: '#9ca3af',
  bg: '#f3f4f6',
  border: '#e5e7eb',
  track: '#e5e7eb',
  shadow: '#9ca3af',
  icon: '#9ca3af',
  text: '#6b7280',
};

function getStepsLevel(steps: number | null) {
  if (steps === null) return NO_DATA_LEVEL;

  if (steps >= 8000)
    return {
      label: 'High',
      color: '#16a34a',
      bg: '#dcfce7',
      border: '#c0efaa',
      track: '#bbf7d0',
      shadow: '#5eba33',
      icon: '#16a34a',
      text: '#15803d',
    };
  if (steps >= 4000)
    return {
      label: 'Moderate',
      color: '#d97706',
      bg: '#fef9c3',
      border: '#fde68a',
      track: '#fef08a',
      shadow: '#d97706',
      icon: '#d97706',
      text: '#92400e',
    };
  return {
    label: 'Low',
    color: '#dc2626',
    bg: '#fee2e2',
    border: '#fca5a5',
    track: '#fecaca',
    shadow: '#dc2626',
    icon: '#dc2626',
    text: '#991b1b',
  };
}

export default function StepsCard({ steps, goal = 1000 }: Props) {
  const { t } = useTranslation();
  const level = getStepsLevel(steps);
  const hasData = steps !== null;
  const progress = hasData ? Math.min(steps / goal, 1) : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const fmt = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);

  return (
    <View
      style={[
        styles.card,
        { borderColor: level.border, shadowColor: level.shadow },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: level.icon }]}>
          <Footprints size={13} color="#ffffff" strokeWidth={2.2} />
        </View>
        <Text style={styles.label}>{t('Steps')}</Text>
      </View>

      <View style={styles.ringWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE} viewBox="0 0 72 72">
          <Circle
            cx={36}
            cy={36}
            r={RADIUS}
            fill="none"
            stroke={level.track}
            strokeWidth={6}
          />
          {hasData && (
            <Circle
              cx={36}
              cy={36}
              r={RADIUS}
              fill="none"
              stroke={level.color}
              strokeWidth={6}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation={-90}
              originX={36}
              originY={36}
            />
          )}
        </Svg>
        <View style={styles.ringCenter}>
          {hasData ? (
            <>
              <Text
                style={[styles.ringVal, { color: level.text }]}
                numberOfLines={1}
              >
                {fmt(steps)}
              </Text>
              <Text style={[styles.ringUnit, { color: level.text }]}>
                {t('steps')}
              </Text>
            </>
          ) : (
            <Text style={[styles.noDataText, { color: level.text }]}>
              {t('No data')}
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.pill, { backgroundColor: level.bg }]}>
        <Text style={[styles.pillText, { color: level.text }]}>
          {hasData ? t(level.label) : t('No data today')}
        </Text>
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
    minHeight: 130,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
      android: { elevation: 4 },
    }),
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '100%' },
  iconBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 11, fontWeight: '600', color: '#374151' },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  ringVal: { fontSize: 13, fontWeight: '700', lineHeight: 16 },
  ringUnit: { fontSize: 9, opacity: 0.8 },
  noDataText: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  pillText: { fontSize: 10, fontWeight: '600' },
});
