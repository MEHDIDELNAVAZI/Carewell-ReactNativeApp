import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  category: string;
  title: string;
  duration: number;
  exercises: number;
  onStart: () => void;
};

export default function TodaysProgramBanner({ category, title, duration, exercises, onStart }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.category}>Today's {category} Program</Text>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
          <Text style={styles.startArrow}>▶</Text>
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>⏱ {duration} min</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta}>✦ {exercises} exercises</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d6a4f',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  startArrow: {
    color: '#ffffff',
    fontSize: 11,
  },
  startText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  metaDot: {
    color: 'rgba(255,255,255,0.5)',
  },
});
