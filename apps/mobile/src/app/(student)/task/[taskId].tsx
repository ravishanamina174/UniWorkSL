import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react-native';
import type { ApplicationStatus, Task } from '@uniwork/api-contracts';
import { AppButton, Card, EmptyState, ErrorState, LoadingState, Screen, ScreenHeader, SectionTitle, SkillBadges, StatusPill, formatDate } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import { useTheme } from '@/theme';
import { ApiRequestError } from '@/lib/api';

export default function TaskDetailsScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { api, error: configError } = useUniWorkApi();
  const router = useRouter();
  const theme = useTheme();
  const [task, setTask] = useState<Task | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(configError || '');
  const [notice, setNotice] = useState('');
  const [verificationRequired, setVerificationRequired] = useState(false);

  const load = useCallback(async () => {
    if (!api) { setError(configError || 'The UniWork API is not configured.'); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const [taskResult, applications] = await Promise.all([api.getTask(taskId), api.listApplications(0)]);
      setTask(taskResult);
      setApplicationStatus(applications.content.find((item) => item.taskId === taskId)?.status || null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load this task.');
    } finally {
      setLoading(false);
    }
  }, [api, configError, taskId]);

  useEffect(() => { void load(); }, [load]);

  async function apply() {
    if (!api || !task) return;
    setApplying(true);
    setNotice('');
    try {
      const application = await api.applyForTask(task.taskId);
      setApplicationStatus(application.status);
      setNotice('Your application was sent to the Task Poster.');
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.code === 'NIC_VERIFICATION_REQUIRED') { setVerificationRequired(true); setNotice('Verify Your NIC to Apply. Complete NIC matching in your profile before applying for tasks.'); }
      else setNotice(cause instanceof Error ? cause.message : 'The application could not be sent.');
    } finally {
      setApplying(false);
    }
  }

  if (loading) return <LoadingState label="Loading task details…" />;
  if (error) return <Screen><ErrorState message={error} onRetry={load} /></Screen>;
  if (!task) return <Screen><EmptyState title="Task not found" detail="This task may no longer be available." /></Screen>;

  const canApply = task.status === 'PUBLISHED' && (!applicationStatus || applicationStatus === 'WITHDRAWN');
  const scheduleStart = task.status === 'ACCEPTED' || task.status === 'STARTED';
  const completed = task.status === 'COMPLETED';
  const mapUrl = `https://www.openstreetmap.org/?mlat=${task.latitude}&mlon=${task.longitude}#map=16/${task.latitude}/${task.longitude}`;

  return (
    <Screen>
      <ScreenHeader title="Task details" subtitle="Review the work, schedule, payment, and location." trailing={<StatusPill status={task.status} />} />
      <Card>
        <Text accessibilityRole="header" style={{ color: theme.text, fontSize: 23, fontWeight: '700', lineHeight: 29 }}>{task.title}</Text>
        <Text style={{ color: theme.text, fontSize: 26, fontWeight: '700' }}>LKR {Number(task.amountLkr).toLocaleString('en-LK')}</Text>
        <Text style={{ color: theme.muted, fontSize: 13 }}>Payment is arranged directly with the Task Poster.</Text>
        <SectionTitle>About the task</SectionTitle>
        <Text style={{ color: theme.text, fontSize: 15, lineHeight: 23 }}>{task.description}</Text>
        <SectionTitle>Required skills</SectionTitle>
        <SkillBadges skills={task.requiredSkills || []} />
        <SectionTitle>Schedule</SectionTitle>
        <Text style={{ color: theme.text, fontSize: 14 }}>{formatDate(task.taskDateTime)}</Text>
        <SectionTitle>Task location</SectionTitle>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <MapPin size={17} color={theme.accent} />
          <Text style={{ flex: 1, color: theme.text, fontSize: 14, lineHeight: 21 }}>{task.locationAddress}</Text>
        </View>
        <Text style={{ color: theme.muted, fontSize: 12 }}>Coordinates: {task.latitude}, {task.longitude}</Text>
        <AppButton title="Open in OpenStreetMap" icon={Navigation} variant="secondary" onPress={() => { void Linking.openURL(mapUrl).catch(() => Alert.alert('Map unavailable', 'Could not open the external map.')); }} />
      </Card>
      {applicationStatus ? <Card><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><Text style={{ color: theme.text, fontWeight: '600' }}>Your application</Text><StatusPill status={applicationStatus} /></View></Card> : null}
      {notice ? <Text accessibilityRole="alert" style={{ color: notice.includes('could not') || notice.includes('no longer') ? theme.danger : theme.success, fontSize: 14 }}>{notice}</Text> : null}
      {verificationRequired ? <AppButton title="Open Profile to verify NIC" variant="secondary" onPress={() => router.push('/(student)/(tabs)/profile')} /> : null}
      {canApply ? <AppButton title="Apply for this task" onPress={apply} loading={applying} /> : null}
      {scheduleStart ? <AppButton title={task.status === 'STARTED' ? 'View task start' : 'Start task'} icon={ShieldCheck} onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/start', params: { taskId } })} /> : null}
      {completed ? <AppButton title="Leave a review" variant="secondary" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/review', params: { taskId } })} /> : null}
      {!canApply && !scheduleStart && !completed && !applicationStatus ? <Card><Text style={{ color: theme.muted, fontSize: 14 }}>This task is not accepting applications right now.</Text></Card> : null}
    </Screen>
  );
}
