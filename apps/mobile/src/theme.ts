import { useColorScheme } from 'react-native';

const light = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  subtle: '#FAFAFA',
  text: '#111111',
  muted: '#666666',
  border: '#E5E5E5',
  borderStrong: '#D4D4D4',
  accent: '#7C3AED',
  accentSoft: '#F3EFFF',
  success: '#18794E',
  successSoft: '#EAF7EF',
  warning: '#8A5A00',
  warningSoft: '#FFF5DE',
  danger: '#B42318',
  dangerSoft: '#FFF0EE',
  info: '#175CD3',
  infoSoft: '#EFF6FF',
  onAccent: '#FFFFFF',
};

const dark: typeof light = {
  background: '#0D0D0D',
  surface: '#171717',
  subtle: '#141414',
  text: '#F5F5F5',
  muted: '#A3A3A3',
  border: '#292929',
  borderStrong: '#404040',
  accent: '#A78BFA',
  accentSoft: '#241B38',
  success: '#6BCB91',
  successSoft: '#13251A',
  warning: '#E9B949',
  warningSoft: '#2C2414',
  danger: '#FF8A80',
  dangerSoft: '#311B1A',
  info: '#84ADFF',
  infoSoft: '#172235',
  onAccent: '#171322',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { small: 4, dialog: 6 } as const;
