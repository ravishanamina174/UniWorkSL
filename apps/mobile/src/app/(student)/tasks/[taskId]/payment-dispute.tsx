import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type { PaymentDispute, PaymentDisputeReason, StudentTaskExecution } from '@uniwork/api-contracts';
import { AppButton, Card, ErrorState, LoadingState, Screen, ScreenHeader, SelectOption, TextField } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import { useTheme } from '@/theme';

export default function PaymentDisputeScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter(); const theme = useTheme(); const { api, error: configError } = useUniWorkApi();
  const [execution, setExecution] = useState<StudentTaskExecution | null>(null);
  const [existing, setExisting] = useState<PaymentDispute[]>([]);
  const [reason, setReason] = useState<PaymentDisputeReason>('PAYMENT_NOT_RECEIVED');
  const [received, setReceived] = useState(''); const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(configError || '');
  const alreadyFiled = existing.some((item) => item.reason === reason);
  const load = useCallback(async () => {
    if (!api) { setError(configError || 'The UniWork API is not configured.'); setLoading(false); return; }
    try { const [task, cases] = await Promise.all([api.getExecution(taskId), api.listPaymentDisputes(taskId)]); setExecution(task); setExisting(cases); setError(''); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load payment details.'); }
    finally { setLoading(false); }
  }, [api, configError, taskId]);
  useEffect(() => { void load(); }, [load]);
  async function submit() {
    if (!api || busy) return;
    if (statement.trim().length < 10) { Alert.alert('Add more detail', 'Describe the payment issue in at least 10 characters.'); return; }
    const amount = reason === 'INCORRECT_PAYMENT_AMOUNT' ? Number(received) : undefined;
    if (reason === 'INCORRECT_PAYMENT_AMOUNT' && (!received.trim() || !Number.isFinite(amount) || amount! < 0)) { Alert.alert('Check the amount', 'Enter the amount you received in LKR.'); return; }
    Alert.alert('Submit payment complaint?', 'UniWork will record both sides of this direct payment arrangement. It cannot independently verify a payment.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit complaint', onPress: async () => {
        setBusy(true);
        try { await api.filePaymentDispute(taskId, { reason, actualAmountLkr: amount, statement: statement.trim() }); Alert.alert('Complaint submitted', 'The Task Poster can respond and UniWork safety administrators can review this case.', [{ text: 'Done', onPress: () => router.replace('/(student)/(tabs)/applied') }]); }
        catch (cause) { Alert.alert('Could not submit complaint', cause instanceof Error ? cause.message : 'Please try again.'); }
        finally { setBusy(false); }
      } },
    ]);
  }
  if (loading) return <LoadingState />;
  if (error) return <Screen><ErrorState message={error} onRetry={load} /></Screen>;
  return <Screen><ScreenHeader title="Payment complaint" subtitle="For a completed task. UniWork records the issue but does not process payments or issue refunds." />
    <Card><Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>{execution?.title}</Text><Text style={{ color: theme.muted }}>Agreed amount: LKR {Number(execution?.amountLkr || 0).toLocaleString('en-LK')}</Text></Card>
    {existing.length > 0 && <Card><ScreenHeader title="Existing complaints" subtitle="Your submitted cases remain available for review." />{existing.map((item) => <View key={item.disputeId} style={{ gap: 3 }}><Text style={{ color: theme.text, fontWeight: '600' }}>{item.reason === 'PAYMENT_NOT_RECEIVED' ? 'Payment not received' : 'Incorrect amount'} · {item.status.replaceAll('_', ' ')}</Text><Text style={{ color: theme.muted, fontSize: 12 }}>{item.studentStatement}</Text></View>)}</Card>}
    {execution?.status === 'COMPLETED' && <Card><ScreenHeader title="Describe the issue" subtitle="Choose the reason that best matches what happened." /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><SelectOption label="Payment not received" value="PAYMENT_NOT_RECEIVED" selected={reason === 'PAYMENT_NOT_RECEIVED'} onSelect={setReason} /><SelectOption label="Incorrect payment amount" value="INCORRECT_PAYMENT_AMOUNT" selected={reason === 'INCORRECT_PAYMENT_AMOUNT'} onSelect={setReason} /></View>
      {reason === 'INCORRECT_PAYMENT_AMOUNT' && <TextField label="Amount actually received (LKR)" value={received} onChangeText={setReceived} keyboardType="decimal-pad" helper="Use zero if no amount was received." />}
      <TextField label="What happened?" value={statement} onChangeText={setStatement} multiline maxLength={2000} helper="Describe the agreement and payment conversation. Do not include bank account or card details." />
      {alreadyFiled && <Text style={{ color: theme.muted, fontSize: 12 }}>A complaint for this reason is already on record.</Text>}
      <AppButton title="Submit payment complaint" disabled={alreadyFiled} loading={busy} onPress={() => void submit()} /></Card>}
  </Screen>;
}
