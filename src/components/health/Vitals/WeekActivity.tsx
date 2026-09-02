import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import colors from '../../../theme/colors';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type DayData = {
  date: string; // YYYY-MM-DD
  day: string;
  steps: number;
};

type Props = {
  data: DayData[];
};

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const GOAL = 8000;
const BAR_MAX_HEIGHT = 90;

// ─────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getLastSevenDays(): string[] {
  const today = new Date();

  const dates: string[] = [];

  // Oldest → newest
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);

    date.setHours(12, 0, 0, 0);
    date.setDate(today.getDate() - i);

    dates.push(formatDateKey(date));
  }

  return dates;
}

function getDayLabel(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  }).format(date);
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatSteps(steps: number): string {
  if (steps <= 0) {
    return '—';
  }

  if (steps >= 1000) {
    return (steps / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }

  return steps.toString();
}

// ─────────────────────────────────────────────
// PREPARE WEEK DATA
// ─────────────────────────────────────────────

function prepareWeeklyData(data: DayData[]): DayData[] {
  const lastSevenDates = getLastSevenDays();

  /*
   * Use DATE as the unique key.
   *
   * This prevents:
   *
   * Tue
   * Tue
   *
   * from causing duplicate React keys.
   */

  const dataByDate = new Map<string, DayData>();

  data.forEach(item => {
    if (!item.date) {
      return;
    }

    const existing = dataByDate.get(item.date);

    if (!existing) {
      dataByDate.set(item.date, {
        ...item,
        steps: Math.max(item.steps || 0, 0),
      });

      return;
    }

    /*
     * If backend accidentally sends the same
     * date more than once, keep the larger value.
     */
    if (item.steps > existing.steps) {
      dataByDate.set(item.date, {
        ...item,
        steps: Math.max(item.steps || 0, 0),
      });
    }
  });

  /*
   * ALWAYS create exactly 7 days.
   *
   * Missing day = 0 steps.
   *
   * This is important because TODAY must still
   * appear even when there is no data.
   */

  return lastSevenDates.map(date => {
    const existing = dataByDate.get(date);

    if (existing) {
      return {
        date,
        day: getDayLabel(date),
        steps: Math.max(existing.steps || 0, 0),
      };
    }

    return {
      date,
      day: getDayLabel(date),
      steps: 0,
    };
  });
}

// ─────────────────────────────────────────────
// BAR
// ─────────────────────────────────────────────

function Bar({
  data,
  maxSteps,
  isToday,
}: {
  data: DayData;
  maxSteps: number;
  isToday: boolean;
}) {
  const hasData = data.steps > 0;

  const heightPercent = maxSteps > 0 ? data.steps / maxSteps : 0;

  const barHeight = hasData ? Math.max(heightPercent * BAR_MAX_HEIGHT, 6) : 0;

  const reachedGoal = data.steps >= GOAL;

  const barColor = reachedGoal ? '#22c55e' : colors.textPrimary ?? '#1a1a1a';

  return (
    <View style={[styles.barColumn, isToday && styles.todayColumn]}>
      {/* STEP VALUE */}

      <Text style={[styles.stepLabel, !hasData && styles.stepLabelEmpty]}>
        {formatSteps(data.steps)}
      </Text>

      {/* BAR */}

      <View style={styles.barTrack}>
        {hasData ? (
          <View
            style={[
              styles.bar,
              {
                height: barHeight,
                backgroundColor: barColor,
              },
            ]}
          />
        ) : (
          <View style={styles.emptyBar} />
        )}
      </View>

      {/* DAY */}

      <View style={[styles.dayContainer, isToday && styles.todayContainer]}>
        <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
          {data.day}
        </Text>
      </View>

      {/* TODAY LABEL */}

      {isToday && <Text style={styles.todayText}>TODAY</Text>}
    </View>
  );
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────

function EmptyState() {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>⌁</Text>
      </View>

      <Text style={styles.emptyTitle}>{t('No activity data')}</Text>

      <Text style={styles.emptyDescription}>
        {t(
          'Your weekly activity will appear here once your steps are recorded.',
        )}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function WeeklyActivity({ data }: Props) {
  const { t } = useTranslation();

  /*
   * Generate EXACTLY the last 7 days.
   *
   * Today is ALWAYS the last item.
   */
  const weeklyData = prepareWeeklyData(data);

  /*
   * Check whether there is at least one
   * actual step reading during the week.
   */
  const hasAnyData = weeklyData.some(item => item.steps > 0);

  /*
   * Even if there is no data, we still render
   * the seven days when there is no data.
   *
   * This gives the user a proper weekly chart
   * instead of confusing missing dates.
   */
  if (!hasAnyData) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>{t('weeklyActivity.title')}</Text>

        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>⌁</Text>
          </View>

          <Text style={styles.emptyTitle}>{t('No activity data')}</Text>

          <Text style={styles.emptyDescription}>
            {t(
              'Your weekly activity will appear here once your steps are recorded.',
            )}
          </Text>
        </View>
      </View>
    );
  }

  // ───────────────────────────────────────────
  // MAX STEPS
  // ───────────────────────────────────────────

  const maxSteps = Math.max(...weeklyData.map(item => item.steps), 1);

  // ───────────────────────────────────────────
  // AVERAGE
  // ───────────────────────────────────────────

  /*
   * IMPORTANT:
   *
   * We DO NOT remove today just because
   * today's steps are 0.
   *
   * For the average, however, we only use
   * days that actually have readings.
   */

  const daysWithData = weeklyData.filter(item => item.steps > 0);

  const avgSteps =
    daysWithData.length > 0
      ? Math.round(
          daysWithData.reduce((sum, item) => sum + item.steps, 0) /
            daysWithData.length,
        )
      : 0;

  // ───────────────────────────────────────────
  // GOAL DAYS
  // ───────────────────────────────────────────

  const goalDays = weeklyData.filter(item => item.steps >= GOAL).length;

  // ───────────────────────────────────────────
  // TODAY
  // ───────────────────────────────────────────

  const today = formatDateKey(new Date());

  // ───────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t('weeklyActivity.title')}</Text>

        {goalDays > 0 && (
          <View style={styles.goalBadge}>
            <View style={styles.goalDot} />

            <Text style={styles.goalBadgeText}>{goalDays}</Text>
          </View>
        )}
      </View>

      {/* CHART */}

      <View style={styles.chartCard}>
        <View style={styles.chartWrapper}>
          {weeklyData.map(item => (
            <Bar
              key={item.date}
              data={item}
              maxSteps={maxSteps}
              isToday={item.date === today}
            />
          ))}
        </View>
      </View>

      {/* FOOTER */}

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.dotGreen} />

          <Text style={styles.footerText}>
            {t('weeklyActivity.avgStepsPerDay', {
              avg: avgSteps.toLocaleString(),
            })}
          </Text>
        </View>

        <Text style={styles.goalText}>
          {t('weeklyActivity.goal', {
            goal: GOAL.toLocaleString(),
          })}
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#f7f7f7',
    borderRadius: 18,
    padding: 16,
  },

  // ─────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary ?? '#1a1a1a',
  },

  goalBadge: {
    minWidth: 30,
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: '#dcfce7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  goalDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },

  goalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },

  // ─────────────────────────────────────────
  // CHART
  // ─────────────────────────────────────────

  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },

  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 62,
  },

  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  todayColumn: {
    position: 'relative',
  },

  // ─────────────────────────────────────────
  // STEP VALUE
  // ─────────────────────────────────────────

  stepLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 5,
    textAlign: 'center',
  },

  stepLabelEmpty: {
    color: '#d1d5db',
  },

  // ─────────────────────────────────────────
  // BAR
  // ─────────────────────────────────────────

  barTrack: {
    width: 12,
    height: BAR_MAX_HEIGHT,
    backgroundColor: '#f1f3f5',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  bar: {
    width: '100%',
    borderRadius: 7,
  },

  emptyBar: {
    width: '100%',
    height: 3,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },

  // ─────────────────────────────────────────
  // DAY
  // ─────────────────────────────────────────

  dayContainer: {
    marginTop: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  todayContainer: {
    backgroundColor: '#eef2ff',
  },

  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
  },

  todayLabel: {
    color: '#4f46e5',
    fontWeight: '700',
  },

  todayText: {
    marginTop: 2,
    fontSize: 7,
    fontWeight: '800',
    color: '#4f46e5',
    letterSpacing: 0.4,
  },

  // ─────────────────────────────────────────
  // FOOTER
  // ─────────────────────────────────────────

  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },

  dotGreen: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },

  footerText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },

  goalText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },

  // ─────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────

  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
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
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyIcon: {
    fontSize: 30,
    fontWeight: '300',
    color: '#9ca3af',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary ?? '#1a1a1a',
    marginBottom: 6,
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: 290,
  },
});
