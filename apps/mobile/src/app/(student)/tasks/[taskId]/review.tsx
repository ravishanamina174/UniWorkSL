import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { AppButton, Card, Screen, ScreenHeader, SelectOption, TextField } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import { useTheme } from '@/theme';

export default function ReviewScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>(); const router = useRouter(); const { api } = useUniWorkApi(); const theme = useTheme();
  const [rating, setRating] = useState(5); const [positive, setPositive] = useState(true); const [review, setReview] = useState(''); const [location, setLocation] = useState(''); const [busy, setBusy] = useState(false);
  async function submit() { if (!api) return; setBusy(true); try { await api.submitReview(taskId, { posterRating: rating, positiveFeedback: positive, reviewText: review.trim() || undefined, locationFeedback: location.trim() || undefined }); Alert.alert('Review submitted', 'Thanks for sharing your experience.', [{ text: 'Done', onPress: () => router.replace('/(student)/(tabs)/applied') }]); } catch (e) { Alert.alert('Could not submit review', e instanceof Error ? e.message : 'Try again.'); } finally { setBusy(false); } }
  return <Screen><ScreenHeader title="Review the Task Poster" subtitle="Share feedback after completing your task."/><Card><Text style={{ color: theme.text, fontWeight: '600' }}>Overall rating</Text><View style={{ flexDirection: 'row', gap: 8 }}>{[1,2,3,4,5].map((n) => <SelectOption key={n} label={`${n} star${n === 1 ? '' : 's'}`} value={String(n)} selected={rating === n} onSelect={() => setRating(n)} />)}</View><Text style={{ color: theme.text, fontWeight: '600' }}>Was the experience positive?</Text><View style={{ flexDirection: 'row', gap: 8 }}><SelectOption label="Yes" value="yes" selected={positive} onSelect={() => setPositive(true)}/><SelectOption label="No" value="no" selected={!positive} onSelect={() => setPositive(false)}/></View><TextField label="Written feedback (optional)" value={review} onChangeText={setReview} multiline maxLength={1000}/><TextField label="Location feedback (optional)" value={location} onChangeText={setLocation} multiline maxLength={500}/><AppButton title="Submit review" loading={busy} onPress={() => void submit()}/></Card></Screen>;
}
