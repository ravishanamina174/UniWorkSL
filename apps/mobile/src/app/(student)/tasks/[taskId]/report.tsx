import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type { SafetyReportCategory } from '@uniwork/api-contracts';
import { AppButton, Card, Screen, ScreenHeader, SelectOption, TextField } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import { useTheme } from '@/theme';

const categories: { value: SafetyReportCategory; label: string }[] = [
  { value: 'UNSAFE_LOCATION', label: 'Unsafe location' }, { value: 'HARASSMENT', label: 'Harassment' }, { value: 'MISLEADING_TASK', label: 'Misleading task' }, { value: 'NON_PAYMENT', label: 'Payment not received' }, { value: 'OTHER', label: 'Other concern' },
];
export default function ReportScreen() {
  const { taskId, category: initialCategory } = useLocalSearchParams<{ taskId: string; category?: SafetyReportCategory }>(); const router = useRouter(); const { api } = useUniWorkApi(); const theme = useTheme();
  const [category, setCategory] = useState<SafetyReportCategory>(categories.some((item) => item.value === initialCategory) ? initialCategory! : 'OTHER'); const [description, setDescription] = useState(''); const [busy, setBusy] = useState(false);
  async function submit() { if (!api) return; if (description.trim().length < 10) { Alert.alert('Add more detail', 'Please describe the concern in at least 10 characters.'); return; } Alert.alert('Submit private report?', 'This report will be sent to UniWork for review.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Submit report', onPress: async () => { setBusy(true); try { await api.submitReport(taskId, { category, description: description.trim() }); Alert.alert('Report submitted', 'Your report has been sent for review.', [{ text: 'Done', onPress: () => router.replace('/(student)/(tabs)/applied') }]); } catch (e) { Alert.alert('Could not submit report', e instanceof Error ? e.message : 'Try again.'); } finally { setBusy(false); } } }]); }
  return <Screen><ScreenHeader title="Report a concern" subtitle="Tell UniWork about a safety, conduct, task, or payment issue."/><Card><Text style={{ color: theme.text, fontWeight: '600' }}>Report category</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{categories.map((item) => <SelectOption key={item.value} label={item.label} value={item.value} selected={category === item.value} onSelect={setCategory}/>)}</View><TextField label="What happened?" value={description} onChangeText={setDescription} multiline maxLength={2000} helper="Include relevant details. Do not include passwords or payment card information."/><AppButton title="Submit private report" loading={busy} onPress={() => void submit()}/></Card></Screen>;
}
