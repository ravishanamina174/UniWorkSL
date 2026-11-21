import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { StudentTaskApplication, StudentTaskExecution } from '@uniwork/api-contracts';
import { AppButton, Card, EmptyState, ErrorState, LoadingState, Screen, ScreenHeader, StatusPill, formatDate } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import { useTheme } from '@/theme';

const statusFilters = ['ALL', 'PENDING', 'ACCEPTED', 'STARTED', 'COMPLETED', 'REJECTED', 'WITHDRAWN'] as const;
type FilterStatus = typeof statusFilters[number];

type AppliedRow = {
  id: string;
  taskId: string;
  title: string;
  status: string;
  date: string;
  detail: string;
  source: 'application' | 'execution';
};

export default function AppliedTasksScreen() {
  const { api, error: configError } = useUniWorkApi();
  const router = useRouter();
  const theme = useTheme();
  const [applications, setApplications] = useState<StudentTaskApplication[]>([]);
  const [active, setActive] = useState<StudentTaskExecution[]>([]);
  const [history, setHistory] = useState<StudentTaskExecution[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(configError || '');

  const load = useCallback(async () => {
    if (!api) { setError(configError || 'The UniWork API is not configured.'); setLoading(false); setRefreshing(false); return; }
    setError('');
    try {
      const [apps, ongoing, completed] = await Promise.all([
        fetchAll((page) => api.listApplications(page)),
        fetchAll((page) => api.listAcceptedTasks(page)),
        fetchAll((page) => api.listHistory(page)),
      ]);
      setApplications(apps);
      setActive(ongoing);
      setHistory(completed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your applications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api, configError]);

  useEffect(() => { void load(); }, [load]);

  const rows = useMemo(() => makeRows(applications, active, history), [applications, active, history]);
  const visibleRows = filter === 'ALL' ? rows : rows.filter((row) => row.status === filter);

  function withdraw(applicationId: string, title: string) {
    Alert.alert('Withdraw application?', `Withdraw your application for “${title}”?`, [
      { text: 'Keep application', style: 'cancel' },
      { text: 'Withdraw', style: 'destructive', onPress: async () => {
        if (!api) return;
        try { await api.withdrawApplication(applicationId); await load(); }
        catch (cause) { Alert.alert('Could not withdraw', cause instanceof Error ? cause.message : 'Try again.'); }
      } },
    ]);
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }}>
      <ScreenHeader title="Applied tasks" subtitle="Track applications and accepted work in one place." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {statusFilters.map((status) => (
          <Pressable key={status} accessibilityRole="radio" accessibilityState={{ checked: filter === status }} onPress={() => setFilter(status)} style={{ minHeight: 40, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 4, borderWidth: 1, borderColor: filter === status ? theme.accent : theme.border, backgroundColor: filter === status ? theme.accentSoft : theme.surface }}>
            <Text style={{ color: filter === status ? theme.accent : theme.muted, fontSize: 12, fontWeight: '600' }}>{status === 'ALL' ? 'All' : titleCase(status)}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? <LoadingState label="Loading your tasks…" /> : error ? <ErrorState message={error} onRetry={load} /> : visibleRows.length === 0 ? <EmptyState title="No tasks in this status" detail="Applications and task progress will appear here when available." /> : (
        visibleRows.map((row) => (
          <Card key={`${row.source}-${row.id}`}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <Text style={{ flex: 1, color: theme.text, fontSize: 16, fontWeight: '600' }}>{row.title}</Text>
              <StatusPill status={row.status} />
            </View>
            <Text style={{ color: theme.muted, fontSize: 13 }}>{row.detail}</Text>
            {row.date ? <Text style={{ color: theme.muted, fontSize: 12 }}>{formatDate(row.date)}</Text> : null}
            <AppButton title="View task" variant="secondary" onPress={() => router.push({ pathname: '/(student)/task/[taskId]', params: { taskId: row.taskId } })} />
            {row.source === 'application' && row.status === 'PENDING' ? <AppButton title="Withdraw application" variant="danger" onPress={() => withdraw(row.id, row.title)} /> : null}
            {row.status === 'ACCEPTED' ? <AppButton title="Start task" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/start', params: { taskId: row.taskId } })} /> : null}
            {row.status === 'STARTED' ? <AppButton title="Report completion" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/complete', params: { taskId: row.taskId } })} /> : null}
            {row.status === 'COMPLETED' ? <AppButton title="Review task" variant="secondary" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/review', params: { taskId: row.taskId } })} /> : null}
            {row.status === 'COMPLETED' ? <AppButton title="Safety sharing status" variant="quiet" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/complete', params: { taskId: row.taskId } })} /> : null}
            {row.status === 'COMPLETED' ? <AppButton title="Report a safety or payment issue" variant="quiet" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/report', params: { taskId: row.taskId } })} /> : null}
            {row.status === 'COMPLETED' ? <AppButton title="Report a payment issue" variant="quiet" onPress={() => router.push({ pathname: '/(student)/tasks/[taskId]/payment-dispute', params: { taskId: row.taskId } })} /> : null}
          </Card>
        ))
      )}
    </Screen>
  );
}

async function fetchAll<T>(fetchPage: (page: number) => Promise<{ content: T[]; totalPages: number }>): Promise<T[]> {
  const first = await fetchPage(0);
  const items = [...first.content];
  for (let page = 1; page < first.totalPages; page += 1) {
    const result = await fetchPage(page);
    items.push(...result.content);
  }
  return items;
}

function makeRows(applications: StudentTaskApplication[], active: StudentTaskExecution[], history: StudentTaskExecution[]): AppliedRow[] {
  const executionRows = [...active, ...history].map((execution) => ({
    id: execution.taskId,
    taskId: execution.taskId,
    title: execution.title,
    status: execution.status === 'ONGOING' ? 'STARTED' : execution.status,
    date: execution.completedAt || execution.startedAt || execution.startRequestedAt || '',
    detail: execution.paymentReceived === false ? 'Completed; payment is still unresolved.' : 'Accepted task progress',
    source: 'execution' as const,
  }));
  const executionIds = new Set(executionRows.map((row) => row.taskId));
  const applicationRows = applications.filter((application) => !(application.status === 'ACCEPTED' && executionIds.has(application.taskId))).map((application) => ({
    id: application.applicationId,
    taskId: application.taskId,
    title: application.taskTitle,
    status: application.status,
    date: application.submittedAt,
    detail: application.status === 'PENDING' ? 'Waiting for the Task Poster to review your application.' : `Application ${application.status.toLowerCase()}.`,
    source: 'application' as const,
  }));
  return [...executionRows, ...applicationRows].sort((left, right) => right.date.localeCompare(left.date));
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
