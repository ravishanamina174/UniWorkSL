import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AppButton, Card, ErrorState, LoadingState, Screen, ScreenHeader, StatusPill } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import type { StudentTaskExecution } from '@uniwork/api-contracts';

export default function CompleteTaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>(); const router = useRouter(); const { api, error: configError } = useUniWorkApi();
  const [execution, setExecution] = useState<StudentTaskExecution | null>(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(configError || '');
  const load = useCallback(async () => { if (!api) { setError(configError || 'API is not configured.'); setLoading(false); return; } try { setError(''); setExecution(await api.getExecution(taskId)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load task.'); } finally { setLoading(false); } }, [api, configError, taskId]);
  useEffect(() => { void load(); }, [load]);
  function confirm(paymentReceived: boolean) { Alert.alert('Confirm task completion?', paymentReceived ? 'You confirm the task is complete and the Task Poster paid you directly.' : 'You confirm the task is complete, but payment has not been received. UniWork does not process this payment.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: async () => { if (!api) return; setBusy(true); try { await api.completeTask(taskId, paymentReceived); if (!paymentReceived) { Alert.alert('Completion recorded', 'Would you like to report the unpaid payment?', [{ text: 'Later', onPress: () => router.replace('/(student)/(tabs)/applied') }, { text: 'Report issue', onPress: () => router.push({ pathname: '/(student)/tasks/[taskId]/report', params: { taskId, category: 'NON_PAYMENT' } }) }]); } else router.replace({ pathname: '/(student)/tasks/[taskId]/review', params: { taskId } }); } catch (e) { Alert.alert('Could not record completion', e instanceof Error ? e.message : 'Try again.'); } finally { setBusy(false); } } }]); }
  if (loading) return <LoadingState />; if (error) return <Screen><ErrorState message={error} onRetry={load} /></Screen>;
  return <Screen><ScreenHeader title="Complete task" subtitle="UniWork records your confirmation. Payment is arranged directly with the Task Poster." /><Card><StatusPill status={execution?.status || 'STARTED'} /><ScreenHeader title={execution?.title || 'Task'} subtitle={`Agreed amount: LKR ${Number(execution?.amountLkr || 0).toLocaleString('en-LK')}`} />
    {execution?.status === 'COMPLETED' ? <><ScreenHeader title="Completion recorded" subtitle={execution.paymentReceived ? 'Payment received was confirmed.' : 'Payment is still unresolved.'} /><AppButton title="Review Task Poster" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/review', params: { taskId } })} /></> : <><AppButton title="Task complete and payment received" loading={busy} onPress={() => confirm(true)} /><AppButton title="Task complete, payment not received" variant="secondary" loading={busy} onPress={() => confirm(false)} /></>}</Card>
  </Screen>;
}
