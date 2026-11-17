import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AppButton, Card, ErrorState, LoadingState, Screen, ScreenHeader, StatusPill, TextField } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import type { StudentTaskExecution } from '@uniwork/api-contracts';

export default function StartTaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const { api, error: configError } = useUniWorkApi();
  const [execution, setExecution] = useState<StudentTaskExecution | null>(null);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(configError || '');
  const load = useCallback(async () => { if (!api) { setError(configError || 'API is not configured.'); setLoading(false); return; } try { setError(''); setExecution(await api.getExecution(taskId)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load task progress.'); } finally { setLoading(false); } }, [api, configError, taskId]);
  useEffect(() => { void load(); }, [load]);
  async function requestStart() { if (!api) return; setBusy(true); try { setExecution(await api.requestStart(taskId)); } catch (e) { Alert.alert('Could not request start', e instanceof Error ? e.message : 'Try again.'); } finally { setBusy(false); } }
  async function verify() {
    if (!api) return;
    if (!/^\d{4}$/.test(pin)) { Alert.alert('Enter the four-digit code', 'Ask the Task Poster for the start code when you meet.'); return; }
    setBusy(true);
    try {
      const result = await api.verifyPin(taskId, pin);
      if (!result.verified) { setPin(''); Alert.alert('Code not accepted', result.locked ? 'No attempts remain. Contact UniWork support.' : `Check with the Task Poster. ${result.attemptsRemaining} attempts remain.`); await load(); return; }
      let permissionGranted = false;
      let locationAvailable = false;
      let coords: { latitude: number; longitude: number; accuracyMeters?: number } = { latitude: 0, longitude: 0 };
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        permissionGranted = permission.granted;
        if (permissionGranted) {
          const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          locationAvailable = true;
          coords = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracyMeters: position.coords.accuracy ?? undefined };
        }
      } catch { locationAvailable = false; }
      setExecution(await api.checkLocation(taskId, { permissionGranted, locationAvailable, ...(locationAvailable ? coords : {}) }));
      Alert.alert('Task started', 'Your start code was verified. Location check status is recorded separately and does not change task access.', [{ text: 'Continue', onPress: () => router.replace({ pathname: '/(student)/tasks/[taskId]/complete', params: { taskId } }) }]);
    } catch (e) { Alert.alert('Could not verify code', e instanceof Error ? e.message : 'Try again.'); }
    finally { setBusy(false); }
  }
  if (loading) return <LoadingState />;
  if (error) return <Screen><ErrorState message={error} onRetry={load} /></Screen>;
  return <Screen><ScreenHeader title="Start this task" subtitle="Meet the Task Poster and ask them for the start code." />
    <Card><StatusPill status={execution?.status || 'ACCEPTED'} /><ScreenHeader title={execution?.title || 'Task'} subtitle={`LKR ${Number(execution?.amountLkr || 0).toLocaleString('en-LK')}`} />
      {execution?.pinVerifiedAt ? <><ScreenHeader title="Start code verified" subtitle="Location check is optional and recorded separately." /><AppButton title="Continue to task" onPress={() => router.replace({ pathname: '/(student)/tasks/[taskId]/complete', params: { taskId } })} /></> : execution?.startRequestedAt ? <><TextField label="Four-digit start code" value={pin} onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" maxLength={4} helper="Only enter the code provided in person by the Task Poster." /><AppButton title="Verify code" loading={busy} disabled={busy} onPress={() => void verify()} /></> : <AppButton title="I am ready to start" loading={busy} onPress={() => void requestStart()} />}
    </Card>
    <AppButton title="Report a safety concern" variant="quiet" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/report', params: { taskId } })} />
  </Screen>;
}
