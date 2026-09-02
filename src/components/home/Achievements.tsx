import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import colors from '../../theme/colors';

interface Achievement {
  icon: string;
  title: string;
}

const achievements: Achievement[] = [
  { icon: '', title: '7-Day Stretch\nStreak' },
  { icon: '', title: 'Posture\nImprover' },
  { icon: '', title: 'Hydration\nHero' },
];

export default function Achievements() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {achievements.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
    width: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
