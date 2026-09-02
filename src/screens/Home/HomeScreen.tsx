import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Modal,
  Image,
  ImageSourcePropType,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Header from '../../components/home/Header';
import colors from '../../theme/colors';
import BottomSheet from '@gorhom/bottom-sheet';
import FormBottomSheet from '../../components/home/FormBottomSheet';
import { FormSubmitPayload, submitForm } from '../../api/form';
import { useHealthData } from '../../hooks/useHealthData';
import TicketList, { TicketListRef } from '../../components/tickets/TicketList';
import StepsCard from '../../components/home/StepsCard';
import HeartRateCard from '../../components/home/HeartRateCard';
import SleepCard from '../../components/home/SleepCard';

import ProgramDetailSheet from '../../components/Programs/ProgramDetailSheet';
import { UserAssignment } from '../../types/programs';
import { LearnItem, LearnResponse } from '../../types/learns';

import Corrective from '../../assets/icons/Corrective.png';
import Ergonomic from '../../assets/icons/Ergonomic.png';
import Form from '../../assets/icons/Form.png';
import Hydration from '../../assets/icons/Form.png';
import Nutrition from '../../assets/icons/Form.png';
import Posture from '../../assets/icons/Form.png';
import Stress from '../../assets/icons/Form.png';
import { completeLearn } from '../../api/Learns';
import LearnDetailSheet from '../../components/Learn/LearnDetailSheet';
import { fetchHomeData } from '../../api/Homepage';
import { sendLog } from '../../api/log';

export interface ProgramDetails {
  id: number;
  name: string;
  points: number;
  category: 'corrective' | 'strength' | 'lifestyle' | 'general';
}

export interface TodayProgramSchedule {
  assignment_date_id: number;
  is_completed: boolean;
  completed_at: string | null;
  date: string;
  program: ProgramDetails;
}

export interface NearestLearn {
  id: number;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  completed_at: string | null;
  points: number | null;
  category: 'musculoskeletal' | 'ergonomics' | 'sleep' | 'nutrition' | 'stress';
}

type TodayItemType = 'program' | 'learn' | 'form';

interface TodayItemProps {
  type: TodayItemType;
  title: string;
  subtitle: string;
  isCompleted: boolean;
  badgeLabel: string;
  onPress: () => void;
  iconSource?: ImageSourcePropType;
}

interface UnifiedTodayItem extends TodayItemProps {
  key: string;
}

const TYPE_CONFIG: {
  [key in TodayItemType]: { label: string; bg: string; color: string };
} = {
  program: { label: 'Program', bg: '#DBEAFE', color: '#1D4ED8' },
  learn: { label: 'Learn', bg: '#EDE9FE', color: '#6D28D9' },
  form: { label: 'Form', bg: '#FEF9C3', color: '#92400E' },
};

const MAX_VISIBLE_TODAY_ITEMS = 3;

const PROGRAM_CATEGORY_ICON_MAP: Record<string, ImageSourcePropType> = {
  corrective: Corrective,
  strength: Posture,
  lifestyle: Hydration,
};

const LEARN_CATEGORY_ICON_MAP: Record<string, ImageSourcePropType> = {
  musculoskeletal: Posture,
  ergonomics: Ergonomic,
  nutrition: Nutrition,
  stress: Stress,
};

function getProgramIcon(category: string): ImageSourcePropType {
  return PROGRAM_CATEGORY_ICON_MAP[category] ?? Posture;
}

function getLearnIcon(category: string): ImageSourcePropType {
  return LEARN_CATEGORY_ICON_MAP[category] ?? Nutrition;
}

// LearnResponse could be a bare array or a paginated `{ results: [] }`
// shape depending on your DRF viewset config — this handles either.
function extractLearnList(resp: LearnResponse | LearnItem[]): LearnItem[] {
  if (Array.isArray(resp)) return resp;
  return (resp as any)?.learns ?? (resp as any)?.results ?? [];
}

