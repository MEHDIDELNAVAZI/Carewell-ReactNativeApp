import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserAssignment } from '../../types/programs';
import { CheckCircle2, Star, PauseCircle, ChevronRight } from 'lucide-react-native';

type Props = {
  assignment: UserAssignment;
  onPress: (assignment: UserAssignment) => void;
};

// Signature: each program type gets a single accent color that drives the
// left rail, the type tag, and (when active) the icon chip. Status states
// (completed / paused) override this with their own semantic color so the
// card's meaning is readable at a glance without reading text.
const TYPE_ACCENT: Record<string, string> = {
  corrective: '#2d9d78',
  strength: '#c2447a',
  lifestyle: '#3b7dd8',
  general: '#e08a2e',
};

const getLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ProgramCard({ assignment, onPress }: Props) {
  const { program, status, active_today, dates } = assignment;

  const accent = TYPE_ACCENT[program.type] ?? '#8a8f98';

  const isCompleted = status === 'completed';
  const isPaused = !isCompleted && status === 'paused';
  const isDisabled = isCompleted || isPaused;

  // "Today" only means "needs action today" — once today's session is
  // done, stop showing it even though the overall program isn't finished.
  const todayStr = getLocalDateString(new Date());
  const todayEntry = dates.find((d: any) => d.date === todayStr);
  const isTodayDone = !!todayEntry?.completed;
  const needsActionToday = active_today === 1 && !isDisabled && !isTodayDone;
  const didTodaysSession = active_today === 1 && !isDisabled && isTodayDone;

  const completedDates = dates.filter((d: any) => d.completed).length;
  const totalDates = dates.length;

  // Rail color communicates state first, type second.
  const railColor = isCompleted ? '#22c55e' : isPaused ? '#94a3b8' : accent;

  return (
    <TouchableOpacity
      style={[styles.card, isCompleted && styles.cardCompleted, isDisabled && styles.cardDisabled]}
      onPress={() => onPress(assignment)}
      activeOpacity={isDisabled ? 1 : 0.85}
    >
      <View style={[styles.rail, { backgroundColor: railColor }]} />

      <View style={styles.body}>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              isCompleted && styles.titleCompleted,
              isPaused && styles.titlePaused,
            ]}
            numberOfLines={1}
          >
            {program.name}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[styles.categoryTag, { backgroundColor: `${accent}1A` }]}
            >
              <Text style={[styles.categoryText, { color: accent }]}>
                {program.type}
              </Text>
            </View>

            {needsActionToday && (
              <View style={styles.todayTag}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            )}
          </View>

          {/* One status line at the bottom — never more than one signal at a time */}
          {isCompleted && (
            <View style={styles.statusRow}>
              <CheckCircle2 size={13} color="#22c55e" />
              <Text style={styles.statusTextCompleted}>
                Completed · {totalDates} sessions
              </Text>
            </View>
          )}

          {isPaused && (
            <View style={styles.statusRow}>
              <PauseCircle size={13} color="#94a3b8" />
              <Text style={styles.statusTextPaused}>Paused</Text>
            </View>
          )}

          {didTodaysSession && (
            <View style={styles.statusRow}>
              <CheckCircle2 size={13} color="#22c55e" />
              <Text style={styles.statusTextCompleted}>Done today</Text>
            </View>
          )}

          {!isCompleted && !isPaused && !didTodaysSession && (
            <View style={styles.statusRow}>
              <Star size={12} color="#9ca3af" />
              <Text style={styles.progress}>
                {completedDates}/{totalDates} sessions
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.iconContainer,
            isCompleted && styles.iconContainerCompleted,
            isPaused && styles.iconContainerPaused,
          ]}
        >
          {isCompleted ? (
            <CheckCircle2 size={22} color="#22c55e" />
          ) : isPaused ? (
            <PauseCircle size={20} color="#94a3b8" />
          ) : (
            <ChevronRight size={22} color="#9ca3af" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardCompleted: {
    backgroundColor: '#fafafa',
    borderColor: '#e5e7eb',
  },
  cardDisabled: {
    opacity: 0.9,
  },
  rail: {
    width: 4,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 20,
  },
  titleCompleted: {
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  titlePaused: {
    color: '#9ca3af',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  todayTag: {
    backgroundColor: '#171717',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
  },
  todayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusTextCompleted: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  statusTextPaused: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  progress: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  iconContainerCompleted: {
    backgroundColor: '#f0fdf4',
  },
  iconContainerPaused: {
    backgroundColor: '#f8fafc',
  },
});