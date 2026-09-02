import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LearnFilterTabs, {
  LearnFilter,
} from '../../components/Learn/LearnFilterTabs';
import LessonCard from '../../components/Learn/LessonCard';
import ProgressCard from '../../components/Learn/ProgressCard';
import MicroLearningBanner from '../../components/Learn/MicroLearningBanner';
import { LearnItem, LearnProgress } from '../../types/learns';
import { completeLearn, getLearnItems } from '../../api/Learns';
import LearnProgressCard from '../../components/Learn/ProgressCard';
import LearnDetailSheet from '../../components/Learn/LearnDetailSheet';

export default function LearnScreen() {
  const { t } = useTranslation();

  const [filter, setFilter] = useState<LearnFilter>('All');
  const [lessons, setLessons] = useState<LearnItem[]>([]);
  const [spotlight, setSpotlight] = useState<LearnItem | null>(null);
  const [progress, setProgress] = useState<LearnProgress>({
    completed: 0,
    total: 0,
    total_xp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedLearn, setSelectedLearn] = useState<LearnItem | null>(null);

  // Load data function
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLearnItems();
      setLessons(data.learns);
      setSpotlight(data.spotlight);
      setProgress(data.progress);
    } catch (error) {
      console.error('Error loading lessons:', error);
      Alert.alert(t('learnScreen.errorTitle'), t('learnScreen.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refetch every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Handler for lesson press
  const handleLessonPress = (lesson: LearnItem) => {
    setSelectedLearn(lesson);
    console.log('Selected lesson:', lesson);
  };

  // Handler for completing a lesson
  const handleLearnComplete = async (learnId: number) => {
    try {
      await completeLearn(learnId);
      setLessons(prev =>
        prev.map(l => (l.id === learnId ? { ...l, completed: true } : l)),
      );
      setProgress(prev => ({
        ...prev,
        completed: prev.completed + 1,
        total_xp:
          prev.total_xp + (lessons.find(l => l.id === learnId)?.points ?? 0),
      }));
      if (selectedLearn?.id === learnId) {
        setSelectedLearn(prev => (prev ? { ...prev, completed: true } : null));
      }
      loadData();
    } catch (err) {
      Alert.alert(t('learnScreen.errorTitle'), t('learnScreen.completeError'));
      console.error(err);
    }
  };

  // Filter lessons based on selected filter
  const filtered = useMemo(() => {
    if (filter === 'All') return lessons;
    return lessons.filter((l: any) => l.category === filter);
  }, [filter, lessons]);

  // Handler for spotlight press
  const handleSpotlightPress = () => {
    if (spotlight) handleLessonPress(spotlight);
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {loading ? t('learnScreen.loading') : t('learnScreen.noLessons')}
            </Text>
          }
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('learnScreen.title')}</Text>
                <Text style={styles.headerSubtitle}>
                  {t('learnScreen.subtitle')}
                </Text>
              </View>

              {/* Progress card */}
              {/* <LearnProgressCard
                completedLessons={progress.completed}
                totalLessons={progress.total}
                xp={progress.total_xp}
              /> */}

              {/* Spotlight: nearest deadline */}
              {/* {spotlight && (
                <>
                  <Text style={styles.sectionTitle}>Up Next</Text>
                  <MicroLearningBanner
                    title={spotlight.title}
                    description={spotlight.description}
                    duration={spotlight.duration}
                    xp={spotlight.points}
                    timeRemaining={spotlight.time_remaining}
                    onPress={handleSpotlightPress}
                  />
                </>
              )} */}

              {/* Filter tabs */}
              <LearnFilterTabs selected={filter} onChange={setFilter} />

              {/* Library heading */}
              <Text style={styles.sectionTitle}>
                {t('learnScreen.library')}
              </Text>
            </>
          }
          renderItem={({ item }) => (
            <LessonCard lesson={item} onPress={handleLessonPress} />
          )}
        />
        {selectedLearn && (
          <LearnDetailSheet
            learn={selectedLearn}
            onClose={() => setSelectedLearn(null)}
            onComplete={handleLearnComplete}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f7f7' },
  list: { paddingBottom: 40 },
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
  headerSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 40,
  },
});
