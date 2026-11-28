import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { CalendarDays, MapPin } from 'lucide-react-native';
import { AppButton, Card, EmptyState, ErrorState, LoadingState, Screen, ScreenHeader, StatusPill, TextField, formatDate } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import type { DirectTask } from '@/lib/api';
import { useTheme } from '@/theme';

export default function DirectTasksScreen() {
  const { api, error: configError } = useUniWorkApi();
  const theme = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<DirectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(configError || '');
  const [counter, setCounter] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const load = useCallback(async () => {
    if (!api) { setLoading(false); setError(configError || 'API is not configured.'); return; }
    setLoading(true);
    try { setItems(await api.listDirectTasks()); setError(''); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load direct tasks.'); }
    finally { setLoading(false); }
  }, [api, configError]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function act(item: DirectTask, action: 'ACCEPT' | 'DECLINE' | 'COUNTER') {
    if (!api || busy) return;
    const amount = action === 'COUNTER' ? Number(counter[item.directTaskId]) : undefined;
    if (action === 'COUNTER' && (!Number.isFinite(amount) || !amount || amount <= 0)) {
      Alert.alert('Enter a valid amount', 'Use a positive LKR amount for your counteroffer.'); return;
    }
    setBusy(item.directTaskId);
    try {
      const updated = await api.actOnDirectTask(item.directTaskId, action, amount);
      setItems((all) => all.map((value) => value.directTaskId === item.directTaskId ? updated : value));
    } catch (cause) { Alert.alert('Could not update offer', cause instanceof Error ? cause.message : 'Please try again.'); }
    finally { setBusy(''); }
  }

  return <Screen keyboardAware refreshing={loading} onRefresh={() => void load()}>
    <ScreenHeader title="Direct Tasks" subtitle="Private task offers sent to you by Task Posters." />
    {loading ? <LoadingState label="Loading offers…" /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : items.length === 0 ? <EmptyState title="No direct offers yet" detail="When a Task Poster sends you an offer, it will appear here with the budget, location and next steps." /> : items.map((item) =>
      <Card key={item.directTaskId} style={{ gap: 14 }}>
        <View style={styles.heading}><View style={styles.headingCopy}><Text style={[styles.eyebrow, { color: theme.muted }]}>FROM {item.posterName}</Text><Text style={[styles.title, { color: theme.text }]}>Direct offer</Text></View><StatusPill status={item.status} /></View>
        <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
        <Text style={[styles.amount, { color: theme.accent }]}>LKR {Number(item.amountLkr).toLocaleString('en-LK')}</Text>
        <View style={[styles.details, { borderColor: theme.border, backgroundColor: theme.subtle }]}>
          <View style={styles.detailRow}><CalendarDays size={16} color={theme.muted} /><Text style={[styles.detailText, { color: theme.muted }]}>{formatDate(item.scheduledAt)}</Text></View>
          <View style={styles.detailRow}><MapPin size={16} color={theme.muted} /><Text style={[styles.detailText, { color: theme.muted }]}>{item.locationAddress}</Text></View>
        </View>
        {item.status === 'SENT' ? <View style={styles.actions}>
          <Text style={[styles.helper, { color: theme.muted }]}>Review the work, time, location and budget before accepting.</Text>
          <AppButton title="Accept offer" loading={busy === item.directTaskId} disabled={Boolean(busy)} onPress={() => void act(item, 'ACCEPT')} />
          <AppButton title="Decline offer" variant="secondary" disabled={Boolean(busy)} onPress={() => void act(item, 'DECLINE')} />
          <View style={[styles.counter, { borderColor: theme.border }]}><Text style={[styles.counterTitle, { color: theme.text }]}>Need a different budget?</Text><TextField label="Your proposed amount (LKR)" keyboardType="decimal-pad" returnKeyType="done" value={counter[item.directTaskId] || ''} onChangeText={(value) => setCounter((all) => ({ ...all, [item.directTaskId]: value }))} /><AppButton title="Send counteroffer" variant="secondary" disabled={Boolean(busy)} onPress={() => void act(item, 'COUNTER')} /></View>
        </View> : item.status === 'COUNTEROFFERED' ? <Text style={[styles.helper, { color: theme.muted }]}>Your proposal of LKR {Number(item.counterAmountLkr).toLocaleString('en-LK')} is waiting for the Task Poster.</Text> : item.status === 'ACCEPTED' ? <View style={styles.actions}><Text style={[styles.helper, { color: theme.muted }]}>Offer accepted. Open the task to see the next steps.</Text>{item.taskId ? <AppButton title="Open task details" onPress={() => router.push({ pathname: '/(student)/task/[taskId]', params: { taskId: item.taskId! } })} /> : null}</View> : <Text style={[styles.helper, { color: theme.muted }]}>This offer is closed. No further action is needed.</Text>}
      </Card>)}
  </Screen>;
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  headingCopy: { flex: 1, gap: 4 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  title: { fontSize: 19, lineHeight: 24, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 23 },
  amount: { fontSize: 22, fontWeight: '700' },
  details: { gap: 10, padding: 12, borderWidth: 1, borderRadius: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  detailText: { flex: 1, fontSize: 13, lineHeight: 19 },
  helper: { fontSize: 13, lineHeight: 19 },
  actions: { gap: 9 },
  counter: { gap: 10, marginTop: 5, padding: 14, borderTopWidth: 1 },
  counterTitle: { fontSize: 14, fontWeight: '700' },
});
