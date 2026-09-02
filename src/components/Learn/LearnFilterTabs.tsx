import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export type LearnFilter =
  | 'All'
  | 'Posture'
  | 'Ergonomics'
  | 'Recovery'
  | 'Nutrition'
  | 'Stress';

type Props = {
  selected: LearnFilter;
  onChange: (filter: LearnFilter) => void;
};

const FILTERS: LearnFilter[] = [
  'All',
  'Posture',
  'Ergonomics',
  'Recovery',
  'Nutrition',
  'Stress',
];

const ICONS: Record<LearnFilter, string> = {
  All: '',
  Posture: '',
  Ergonomics: '',
  Recovery: '',
  Nutrition: '',
  Stress: '',
};

export default function LearnFilterTabs({ selected, onChange }: Props) {
  const { t } = useTranslation();

  const LABELS: Record<LearnFilter, string> = {
    All: t('learnFilterTabs.all'),
    Posture: t('learnFilterTabs.posture'),
    Ergonomics: t('learnFilterTabs.ergonomics'),
    Recovery: t('learnFilterTabs.recovery'),
    Nutrition: t('learnFilterTabs.nutrition'),
    Stress: t('learnFilterTabs.stress'),
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map(filter => {
        const isActive = selected === filter;
        return (
          <TouchableOpacity
            key={filter}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(filter)}
            activeOpacity={0.8}
          >
            <Text style={[styles.icon, isActive && styles.textActive]}>
              {ICONS[filter]}
            </Text>
            <Text style={[styles.label, isActive && styles.textActive]}>
              {LABELS[filter]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
  },
  tabActive: {
    backgroundColor: '#1a1a1a',
  },
  icon: {
    fontSize: 12,
    color: '#6b7280',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  textActive: {
    color: '#ffffff',
  },
});
