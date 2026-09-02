import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export type CommunityTab = 'Leaderboard' | 'Team Challenges';

type Props = {
  selected: CommunityTab;
  onChange: (tab: CommunityTab) => void;
};

const TABS: CommunityTab[] = ['Leaderboard', 'Team Challenges'];

export default function CommunityTabs({ selected, onChange }: Props) {
  const { t } = useTranslation();

  const TAB_LABELS: Record<CommunityTab, string> = {
    Leaderboard: t('communityTabs.leaderboard'),
    'Team Challenges': t('communityTabs.teamChallenges'),
  };

  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = selected === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },
  labelActive: {
    color: '#1a1a1a',
  },
});
