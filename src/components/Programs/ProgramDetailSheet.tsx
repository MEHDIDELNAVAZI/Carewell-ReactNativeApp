import React, {
  useCallback,
  useRef,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { UserAssignment } from '../../types/programs';
import { completeAssignmentDate } from '../../api/assignments';

type Props = {
  assignment: UserAssignment | null;
  onClose: () => void;
  onStart: (assignment: UserAssignment) => void;
  onComplete: (completedDateId: number) => void;
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  corrective: { bg: '#e8f5e9', text: '#2d6a4f' },
  strength: { bg: '#fce4ec', text: '#c62828' },
  lifestyle: { bg: '#e3f2fd', text: '#1565c0' },
  general: { bg: '#fff8e1', text: '#f57f17' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#e8f5e9', text: '#2d6a4f' },
  paused: { bg: '#fff3e0', text: '#e65100' },
  completed: { bg: '#f3f4f6', text: '#6b7280' },
};

export default function ProgramDetailSheet({
  assignment,
  onClose,
  onStart,
  onComplete,
}: Props) {
  const { t } = useTranslation();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const scrollRef = useRef<any>(null);
  const snapPoints = useMemo(() => ['75%', '95%'], []);
  const [completing, setCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const navigation = useNavigation<any>();

  // Holds a pending video URL so we navigate ONLY after the sheet has
  // fully closed, instead of navigating while it's still animating.
  const pendingUrlRef = useRef<string | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (assignment) {
      bottomSheetRef.current?.snapToIndex(0);
      setJustCompleted(false);
    }
  }, [assignment?.assignment_id]);

  const TYPE_LABELS: Record<string, string> = {
    corrective: t('programDetailSheet.types.corrective'),
    strength: t('programDetailSheet.types.strength'),
    lifestyle: t('programDetailSheet.types.lifestyle'),
    general: t('programDetailSheet.types.general'),
  };

  const STATUS_LABELS: Record<string, string> = {
    active: t('programDetailSheet.statuses.active'),
    paused: t('programDetailSheet.statuses.paused'),
    completed: t('programDetailSheet.statuses.completed'),
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

  // FIX (crash on back from Browser screen):
  // Close the sheet first; only navigate once onClose fires (i.e. the
  // close animation has actually finished), instead of navigating while
  // the sheet is still open/animating.
  const handleOpenVideo = (url: string | null) => {
    if (!url) return;
    pendingUrlRef.current = url;
    bottomSheetRef.current?.close();
  };

  const handleSheetClose = useCallback(() => {
    onClose();
    if (pendingUrlRef.current) {
      const url = pendingUrlRef.current;
      pendingUrlRef.current = null;
      requestAnimationFrame(() => {
        navigation.navigate('Browser', { url });
      });
    }
  }, [onClose, navigation]);

  if (!assignment) return null;

  const { program, status, dates, notes, active_today, upcomingsessions } =
    assignment;
  const typeStyle = TYPE_COLORS[program.type] ?? {
    bg: '#f3f4f6',
    text: '#6b7280',
  };
  const statusStyle = STATUS_COLORS[status] ?? {
    bg: '#f3f4f6',
    text: '#6b7280',
  };

  const completedDates = dates.filter((d: any) => d.completed).length;
  const upcomingDates = upcomingsessions.slice(0, 5);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = dates.find((d: any) => d.date === todayStr);
  const todayAlreadyCompleted = todayDate?.completed ?? false;

  const handleComplete = async () => {
    if (!todayDate || todayDate.completed) return;
    setCompleting(true);
    try {
      await completeAssignmentDate(todayDate.id);
      if (!isMountedRef.current) return;

      try {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      } catch (e) {
        // scroll node no longer mounted, ignore
      }

      setJustCompleted(true);
      onComplete(todayDate.id);
    } catch (err) {
      console.error(err);
    } finally {
      if (isMountedRef.current) {
        setCompleting(false);
      }
    }
  };

  const isCompleted =
    todayAlreadyCompleted || justCompleted || status === 'completed';
  const isDisabled = completing || isCompleted || !active_today;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleSheetClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.tag, { backgroundColor: typeStyle.bg }]}>
              <Text style={[styles.tagText, { color: typeStyle.text }]}>
                {TYPE_LABELS[program.type] ?? program.type}
              </Text>
            </View>
            {active_today === 1 && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>
                  {t('programDetailSheet.today')}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>{program.name}</Text>

        {/* Instruction */}
        {program.instruction && (
          <>
            <Text style={styles.sectionTitle}>
              {t('programDetailSheet.instruction')}
            </Text>
            <Text style={styles.description}>{program.instruction}</Text>
          </>
        )}

        {/* Target */}
        {program.target && (
          <>
            <Text style={styles.sectionTitle}>
              {t('programDetailSheet.target')}
            </Text>
            <Text style={styles.description}>{program.target}</Text>
          </>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {completedDates}/{dates.length}
            </Text>
            <Text style={styles.statLabel}>
              {t('programDetailSheet.sessionsDone')}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{program.points}</Text>
            <Text style={styles.statLabel}>
              {t('programDetailSheet.points')}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <View style={[styles.tag, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.tagText, { color: statusStyle.text }]}>
                {STATUS_LABELS[status] ?? status}
              </Text>
            </View>
            <Text style={styles.statLabel}>
              {t('programDetailSheet.status')}
            </Text>
          </View>
        </View>

        {/* Upcoming dates */}
        {upcomingDates.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              {t('programDetailSheet.upcomingSessions')}
            </Text>
            <View style={styles.dateList}>
              {upcomingDates.map((d: any) => (
                <View key={d.id} style={styles.dateRow}>
                  <View style={styles.dateDot} />
                  <Text style={styles.dateText}>{d.date}</Text>
                  {d.completed && <Text style={styles.dateCheck}>✓</Text>}
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.sectionTitle}>
            {t('programDetailSheet.noUpcomingSessions')}
          </Text>
        )}

        {/* Notes */}
        {notes ? (
          <>
            <Text style={styles.sectionTitle}>
              {t('programDetailSheet.notes')}
            </Text>
            <Text style={styles.notes}>{notes}</Text>
          </>
        ) : null}

        {/* Video link */}
        {program.video_link ? (
          <>
            <Text style={styles.sectionTitle}>
              {t('programDetailSheet.video')}
            </Text>
            <TouchableOpacity
              style={styles.videoRow}
              onPress={() => handleOpenVideo(program.video_link)}
            >
              <Text style={styles.videoLink}>
                {t('programDetailSheet.openVideoLink')}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}

        {/* Completion button */}
        <View style={styles.completionBox}>
          <Text style={styles.completionQuestion}>
            {t('programDetailSheet.completionQuestion')}
          </Text>
          <TouchableOpacity
            style={[styles.completeBtn, isDisabled && styles.completeBtnDone]}
            onPress={handleComplete}
            disabled={isDisabled}
            activeOpacity={0.88}
          >
            <Text style={styles.completeBtnText}>
              {isCompleted
                ? t('programDetailSheet.completedLabel')
                : !active_today
                ? t('programDetailSheet.notScheduledToday')
                : completing
                ? t('programDetailSheet.saving')
                : t('programDetailSheet.yesIHave')}
            </Text>
          </TouchableOpacity>
        </View>
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
  handle: {
    backgroundColor: '#e5e7eb',
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  todayBadge: {
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 10,
    lineHeight: 30,
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
    marginBottom: 24,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  dateList: {
    gap: 10,
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2d6a4f',
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  dateCheck: {
    fontSize: 14,
    color: '#2d6a4f',
    fontWeight: '700',
  },
  notes: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
    marginBottom: 24,
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 14,
  },
  videoRow: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  videoLink: {
    fontSize: 13,
    color: '#1565c0',
    textDecorationLine: 'underline',
  },
  completionBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  completionQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  completeBtn: {
    backgroundColor: '#2d6a4f',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  completeBtnDone: {
    backgroundColor: '#9ca3af',
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
