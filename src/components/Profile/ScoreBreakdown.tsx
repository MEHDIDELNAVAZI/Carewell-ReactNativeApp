import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  PersonStanding,
  BookOpen,
  ClipboardList,
  Trophy,
  LucideIcon,
} from 'lucide-react-native';

export type ScoreItem = {
  label: string;
  score: number;
  color: string;
};

type Props = {
  scores: ScoreItem[];
};

const TRACK_COLOR = '#f1f5f9';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Horizontal space eaten by the card's own margins + padding on each side.
// card marginHorizontal(16) + card padding(20) = 36 per side = 72 total
const CARD_CHROME = 72;
const RING_WRAP_GUTTER = 20; // matches smallRingWrap's extra width (size + 20)

function getIconForLabel(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (l.includes('program')) return PersonStanding;
  if (l.includes('learn')) return BookOpen;
  if (l.includes('form')) return ClipboardList;
  if (l.includes('total')) return Trophy;
  return ClipboardList;
}

/**
 * Ring/progress circle.
 * When `filled` is true, it renders as a solid gradient disc (a "badge")
 * with the progress shown as a bright ring traced around its edge, instead
 * of a plain thin outline. Used for the Total score so it reads as the
 * hero metric rather than just another small ring.
 */
function CircularProgress({
  size,
  strokeWidth,
  score,
  color,
  gradientId,
  filled = false,
  children,
}: {
  size: number;
  strokeWidth: number;
  score: number;
  color: string;
  gradientId: string;
  filled?: boolean;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);
  const fillRadius = radius - strokeWidth / 2 - 1;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.75} />
            <Stop offset="50%" stopColor={color} stopOpacity={0.95} />
            <Stop offset="100%" stopColor={color} stopOpacity={1} />
          </LinearGradient>
          {filled && (
            <LinearGradient
              id={`${gradientId}-fill`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={color} stopOpacity={0.16} />
              <Stop offset="100%" stopColor={color} stopOpacity={0.28} />
            </LinearGradient>
          )}
        </Defs>

        {/* Soft filled disc behind everything, only for the "hero" ring */}
        {filled && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={fillRadius}
            fill={`url(#${gradientId}-fill)`}
          />
        )}

        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={filled ? 'rgba(148, 163, 184, 0.18)' : TRACK_COLOR}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Subtle glow behind the progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth * (filled ? 2 : 1.5)}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          opacity={filled ? 0.16 : 0.1}
        />

        {/* Progress ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

function SmallRing({
  item,
  index,
  size,
}: {
  item: ScoreItem;
  index: number;
  size: number;
}) {
  const Icon = getIconForLabel(item.label);
  const iconSize = Math.max(14, Math.round(size * 0.2));
  const scoreSize = Math.max(11, Math.round(size * 0.16));

  return (
    <View style={[styles.smallRingWrap, { width: size + RING_WRAP_GUTTER }]}>
      <View style={styles.ringContainer}>
        <CircularProgress
          size={size}
          strokeWidth={Math.max(5, Math.round(size * 0.08))}
          score={item.score}
          color={item.color}
          gradientId={`small-grad-${index}`}
        >
          <View style={styles.ringContent}>
            <Icon
              size={iconSize}
              color={item.color}
              strokeWidth={2.5}
              style={{ marginBottom: 2 }}
            />
            <Text style={[styles.smallScore, { fontSize: scoreSize }]}>
              {item.score}%
            </Text>
          </View>
        </CircularProgress>
      </View>
      <Text style={styles.smallLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </View>
  );
}

export default function ScoreBreakdown({ scores }: Props) {
  const { t } = useTranslation();

  if (!scores || scores.length === 0) {
    return null;
  }

  const smallScores = scores.slice(0, -1);
  const total = scores[scores.length - 1];
  const TotalIcon = getIconForLabel(total.label);
  const isStacked = smallScores.length >= 3;
  const count = Math.max(1, smallScores.length);

  // Available width the small-ring grid actually has to work with.
  const contentWidth = SCREEN_WIDTH - CARD_CHROME;
  const gridWidth = isStacked ? contentWidth : contentWidth * 0.56;

  // Fit `count` rings on a single row: size + gutter, times count, must
  // not exceed the grid width. This is what keeps 3 rings from wrapping
  // to a second line on narrower phones — they shrink instead.
  const fittedSize = Math.floor(gridWidth / count) - RING_WRAP_GUTTER;

  const smallRingSize = isStacked
    ? Math.max(52, Math.min(75, fittedSize))
    : Math.min(85, fittedSize);

  const totalRingSize = isStacked
    ? Math.min(128, contentWidth * 0.36)
    : Math.min(150, contentWidth * 0.42);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t('scoreBreakdown.title')}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Overview</Text>
        </View>
      </View>

      <View
        style={[styles.contentRow, isStacked && styles.contentColumnStacked]}
      >
        <View
          style={[
            styles.grid,
            isStacked ? styles.gridStacked : styles.gridRow,
            { flexWrap: 'nowrap' },
          ]}
        >
          {smallScores.map((item, index) => (
            <SmallRing
              key={`${item.label}-${index}`}
              item={item}
              index={index}
              size={smallRingSize}
            />
          ))}
        </View>

        {isStacked && <View style={styles.divider} />}

        <View style={isStacked ? styles.totalWrapStacked : styles.totalWrap}>
          <View style={styles.totalRingContainer}>
            <CircularProgress
              size={totalRingSize}
              strokeWidth={isStacked ? 9 : 11}
              score={total.score}
              color={total.color}
              gradientId="total-grad"
              filled
            >
              <View style={styles.totalContent}>
                <TotalIcon
                  size={isStacked ? 22 : 30}
                  color={total.color}
                  strokeWidth={2.5}
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={[
                    styles.totalScore,
                    { color: total.color },
                    isStacked && styles.totalScoreStacked,
                  ]}
                >
                  {total.score}%
                </Text>
              </View>
            </CircularProgress>
          </View>
          <View style={styles.totalLabelContainer}>
            <View style={[styles.totalDot, { backgroundColor: total.color }]} />
            <Text style={styles.totalLabel}>{total.label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  headerBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentColumnStacked: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridStacked: {
    justifyContent: 'space-between',
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    width: '90%',
    marginVertical: 20,
  },
  smallRingWrap: {
    alignItems: 'center',
  },
  ringContainer: {
    marginBottom: 8,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallScore: {
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 0,
  },
  smallLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 14,
    maxWidth: 70,
  },
  totalWrap: {
    alignItems: 'center',
    marginLeft: 8,
  },
  totalWrapStacked: {
    alignItems: 'center',
    marginTop: 4,
  },
  totalRingContainer: {
    marginBottom: 12,
  },
  totalContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalScore: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  totalScoreStacked: {
    fontSize: 19,
  },
  totalLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  totalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.9,
  },
});
