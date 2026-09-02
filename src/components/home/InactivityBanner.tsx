import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export default function InactivityBanner() {
  return (
    <View style={styles.container}>
  
      <Text style={styles.text}>
        You've been inactive for 2 hours — time for your posture break!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff9e6',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe08a',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
});
