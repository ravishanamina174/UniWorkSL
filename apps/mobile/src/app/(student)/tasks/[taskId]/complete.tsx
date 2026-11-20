import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { AppButton, Card, ErrorState, LoadingState, Screen, ScreenHeader, StatusPill } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import type { StudentTaskExecution } from '@uniwork/api-contracts';

export default function CompleteTaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>(); const router = useRouter(); const { api, error: configError } = useUniWorkApi();
  const [execution, setExecution] = useState<StudentTaskExecution | null>(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(configError || '');
  const [sharing, setSharing] = useState<{ status: string; expiresAt: string | null } | null>(null);
  const sharingStatus = sharing?.status;
  const load = useCallback(async () => { if (!api) { setError(configError || 'API is not configured.'); setLoading(false); return; } try { setError(''); setExecution(await api.getExecution(taskId)); setSharing(await api.getSafeTask(taskId)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load task.'); } finally { setLoading(false); } }, [api, configError, taskId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!api || !sharingStatus || !['ACTIVE', 'SAFETY_WINDOW'].includes(sharingStatus)) return;
    let cancelled = false;
    async function update() {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted || cancelled) return;
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!cancelled && api) await api.updateSafeTaskLocation(taskId, position.coords.latitude, position.coords.longitude, position.coords.accuracy ?? undefined);
      } catch { /* The next foreground update can retry after GPS or connectivity returns. */ }
    }
    void update(); const timer = setInterval(() => void update(), 4 * 60_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [api, sharingStatus, taskId]);
  async function stopSharing() { if (!api) return; setBusy(true); try { setSharing(await api.stopSafeTask(taskId)); } catch (e) { Alert.alert('Could not stop sharing', e instanceof Error ? e.message : 'Try again.'); } finally { setBusy(false); } }
  function confirm(paymentReceived: boolean) { Alert.alert('Confirm task completion?', paymentReceived ? 'You confirm the task is complete and the Task Poster paid you directly.' : 'You confirm the task is complete, but payment has not been received. UniWork does not process this payment.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: async () => { if (!api || busy) return; setBusy(true); try { await api.completeTask(taskId, paymentReceived); const next = await api.getSafeTask(taskId); setSharing(next); setExecution(await api.getExecution(taskId)); if (next.status === 'SAFETY_WINDOW') { Alert.alert('Are you safe?', 'Your location will remain shared with your trusted contact for up to one hour after completing this task. You can stop sharing now if you are safe.', [{ text: 'Keep Sharing' }, { text: "I'm Safe — Stop Sharing", onPress: () => void stopSharing() }]); } else if (!paymentReceived) { Alert.alert('Completion recorded', 'Would you like to report the unpaid payment?', [{ text: 'Later', onPress: () => router.replace('/(student)/(tabs)/applied') }, { text: 'Report issue', onPress: () => router.push({ pathname: '/(student)/tasks/[taskId]/report', params: { taskId, category: 'NON_PAYMENT' } }) }]); } else router.replace({ pathname: '/(student)/tasks/[taskId]/review', params: { taskId } }); } catch (e) { Alert.alert('Could not record completion', e instanceof Error ? e.message : 'Try again.'); } finally { setBusy(false); } } }]); }
  if (loading) return <LoadingState />; if (error) return <Screen><ErrorState message={error} onRetry={load} /></Screen>;
  return <Screen><ScreenHeader title="Complete task" subtitle="UniWork records your confirmation. Payment is arranged directly with the Task Poster." />{sharing && ['ACTIVE', 'SAFETY_WINDOW'].includes(sharing.status) && <Card><ScreenHeader title={sharing.status === 'SAFETY_WINDOW' ? 'Safety window active' : 'Safety sharing active'} subtitle={sharing.expiresAt ? `Guardian access ends ${new Date(sharing.expiresAt).toLocaleString()}` : 'Your trusted contact can view your latest shared location.'} /><AppButton title="Stop Sharing" variant="secondary" loading={busy} onPress={() => void stopSharing()} /></Card>}<Card><StatusPill status={execution?.status || 'STARTED'} /><ScreenHeader title={execution?.title || 'Task'} subtitle={`Agreed amount: LKR ${Number(execution?.amountLkr || 0).toLocaleString('en-LK')}`} />
    {execution?.status === 'COMPLETED' ? <><ScreenHeader title="Completion recorded" subtitle={execution.paymentReceived ? 'Payment received was confirmed.' : 'Payment is still unresolved.'} /><AppButton title="Review Task Poster" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/review', params: { taskId } })} />{!execution.paymentReceived && <AppButton title="Report unpaid payment" variant="secondary" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/report', params: { taskId, category: 'NON_PAYMENT' } })} />}</> : <><AppButton title="Task complete and payment received" loading={busy} onPress={() => confirm(true)} /><AppButton title="Task complete, payment not received" variant="secondary" loading={busy} onPress={() => confirm(false)} /></>}</Card>
  </Screen>;
}
