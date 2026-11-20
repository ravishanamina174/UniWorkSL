import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Text } from 'react-native';
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
  const [safeStep, setSafeStep] = useState(false);
  const [safetyLink, setSafetyLink] = useState('');
  const firstLoad = useRef(true);
  const [error, setError] = useState(configError || '');
  const load = useCallback(async () => { if (!api) { setError(configError || 'API is not configured.'); setLoading(false); return; } try { setError(''); const next = await api.getExecution(taskId); setExecution(next); if (firstLoad.current && next.startRequestedAt && !next.pinVerifiedAt) setSafeStep(true); firstLoad.current = false; } catch (e) { setError(e instanceof Error ? e.message : 'Could not load task progress.'); } finally { setLoading(false); } }, [api, configError, taskId]);
  useEffect(() => { void load(); }, [load]);
  async function requestStart() { if (!api) return; setBusy(true); try { setExecution(await api.requestStart(taskId)); setSafeStep(true); } catch (e) { Alert.alert('Could not request start', e instanceof Error ? e.message : 'Try again.'); } finally { setBusy(false); } }
  async function generateSafetyLink() {
    if (!api || busy) return;
    setBusy(true);
    try {
      const origin = process.env.EXPO_PUBLIC_WEB_BASE_URL?.trim();
      if (!origin || !/^https?:\/\//.test(origin)) throw new Error('Set EXPO_PUBLIC_WEB_BASE_URL to a reachable web address.');
      if (process.env.NODE_ENV === 'production' && !origin.startsWith('https://')) throw new Error('Guardian sharing requires an HTTPS web address in production.');
      const { token } = await api.createSafeTask(taskId);
      setSafetyLink(`${origin.replace(/\/$/, '')}/safetask/share/${token}`);
    } catch (e) { Alert.alert('Could not generate safety link', e instanceof Error ? e.message : 'Please retry or skip for now.'); }
    finally { setBusy(false); }
  }
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
      {execution?.pinVerifiedAt ? <><ScreenHeader title="Start code verified" subtitle="Location check is optional and recorded separately." /><AppButton title="Continue to task" onPress={() => router.replace({ pathname: '/(student)/tasks/[taskId]/complete', params: { taskId } })} /></> : execution?.startRequestedAt && safeStep ? <><ScreenHeader title="SafeTask guardian sharing" subtitle="You can share a private link with a parent or trusted contact. Sharing begins only after the start code is verified." /><Text style={{ color: '#737373', fontSize: 14, lineHeight: 21 }}>Share the link manually by WhatsApp, SMS, or another app. Location updates may be delayed.</Text>{safetyLink ? <><AppButton title="Copy Link" onPress={() => void Clipboard.setStringAsync(safetyLink).then(() => Alert.alert('Link copied', 'Share it with someone you trust.'))} /><AppButton title="Continue & Start Task" onPress={() => setSafeStep(false)} /></> : <><AppButton title="Generate Safety Link" loading={busy} disabled={busy} onPress={() => void generateSafetyLink()} /><AppButton title="Skip for Now" variant="secondary" onPress={() => setSafeStep(false)} /></>}</> : execution?.startRequestedAt ? <><TextField label="Four-digit start code" value={pin} onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" maxLength={4} helper="Only enter the code provided in person by the Task Poster." /><AppButton title="Verify code" loading={busy} disabled={busy} onPress={() => void verify()} /></> : <AppButton title="I am ready to start" loading={busy} onPress={() => void requestStart()} />}
    </Card>
    <AppButton title="Report a safety concern" variant="quiet" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/report', params: { taskId } })} />
  </Screen>;
}
