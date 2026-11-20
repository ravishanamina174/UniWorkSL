import { useColorScheme } from 'react-native';

const light = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  subtle: '#FAFAFA',
  text: '#171717',
  muted: '#737373',
  border: '#E5E5E5',
  borderStrong: '#D4D4D4',
  accent: '#5B55A5',
  accentSoft: '#F0EFFA',
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
  background: '#101010',
  surface: '#1C1C1C',
  subtle: '#171717',
  text: '#F5F5F5',
  muted: '#A3A3A3',
  border: '#303030',
  borderStrong: '#404040',
  accent: '#B3A8FF',
  accentSoft: '#29263F',
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
export const radius = { small: 9, dialog: 14 } as const;
