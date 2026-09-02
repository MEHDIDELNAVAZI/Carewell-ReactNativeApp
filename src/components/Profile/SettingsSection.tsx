import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type SettingsItem = {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  onPress: () => void;
};

export type SettingsGroup = {
  title: string;
  items: SettingsItem[];
};

type Props = {
  groups: SettingsGroup[];
};

function SettingsRow({ item }: { item: SettingsItem }) {
  return (
    <TouchableOpacity style={styles.row} onPress={item.onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrapper, { backgroundColor: item.iconBg }]}>
        <Text style={[styles.icon, { color: item.iconColor }]}>{item.icon}</Text>
      </View>
      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function SettingsSection({ groups }: Props) {
  return (
    <View style={styles.container}>
      {groups.map((group, gi) => (
        <View key={group.title} style={[styles.group, gi > 0 && { marginTop: 20 }]}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.groupCard}>
            {group.items.map((item, index) => (
              <React.Fragment key={item.id}>
                <SettingsRow item={item} />
                {index < group.items.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  group: {},
  groupTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  arrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 62,
  },
});
