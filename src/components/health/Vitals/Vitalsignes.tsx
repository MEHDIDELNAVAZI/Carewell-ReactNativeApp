import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';

import colors from '../../../theme/colors';
import { Heart, Droplet, Activity, TrendingUp } from 'lucide-react-native';

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────

function HeartIcon() {
  return (
    <View style={[styles.iconWrapper, { backgroundColor: '#fde8e8' }]}>
      <Heart size={20} color="red" />
    </View>
  );
}

function OxygenIcon() {
  return (
    <View style={[styles.iconWrapper, { backgroundColor: '#e0f2fe' }]}>
      <Droplet size={20} color="#0284c7" />
    </View>
  );
}

function MinHeartIcon() {
  return (
    <View style={[styles.iconWrapper, { backgroundColor: '#fef3c7' }]}>
      <Activity size={20} color="#d97706" />
    </View>
  );
}

function MaxHeartIcon() {
  return (
    <View style={[styles.iconWrapper, { backgroundColor: '#dcfce7' }]}>
      <TrendingUp size={20} color="#16a34a" />
    </View>
  );
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type VitalCard = {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  Icon: React.FC;
};

type Props = {
  avgHeartRate: number | null;
  minHeartRate: number | null;
  maxHeartRate: number | null;
  maxoxygenlevel: number | null;
  minoxygenlevel: number | null;
};

// ─────────────────────────────────────────────
// VITAL CARD
// ─────────────────────────────────────────────

function VitalCardItem({ card }: { card: VitalCard }) {
  const scale = useRef(new Animated.Value(1)).current;

  const hasData = card.value !== null;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        !hasData && styles.cardNoData,
        {
          transform: [{ scale }],
        },
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      {/* Icon */}
      <View style={!hasData ? styles.dimmed : undefined}>
        <card.Icon />
      </View>

      {/* Label */}
      <Text style={styles.label}>{card.label}</Text>

      {/* Value */}
      {hasData ? (
        <View style={styles.valueRow}>
          <Text style={styles.value}>{card.value}</Text>

          <Text style={styles.unit}>{card.unit}</Text>
        </View>
      ) : (
        <View style={styles.placeholderValue}>
          <Text style={styles.placeholderDash}>—</Text>
        </View>
      )}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────

function EmptyVitalSigns() {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Heart size={28} color="#9ca3af" strokeWidth={1.8} />
      </View>

      <Text style={styles.emptyTitle}>{t('No readings today')}</Text>

      <Text style={styles.emptyDescription}>
        {t('Your vital signs will appear here once they are recorded.')}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function VitalSigns({
  avgHeartRate,
  minHeartRate,
  maxHeartRate,
  maxoxygenlevel,
  minoxygenlevel,
}: Props) {
  const { t } = useTranslation();

  const vitals: VitalCard[] = [
    {
      id: 'avg_hr',
      label: t('AVG HEART RATE'),
      value: avgHeartRate,
      unit: 'bpm',
      Icon: HeartIcon,
    },
    {
      id: 'min_hr',
      label: t('MIN HEART RATE'),
      value: minHeartRate,
      unit: 'bpm',
      Icon: MinHeartIcon,
    },
    {
      id: 'max_hr',
      label: t('MAX HEART RATE'),
      value: maxHeartRate,
      unit: 'bpm',
      Icon: MaxHeartIcon,
    },
    {
      id: 'oxygen',
      label: t('OXYGEN LEVEL'),
      value: maxoxygenlevel,
      unit: '%',
      Icon: OxygenIcon,
    },
  ];

  // Check if there is absolutely no data for today
  const allEmpty = vitals.every(vital => vital.value === null);

  return (
    <View style={styles.container}>
      {/* Section title */}
      <Text style={styles.sectionTitle}>{t('Vital Signs')}</Text>

      {/* Empty state OR cards */}
      {allEmpty ? (
        <EmptyVitalSigns />
      ) : (
        <View style={styles.grid}>
          {vitals.map(card => (
            <VitalCardItem key={card.id} card={card} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    width: '100%',
  },

  // ─────────────────────────────────────────
  // SECTION
  // ─────────────────────────────────────────

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },

  // ─────────────────────────────────────────
  // GRID
  // ─────────────────────────────────────────

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // ─────────────────────────────────────────
  // VITAL CARD
  // ─────────────────────────────────────────

  card: {
    width: '47%',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 14,
    minHeight: 130,
    justifyContent: 'flex-start',
  },

  cardNoData: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderStyle: 'dashed',
  },

  dimmed: {
    opacity: 0.4,
  },

  // ─────────────────────────────────────────
  // ICON
  // ─────────────────────────────────────────

  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  // ─────────────────────────────────────────
  // LABEL
  // ─────────────────────────────────────────

  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  // ─────────────────────────────────────────
  // VALUE
  // ─────────────────────────────────────────

  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },

  value: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary ?? '#1a1a1a',
    lineHeight: 32,
  },

  unit: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 3,
  },

  // ─────────────────────────────────────────
  // NO VALUE PLACEHOLDER
  // ─────────────────────────────────────────

  placeholderValue: {
    height: 32,
    justifyContent: 'center',
  },

  placeholderDash: {
    fontSize: 28,
    fontWeight: '600',
    color: '#d1d5db',
    lineHeight: 32,
  },

  // ─────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────

  emptyState: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eef1f4',
  },

  emptyIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#eef2f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: 280,
  },
});
