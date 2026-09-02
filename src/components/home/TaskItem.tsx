import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import colors from '../../theme/colors';

interface TaskItemProps {
  title: string;
  points: string;
  icon?: string;
  isCompleted?: boolean;
  onPress?: () => void;
}

export default function TaskItem({
  title,
  points,
  icon,
  isCompleted,
  onPress,
}: TaskItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.completedContainer]}
      onPress={onPress}
      disabled={isCompleted}
      activeOpacity={0.7}
    >
      {/* Left: checkbox + text */}
      <View style={styles.left}>
        <View style={[styles.checkbox, isCompleted && styles.checkboxDone]}>
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <View style={styles.textBlock}>
          {icon ? (
            <Text style={styles.icon}>{icon}</Text>
          ) : null}
          <Text
            style={[styles.title, isCompleted && styles.titleDone]}
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>
      </View>

      {/* Right: points pill */}
      <View style={[styles.pill, isCompleted && styles.pillDone]}>
        <Text style={[styles.pillText, isCompleted && styles.pillTextDone]}>
          {isCompleted ? 'Done' : points}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  completedContainer: {
    backgroundColor: colors.gray100 ?? '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Left side
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Checkbox
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },

  // Text block
  textBlock: {
    flex: 1,
    gap: 2,
  },
  icon: {
    fontSize: 13,
    marginBottom: 1,
  },
  title: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
  },
  titleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },

  // Points pill
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: `${colors.primary}18`, // ~10% opacity tint
    flexShrink: 0,
  },
  pillDone: {
    backgroundColor: colors.gray200 ?? '#E5E7EB',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  pillTextDone: {
    color: colors.textSecondary,
  },
});
