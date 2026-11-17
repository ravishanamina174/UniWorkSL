import { MapPin } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '@/theme';

export function BrandMark() {
  const theme = useTheme();
  return (
    <View style={styles.mark}>
      <Svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" accessibilityElementsHidden>
        <Path d="M24 3.5 43.5 14.75v18.5L24 44.5 4.5 33.25v-18.5L24 3.5Z" stroke={theme.text} strokeWidth={1.7} strokeLinejoin="round" />
        <Path d="m4.8 14.9 19.2 11 19.2-11M24 26v18" stroke={theme.text} strokeWidth={1.7} strokeLinejoin="round" />
        <Path d="M29.2 21.6v6.5c0 3 2 4.6 4.1 4.6s4.1-1.6 4.1-4.6v-6.5" stroke={theme.accent} strokeWidth={1.6} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

export function Wordmark() {
  const theme = useTheme();
  return <View style={styles.wordmark}><BrandMark /><Text style={[styles.wordmarkText, { color: theme.text }]}>UniWorkSL</Text></View>;
}

export function LocationBadge({ address }: { address: string }) {
  const theme = useTheme();
  return <View style={styles.location}><MapPin size={15} color={theme.muted} /><Text numberOfLines={2} style={[styles.locationText, { color: theme.muted }]}>{address}</Text></View>;
}

const styles = StyleSheet.create({
  mark: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wordmarkText: { fontSize: 20, fontWeight: '700', letterSpacing: -0.8 },
  location: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, flex: 1 },
  locationText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
