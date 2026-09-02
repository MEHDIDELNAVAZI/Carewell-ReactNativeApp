import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export type FilterOption = 'All' | 'Corrective' | 'Recovery' | 'Strength';

type Props = {
  selected: FilterOption;
  onChange: (filter: FilterOption) => void;
};

const FILTERS: FilterOption[] = ['All', 'Corrective', 'Recovery', 'Strength'];

const ICONS: Record<FilterOption, string> = {
  All: '',
  Corrective: '',
  Recovery: '',
  Strength: '',
};

export default function FilterTabs({ selected, onChange }: Props) {
  const { t } = useTranslation();

  const LABELS: Record<FilterOption, string> = {
    All: t('programFilterTabs.all'),
    Corrective: t('programFilterTabs.corrective'),
    Recovery: t('programFilterTabs.recovery'),
    Strength: t('programFilterTabs.strength'),
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const isActive = selected === filter;
        return (
          <TouchableOpacity
            key={filter}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(filter)}
            activeOpacity={0.8}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {ICONS[filter]}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
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
  iconActive: {
    color: '#ffffff',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  labelActive: {
    color: '#ffffff',
  },
});