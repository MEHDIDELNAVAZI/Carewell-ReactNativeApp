import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  ClipboardCheck,
  Star,
  PersonStanding,
  HeartPulse,
  HandHeart,
} from 'lucide-react-native';

type Props = {
  currentMonth: number;
  monthName: string;
  monthDescription: string;
  progressPercent: number;
  totalMonths: number;
};

const GREEN = '#1d4d3f';
const GOLD = '#e8a942';
const GRAY_LINE = '#d9d9d9';
const GRAY_TEXT = '#9ca3af';

// Icon + short label per month. Extend this if totalMonths > 6.
const MONTH_META = [
  { icon: Brain, label: 'awareness' },
  { icon: ClipboardCheck, label: 'habits' },
  { icon: Star, label: 'integration' },
  { icon: PersonStanding, label: 'stamina' },
  { icon: HeartPulse, label: 'advanced health' },
  { icon: HandHeart, label: 'maintenance' },
];

export default function WellnessJourney({
  currentMonth,
  monthName,
  monthDescription,
  progressPercent,
  totalMonths,
}: Props) {
  const { t } = useTranslation();

  const steps = Array.from({ length: totalMonths }).map((_, i) => {
    const monthNum = i + 1;
    const meta = MONTH_META[i] ?? { icon: Star, label: `Month ${monthNum}` };
    const status =
      monthNum < currentMonth
        ? 'done'
        : monthNum === currentMonth
        ? 'current'
        : 'upcoming';
    return { ...meta, monthNum, status };
  });

  const currentIndex = steps.findIndex(s => s.status === 'current');

  return (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View>
          <Text style={styles.sectionTitle}>{t('wellnessJourney.title')}</Text>
          <Text style={styles.stageTitle}>{monthName}</Text>
        </View>

        <Text style={styles.percentLabel}>
          {progressPercent}%{'\n'}
          <Text style={styles.percentSub}>Completed</Text>
        </Text>
      </View>

      {/* Icon row */}
      <View style={styles.iconRow}>
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isCurrent = step.status === 'current';
          return (
            <View key={i} style={styles.iconCell}>
              <Icon
                size={22}
                color={step.status === 'upcoming' ? GRAY_TEXT : GREEN}
                strokeWidth={2}
              />
            </View>
          );
        })}
      </View>

      {/* Circle / line track */}
      <View style={styles.dotTrack}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <View
              style={[
                styles.circle,
                step.status === 'done' && styles.circleDone,
                step.status === 'current' && styles.circleCurrent,
                step.status === 'upcoming' && styles.circleUpcoming,
              ]}
            >
              {step.status === 'current' ? (
                <Star size={12} color="#ffffff" fill="#ffffff" />
              ) : (
                <Text
                  style={[
                    styles.circleNum,
                    step.status === 'upcoming' && styles.circleNumUpcoming,
                  ]}
                >
                  {step.monthNum}
                </Text>
              )}
            </View>
            {i < steps.length - 1 && (
              <View
                style={[styles.line, i < currentIndex && styles.lineFilled]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Labels under each step */}
      <View style={styles.labelRow}>
        {steps.map((step, i) => (
          <Text
            key={i}
            style={[
              styles.stepLabel,
              step.status === 'upcoming' && styles.stepLabelUpcoming,
            ]}
          >
            {`Month ${step.monthNum}\n`}
          </Text>
        ))}
      </View>

      {/* <Text style={styles.description}>{monthDescription}</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
  },
  iconCell: {
    width: 40,
    alignItems: 'center',
  },
  percentLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  percentSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  dotTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: GREEN,
  },
  circleCurrent: {
    backgroundColor: GOLD,
  },
  circleUpcoming: {
    backgroundColor: '#e5e7eb',
  },
  circleNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  circleNumUpcoming: {
    color: '#9ca3af',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: GRAY_LINE,
  },
  lineFilled: {
    backgroundColor: GREEN,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    width: 48,
  },
  stepLabelUpcoming: {
    color: GRAY_TEXT,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 16,
  },
});
