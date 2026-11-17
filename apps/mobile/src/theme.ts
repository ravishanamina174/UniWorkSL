import { useColorScheme } from 'react-native';

const light = {
  background: '#F8F8F5',
  surface: '#FFFFFF',
  subtle: '#F0F1EB',
  text: '#292B27',
  muted: '#686D64',
  border: '#E2E4DD',
  borderStrong: '#C9CEC3',
  accent: '#4F7D32',
  accentSoft: '#EAF0E4',
  success: '#32683B',
  successSoft: '#E8F1E8',
  warning: '#805A19',
  warningSoft: '#F7F0DD',
  danger: '#A3413B',
  dangerSoft: '#F6E9E7',
  info: '#425B9A',
  infoSoft: '#E9EDF6',
  onAccent: '#FFFFFF',
};

const dark: typeof light = {
  background: '#171A16',
  surface: '#20241F',
  subtle: '#252A23',
  text: '#F3F4EF',
  muted: '#B0B7AA',
  border: '#353C32',
  borderStrong: '#485344',
  accent: '#A5C58B',
  accentSoft: '#2A3824',
  success: '#9BC89A',
  successSoft: '#253527',
  warning: '#E4C47A',
  warningSoft: '#3A3321',
  danger: '#E8A09A',
  dangerSoft: '#3B2928',
  info: '#A9B9E3',
  infoSoft: '#293247',
  onAccent: '#172113',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { small: 4, dialog: 6 } as const;
