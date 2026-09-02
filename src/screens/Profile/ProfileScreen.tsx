import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import ScoreBreakdown, {
  ScoreItem,
} from '../../components/Profile/ScoreBreakdown';
import AchievementsGrid, {
  Achievement,
} from '../../components/Profile/AchievementsGrid';
import MyStreaks, { Streak } from '../../components/Profile/MyStreaks';
import SettingsSection, {
  SettingsGroup,
} from '../../components/Profile/SettingsSection';
import ProfileHeroCard from '../../components/Profile/ProfileHeroCard';
import WellnessJourney from '../../components/Profile/WellnessJourney';
import { fetchProfile } from '../../api/profile';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** How many full 30-day months since registeredAt (1-based) */
function getJourneyMonth(registeredAt: string): number {
  const start = new Date(registeredAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30) + 1;
}

/** Days elapsed since registeredAt, capped at 180 */
function getDaysElapsed(registeredAt: string): number {
  const start = new Date(registeredAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(diffDays, 180);
}

const JOURNEY_TOTAL_DAYS = 180;

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { t } = useTranslation();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ── Translated month metadata for the wellness journey ─────────────────────
  const MONTH_NAMES: Record<number, { name: string; description: string }> = {
    1: {
      name: t('profileScreen.journey.month1.name'),
      description: t('profileScreen.journey.month1.description'),
    },
    2: {
      name: t('profileScreen.journey.month2.name'),
      description: t('profileScreen.journey.month2.description'),
    },
    3: {
      name: t('profileScreen.journey.month3.name'),
      description: t('profileScreen.journey.month3.description'),
    },
    4: {
      name: t('profileScreen.journey.month4.name'),
      description: t('profileScreen.journey.month4.description'),
    },
    5: {
      name: t('profileScreen.journey.month5.name'),
      description: t('profileScreen.journey.month5.description'),
    },
    6: {
      name: t('profileScreen.journey.month6.name'),
      description: t('profileScreen.journey.month6.description'),
    },
  };

  // ── Static data (translated; still unused/commented in render) ─────────────
  const ACHIEVEMENTS: Achievement[] = [
    {
      id: '1',
      icon: '🧘',
      label: t('profileScreen.achievements.stretchStreak'),
      unlocked: true,
    },
    {
      id: '2',
      icon: '🏆',
      label: t('profileScreen.achievements.postureImprover'),
      unlocked: true,
    },
    {
      id: '3',
      icon: '💧',
      label: t('profileScreen.achievements.hydrationHero'),
      unlocked: true,
    },
    {
      id: '4',
      icon: '🔄',
      label: t('profileScreen.achievements.recoveryMaster'),
      unlocked: false,
    },
    {
      id: '5',
      icon: '😴',
      label: t('profileScreen.achievements.sleepOptimizer'),
      unlocked: false,
    },
    {
      id: '6',
      icon: '⭐',
      label: t('profileScreen.achievements.wellnessConsistent'),
      unlocked: false,
    },
  ];

  const STREAKS: Streak[] = [
    {
      id: '1',
      icon: '🟢',
      iconColor: '#22c55e',
      days: 7,
      label: t('profileScreen.streaks.stretching'),
    },
    {
      id: '2',
      icon: '🔵',
      iconColor: '#3b82f6',
      days: 14,
      label: t('profileScreen.streaks.hydration'),
    },
    {
      id: '3',
      icon: '🟣',
      iconColor: '#8b5cf6',
      days: 5,
      label: t('profileScreen.streaks.sleep'),
    },
    {
      id: '4',
      icon: '🟠',
      iconColor: '#f97316',
      days: 3,
      label: t('profileScreen.streaks.steps'),
    },
  ];

  const SETTINGS_GROUPS: SettingsGroup[] = [
    {
      title: t('profileScreen.settings.wellnessGroup'),
      items: [
        {
          id: 'goals',
          icon: '🎯',
          iconBg: '#e8f5e9',
          iconColor: '#2d6a4f',
          label: t('profileScreen.settings.myGoals'),
          onPress: () => {},
        },
        {
          id: 'remind',
          icon: '🔔',
          iconBg: '#fffbeb',
          iconColor: '#f59e0b',
          label: t('profileScreen.settings.reminders'),
          onPress: () => {},
        },
        {
          id: 'devices',
          icon: '📱',
          iconBg: '#ede9fe',
          iconColor: '#7c3aed',
          label: t('profileScreen.settings.linkedDevices'),
          onPress: () => {},
        },
      ],
    },
    {
      title: t('profileScreen.settings.accountGroup'),
      items: [
        {
          id: 'info',
          icon: '👤',
          iconBg: '#e0f2fe',
          iconColor: '#0369a1',
          label: t('profileScreen.settings.personalInfo'),
          onPress: () => {},
        },
        {
          id: 'privacy',
          icon: '🔒',
          iconBg: '#fce7f3',
          iconColor: '#be185d',
          label: t('profileScreen.settings.privacySettings'),
          onPress: () => {},
        },
        {
          id: 'support',
          icon: '❓',
          iconBg: '#fff7ed',
          iconColor: '#ea580c',
          label: t('profileScreen.settings.supportFaq'),
          onPress: () => {},
        },
      ],
    },
  ];

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProfile();
      setProfileData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const profile = profileData?.profile;
  const breakdown = profileData?.points_breakdown;
  const registeredAt = profile?.created_at ?? new Date().toISOString();

  const journeyMonth = getJourneyMonth(registeredAt);
  const daysElapsed = getDaysElapsed(registeredAt);
  const progressPct = Math.round((daysElapsed / JOURNEY_TOTAL_DAYS) * 100);
  const monthInfo = MONTH_NAMES[Math.min(journeyMonth, 6)] ?? MONTH_NAMES[6];

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : '—';

  const totalPoints = profile?.points ?? 0;
  // Score breakdown built from points_breakdown
  const pct = (done: number, total: number): number =>
    total > 0 ? Math.round((done / total) * 100) : 0;

  const SCORES: ScoreItem[] = breakdown
    ? [
        {
          label: t('profileScreen.scores.programsPoints'),
          score: pct(breakdown.programs.done, breakdown.programs.total),
          color: '#22c55e',
        },
        {
          label: t('profileScreen.scores.learnsPoints'),
          score: pct(breakdown.learns.done, breakdown.learns.total),
          color: '#3b82f6',
        },
        {
          label: t('profileScreen.scores.formsPoints'),
          score: pct(breakdown.forms.done, breakdown.forms.total),
          color: '#8b5cf6',
        },
        {
          label: t('profileScreen.scores.totalEarned'),
          score: pct(breakdown.total.done, breakdown.total.total),
          color: '#2d6a4f',
        },
      ]
    : [];

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ActivityIndicator
          style={{ marginTop: 60 }}
          size="large"
          color="#2d6a4f"
        />
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
      <FlatList
        data={[]}
        keyExtractor={() => ''}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ProfileHeroCard
              name={fullName}
              role={profile?.department ?? '—'}
              ward={
                profile?.work_shift
                  ? t('profileScreen.shiftSuffix', {
                      shift: profile.work_shift,
                    })
                  : '—'
              }
              totalPoints={totalPoints}
              achievements={ACHIEVEMENTS.filter(a => a.unlocked).length}
              stageLabel={monthInfo.name}
              avatarUri={profile?.profileimage ?? undefined}
            />
            <WellnessJourney
              currentMonth={Math.min(journeyMonth, 6)}
              monthName={monthInfo.name}
              monthDescription={monthInfo.description}
              progressPercent={progressPct}
              totalMonths={6}
            />

            <ScoreBreakdown scores={SCORES} />

            {/* <AchievementsGrid achievements={ACHIEVEMENTS} /> */}
            {/* <MyStreaks streaks={STREAKS} /> */}

            {/* <SettingsSection groups={SETTINGS_GROUPS} /> */}

            <View style={{ height: 20 }} />
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
  },
});