function TodayItem({
  type,
  title,
  subtitle,
  isCompleted,
  badgeLabel,
  onPress,
  iconSource,
}: TodayItemProps) {
  const { t } = useTranslation();

  let sourceToRender: ImageSourcePropType = iconSource ?? Posture;

  if (isCompleted) {
    sourceToRender = Form;
  } else if (!iconSource && type === 'learn') {
    sourceToRender = Nutrition;
  } else if (!iconSource && type === 'form') {
    sourceToRender = Form;
  }

  const badgeStyle = isCompleted
    ? styles.badgeDone
    : type === 'learn'
    ? styles.badgeLearn
    : type === 'form'
    ? styles.badgeForm
    : styles.badgePts;
  const badgeTextStyle = isCompleted
    ? styles.badgeTextDone
    : type === 'learn'
    ? styles.badgeTextLearn
    : type === 'form'
    ? styles.badgeTextForm
    : styles.badgeTextPts;

  const tc = TYPE_CONFIG[type];

  return (
    <TouchableOpacity
      style={[styles.item, isCompleted && styles.itemDisabled]}
      onPress={onPress}
      activeOpacity={isCompleted ? 1 : 0.65}
      disabled={isCompleted}
    >
      <View style={[styles.iconWrap, { backgroundColor: 'white' }]}>
        <Image
          source={sourceToRender}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.itemBody}>
        <View style={styles.itemTitleRow}>
          <Text
            style={[styles.itemTitle, isCompleted && styles.itemTitleDone]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <View style={[styles.typePill, { backgroundColor: tc.bg }]}>
            <Text style={[styles.typePillText, { color: tc.color }]}>
              {t(tc.label)}
            </Text>
          </View>
        </View>
        <Text style={styles.itemSub}>{subtitle}</Text>
      </View>
      <View style={styles.itemRight}>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>{badgeLabel}</Text>
        </View>
        {!isCompleted && <Text style={styles.chevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { t } = useTranslation();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetched once in load(), cached here. Tapping a program/learn item just
  // looks these up locally — no request fired on tap.
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
  const [learnItems, setLearnItems] = useState<LearnItem[]>([]);

  const [selectedAssignment, setSelectedAssignment] =
    useState<UserAssignment | null>(null);
  const [selectedLearn, setSelectedLearn] = useState<LearnItem | null>(null);

  // Single load: home data + assignments + learn items, all at once.
  // allSettled so one failing source doesn't block the others.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [homeResult] = await Promise.allSettled([fetchHomeData()]);

      if (homeResult.status === 'fulfilled') {
        const homeData = homeResult.value;
        setData(homeData);

        // todayPrograms already contains full program info per schedule,
        // so use it directly as the local lookup cache.
        setAssignments(
          (homeData.todayPrograms ?? []) as unknown as UserAssignment[],
        );

        // nearestLearn comes back fully populated (title/description/content/type),
        // so just wrap it as the single-item lookup cache.
        setLearnItems(
          homeData.nearestLearn
            ? [homeData.nearestLearn as unknown as LearnItem]
            : [],
        );
      } else {
        console.error('fetchHomeData failed:', homeResult.reason);
        throw homeResult.reason; // home data is required, everything else is optional
      }
    } catch (e: any) {
      console.error('load() failed:', e);
      setError(
        e?.response?.data?.detail ?? e?.message ?? t('Failed to load data'),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);
  // ─────────────────────────────────────────────
  // HEALTH DATA
  // ─────────────────────────────────────────────

  const {
    data: healthData,
    loading: healthLoading,
    refetch: refetchHealthData,
  } = useHealthData();

  const ticketListRef = useRef<TicketListRef>(null);

  // ─────────────────────────────────────────────
  // PULL TO REFRESH
  // ─────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      load(),
      refetchHealthData?.(),
      ticketListRef.current?.refresh(),
    ]);
  }, [load, refetchHealthData]);

  // ─────────────────────────────────────────────
  // LOCAL TODAY
  // ─────────────────────────────────────────────
  //
  // Don't use:
  // new Date().toISOString().split('T')[0]
  //
  // because toISOString() is UTC.
  // For health data we want the user's
  // local calendar date.
  // ─────────────────────────────────────────────

  const getLocalDateString = useCallback(() => {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, '0');

    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }, []);

  const Today = getLocalDateString();

  // ─────────────────────────────────────────────
  // FIND TODAY
  // ─────────────────────────────────────────────

  const todayHealth = healthData.days.find(d => d.date === Today) ?? null;

  const todaySleepStages = todayHealth?.sleepStages ?? [];

  const sleepHours =
    todayHealth?.sleepHours && todayHealth?.sleepHours > 0
      ? todayHealth?.sleepHours
      : todayHealth?.sleepHours ?? null;

  // ─────────────────────────────────────────────
  // OTHER HEALTH DATA
  // ─────────────────────────────────────────────

  const steps = todayHealth?.steps ?? null;

  const avgHR = todayHealth?.avgHeartRate ?? null;

  const minHR = todayHealth?.minHeartRate ?? null;

  const maxHR = todayHealth?.maxHeartRate ?? null;

  // this is for debug we log the open data that fetched with the user phone .
  useEffect(() => {
    if (!todayHealth) {
      console.log('---------------------------');

      console.log('NO HEALTH DATA FOR TODAY');

      console.log('Today:', Today);

      console.log(
        'Available dates:',
        healthData.days.map(d => d.date),
      );

      return;
    }
  }, [todayHealth, Today, todaySleepStages, sleepHours]);

  // ─────────────────────────────────────────────
  // 7-DAY HEALTH LOG
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (healthData.days.length === 0) {
      return;
    }

    sendLog(
      'foreground',
      'info',
      'home-screen-7day-render',
      `rendering ${healthData.days.length} days on home screen`,
      {
        allDays: healthData.days.map(d => {
          const stages = d.sleepStages ?? [];

          const deep = stages
            .filter(stage => stage.stage?.toLowerCase() === 'deep')
            .reduce(
              (sum, stage) => sum + (Number(stage.durationMinutes) || 0),
              0,
            );

          const rem = stages
            .filter(stage => stage.stage?.toLowerCase() === 'rem')
            .reduce(
              (sum, stage) => sum + (Number(stage.durationMinutes) || 0),
              0,
            );

          const light = stages
            .filter(stage => stage.stage?.toLowerCase() === 'light')
            .reduce(
              (sum, stage) => sum + (Number(stage.durationMinutes) || 0),
              0,
            );

          const awake = stages
            .filter(stage => stage.stage?.toLowerCase() === 'awake')
            .reduce(
              (sum, stage) => sum + (Number(stage.durationMinutes) || 0),
              0,
            );

          const actualSleepMinutes = deep + rem + light;

          const actualSleepHours =
            actualSleepMinutes > 0
              ? actualSleepMinutes / 60
              : d.sleepHours ?? null;

          return {
            date: d.date,

            steps: d.steps,

            avgHeartRate: d.avgHeartRate,

            sleepHours: actualSleepHours,

            sleepStageSummary: {
              deep,
              rem,
              light,
              awake,
            },
          };
        }),
        selectedLastDayDate:
          healthData.days[healthData.days.length - 1]?.date ?? null,
        todayActualDate: Today,
        todayCalculatedSleepHours: sleepHours,
      },
    );
  }, [healthData, Today, sleepHours]);

  // const deepSleepMin =
  //   todayHealth?.sleepStages
  //     .filter((s: any) => s.stage === 'deep')
  //     .reduce((acc: number, s: any) => acc + s.durationMinutes, 0) ?? null;

  // const remSleepMin =
  //   todayHealth?.sleepStages
  //     .filter((s: any) => s.stage === 'rem')
  //     .reduce((acc: number, s: any) => acc + s.durationMinutes, 0) ?? null;

  // const fmt = (val: number | null, decimals = 0): string =>
  //   val === null
  //     ? '—'
  //     : decimals > 0
  //     ? val.toFixed(decimals)
  //     : String(Math.round(val));

  const profile = data?.profile;
  const todayPrograms: TodayProgramSchedule[] = data?.todayPrograms ?? [];
  const nearestLearn: NearestLearn | null = data?.nearestLearn ?? null;
  const todaysForms = data?.todaysform ?? [];
  const points = data?.user?.points ?? 0;
  const wellnessScore: number = data?.wellnessScore ?? 0;

  const firstName = profile?.first_name ?? '';
  const lastName = profile?.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  const [submittedFormIds, setSubmittedFormIds] = useState<Set<number>>(
    new Set(),
  );

  const formSheetRef = useRef<BottomSheet>(null);
  const [selectedForm, setSelectedForm] = useState<any>(null);

  const openForm = useCallback((form: any) => {
    setSelectedForm(form);
    setTimeout(() => {
      formSheetRef.current?.expand();
    }, 100);
  }, []);

  // Purely local lookup — no request. Uses the `assignments` cached from load().
  const handleProgramItemPress = useCallback(
    (schedule: TodayProgramSchedule) => {
      const match = assignments.find(a => a.program.id === schedule.program.id);
      if (match) {
        setSelectedAssignment(match);
      } else {
        Alert.alert(t('Error'), t('Could not load program details'));
      }
    },
    [assignments, t],
  );

  // Purely local lookup — no request. Uses the `learnItems` cached from load().
  const handleLearnItemPress = useCallback(
    (learn: NearestLearn) => {
      const match = learnItems.find(l => l.id === learn.id);
      if (match) {
        setSelectedLearn(match);
      } else {
        Alert.alert(t('Error'), t('Could not load learn details'));
      }
    },
    [learnItems, t],
  );

  const unifiedTodayItems: UnifiedTodayItem[] = useMemo(() => {
    const items: UnifiedTodayItem[] = [];

    todayPrograms.forEach(schedule => {
      const completedAt = schedule.completed_at
        ? new Date(schedule.completed_at).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : null;

      items.push({
        key: `program-${schedule.assignment_date_id}`,
        type: 'program',
        title: schedule.program.name,
        subtitle:
          schedule.is_completed && completedAt
            ? t('Completed · {{time}}', { time: completedAt })
            : `+${schedule.program.points} pts`,
        isCompleted: schedule.is_completed,
        badgeLabel: `+${schedule.program.points} pts`,
        iconSource: getProgramIcon(schedule.program.category),
        onPress: () => handleProgramItemPress(schedule),
      });
    });

    if (nearestLearn) {
      const dueDate = new Date(nearestLearn.deadline).toLocaleDateString(
        'en-GB',
        { day: 'numeric', month: 'short' },
      );
      const completedAt = nearestLearn.completed_at
        ? new Date(nearestLearn.completed_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })
        : null;

      items.push({
        key: `learn-${nearestLearn.id}`,
        type: 'learn',
        title: nearestLearn.title,
        subtitle:
          nearestLearn.completed && completedAt
            ? t('Completed · {{date}}', { date: completedAt })
            : t('Due {{date}}', { date: dueDate }),
        isCompleted: nearestLearn.completed,
        badgeLabel:
          nearestLearn.points !== null
            ? `+${nearestLearn.points} pts`
            : nearestLearn.completed
            ? t('Done')
            : t('Pending'),
        iconSource: getLearnIcon(nearestLearn.category),
        onPress: () => handleLearnItemPress(nearestLearn),
      });
    }
    todaysForms.forEach((form: any) => {
      const isDone =
        !!form.is_completed ||
        submittedFormIds.has(form.today_scheduled_day_id);

      const formDate = form.date
        ? new Date(form.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })
        : null;

      const isToday = form.date === new Date().toISOString().split('T')[0];

      items.push({
        key: `form-${form.today_scheduled_day_id}`,
        type: 'form',
        title: form.name,
        subtitle: isDone
          ? t('Completed')
          : isToday
          ? `${form.questions.length} ${t('questions')}`
          : t('{{date}} · {{count}} questions', {
              date: formDate,
              count: form.questions.length,
            }),
        isCompleted: isDone,
        badgeLabel: isDone
          ? t('Done')
          : isToday
          ? t('Fill in')
          : formDate ?? t('Fill in'),
        iconSource: Form,
        onPress: isDone
          ? () => {}
          : () =>
              openForm({
                id: form.form_id,
                name: form.name,
                questions: form.questions,
                today_scheduled_day_id: form.today_scheduled_day_id,
                date: form.date,
                multiplechois: form.multiplechois,
              }),
      });
    });
    return items.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }, [
    todayPrograms,
    nearestLearn,
    todaysForms,
    submittedFormIds,
    handleProgramItemPress,
    handleLearnItemPress,
    openForm,
    t,
  ]);

  const totalItems = unifiedTodayItems.length;
  const completedItems = unifiedTodayItems.filter(i => i.isCompleted).length;
  const isEmpty = totalItems === 0;
  const hasMoreThanVisible = totalItems > MAX_VISIBLE_TODAY_ITEMS;
  const visibleTodayItems = unifiedTodayItems.slice(0, MAX_VISIBLE_TODAY_ITEMS);

  const [showAllTodayModal, setShowAllTodayModal] = useState(false);

  // Program sheet's completeAssignmentDate already hit the server — we
  // still call load() here to refresh points/wellnessScore. That's the only
  // request tied to completion, not to opening the sheet.
  const handleProgramComplete = useCallback(
    (completedDateId: number) => {
      setData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          todayPrograms: prev.todayPrograms.map((s: TodayProgramSchedule) =>
            s.assignment_date_id === completedDateId
              ? {
                  ...s,
                  is_completed: true,
                  completed_at: new Date().toISOString(),
                }
              : s,
          ),
        };
      });
      load();
    },
    [load],
  );

  const handleLearnComplete = useCallback(
    async (learnId: number) => {
      try {
        await completeLearn(learnId);
        setData((prev: any) => {
          if (!prev || prev.nearestLearn?.id !== learnId) return prev;
          return {
            ...prev,
            nearestLearn: {
              ...prev.nearestLearn,
              completed: true,
              completed_at: new Date().toISOString(),
            },
          };
        });
        setSelectedLearn(null);
        load();
      } catch (e) {
        console.error('completeLearn failed:', e);
        Alert.alert(t('Error'), t('Could not mark this as completed'));
      }
    },
    [load, t],
  );

  if (loading && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={['top']}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={load} style={styles.retryBtn}>
          <Text style={styles.retryText}>{t('Retry')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Header
        name={fullName || t('Welcome')}
        role={profile?.work_shift ?? ''}
        ward={profile?.department ?? ''}
        points={points}
        profileImageUri={profile?.profileimage ?? null}
        wellnessScore={wellnessScore}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.healthSection}>
          <View style={styles.healthRow}>
            <StepsCard steps={steps} />
            <HeartRateCard avgHR={avgHR} minHR={minHR} maxHR={maxHR} />
            <SleepCard sleepHours={sleepHours} />
          </View>
        </View>

        <View style={styles.todaySection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t('Todays Mission')}</Text>
            </View>
          </View>
          {isEmpty && (
            <Text style={styles.emptyText}>
              {t('Nothing scheduled for today')}
            </Text>
          )}
          {visibleTodayItems.map(item => (
            <TodayItem
              key={item.key}
              type={item.type}
              title={item.title}
              subtitle={item.subtitle}
              isCompleted={item.isCompleted}
              badgeLabel={item.badgeLabel}
              iconSource={item.iconSource}
              onPress={item.onPress}
            />
          ))}

          {hasMoreThanVisible && (
            <TouchableOpacity
              style={styles.seeAllMoreBtn}
              onPress={() => setShowAllTodayModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllMoreText}>
                {t('See all {{totalItems}} items', { totalItems })}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        </View>
        <TicketList ref={ticketListRef} />
      </ScrollView>

      <Modal
        visible={showAllTodayModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAllTodayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('Today ({{totalItems}})', { totalItems })}
              </Text>
              <TouchableOpacity
                onPress={() => setShowAllTodayModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {unifiedTodayItems.map(item => (
                <TodayItem
                  key={item.key}
                  type={item.type}
                  title={item.title}
                  subtitle={item.subtitle}
                  isCompleted={item.isCompleted}
                  badgeLabel={item.badgeLabel}
                  iconSource={item.iconSource}
                  onPress={() => {
                    if (item.isCompleted) return;
                    setShowAllTodayModal(false);
                    setTimeout(() => item.onPress(), 150);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FormBottomSheet
        form={selectedForm}
        ref={formSheetRef}
        loading={isSubmittingForm}
        onSubmit={async (payload: FormSubmitPayload) => {
          setIsSubmittingForm(true);
          try {
            await submitForm(payload);
            if (selectedForm?.today_scheduled_day_id != null) {
              setSubmittedFormIds(prev =>
                new Set(prev).add(selectedForm.today_scheduled_day_id),
              );
            }
            load();
          } catch (e) {
            console.error('submitForm failed:', e);
            Alert.alert(t('Error'), t('Could not submit form'));
          } finally {
            setIsSubmittingForm(false);
            formSheetRef.current?.close();
          }
        }}
      />
      <ProgramDetailSheet
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onStart={() => setSelectedAssignment(null)}
        onComplete={handleProgramComplete}
      />

      <LearnDetailSheet
        learn={selectedLearn}
        onClose={() => setSelectedLearn(null)}
        onComplete={handleLearnComplete}
      />
    </SafeAreaView>
  );
}
// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff6d' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { backgroundColor: colors.background },
  divider: { height: 8, backgroundColor: colors.gray100 },

  langSwitcherRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  healthSection: { paddingBottom: 10, paddingTop: 10 },
  oji: { fontSize: 20, marginBottom: 4 },
  healthCardValue: { fontSize: 22, fontWeight: '700', lineHeight: 26 },
  healthCardUnit: { fontSize: 11, fontWeight: '500', opacity: 0.7 },
  healthCardLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },

  todaySection: { marginTop: 8 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  sectionMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },

  seeAllMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 0.5,
    borderTopColor: colors.gray100,
  },
  seeAllMoreText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray100,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  modalScroll: { paddingBottom: 8 },
  closeText: { fontSize: 20, color: colors.textPrimary, fontWeight: '600' },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderTopWidth: 0.5,
    borderTopColor: colors.gray100,
    gap: 12,
  },
  itemDisabled: {
    opacity: 0.55,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#F3F4F6',
  },
  iconImage: {
    width: 30,
    height: 30,
  },
  itemBody: { flex: 1, minWidth: 0 },

  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  healthRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  itemTitleDone: { color: '#9CA3AF', textDecorationLine: 'line-through' },
  itemSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
    flexShrink: 0,
  },
  typePillText: { fontSize: 10, fontWeight: '600' },

  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  chevron: { fontSize: 20, color: '#9CA3AF', lineHeight: 22 },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgePts: { backgroundColor: '#DBEAFE' },
  badgeTextPts: { color: '#1D4ED8' },
  badgeDone: { backgroundColor: '#DCFCE7' },
  badgeTextDone: { color: '#15803D' },
  badgeLearn: { backgroundColor: '#EDE9FE' },
  badgeTextLearn: { color: '#6D28D9' },
  badgeForm: { backgroundColor: '#FEF3C7' },
  badgeTextForm: { color: '#92400E' },

  errorText: { color: 'red', marginBottom: 12 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
});
