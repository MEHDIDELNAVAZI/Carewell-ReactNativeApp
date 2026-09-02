import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { Heart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  avgHR: number | null;
  minHR?: number | null;
  maxHR?: number | null;
}

const NO_DATA_LEVEL = {
  label: 'No data',
  color: '#9ca3af',
  border: '#e5e7eb',
  shadow: '#9ca3af',
  icon: '#9ca3af',
  title: '#6b7280',
  sub: '#9ca3af',
  dot: '#9ca3af',
  dotLabel: '#6b7280',
  stroke: '#d1d5db',
};

function getHRLevel(avgHR: number | null) {
  if (avgHR === null) return NO_DATA_LEVEL;

  if (avgHR >= 80)
    return {
      label: 'High',
      color: '#dc2626',
      border: '#fca5a5',
      shadow: '#dc2626',
      icon: '#e11d48',
      title: '#9f1239',
      sub: '#be123c',
      dot: '#dc2626',
      dotLabel: '#991b1b',
      stroke: '#f43f5e',
    };
  if (avgHR >= 50)
    return {
      label: 'Moderate',
      color: '#16a34a',
      border: '#bbf7d0',
      shadow: '#16a34a',
      icon: '#16a34a',
      title: '#15803d',
      sub: '#166534',
      dot: '#16a34a',
      dotLabel: '#15803d',
      stroke: '#22c55e',
    };
  return {
    label: 'Low',
    color: '#dc2626',
    border: '#fca5a5',
    shadow: '#dc2626',
    icon: '#e11d48',
    title: '#9f1239',
    sub: '#be123c',
    dot: '#dc2626',
    dotLabel: '#991b1b',
    stroke: '#f43f5e',
  };
}

export default function HeartRateCard({ avgHR, minHR, maxHR }: Props) {
  const { t } = useTranslation();
  const level = getHRLevel(avgHR);
  const hasData = avgHR !== null;
  const fmt = (v: number | null) => (v === null ? '—' : String(Math.round(v)));

  return (
    <View
      style={[
        styles.card,
        { borderColor: level.border },
        Platform.OS === 'ios' && { shadowColor: level.shadow },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBadge, { backgroundColor: level.icon }]}>
          <Heart size={13} color="#ffffff" fill="#ffffff" strokeWidth={0} />
        </View>
        <View style={styles.titleBlock}>
          <Text
            style={[styles.cardTitle, { color: level.title }]}
            numberOfLines={1}
          >
            {t('Heart rate')}
          </Text>
          <Text
            style={[styles.cardSub, { color: level.sub }]}
            numberOfLines={1}
          >
            {hasData ? t('Average BPM') : t('No data today')}
          </Text>
        </View>
      </View>

      <Text style={[styles.mainVal, { color: level.color }]} numberOfLines={1}>
        {fmt(avgHR)}
      </Text>

      <Svg
        width="100%"
        height={28}
        viewBox="0 0 100 28"
        preserveAspectRatio="none"
      >
        <Polyline
          points={
            hasData
              ? '0,14 10,14 15,8 20,20 25,4 30,22 35,14 50,14 55,8 60,20 65,4 70,22 75,14 100,14'
              : '0,14 100,14'
          }
          fill="none"
          stroke={level.stroke}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeDasharray={hasData ? undefined : '3,3'}
        />
      </Svg>

      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: level.dot }]} />
        <Text style={[styles.statusTxt, { color: level.dotLabel }]}>
          {hasData ? t(level.label) : t('No data')}
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
    padding: 14,
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  titleBlock: { flexShrink: 1 },
  cardTitle: { fontSize: 11, fontWeight: '600', marginBottom: 1 },
  cardSub: { fontSize: 10 },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mainVal: { fontSize: 22, fontWeight: '700', lineHeight: 26 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 99 },
  statusTxt: { fontSize: 10, fontWeight: '600' },
});
