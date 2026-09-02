import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LearnItem, LessonCategory } from '../../types/learns';
import {
  CheckCircle2,
  Clock,
  CalendarX2,
  Flame,
  ChevronRight,
} from 'lucide-react-native';

type Props = {
  lesson: LearnItem;
  onPress: (lesson: LearnItem) => void;
};

// Signature: each category gets a single accent color that drives the
// left rail, the category tag, and (when active) the icon chip. Status
// states (completed / expired) override this with their own semantic
// color so the card's meaning is readable at a glance without reading text.
const CATEGORY_ACCENT: Record<LessonCategory, string> = {
  musculoskeletal: '#2d9d78',
  ergonomics: '#2d9d78',
  sleep: '#3b7dd8',
  nutrition: '#e08a2e',
  stress: '#c2447a',
};

const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return 'Expired';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

export default function LessonCard({ lesson, onPress }: Props) {
  const accent = CATEGORY_ACCENT[lesson.category] ?? '#8a8f98';

  const isCompleted = lesson.completed;
  const isExpired = !isCompleted && lesson.is_expired;
  const isDisabled = isCompleted || isExpired;

  // Rail color communicates state first, category second.
  const railColor = isCompleted ? '#22c55e' : isExpired ? '#94a3b8' : accent;

  return (
    <TouchableOpacity
      style={[styles.card, isDisabled && styles.cardDisabled]}
      onPress={() => onPress(lesson)}
      activeOpacity={isDisabled ? 1 : 0.85}
    >
      <View style={[styles.rail, { backgroundColor: railColor }]} />

      <View style={styles.body}>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              isCompleted && styles.titleCompleted,
              isExpired && styles.titleExpired,
            ]}
            numberOfLines={2}
          >
            {lesson.title}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[styles.categoryTag, { backgroundColor: `${accent}1A` }]}
            >
              <Text style={[styles.categoryText, { color: accent }]}>
                {lesson.category}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Clock size={12} color="#9ca3af" />
              <Text style={styles.meta}>{lesson.duration} min</Text>
            </View>

            {!isCompleted && (
              <View style={styles.metaItem}>
                <Flame size={12} color="#f59e0b" />
                <Text style={styles.xp}>+{lesson.points} XP</Text>
              </View>
            )}
          </View>

          {/* One status line at the bottom — never more than one signal at a time */}
          {isCompleted && (
            <View style={styles.statusRow}>
              <CheckCircle2 size={13} color="#22c55e" />
              <Text style={styles.statusTextCompleted}>Completed</Text>
            </View>
          )}

          {isExpired && (
            <View style={styles.statusRow}>
              <CalendarX2 size={13} color="#94a3b8" />
              <Text style={styles.statusTextExpired}>Deadline passed</Text>
            </View>
          )}

          {!isCompleted && !isExpired && (
            <View style={styles.statusRow}>
              <Text
                style={[
                  styles.deadline,
                  lesson.time_remaining < 86400 && styles.deadlineUrgent,
                  lesson.time_remaining < 3600 && styles.deadlineCritical,
                ]}
              >
                {formatTimeRemaining(lesson.time_remaining)}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.iconContainer,
            isCompleted && styles.iconContainerCompleted,
            isExpired && styles.iconContainerExpired,
          ]}
        >
          {isCompleted ? (
            <CheckCircle2 size={22} color="#22c55e" />
          ) : isExpired ? (
            <CalendarX2 size={20} color="#94a3b8" />
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
  titleExpired: {
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
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  xp: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f59e0b',
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
  statusTextExpired: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  deadline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  deadlineUrgent: {
    color: '#f97316',
  },
  deadlineCritical: {
    color: '#ef4444',
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
  iconContainerExpired: {
    backgroundColor: '#f8fafc',
  },
});
