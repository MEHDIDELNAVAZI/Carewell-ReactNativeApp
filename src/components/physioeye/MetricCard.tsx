import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Accessibility,
  ArrowDown,
  ArrowUp,
  Bone,
  ChevronRight,
  Dumbbell,
  Footprints,
  LucideIcon,
  PersonStanding,
  Scale,
} from 'lucide-react-native';

import { ProgressBar } from './ProgressBar';

import {
  cardShadow,
  colors,
  getScoreColor,
  radius,
  tabularNums,
} from './theme';

import { MetricKey } from './types';

import { navigationRef } from '../../navigation/navigationRef';

/**
 * ============================================================
 * METRIC
 * ============================================================
 */

export interface MetricCardData {
  key: MetricKey;
  title: string;
  score: number;
  delta?: number;
}

/**
 * ============================================================
 * ICONS
 * ============================================================
 */

const METRIC_ICONS: Record<MetricKey, LucideIcon> = {
  posture: PersonStanding,
  alignment: Scale,
  upperBody: Dumbbell,
  lowerBody: Bone,
  functional: Accessibility,
  walking: Footprints,
};

/**
 * ============================================================
 * PROPS
 * ============================================================
 */

interface Props {
  metric: MetricCardData;

  animationDelay?: number;
}

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export function MetricCard({ metric, animationDelay = 0 }: Props) {
  const { key, title, score, delta = 0 } = metric;

  const Icon = METRIC_ICONS[key];

  const barColor = getScoreColor(score);

  const positive = delta > 0;

  const negative = delta < 0;

  const deltaLabel = positive
    ? `up ${delta} points`
    : negative
    ? `down ${Math.abs(delta)} points`
    : 'no change';

  const handlePress = () => {
    navigationRef.navigate('MetricDetail', {
      metric: key,
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${score} out of 100, ${deltaLabel}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Icon size={16} color={colors.amberInk} strokeWidth={2.2} />
        </View>

        <Text
          style={styles.title}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {title}
        </Text>

        <ChevronRight size={16} color={colors.inkMuted} />
      </View>

      {/* Score */}
      <View style={styles.scoreRow}>
        <Text style={styles.score}>{score}</Text>

        <Text style={styles.max}>/100</Text>

        {delta !== 0 && (
          <View style={[styles.delta, negative && styles.deltaNegative]}>
            {positive ? (
              <ArrowUp size={11} color={colors.mintInk} strokeWidth={3} />
            ) : (
              <ArrowDown size={11} color={colors.negativeInk} strokeWidth={3} />
            )}

            <Text
              style={[styles.deltaText, negative && styles.deltaTextNegative]}
            >
              {Math.abs(delta)}
            </Text>
          </View>
        )}
      </View>

      {/* Progress */}
      <ProgressBar
        value={score}
        colors={[barColor]}
        trackColor={colors.track}
        height={7}
        delay={animationDelay}
        style={styles.bar}
      />
    </Pressable>
  );
}

/**
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 12,
    ...cardShadow,
  },

  pressed: {
    opacity: 0.85,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.amberSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: colors.ink,
    textAlignVertical: 'center',
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },

  score: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
    ...tabularNums,
  },

  max: {
    marginLeft: 2,
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '500',
  },

  delta: {
    marginLeft: 'auto',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.mintSoft,
  },

  deltaNegative: {
    backgroundColor: colors.negativeSoft,
  },

  deltaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mintInk,
    ...tabularNums,
  },

  deltaTextNegative: {
    color: colors.negativeInk,
  },

  bar: {
    marginTop: 12,
  },
});
