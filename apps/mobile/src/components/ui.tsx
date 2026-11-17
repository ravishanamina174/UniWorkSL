import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { Task, TaskStatus } from '@uniwork/api-contracts';
import { radius, spacing, useTheme } from '@/theme';

export function Screen({ children, scroll = true, refreshing, onRefresh }: { children: ReactNode; scroll?: boolean; refreshing?: boolean; onRefresh?: () => void }) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {scroll ? <ScrollView contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled" refreshControl={onRefresh ? <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} tintColor={theme.accent} /> : undefined}>{children}</ScrollView> : <View style={styles.screenContent}>{children}</View>}
    </SafeAreaView>
  );
}

export function ScreenHeader({ title, subtitle, trailing }: { title: string; subtitle?: string; trailing?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text accessibilityRole="header" style={[styles.heading, { color: theme.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]}>{children}</View>;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon: Icon,
  accessibilityLabel,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'quiet';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const colors = {
    primary: { backgroundColor: theme.accent, borderColor: theme.accent, color: theme.onAccent },
    secondary: { backgroundColor: theme.surface, borderColor: theme.borderStrong, color: theme.text },
    danger: { backgroundColor: theme.dangerSoft, borderColor: theme.dangerSoft, color: theme.danger },
    quiet: { backgroundColor: 'transparent', borderColor: 'transparent', color: theme.accent },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.button, colors, (pressed || disabled) && styles.buttonPressed]}
    >
      {loading ? <ActivityIndicator color={colors.color} /> : Icon ? <Icon size={18} color={colors.color} /> : null}
      <Text style={[styles.buttonText, { color: colors.color }]}>{title}</Text>
    </Pressable>
  );
}

export function TextField({
  label,
  error,
  helper,
  style,
  ...props
}: Omit<ComponentProps<typeof TextInput>, 'style'> & { label: string; error?: string; helper?: string; style?: object }) {
  const theme = useTheme();
  return (
    <View style={[styles.fieldWrap, style]}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.muted}
        selectionColor={theme.accent}
        {...props}
        style={[styles.input, { backgroundColor: theme.surface, borderColor: error ? theme.danger : theme.borderStrong, color: theme.text }, props.multiline && styles.multiline]}
      />
      {error ? <Text accessibilityRole="alert" style={[styles.helper, { color: theme.danger }]}>{error}</Text> : helper ? <Text style={[styles.helper, { color: theme.muted }]}>{helper}</Text> : null}
    </View>
  );
}

export function SelectOption<T extends string>({ label, value, selected, onSelect }: { label: string; value: T; selected: boolean; onSelect: (value: T) => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={() => onSelect(value)}
      style={[styles.option, { backgroundColor: selected ? theme.accentSoft : theme.surface, borderColor: selected ? theme.accent : theme.border }]}
    >
      <Text style={{ color: selected ? theme.accent : theme.text, fontSize: 14, fontWeight: selected ? '600' : '400' }}>{label}</Text>
    </Pressable>
  );
}

export function StatusPill({ status }: { status: string }) {
  const theme = useTheme();
  const palette = statusPalette(status, theme);
  return <View style={[styles.pill, { backgroundColor: palette.background }]}><Text style={{ color: palette.text, fontSize: 12, fontWeight: '600' }}>{formatStatus(status)}</Text></View>;
}

export function SkillBadges({ skills }: { skills: string[] }) {
  const theme = useTheme();
  if (!skills.length) return null;
  return <View style={styles.wrap}>{skills.slice(0, 4).map((skill) => <View key={skill} style={[styles.skill, { backgroundColor: theme.subtle, borderColor: theme.border }]}><Text style={{ color: theme.muted, fontSize: 12 }}>{skill}</Text></View>)}</View>;
}

export function TaskCard({ task, onPress, applied }: { task: Task; onPress: () => void; applied?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${task.title}`} onPress={onPress}>
      <Card>
        <View style={styles.taskTop}>
          <View style={styles.flex}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{task.title}</Text>
            <Text numberOfLines={2} style={[styles.body, { color: theme.muted }]}>{task.description}</Text>
          </View>
          {applied ? <StatusPill status="APPLIED" /> : null}
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.amount, { color: theme.text }]}>LKR {Number(task.amountLkr).toLocaleString('en-LK')}</Text>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}><MapPin size={14} color={theme.muted} /><Text numberOfLines={1} style={[styles.meta, { color: theme.muted, flex: 1 }]}>{task.locationAddress}</Text></View>
        </View>
        <SkillBadges skills={task.requiredSkills || []} />
        <Text style={[styles.meta, { color: theme.muted }]}>{formatDate(task.taskDateTime)}</Text>
        <Text style={[styles.link, { color: theme.accent }]}>View details →</Text>
      </Card>
    </Pressable>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const theme = useTheme();
  return <View accessibilityRole="progressbar" style={styles.state}><ActivityIndicator color={theme.accent} /><Text style={[styles.stateText, { color: theme.muted }]}>{label}</Text></View>;
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  const theme = useTheme();
  return <View style={styles.state}><Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text><Text style={[styles.body, { color: theme.muted, textAlign: 'center' }]}>{detail}</Text>{action}</View>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const theme = useTheme();
  return <View style={styles.state}><Text accessibilityRole="alert" style={[styles.body, { color: theme.danger, textAlign: 'center' }]}>{message}</Text>{onRetry ? <AppButton title="Try again" onPress={onRetry} variant="secondary" /> : null}</View>;
}

export function SectionTitle({ children }: { children: string }) {
  const theme = useTheme();
  return <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>{children}</Text>;
}

export function taskStatusLabel(status: TaskStatus): string {
  return formatStatus(status);
}

function statusPalette(status: string, theme: ReturnType<typeof useTheme>) {
  if (['COMPLETED', 'STARTED', 'VERIFIED'].includes(status)) return { background: theme.successSoft, text: theme.success };
  if (['REJECTED', 'CANCELLED', 'WITHDRAWN', 'FAILED'].includes(status)) return { background: theme.dangerSoft, text: theme.danger };
  if (['PENDING', 'PIN_PENDING', 'ACCEPTED', 'ONGOING'].includes(status)) return { background: theme.warningSoft, text: theme.warning };
  return { background: theme.infoSoft, text: theme.info };
}

export function formatStatus(status: string): string {
  return status.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace('T', ' ');
  return new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  screenContent: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.xs },
  headerCopy: { flex: 1, gap: spacing.xs },
  heading: { fontSize: 28, fontWeight: '700', letterSpacing: -0.6 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: radius.small, padding: spacing.md, gap: spacing.sm },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 21 },
  button: { minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderRadius: radius.small, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  buttonText: { fontSize: 15, fontWeight: '600' },
  buttonPressed: { opacity: 0.66 },
  fieldWrap: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: '600' },
  input: { minHeight: 48, borderWidth: 1, borderRadius: radius.small, paddingHorizontal: 12, paddingVertical: 11, fontSize: 16 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  helper: { fontSize: 12, lineHeight: 17 },
  option: { minHeight: 42, justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.small, borderWidth: 1 },
  pill: { minHeight: 24, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.small },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  skill: { borderWidth: 1, borderRadius: radius.small, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  taskTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  flex: { flex: 1, gap: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  amount: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 12, lineHeight: 18, flexShrink: 1 },
  link: { fontSize: 14, fontWeight: '600' },
  state: { flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  stateText: { fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginTop: spacing.xs },
});
