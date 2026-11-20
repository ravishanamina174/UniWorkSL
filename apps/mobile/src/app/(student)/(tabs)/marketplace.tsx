import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarDays, Clock3, MapPin, SlidersHorizontal, X } from 'lucide-react-native';
import type { ApplicationStatus, Task } from '@uniwork/api-contracts';
import { AppButton, Card, EmptyState, ErrorState, LoadingState, Screen, ScreenHeader, SkillBadges, StatusPill, TextField, formatDate } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import { colomboDate, validPriceRange } from '@/lib/marketplace-filters';
import { useTheme } from '@/theme';

type Point = { latitude: number; longitude: number };
function distance(task: Task, from: Point): string {
  const r = Math.PI / 180, dLat = (Number(task.latitude) - from.latitude) * r, dLng = (Number(task.longitude) - from.longitude) * r;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.latitude * r) * Math.cos(Number(task.latitude) * r) * Math.sin(dLng / 2) ** 2;
  return (2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)))).toFixed(1) + ' km away';
}
export default function MarketplaceScreen() {
  const { api, error: configError } = useUniWorkApi(), theme = useTheme(), router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]), [page, setPage] = useState(0), [totalPages, setTotalPages] = useState(0);
  const [draft, setDraft] = useState(''), [search, setSearch] = useState(''), [date, setDate] = useState<string>(), [near, setNear] = useState<Point>();
  const [minDraft, setMinDraft] = useState(''), [maxDraft, setMaxDraft] = useState('');
  const [min, setMin] = useState<number>(), [max, setMax] = useState<number>();
  const [priceOpen, setPriceOpen] = useState(false), [dateOpen, setDateOpen] = useState(false), [selected, setSelected] = useState<Task>();
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null), [checkingApplication, setCheckingApplication] = useState(false), [applicationCheckError, setApplicationCheckError] = useState('');
  const [notice, setNotice] = useState(''), [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false), [more, setMore] = useState(false), [applying, setApplying] = useState(false);
  const [error, setError] = useState(configError || ''), requestId = useRef(0);
  useEffect(() => { const timer = setTimeout(() => setSearch(draft.trim()), 300); return () => clearTimeout(timer); }, [draft]);
  const load = useCallback(async (target: number, replace: boolean) => {
    const id = replace ? ++requestId.current : requestId.current;
    if (!api) { setError(configError || 'API is not configured.'); setLoading(false); return; }
    if (replace) setLoading(true); else setMore(true);
    setError('');
    try {
      const result = await api.listTasks(target, search, min, max, date, near?.latitude, near?.longitude);
      if (id !== requestId.current) return;
      setTasks((current) => replace ? result.content : [...current, ...result.content.filter((item) => !current.some((old) => old.taskId === item.taskId))]);
      setPage(result.page); setTotalPages(result.totalPages);
    } catch (cause) { if (id === requestId.current) setError(cause instanceof Error ? cause.message : 'Could not load tasks.'); }
    finally { if (id === requestId.current) { setLoading(false); setRefreshing(false); setMore(false); } }
  }, [api, configError, search, min, max, date, near]);
  useEffect(() => { void load(0, true); }, [load]);
  useEffect(() => {
    if (!api || !selected) return;
    let active = true;
    setCheckingApplication(true); setApplicationStatus(null); setApplicationCheckError('');
    void api.listApplications(0).then((result) => {
      if (active) setApplicationStatus(result.content.find((item) => item.taskId === selected.taskId)?.status || null);
    }).catch(() => { if (active) setApplicationCheckError('Could not check your application status. Open full task details to continue.'); })
      .finally(() => { if (active) setCheckingApplication(false); });
    return () => { active = false; };
  }, [api, selected]);
  function chooseNear() {
    if (near) { setNear(undefined); return; }
    Alert.alert('Find nearby tasks', 'Use your location once to find published tasks within 10 km. This does not enable SafeTask tracking.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Use location', onPress: () => void (async () => {
        try {
          const existing = await Location.getForegroundPermissionsAsync();
          const permission = existing.granted ? existing : await Location.requestForegroundPermissionsAsync();
          if (!permission.granted) { setLocationError('Location permission was denied. Other filters still work.'); return; }
          const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setNear({ latitude: position.coords.latitude, longitude: position.coords.longitude }); setLocationError('');
        } catch { setLocationError('Could not get your location. Check GPS and try again.'); }
      })() },
    ]);
  }
  function applyPrice() {
    const low = minDraft.trim() ? Number(minDraft) : undefined, high = maxDraft.trim() ? Number(maxDraft) : undefined;
    if (!validPriceRange(low, high)) {
      Alert.alert('Invalid price range', 'Enter non-negative LKR amounts with minimum no greater than maximum.'); return;
    }
    setMin(low); setMax(high); setPriceOpen(false);
  }
  async function apply() {
    if (!api || !selected || applying || checkingApplication || applicationCheckError || applicationStatus && applicationStatus !== 'WITHDRAWN') return;
    setApplying(true); setNotice('');
    try { const application = await api.applyForTask(selected.taskId); setApplicationStatus(application.status); setNotice('Application sent to the Task Poster.'); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : 'Could not apply for this task.'); }
    finally { setApplying(false); }
  }
  const active = Boolean(draft || date || near || min !== undefined || max !== undefined);
  const chips = [
    { label: 'Near Me', active: Boolean(near), Icon: MapPin, press: chooseNear },
    { label: 'Today', active: date === colomboDate(), Icon: Clock3, press: () => setDate(date === colomboDate() ? undefined : colomboDate()) },
    { label: 'Tomorrow', active: date === colomboDate(1), Icon: Clock3, press: () => setDate(date === colomboDate(1) ? undefined : colomboDate(1)) },
    { label: date && date !== colomboDate() && date !== colomboDate(1) ? date : 'Select Date', active: Boolean(date), Icon: CalendarDays, press: () => setDateOpen(true) },
    { label: 'Price Range', active: min !== undefined || max !== undefined, Icon: SlidersHorizontal, press: () => setPriceOpen(true) },
  ];
  return <Screen refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(0, true); }}>
    <ScreenHeader title="Marketplace" subtitle="Discover local opportunities that fit your day." />
    <TextField label="Search tasks" placeholder="Title, details or skills" value={draft} onChangeText={setDraft} returnKeyType="search" />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{chips.map(({ label, active: chosen, Icon, press }) => <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: chosen }} onPress={press} style={[styles.chip, { backgroundColor: chosen ? theme.accentSoft : theme.surface, borderColor: chosen ? theme.accent : theme.border }]}><Icon size={16} color={chosen ? theme.accent : theme.muted} /><Text style={{ color: chosen ? theme.accent : theme.text, fontWeight: '600' }}>{label}</Text></Pressable>)}</ScrollView>
    {active && <AppButton title="Clear Filters" variant="quiet" onPress={() => { setDraft(''); setDate(undefined); setNear(undefined); setMinDraft(''); setMaxDraft(''); setMin(undefined); setMax(undefined); setLocationError(''); }} />}
    {locationError ? <Text accessibilityRole="alert" style={{ color: theme.danger }}>{locationError}</Text> : null}
    {near && <Text style={{ color: theme.muted }}>Within 10 km · closest first</Text>}
    {loading ? <LoadingState label="Finding tasks…" /> : error ? <ErrorState message={error} onRetry={() => void load(0, true)} /> : tasks.length === 0 ? <EmptyState title="No tasks found" detail="Try another search, date or price range." /> : <>{tasks.map((task) => <Pressable key={task.taskId} accessibilityRole="button" accessibilityLabel={'View ' + task.title} onPress={() => { setSelected(task); setNotice(''); }} style={[styles.task, { backgroundColor: theme.surface, borderColor: theme.border }]}><View style={styles.top}><Text numberOfLines={2} style={[styles.taskTitle, { color: theme.text }]}>{task.title}</Text><Text style={[styles.amount, { color: theme.accent }]}>LKR {Number(task.amountLkr).toLocaleString('en-LK')}</Text></View><Text style={{ color: theme.muted, fontSize: 12 }}>{formatDate(task.taskDateTime)}</Text><Text numberOfLines={1} style={{ color: theme.muted, fontSize: 13 }}>{task.locationAddress}{near ? ' · ' + distance(task, near) : ''}</Text><SkillBadges skills={(task.requiredSkills || []).slice(0, 2)} /></Pressable>)}{page + 1 < totalPages && <AppButton title="Load more tasks" variant="secondary" loading={more} onPress={() => void load(page + 1, false)} />}</>}
    <Card style={{ backgroundColor: theme.subtle }}><Text style={{ color: theme.muted, fontSize: 12, lineHeight: 18 }}>Payments are arranged directly between Students and Task Posters. UniWork does not process payments.</Text></Card>
    <Modal visible={priceOpen} animationType="slide" transparent onRequestClose={() => setPriceOpen(false)}><View style={styles.backdrop}><View style={[styles.sheet, { backgroundColor: theme.surface }]}><Text style={[styles.sheetTitle, { color: theme.text }]}>Price range · LKR</Text><TextField label="Minimum" keyboardType="numeric" value={minDraft} onChangeText={setMinDraft} /><TextField label="Maximum" keyboardType="numeric" value={maxDraft} onChangeText={setMaxDraft} /><AppButton title="Apply Price Range" onPress={applyPrice} /><AppButton title="Cancel" variant="quiet" onPress={() => setPriceOpen(false)} /></View></View></Modal>
    {dateOpen && <DateTimePicker value={date ? new Date(date + 'T12:00:00') : new Date()} mode="date" onChange={(event, value) => { setDateOpen(false); if (event.type === 'set' && value) setDate([value.getFullYear(), String(value.getMonth() + 1).padStart(2, '0'), String(value.getDate()).padStart(2, '0')].join('-')); }} />}
    <Modal visible={Boolean(selected)} animationType="slide" transparent onRequestClose={() => setSelected(undefined)}><View style={styles.backdrop}><View style={[styles.sheet, styles.detailSheet, { backgroundColor: theme.surface }]}><View style={styles.top}><Text style={[styles.sheetTitle, { color: theme.text }]}>Task details</Text><Pressable accessibilityRole="button" accessibilityLabel="Close details" onPress={() => setSelected(undefined)}><X size={24} color={theme.text} /></Pressable></View>{selected && <ScrollView contentContainerStyle={{ gap: 13 }}><Text style={[styles.taskTitle, { color: theme.text }]}>{selected.title}</Text><Text style={[styles.amount, { color: theme.accent }]}>LKR {Number(selected.amountLkr).toLocaleString('en-LK')}</Text><Text style={{ color: theme.muted }}>Payment is arranged directly with the Task Poster.</Text><Text style={{ color: theme.text, lineHeight: 22 }}>{selected.description}</Text><Text style={{ color: theme.muted }}>{formatDate(selected.taskDateTime)}</Text><Text style={{ color: theme.muted }}>{selected.locationAddress}</Text><SkillBadges skills={selected.requiredSkills || []} />{applicationStatus ? <View style={styles.top}><Text style={{ color: theme.text }}>Your application</Text><StatusPill status={applicationStatus} /></View> : null}{applicationCheckError ? <Text accessibilityRole="alert" style={{ color: theme.danger }}>{applicationCheckError}</Text> : null}{notice ? <Text accessibilityRole="alert" style={{ color: theme.info }}>{notice}</Text> : null}{(!applicationStatus || applicationStatus === 'WITHDRAWN') && !applicationCheckError ? <AppButton title="Apply for Task" loading={applying || checkingApplication} onPress={() => void apply()} /> : null}<AppButton title="Open full task details" variant="secondary" onPress={() => { const id = selected.taskId; setSelected(undefined); router.push({ pathname: '/(student)/task/[taskId]', params: { taskId: id } }); }} /></ScrollView>}</View></View></Modal>
  </Screen>;
}
const styles = StyleSheet.create({ chips: { gap: 9, paddingVertical: 4, paddingRight: 16 }, chip: { minHeight: 43, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 22 }, task: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 8, elevation: 2 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }, taskTitle: { flex: 1, fontSize: 17, fontWeight: '700', lineHeight: 22 }, amount: { fontSize: 16, fontWeight: '700' }, backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000088' }, sheet: { padding: 22, gap: 14, borderTopLeftRadius: 18, borderTopRightRadius: 18 }, detailSheet: { maxHeight: '86%' }, sheetTitle: { fontSize: 20, fontWeight: '700' } });
