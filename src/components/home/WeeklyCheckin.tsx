import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../theme/colors';

interface WeeklyCheckinProps {
  onPress?: () => void;
}

export default function WeeklyCheckin({ onPress }: WeeklyCheckinProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.left}>
        <Text style={styles.title}>Weekly Check-In</Text>
        <Text style={styles.subtitle}>3 min · Your responses help personalise your program</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accent,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
  },
  arrow: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
