import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import colors from '../../theme/colors';
import Header from '../../components/health/Header';
import Healthnavigator from '../../navigation/Healthnavigator';
import { useTranslation } from 'react-i18next';

export default function Healthscreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title={t('header.title')} subtitle={t('header.subtitle')} />

      {/* Navigator gets all remaining space */}
      <View style={{ flex: 1 }}>
        <Healthnavigator />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    backgroundColor: colors.white,
  },
  divider: {
    height: 8,
    backgroundColor: colors.gray100,
  },
  section: {
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  statsWrapper: {
    backgroundColor: colors.white,
  },
  tasksSection: {
    backgroundColor: colors.white,
    marginTop: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 30,
  },
});
