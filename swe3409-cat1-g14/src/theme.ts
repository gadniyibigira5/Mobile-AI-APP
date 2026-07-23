// src/theme.ts
//
// The two colour palettes for Milk Check.
//
// Every screen and component reads its colours from here, so switching
// between light and dark is a single toggle. Never hardcode a colour in a
// screen again — add a key here instead.
//
// Design notes:
//   - Warm off-white backgrounds, editorial and paper-like.
//   - Near-black headings, not tinted.
//   - Yellow is the brand accent — used only on the header rule and primary
//     buttons. Buttons carry DARK text (textInverse) because white on yellow
//     is unreadable.
//   - Green is reserved for safe actions and the "Low" risk state.
//   - Amber is Medium risk. Red is High risk. Do not mix these with the
//     yellow accent — they must stay distinct.

export type Theme = {
  /* Backgrounds */
  bg: string;
  card: string;
  cardAlt: string;

  /* Text */
  text: string;
  textMuted: string;
  textInverse: string;

  /* Brand */
  primary: string;
  primaryDark: string;
  primarySoft: string;

  /* Accent (the editorial yellow) */
  accent: string;
  accentSoft: string;

  /* Lines and shadows */
  border: string;
  shadow: string;

  /* Status colours */
  success: string;
  warning: string;
  danger: string;
  neutral: string;

  /* Status backgrounds */
  successBg: string;
  warningBg: string;
  dangerBg: string;
  neutralBg: string;

  /* Gradients */
  gradientPrimary: [string, string];
  gradientHeader: [string, string];
  gradientHero: [string, string];
  gradientAccent: [string, string];
};

export const lightTheme: Theme = {
  bg: '#F7F5EF',
  card: '#FFFFFF',
  cardAlt: '#F2EEE3',

  text: '#14110B',
  textMuted: '#6E6857',
  textInverse: '#14110B',

  primary: '#218A57',
  primaryDark: '#14110B',
  primarySoft: '#E6F1E8',

  accent: '#F5B800',
  accentSoft: '#FFF3CC',

  border: '#E5DFD0',
  shadow: 'rgba(20,17,11,0.08)',

  success: '#1B6B3D',
  warning: '#A66000',
  danger: '#B00020',
  neutral: '#6E6857',

  successBg: '#F0F8F3',
  warningBg: '#FFF6E4',
  dangerBg: '#FBEBEC',
  neutralBg: '#F2EEE3',

  gradientPrimary: ['#F5B800', '#E09E00'],
  gradientHeader: ['#FFFFFF', '#F7F5EF'],
  gradientHero: ['rgba(20,17,11,0.05)', 'rgba(20,17,11,0.78)'],
  gradientAccent: ['#F5B800', '#FFDA47'],
};

export const darkTheme: Theme = {
  bg: '#15130F',
  card: '#1E1B15',
  cardAlt: '#262217',

  text: '#F5F0E4',
  textMuted: '#A39B85',
  textInverse: '#14110B',

  primary: '#3FB950',
  primaryDark: '#F5F0E4',
  primarySoft: '#1E2A22',

  accent: '#F5B800',
  accentSoft: '#3A2E10',

  border: '#3A3529',
  shadow: 'rgba(0,0,0,0.5)',

  success: '#4ADE80',
  warning: '#F5B800',
  danger: '#F87171',
  neutral: '#A39B85',

  successBg: '#12291C',
  warningBg: '#2A1E0A',
  dangerBg: '#2A1113',
  neutralBg: '#262217',

  gradientPrimary: ['#F5B800', '#C98A00'],
  gradientHeader: ['#1E1B15', '#15130F'],
  gradientHero: ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.85)'],
  gradientAccent: ['#F5B800', '#FFDA47'],
};