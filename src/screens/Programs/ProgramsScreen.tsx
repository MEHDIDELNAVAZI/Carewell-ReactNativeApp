import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import FilterTabs, { FilterOption } from '../../components/Programs/FilterTabs';
import ProgramDetailSheet from '../../components/Programs/ProgramDetailSheet';
import { Program, UserAssignment } from '../../types/programs';
import { getMyAssignments } from '../../api/Programs';
import ProgramCard from '../../components/Programs/ProgramCard';

export default function ProgramsScreen() {
  const { t } = useTranslation();

  const [filter, setFilter] = useState<FilterOption>('All');
  const [selectedProgram, setSelectedProgram] = useState<UserAssignment | null>(
    null,
  );
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data function
  const loadData = useCallback(() => {
    setLoading(true);
    getMyAssignments()
      .then(setAssignments)
      .catch(() =>
        Alert.alert(
          t('programsScreen.errorTitle'),
          t('programsScreen.loadError'),
        ),
      )
      .finally(() => setLoading(false));
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

  const filtered = useMemo(() => {
    if (filter === 'All') return assignments;
    return assignments.filter(
      p => p.program.type === filter.toLocaleLowerCase(),
    );
  }, [filter, assignments]);

  const handleStart = () => {
    // Navigate to program detail
    console.log("Start today's program");
  };
  const handleProgramPress = (assignment: UserAssignment) => {
    setSelectedProgram(assignment);
  };

  // FIX: this used to be `onClose={() => {}}` — a no-op. That meant
  // `selectedProgram` never got cleared when the sheet closed (swipe
  // down / backdrop tap / close button), so <ProgramDetailSheet> never
  // unmounted. BottomSheet's `index` prop only sets the INITIAL snap
  // point, so on the next card press the already-mounted sheet had no
  // signal to reopen — hence "opens once, then nothing." Clearing state
  // here unmounts the sheet on close, so it mounts fresh (and opens)
  // every time a card is pressed.
  const handleSheetClose = useCallback(() => {
    setSelectedProgram(null);
  }, []);

  const handleComplete = (completedDateId: number) => {
    const updatedAssignments = assignments.map(a => {
      if (a.assignment_id !== selectedProgram?.assignment_id) return a;
      return {
        ...a,
        dates: a.dates.map(d =>
          d.id === completedDateId ? { ...d, completed: true } : d,
        ),
      };
    });

    setAssignments(updatedAssignments);

    // also update selectedProgram so the sheet gets fresh data
    const updated = updatedAssignments.find(
      a => a.assignment_id === selectedProgram?.assignment_id,
    );
    if (updated) setSelectedProgram(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.assignment_id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading
              ? t('programsScreen.loading')
              : t('programsScreen.noPrograms')}
          </Text>
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {t('programsScreen.title')}
              </Text>
              {/* <Text style={styles.headerSubtitle}>
                Personalised for nursing & care staff
              </Text> */}
            </View>

            {/* Today's program banner */}
            {/* <TodaysProgramBanner
              category="Corrective"
              title="Neck Posture Correction"
              duration={15}
              exercises={5}
              onStart={handleStart}
            /> */}

            {/* Quick access */}
            {/* <QuickAccessCard
              icon=""
              title="Post-Shift Recovery"
              subtitle="Shift Recovery Routine · 12 min"
              onPress={() => console.log('Quick access pressed')}
            /> */}

            {/* Filter tabs */}
            <FilterTabs selected={filter} onChange={setFilter} />

            {/* Count */}
            <Text style={styles.count}>
              {t('programsScreen.programCount', { count: filtered.length })}
            </Text>
          </>
        }
        // and renderItem
        renderItem={({ item }) => (
          <ProgramCard assignment={item} onPress={handleProgramPress} />
        )}
        contentContainerStyle={styles.list}
      />
      {selectedProgram && (
        <ProgramDetailSheet
          assignment={selectedProgram}
          onClose={handleSheetClose}
          onStart={a => {
            setSelectedProgram(null);
            console.log('Start:', a.program.name);
          }}
          onComplete={handleComplete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  list: {
    paddingBottom: 32,
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '400',
  },
  count: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 40,
  },
});
