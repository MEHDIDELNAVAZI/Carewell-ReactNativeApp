import { StyleSheet } from 'react-native';

import {
  cardShadow,
  colors,
  radius,
  spacing,
  tabularNums,
} from '../../components/physioeye/theme';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.screen,
  },

  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 36,
  },

  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  headerSpacer: {
    width: 42,
  },

  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },

  titleSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '400',
    color: colors.inkSoft,
    textAlign: 'center',
  },

  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: 'center',
    ...cardShadow,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  score: {
    fontSize: 62,
    lineHeight: 68,
    fontWeight: '700',
    color: colors.ink,
    ...tabularNums,
  },

  scoreMax: {
    marginLeft: 5,
    fontSize: 22,
    color: colors.inkMuted,
    fontWeight: '500',
  },

  mainProgress: {
    width: '100%',
    marginTop: 14,
  },

  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  deltaArrow: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.mintInk,
    marginRight: 5,
  },

  deltaNegative: {
    color: colors.inkSoft,
  },

  deltaText: {
    fontSize: 14,
    color: colors.inkSoft,
  },

  status: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '700',
    color: colors.mintInk,
  },

  progressSection: {
    marginTop: spacing.section,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    ...cardShadow,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.ink,
  },

  progressSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
  },

  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.track,
  },

  progressBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkSoft,
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.gap,
    marginTop: spacing.section,
  },

  metricCard: {
    width: '48%',
    minHeight: 205,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 18,
    ...cardShadow,
  },

  metricIcon: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  metricTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.ink,
  },

  metricScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },

  metricScore: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.ink,
    ...tabularNums,
  },

  metricMax: {
    marginLeft: 2,
    fontSize: 12,
    color: colors.inkMuted,
  },

  metricProgress: {
    marginTop: 10,
  },

  noDataText: {
    marginTop: 10,
    fontSize: 12,
    color: colors.inkMuted,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.inkSoft,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  errorTitle: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },

  errorText: {
    marginTop: 8,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
