import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { AppButton, Card, EmptyState, ErrorState, LoadingState, Screen, ScreenHeader, TaskCard, TextField } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import type { Task } from '@uniwork/api-contracts';
import { useTheme } from '@/theme';

export default function MarketplaceScreen() {
  const { api, error: configError } = useUniWorkApi();
  const theme = useTheme();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [minDraft, setMinDraft] = useState('');
  const [maxDraft, setMaxDraft] = useState('');
  const [minAmount, setMinAmount] = useState<number | undefined>();
  const [maxAmount, setMaxAmount] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(configError || '');

  const loadPage = useCallback(async (targetPage: number, replace: boolean) => {
    if (!api) {
      setError(configError || 'Set the UniWork API URL before browsing tasks.');
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      return;
    }
    if (replace) setLoading(true);
    setError('');
    try {
      const result = await api.listTasks(targetPage, search, minAmount, maxAmount);
      setTasks((current) => replace ? result.content : [...current, ...result.content.filter((item) => !current.some((existing) => existing.taskId === item.taskId))]);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the task marketplace.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [api, configError, maxAmount, minAmount, search]);

  useEffect(() => { void loadPage(0, true); }, [loadPage]);

  function applyFilters() {
    setSearch(searchDraft.trim());
    setMinAmount(minDraft ? Number(minDraft) : undefined);
    setMaxAmount(maxDraft ? Number(maxDraft) : undefined);
  }

  function refresh() {
    setRefreshing(true);
    void loadPage(0, true);
  }

  const canLoadMore = page + 1 < totalPages;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ScreenHeader title="Marketplace" subtitle="Browse published tasks shared by local Task Posters." />
      <Card>
        <TextField label="Search tasks" placeholder="Try gardening or event help" value={searchDraft} onChangeText={setSearchDraft} returnKeyType="search" onSubmitEditing={applyFilters} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextField style={{ flex: 1 }} label="Minimum LKR" placeholder="Any" value={minDraft} onChangeText={setMinDraft} keyboardType="numeric" />
          <TextField style={{ flex: 1 }} label="Maximum LKR" placeholder="Any" value={maxDraft} onChangeText={setMaxDraft} keyboardType="numeric" />
        </View>
        <AppButton title="Search tasks" icon={Search} onPress={applyFilters} />
      </Card>
      {loading ? <LoadingState label="Loading published tasks…" /> : error ? <ErrorState message={error} onRetry={refresh} /> : tasks.length === 0 ? <EmptyState title="No tasks found" detail="Try another search or adjust the payment range." /> : (
        <>
          {tasks.map((task) => <TaskCard key={task.taskId} task={task} onPress={() => router.push({ pathname: '/(student)/task/[taskId]', params: { taskId: task.taskId } })} />)}
          {canLoadMore ? <AppButton title="Load more tasks" variant="secondary" loading={loadingMore} onPress={() => { setLoadingMore(true); void loadPage(page + 1, false); }} /> : null}
        </>
      )}
      <Card style={{ backgroundColor: theme.subtle }}><Text style={{ color: theme.muted, fontSize: 12, lineHeight: 18 }}>Task payments are arranged directly between Students and Task Posters. UniWork does not process payments.</Text></Card>
    </Screen>
  );
}
