import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../../theme/colors';

interface Props {
  created_at: string;
}

const months = [
  { month: 'Month 1', title: 'Awareness' },
  { month: 'Month 2', title: 'Movement Correction' },
  { month: 'Month 3', title: 'Recovery Optimization' },
  { month: 'Month 4', title: 'Strength Building' },
  { month: 'Month 5', title: 'Performance Enhancement' },
  { month: 'Month 6', title: 'Long-Term Wellness' },
];

export default function WellnessJourney({ created_at }: Props) {
  const getCurrentMonthIndex = () => {
    if (!created_at) return 0;

    const createdDate = new Date(created_at);
    const now = new Date();

    const monthsPassed =
      (now.getFullYear() - createdDate.getFullYear()) * 12 +
      (now.getMonth() - createdDate.getMonth());

    return Math.min(Math.max(monthsPassed, 0), 5);
  };

  const currentMonthIndex = getCurrentMonthIndex();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>My Wellness Journey</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {months.map((item, index) => {
          const isActive = index === currentMonthIndex;

          return (
            <View
              key={index}
              style={[styles.card, isActive && styles.cardActive]}
            >
              <Text style={[styles.monthLabel, isActive && styles.textActive]}>
                {item.month}
              </Text>

              <Text style={[styles.monthTitle, isActive && styles.textActive]}>
                {item.title}
              </Text>

              {isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  scroll: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    width: 140,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  cardActive: {
    backgroundColor: '#024119', // green
    borderColor: '#024119',
  },
  monthLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  textActive: {
    color: '#FFFFFF',
  },
  activeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
