import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { ProgressBar } from './ProgressBar';
import { colors, radius, tabularNums } from './theme';

interface Props {
  score: number;
  /** Points gained since the first assessment */
  delta: number;
  maxScore?: number;
}

/**
 * Compact replacement for the big gauge header: the score and its progress
 * sit in one short card, so the metric cards move up the screen.
 */
export function MovementScoreCard({ score, delta, maxScore = 100 }: Props) {
  const percent = (score / maxScore) * 100;
  const sign = delta > 0 ? '+' : '';

  return (
    <View style={styles.card} accessible>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>Movement Score</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.max}>/{maxScore}</Text>
          </View>
        </View>

        {delta !== 0 && (
          <View style={styles.pill}>
            <TrendingUp size={14} color={colors.mint} strokeWidth={2.5} />
            <Text style={styles.pillText}>
              {sign}
              {delta}
            </Text>
          </View>
        )}
      </View>

      <ProgressBar
        value={percent}
        colors={[colors.amber, colors.mint]}
        trackColor={colors.trackOnDeep}
        height={10}
        showThumb
        thumbBorderColor={colors.mint}
        delay={150}
        duration={1100}
        style={styles.bar}
      />

      {delta !== 0 && (
        <Text style={styles.sub}>
          {Math.abs(delta)} points {delta > 0 ? 'up' : 'down'} since your first
          assessment
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.deep,
    borderRadius: radius.hero,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    color: colors.onDeepMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    color: colors.onDeep,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1.5,
    ...tabularNums,
  },
  max: {
    color: colors.onDeepMuted,
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(127, 209, 179, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pillText: {
    color: colors.mint,
    fontSize: 14,
    fontWeight: '700',
    ...tabularNums,
  },
  bar: {
    marginTop: 10,
  },
  message: {
    color: colors.onDeep,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 14,
  },
  sub: {
    color: colors.onDeepMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
