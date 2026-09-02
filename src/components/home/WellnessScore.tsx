import React, { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

interface WellnessScoreProps {
  score: number;
  maxScore?: number;
  status: string;
  points: number;
  date: string;
}

// Increased size from 150 to 190
const SIZE = 190;
const STROKE_WIDTH = 12; // Slightly thicker line for the bigger scale
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ARC_DEGREES = 180;
const START_ANGLE = -180;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function Star({
  cx,
  cy,
  size,
  opacity = 1,
  color = '#F4C572',
}: {
  cx: number;
  cy: number;
  size: number;
  opacity?: number;
  color?: string;
}) {
  const s = size / 2;
  return (
    <Path
      d={`M${cx},${cy - s} L${cx + s * 0.3},${cy - s * 0.3} L${cx + s},${cy} L${
        cx + s * 0.3
      },${cy + s * 0.3} L${cx},${cy + s} L${cx - s * 0.3},${cy + s * 0.3} L${
        cx - s
      },${cy} L${cx - s * 0.3},${cy - s * 0.3} Z`}
      fill={color}
      opacity={opacity}
    />
  );
}

const SCATTERED_STARS = [
  { angle: -160, radiusFactor: 1.18, size: 7, opacity: 0.55 },
  { angle: -130, radiusFactor: 1.32, size: 5, opacity: 0.4 },
  { angle: -100, radiusFactor: 1.15, size: 5, opacity: 0.5 },
  { angle: -70, radiusFactor: 1.3, size: 7, opacity: 0.6 },
  { angle: -40, radiusFactor: 1.15, size: 5, opacity: 0.45 },
  { angle: -10, radiusFactor: 1.28, size: 6, opacity: 0.5 },
  { angle: 20, radiusFactor: 1.16, size: 5, opacity: 0.4 },
  { angle: 50, radiusFactor: 1.3, size: 7, opacity: 0.55 },
  { angle: 80, radiusFactor: 1.18, size: 5, opacity: 0.45 },
  { angle: 110, radiusFactor: 1.3, size: 6, opacity: 0.5 },
  { angle: 140, radiusFactor: 1.2, size: 5, opacity: 0.4 },
  { angle: 160, radiusFactor: 1.15, size: 5, opacity: 0.45 },
];

export default function WellnessScore({
  score,
  maxScore = 100,
  status,
  points,
  date,
}: WellnessScoreProps) {
  const center = SIZE / 2;
  const fraction = Math.min(Math.max(score / maxScore, 0), 1);
  const filledLength = CIRCUMFERENCE * (ARC_DEGREES / 360) * fraction;
  const trackLength = CIRCUMFERENCE * (ARC_DEGREES / 360);

  const endAngle = START_ANGLE + ARC_DEGREES * fraction;
  const tip = polarToCartesian(center, center, RADIUS, endAngle);
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.ringWrapper}>
        <Svg width={SIZE} height={SIZE} style={styles.overflowSvg}>
          <Defs>
            <LinearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#5DCAA5" />
              <Stop offset="100%" stopColor="#F4C572" />
            </LinearGradient>
          </Defs>

          {SCATTERED_STARS.map((star, i) => {
            const pos = polarToCartesian(
              center,
              center,
              RADIUS * star.radiusFactor,
              star.angle,
            );
            return (
              <Star
                key={i}
                cx={pos.x}
                cy={pos.y}
                size={star.size}
                opacity={star.opacity}
              />
            );
          })}

          <Circle
            cx={center}
            cy={center}
            r={RADIUS}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${trackLength} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            fill="transparent"
            rotation={START_ANGLE}
            origin={`${center}, ${center}`}
          />

          <Circle
            cx={center}
            cy={center}
            r={RADIUS}
            stroke="url(#scoreGrad)"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${filledLength} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            fill="transparent"
            rotation={START_ANGLE}
            origin={`${center}, ${center}`}
          />

          {/* Slightly larger main star indicator */}
          <Star cx={tip.x} cy={tip.y} size={16} color="#FDE9C0" />
          <Star cx={tip.x} cy={tip.y} size={11} color="#F4C572" />
        </Svg>

        <View style={styles.centerText}>
          <Text style={styles.label}>{t('dailyWellnessScore')}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreMax}>/{maxScore}</Text>
          </View>
          <Text style={styles.pointsAchieved}>
            Points: {points.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 2,
    paddingBottom: 10,
  },
  ringWrapper: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowSvg: {
    overflow: 'visible',
  },
  centerText: {
    position: 'absolute',
    transform: [{ translateY: -12 }], // Adjusted to perfectly align in the new larger arc
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11, // Increased from 9
    fontWeight: '600',
    letterSpacing: 0.8,
    textAlign: 'center',
    lineHeight: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  scoreNumber: {
    color: '#fff',
    fontSize: 20, // Increased from 32
    fontWeight: '700',
    lineHeight: 30,
  },
  scoreMax: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 16, // Increased from 13
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 2,
  },
  pointsAchieved: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12, // Increased from 10
    marginTop: 4,
  },
});
