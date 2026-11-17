import { BookOpenCheck, MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '@/theme';

export function BrandMark() {
  const theme = useTheme();
  return (
    <View style={[styles.mark, { backgroundColor: theme.accent }]}>
      <BookOpenCheck size={22} color={theme.onAccent} strokeWidth={2.2} />
    </View>
  );
}

export function Wordmark() {
  const theme = useTheme();
  return <View style={styles.wordmark}><BrandMark /><Text style={[styles.wordmarkText, { color: theme.text }]}>UniWork</Text></View>;
}

export function LocationBadge({ address }: { address: string }) {
  const theme = useTheme();
  return <View style={styles.location}><MapPin size={15} color={theme.muted} /><Text numberOfLines={2} style={[styles.locationText, { color: theme.muted }]}>{address}</Text></View>;
}

const styles = StyleSheet.create({
  mark: { width: 42, height: 42, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wordmarkText: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  location: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, flex: 1 },
  locationText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
