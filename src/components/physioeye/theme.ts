import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  // surfaces
  screen: '#F2F6F5',
  surface: '#FFFFFF',
  deep: '#0F3B38', // hero card
  border: 'rgba(15, 59, 56, 0.07)',

  // text
  ink: '#12211F',
  inkSoft: '#586966',
  inkMuted: '#8B9C98',
  onDeep: '#FFFFFF',
  onDeepMuted: 'rgba(255, 255, 255, 0.66)',

  // brand accents
  amber: '#E3A24A',
  amberSoft: '#FBF0DC',
  amberInk: '#A8701C',
  mint: '#7FD1B3',
  mintSoft: '#E2F4EC',
  mintInk: '#1F7A5E',

  // score tones
  scoreGreat: '#34B08A',
  scoreGood: '#7CCBB0',
  scoreFocus: '#E3A24A',

  track: '#E5ECEA',
  trackOnDeep: 'rgba(255, 255, 255, 0.14)',
  negativeSoft: '#FBE7E4',
  negativeInk: '#B3382C',
} as const;

export const radius = { card: 20, hero: 24, pill: 999 } as const;
export const spacing = { screen: 20, gap: 12, section: 16 } as const;

export const cardShadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F3B38',
      shadowOpacity: 0.07,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 2 },
    default: {},
  }) ?? {};

export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

/** Bar colour follows the score, so weaker areas stand out without extra labels. */
export function getScoreColor(score: number): string {
  if (score >= 80) return colors.scoreGreat;
  if (score >= 70) return colors.scoreGood;
  return colors.scoreFocus;
}
