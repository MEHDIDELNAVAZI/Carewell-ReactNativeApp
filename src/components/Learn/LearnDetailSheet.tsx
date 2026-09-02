import React, { useCallback, useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { LearnItem } from '../../types/learns';
import { useNavigation } from '@react-navigation/native';

type Props = {
  learn: LearnItem | null;
  onClose: () => void;
  onComplete: (learnId: number) => void;
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  musculoskeletal: { bg: '#e8f5e9', text: '#2d6a4f' },
  ergonomics: { bg: '#e8f5e9', text: '#2d6a4f' },
  sleep: { bg: '#e3f2fd', text: '#1565c0' },
  nutrition: { bg: '#fff8e1', text: '#f57f17' },
  stress: { bg: '#fce4ec', text: '#c62828' },
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  video: { bg: '#e3f2fd', text: '#1565c0' },
  article: { bg: '#fff8e1', text: '#f57f17' },
  micro: { bg: '#e8f5e9', text: '#2d6a4f' },
  quiz: { bg: '#fce4ec', text: '#c62828' },
};

export default function LearnDetailSheet({
  learn,
  onClose,
  onComplete,
}: Props) {
  const { t } = useTranslation();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%', '95%'], []);
  const [completing, setCompleting] = useState(false);
  const navigation = useNavigation<any>();

  // Translated lookups for raw backend category/type values
  const TYPE_LABELS: Record<string, string> = {
    video: t('learnDetailSheet.types.video'),
    article: t('learnDetailSheet.types.article'),
    micro: t('learnDetailSheet.types.micro'),
    quiz: t('learnDetailSheet.types.quiz'),
  };

  const CATEGORY_LABELS: Record<string, string> = {
    musculoskeletal: t('learnDetailSheet.categories.musculoskeletal'),
    ergonomics: t('learnDetailSheet.categories.ergonomics'),
    sleep: t('learnDetailSheet.categories.sleep'),
    nutrition: t('learnDetailSheet.categories.nutrition'),
    stress: t('learnDetailSheet.categories.stress'),
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds === 0) return t('learnDetailSheet.expired');
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) {
      return t('learnDetailSheet.daysHoursLeft', { days, hours });
    }
    return t('learnDetailSheet.hoursLeft', { hours });
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onClose}
      />
    ),
    [onClose],
  );

  if (!learn) return null;

  const categoryStyle = CATEGORY_COLORS[learn.category] ?? {
    bg: '#f3f4f6',
    text: '#6b7280',
  };
  const typeStyle = TYPE_COLORS[learn.type] ?? {
    bg: '#f3f4f6',
    text: '#6b7280',
  };
  const isExpiringSoon =
    learn.time_remaining > 0 && learn.time_remaining < 86400;
  const isDisabled = completing || learn.completed || learn.is_expired;

  const handleComplete = async () => {
    if (isDisabled) return;
    setCompleting(true);
    try {
      onComplete(learn.id);
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.tag, { backgroundColor: typeStyle.bg }]}>
              <Text style={[styles.tagText, { color: typeStyle.text }]}>
                {TYPE_LABELS[learn.type] ?? learn.type}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: categoryStyle.bg }]}>
              <Text style={[styles.tagText, { color: categoryStyle.text }]}>
                {CATEGORY_LABELS[learn.category] ?? learn.category}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>{learn.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{learn.description}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {t('learnDetailSheet.durationMinutes', {
                minutes: learn.duration,
              })}
            </Text>
            <Text style={styles.statLabel}>
              {t('learnDetailSheet.duration')}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {t('learnDetailSheet.rewardXp', { points: learn.points })}
            </Text>
            <Text style={styles.statLabel}>{t('learnDetailSheet.reward')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{learn.completion_score}%</Text>
            <Text style={styles.statLabel}>
              {t('learnDetailSheet.completionRate')}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{learn.views}</Text>
            <Text style={styles.statLabel}>{t('learnDetailSheet.views')}</Text>
          </View>
        </View>

        {/* Deadline */}
        <View
          style={[
            styles.deadlineRow,
            isExpiringSoon && styles.deadlineRowUrgent,
          ]}
        >
          <Text
            style={[
              styles.deadlineLabel,
              isExpiringSoon && styles.deadlineLabelUrgent,
            ]}
          >
            ⏰ {t('learnDetailSheet.deadline')}
          </Text>
          <Text
            style={[
              styles.deadlineValue,
              isExpiringSoon && styles.deadlineValueUrgent,
            ]}
          >
            {learn.is_expired
              ? t('learnDetailSheet.expired')
              : `${new Date(
                  learn.deadline,
                ).toLocaleDateString()} · ${formatTimeRemaining(
                  learn.time_remaining,
                )}`}
          </Text>
        </View>

        {/* Content */}
        <Text style={styles.sectionTitle}>{t('learnDetailSheet.content')}</Text>
        {/* Video link */}
        {learn.content ? (
          <>
            <Text style={styles.sectionTitle}>
              {t('programDetailSheet.video')}
            </Text>
            <TouchableOpacity
              style={styles.videoRow}
              onPress={() =>
                navigation.navigate('Browser', { url: learn.content })
              }
            >
              <Text style={styles.videoLink}>
                {t('programDetailSheet.openVideoLink')}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}

        {/* Complete button */}
        <TouchableOpacity
          style={[styles.completeBtn, isDisabled && styles.completeBtnDisabled]}
          onPress={handleComplete}
          disabled={isDisabled}
          activeOpacity={0.88}
        >
          <Text style={styles.completeBtnText}>
            {learn.completed
              ? t('learnDetailSheet.completedLabel')
              : learn.is_expired
              ? t('learnDetailSheet.deadlinePassed')
              : completing
              ? t('learnDetailSheet.saving')
              : t('learnDetailSheet.markComplete', { points: learn.points })}
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: { backgroundColor: '#e5e7eb', width: 40 },
  content: { paddingHorizontal: 20, paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 50 },
  tagText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 10,
    lineHeight: 30,
  },
  videoRow: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: '#e5e7eb' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  deadlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  deadlineRowUrgent: { backgroundColor: '#fee2e2' },
  deadlineLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  deadlineLabelUrgent: { color: '#dc2626' },
  deadlineValue: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  deadlineValueUrgent: { color: '#dc2626' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  contentBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  contentText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  completeBtn: {
    backgroundColor: '#2d6a4f',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeBtnDisabled: { backgroundColor: '#9ca3af' },
  completeBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  videoLink: {
    fontSize: 13,
    color: '#1565c0',
    textDecorationLine: 'underline',
  },
});
