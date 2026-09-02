import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import CommunityTabs, {
  CommunityTab,
} from '../../components/Community/CommunityTabs';
import RankingRow from '../../components/Community/RankingRow';
import PodiumRow from '../../components/Community/PodiumRow';
import ChallengeCard, {
  Challenge,
} from '../../components/Community/ChallengeCard';
import MyProfileCard from '../../components/Community/MyProfileCard';

import { fetchCommunityLeaderboard, RankingUser } from '../../api/community';

// ── Static challenges (replace with API later if needed) ─────────────────────

const CHALLENGES: Challenge[] = [
  // {
  //   id: '1',
  //   icon: '',
  //   iconBg: '#e0f2fe',
  //   title: 'Ward A Hydration Challenge',
  //   description: 'All team members meet daily water goals for 7 days',
  //   participants: 12,
  //   progressPercent: 68,
  //   endsDate: 'May 22, 2026',
  // },
  // {
  //   id: '2',
  //   icon: '',
  //   iconBg: '#e8f5e9',
  //   title: 'Department Step Challenge',
  //   description: 'Collective step goal: 500,000 steps this week',
  //   participants: 28,
  //   progressPercent: 68,
  //   endsDate: 'May 18, 2026',
  // },
  // {
  //   id: '3',
  //   icon: '',
  //   iconBg: '#ede9fe',
  //   title: 'Morning Mobility Month',
  //   description: 'Complete at least one mobility session before each shift',
  //   participants: 18,
  //   progressPercent: 47,
  //   endsDate: 'May 31, 2026',
  // },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<CommunityTab>('Leaderboard');

  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [top3, setTop3] = useState<RankingUser[]>([]);
  const [me, setMe] = useState<RankingUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCommunityLeaderboard();
      setRankings(data.rankings);
      setTop3(data.top3);
      setMe(data.me);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? t('communityScreen.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Refetch every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // ── Podium adapter: PodiumRow expects { initials, name, ward, points, isMe }
  const podiumUsers = top3.map(u => ({
    id: String(u.id),
    initials: u.initials,
    name: u.full_name,
    ward: u.department,
    points: u.points,
    delta: '',
    isMe: u.is_me,
  }));

  // ── RankingRow adapter
  const rankingUsers = rankings.map(u => ({
    id: String(u.id),
    initials: u.initials,
    name: u.full_name,
    ward: u.department,
    points: u.points,
    delta: '',
    isMe: u.is_me,
  }));

  const renderLeaderboard = () => {
    if (loading) {
      return <ActivityIndicator style={{ marginTop: 32 }} />;
    }
    if (error) {
      return (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>{t('communityScreen.retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <>
        {podiumUsers.length >= 3 && <PodiumRow top3={podiumUsers} />}
        <Text style={styles.sectionTitle}>{t('communityScreen.rankings')}</Text>
        {rankingUsers.map((user, index) => (
          <RankingRow key={user.id} user={user} rank={index + 1} />
        ))}
      </>
    );
  };

  const renderChallenges = () => (
    <>
      <Text style={styles.sectionTitle}>
        {t('communityScreen.activeChallenges')}
      </Text>
      {CHALLENGES.map(challenge => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={[]}
        keyExtractor={() => ''}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {t('communityScreen.title')}
              </Text>
              <Text style={styles.headerSubtitle}>
                {t('communityScreen.subtitle')}
              </Text>
            </View>

            {/* Current user profile card */}
            {me && (
              <MyProfileCard
                name={me.full_name}
                ward={me.department}
                rank={me.rank}
                points={me.points}
                streakDays={0}
              />
            )}

            <CommunityTabs selected={activeTab} onChange={setActiveTab} />

            <View style={styles.tabContent}>
              {activeTab === 'Leaderboard'
                ? renderLeaderboard()
                : renderChallenges()}
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f7f7' },
  content: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 13, color: '#9ca3af' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  tabContent: { paddingHorizontal: 16 },
  errorWrap: { alignItems: 'center', marginTop: 32, gap: 12 },
  errorText: { color: 'red', fontSize: 14 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
});
