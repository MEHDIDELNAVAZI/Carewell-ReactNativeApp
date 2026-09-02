import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Moon, Clock3, Sparkles } from 'lucide-react-native';

import colors from '../../../theme/colors';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type SleepStage = {
  stage: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
};

type SleepQualityProps = {
  sleepHours: number | null;
  sleepStages: SleepStage[];
};

type StageInfo = {
  key: string;
  title: string;
  minutes: number;
  color: string;
};

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const SLEEP_GOAL_HOURS = 8;

const STAGE_COLORS = {
  deep: '#7c3aed',
  rem: '#06b6d4',
  light: '#f59e0b',
  awake: '#ef4444',
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) {
    return '—';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${mins}m`;
}

// ─────────────────────────────────────────────
// QUALITY
// ─────────────────────────────────────────────

function getSleepQuality(hours: number) {
  if (hours >= 8) {
    return {
      key: 'sleepQuality.score.excellent',
      color: '#16a34a',
      backgroundColor: '#dcfce7',
    };
  }

  if (hours >= 7) {
    return {
      key: 'sleepQuality.score.good',
      color: '#16a34a',
      backgroundColor: '#dcfce7',
    };
  }

  if (hours >= 6) {
    return {
      key: 'sleepQuality.score.average',
      color: '#d97706',
      backgroundColor: '#fef3c7',
    };
  }

  return {
    key: 'sleepQuality.score.poor',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
  };
}

// ─────────────────────────────────────────────
// CALCULATE STAGE MINUTES
// ─────────────────────────────────────────────

function calculateStageMinutes(
  sleepStages: SleepStage[],
  stageName: string,
): number {
  return sleepStages
    .filter(stage => stage.stage?.toLowerCase() === stageName.toLowerCase())
    .reduce((sum, stage) => sum + Math.max(stage.durationMinutes || 0, 0), 0);
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────

function EmptySleepState() {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Moon size={28} color="#7c3aed" strokeWidth={1.8} />
      </View>

      <Text style={styles.emptyTitle}>{t('No sleep data today')}</Text>

      <Text style={styles.emptyDescription}>
        {t('Your sleep information will appear here once it is recorded.')}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// STAGE STAT
// ─────────────────────────────────────────────

function StageStat({
  title,
  minutes,
  color,
}: {
  title: string;
  minutes: number;
  color: string;
}) {
  const hasData = minutes > 0;

  return (
    <View style={styles.stageStat}>
      <View style={styles.stageStatHeader}>
        <View
          style={[
            styles.stageDot,
            {
              backgroundColor: color,
              opacity: hasData ? 1 : 0.3,
            },
          ]}
        />

        <Text style={styles.stageStatTitle}>{title}</Text>
      </View>

      <Text
        style={[styles.stageStatValue, !hasData && styles.stageStatValueEmpty]}
      >
        {formatDuration(minutes)}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// SLEEP TIMELINE
// ─────────────────────────────────────────────

function SleepTimeline({ stages }: { stages: StageInfo[] }) {
  /*
   * VERY IMPORTANT:
   *
   * Awake is NOT part of the sleep timeline.
   *
   * Only:
   *
   * Deep + REM + Light
   *
   * are used here.
   */

  const sleepStagesOnly = stages.filter(stage => stage.key !== 'awake');

  const totalSleepMinutes = sleepStagesOnly.reduce(
    (sum, stage) => sum + stage.minutes,
    0,
  );

  if (totalSleepMinutes <= 0) {
    return (
      <View style={styles.timelineEmpty}>
        <Text style={styles.timelineEmptyText}>—</Text>
      </View>
    );
  }

  return (
    <View style={styles.timeline}>
      {sleepStagesOnly.map(stage => {
        const percentage =
          stage.minutes > 0
            ? Math.max((stage.minutes / totalSleepMinutes) * 100, 2)
            : 1;

        return (
          <View
            key={stage.key}
            style={[
              styles.timelineSegment,
              {
                width: `${percentage}%`,
                backgroundColor: stage.color,
                opacity: stage.minutes > 0 ? 1 : 0.15,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function SleepQuality({
  sleepHours,
  sleepStages,
}: SleepQualityProps) {
  const { t } = useTranslation();

  // ───────────────────────────────────────────
  // CHECK IF THERE IS ANY SLEEP DATA
  // ───────────────────────────────────────────

  const hasProvidedSleepHours =
    sleepHours !== null && sleepHours !== undefined && sleepHours > 0;

  const hasStageData = sleepStages && sleepStages.length > 0;

  // ───────────────────────────────────────────
  // CALCULATE STAGES
  // ───────────────────────────────────────────

  const deepSleepMinutes = calculateStageMinutes(sleepStages, 'deep');

  const remSleepMinutes = calculateStageMinutes(sleepStages, 'rem');

  const lightSleepMinutes = calculateStageMinutes(sleepStages, 'light');

  const awakeMinutes = calculateStageMinutes(sleepStages, 'awake');

  // ───────────────────────────────────────────
  // ACTUAL SLEEP
  // ───────────────────────────────────────────
  //
  // THIS IS THE IMPORTANT PART.
  //
  // Awake is NEVER included.
  //
  // Actual sleep =
  //
  // Deep
  // + REM
  // + Light
  //
  // ───────────────────────────────────────────

  const calculatedSleepMinutes =
    deepSleepMinutes + remSleepMinutes + lightSleepMinutes;

  /*
   * If stage data exists and contains actual
   * sleep stages, use those values.
   *
   * If HealthKit/Health Connect didn't give
   * us stages, fall back to sleepHours.
   */

  let actualSleepMinutes = 0;

  if (calculatedSleepMinutes > 0) {
    actualSleepMinutes = calculatedSleepMinutes;
  } else if (hasProvidedSleepHours) {
    actualSleepMinutes = Math.round(sleepHours * 60);
  }

  const hasActualSleep = actualSleepMinutes > 0;

  // ───────────────────────────────────────────
  // EMPTY STATE
  // ───────────────────────────────────────────

  if (!hasActualSleep) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Moon size={19} color="#7c3aed" strokeWidth={2} />

            <Text style={styles.sectionTitle}>{t('sleepQuality.title')}</Text>
          </View>
        </View>

        <EmptySleepState />
      </View>
    );
  }

  // ───────────────────────────────────────────
  // HOURS
  // ───────────────────────────────────────────

  const actualSleepHours = actualSleepMinutes / 60;

  const hoursPart = Math.floor(actualSleepMinutes / 60);

  const minutesPart = actualSleepMinutes % 60;

  // ───────────────────────────────────────────
  // QUALITY
  // ───────────────────────────────────────────

  const quality = getSleepQuality(actualSleepHours);

  // ───────────────────────────────────────────
  // GOAL
  // ───────────────────────────────────────────

  const goalPercentage = Math.min(
    (actualSleepHours / SLEEP_GOAL_HOURS) * 100,
    100,
  );

  const remainingMinutes = Math.max(
    SLEEP_GOAL_HOURS * 60 - actualSleepMinutes,
    0,
  );

  // ───────────────────────────────────────────
  // STAGES
  // ───────────────────────────────────────────

  const stages = useMemo<StageInfo[]>(
    () => [
      {
        key: 'deep',
        title: t('sleepQuality.stages.deep'),
        minutes: deepSleepMinutes,
        color: STAGE_COLORS.deep,
      },
      {
        key: 'rem',
        title: t('sleepQuality.stages.rem'),
        minutes: remSleepMinutes,
        color: STAGE_COLORS.rem,
      },
      {
        key: 'light',
        title: t('sleepQuality.stages.light'),
        minutes: lightSleepMinutes,
        color: STAGE_COLORS.light,
      },
      {
        key: 'awake',
        title: t('sleepQuality.stages.awake'),
        minutes: awakeMinutes,
        color: STAGE_COLORS.awake,
      },
    ],
    [t, deepSleepMinutes, remSleepMinutes, lightSleepMinutes, awakeMinutes],
  );

  // ───────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ═══════════════════════════════════════
          HEADER
      ═══════════════════════════════════════ */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Moon size={19} color="#7c3aed" strokeWidth={2} />

          <Text style={styles.sectionTitle}>{t('sleepQuality.title')}</Text>
        </View>

        <View
          style={[
            styles.qualityBadge,
            {
              backgroundColor: quality.backgroundColor,
            },
          ]}
        >
          <Sparkles size={12} color={quality.color} strokeWidth={2.2} />

          <Text
            style={[
              styles.qualityBadgeText,
              {
                color: quality.color,
              },
            ]}
          >
            {t(quality.key)}
          </Text>
        </View>
      </View>

      {/* ═══════════════════════════════════════
          MAIN SLEEP SUMMARY
      ═══════════════════════════════════════ */}

      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryCaption}>{t('Sleep duration')}</Text>

            <View style={styles.durationRow}>
              <Text style={styles.hoursText}>{hoursPart}</Text>

              <View style={styles.durationRight}>
                <Text style={styles.durationUnit}>h</Text>

                <Text style={styles.minutesText}>
                  {minutesPart.toString().padStart(2, '0')}m
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sleepIconCircle}>
            <Moon size={27} color="#7c3aed" fill="#ede9fe" strokeWidth={1.8} />
          </View>
        </View>

        {/* ═════════════════════════════════════
            GOAL
        ═════════════════════════════════════ */}

        <View style={styles.goalHeader}>
          <View style={styles.goalLabelRow}>
            <Clock3 size={13} color="#9ca3af" />

            <Text style={styles.goalLabel}>
              {t('sleepQuality.goal', {
                hours: SLEEP_GOAL_HOURS,
              })}
            </Text>
          </View>

          <Text style={styles.goalPercentage}>
            {Math.round(goalPercentage)}%
          </Text>
        </View>

        <View style={styles.goalTrack}>
          <View
            style={[
              styles.goalBar,
              {
                width: `${goalPercentage}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.goalHint}>
          {remainingMinutes > 0
            ? `${formatDuration(remainingMinutes)} ${t('remaining to goal')}`
            : t('Sleep goal reached')}
        </Text>
      </View>

      {/* ═══════════════════════════════════════
          STAGES HEADER
      ═══════════════════════════════════════ */}

      <View style={styles.stagesHeader}>
        <Text style={styles.stagesTitle}>{t('Sleep stages')}</Text>

        <Text style={styles.stagesSubtitle}>{t('Sleep distribution')}</Text>
      </View>

      {/* ═══════════════════════════════════════
          TIMELINE
      ═══════════════════════════════════════ */}

      <View style={styles.timelineCard}>
        <SleepTimeline stages={stages} />

        <View style={styles.timelineLegend}>
          {stages
            .filter(stage => stage.key !== 'awake')
            .map(stage => (
              <View key={stage.key} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: stage.color,
                    },
                  ]}
                />

                <Text style={styles.legendText}>{stage.title}</Text>
              </View>
            ))}
        </View>
      </View>

      {/* ═══════════════════════════════════════
          STAGE STATISTICS
      ═══════════════════════════════════════ */}

      <View style={styles.statsGrid}>
        <StageStat
          title={t('sleepQuality.stages.deep')}
          minutes={deepSleepMinutes}
          color={STAGE_COLORS.deep}
        />

        <StageStat
          title={t('sleepQuality.stages.rem')}
          minutes={remSleepMinutes}
          color={STAGE_COLORS.rem}
        />

        <StageStat
          title={t('sleepQuality.stages.light')}
          minutes={lightSleepMinutes}
          color={STAGE_COLORS.light}
        />

        {/* Awake is displayed separately.
            It NEVER affects total sleep. */}

        <StageStat
          title={t('sleepQuality.stages.awake')}
          minutes={awakeMinutes}
          color={STAGE_COLORS.awake}
        />
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

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary ?? '#1a1a1a',
  },

  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },

  qualityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // ─────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────

  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
  },

  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryCaption: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 3,
  },

  durationRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  hoursText: {
    fontSize: 43,
    lineHeight: 47,
    fontWeight: '800',
    color: colors.textPrimary ?? '#111827',
    letterSpacing: -1.2,
  },

  durationRight: {
    marginLeft: 5,
    marginBottom: 5,
  },

  durationUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },

  minutesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },

  sleepIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─────────────────────────────────────────
  // GOAL
  // ─────────────────────────────────────────

  goalHeader: {
    marginTop: 20,
    marginBottom: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  goalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  goalLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
  },

  goalPercentage: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
  },

  goalTrack: {
    height: 8,
    width: '100%',
    backgroundColor: '#ede9fe',
    borderRadius: 999,
    overflow: 'hidden',
  },

  goalBar: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
  },

  goalHint: {
    marginTop: 7,
    fontSize: 10,
    fontWeight: '500',
    color: '#b0b4bb',
  },

  // ─────────────────────────────────────────
  // STAGES HEADER
  // ─────────────────────────────────────────

  stagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 10,
  },

  stagesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary ?? '#1a1a1a',
  },

  stagesSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#a1a1aa',
  },

  // ─────────────────────────────────────────
  // TIMELINE
  // ─────────────────────────────────────────

  timelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },

  timeline: {
    width: '100%',
    height: 17,
    borderRadius: 9,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
  },

  timelineSegment: {
    height: '100%',
    marginRight: 1,
  },

  timelineEmpty: {
    width: '100%',
    height: 17,
    borderRadius: 9,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timelineEmptyText: {
    fontSize: 10,
    color: '#9ca3af',
  },

  timelineLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    columnGap: 14,
    rowGap: 7,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  legendText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8b8f97',
  },

  // ─────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },

  stageStat: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 13,
    minHeight: 78,
    justifyContent: 'space-between',
  },

  stageStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  stageStatTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8b8f97',
  },

  stageStatValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary ?? '#1a1a1a',
  },

  stageStatValueEmpty: {
    color: '#d1d5db',
  },

  // ─────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────

  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 32,
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
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
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
    maxWidth: 280,
  },
});
