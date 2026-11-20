import { useRouter } from 'expo-router';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, Camera, CheckCircle2, Compass, Handshake, ShieldCheck, Sparkles } from 'lucide-react-native';
import { AppButton, Card, Screen } from '@/components/ui';
import { Wordmark } from '@/components/brand';
import { useTheme } from '@/theme';

const steps = [
  { number: '01', title: 'Discover', detail: 'Find local tasks that fit your schedule and skills.', icon: Compass },
  { number: '02', title: 'Apply', detail: 'Tell a Task Poster you are interested.', icon: Handshake },
  { number: '03', title: 'Complete', detail: 'Coordinate the work and confirm completion.', icon: CheckCircle2 },
];
export default function StudentDashboard() {
  const theme = useTheme(); const router = useRouter();
  return <Screen><ImageBackground source={require('../../../../assets/images/hero.png')} imageStyle={{ borderRadius: 6 }} style={styles.hero} resizeMode="cover"><View style={styles.overlay} /><View style={styles.heroContent}><Wordmark inverse /><Text style={styles.heroTitle}>Small tasks. Bigger possibilities.</Text><Text style={styles.heroCopy}>Local earning opportunities for Sri Lankan university students, built around everyday skills.</Text><AppButton title="Explore Tasks" icon={ArrowRight} onPress={() => router.push('/(student)/(tabs)/marketplace')} /></View></ImageBackground>
    <View style={styles.section}><Text style={[styles.eyebrow, { color: theme.info }]}>01 / HOW IT WORKS</Text><Text style={[styles.title, { color: theme.text }]}>A clearer path to local work.</Text>{steps.map(({ number, title, detail, icon: Icon }) => <Card key={number}><View style={styles.row}><Icon size={22} color={theme.info} /><View style={styles.flex}><Text style={[styles.stepTitle, { color: theme.text }]}>{number} / {title}</Text><Text style={{ color: theme.muted, lineHeight: 21 }}>{detail}</Text></View></View></Card>)}</View>
    <View style={styles.section}><Text style={[styles.eyebrow, { color: theme.warning }]}>02 / EVERYDAY SKILLS</Text><Text style={[styles.title, { color: theme.text }]}>What can you help with?</Text><Card><View style={styles.row}><Camera size={22} color={theme.warning} /><Text style={[styles.flex, { color: theme.text, lineHeight: 22 }]}>Event support, photography, errands, organization and practical assistance.</Text></View><AppButton title="Find tasks that fit" variant="secondary" onPress={() => router.push('/(student)/(tabs)/marketplace')} /></Card></View>
    <View style={styles.section}><Text style={[styles.eyebrow, { color: theme.success }]}>03 / SAFETY & TRUST</Text><Text style={[styles.title, { color: theme.text }]}>Stay clear and connected.</Text><Card><View style={styles.row}><ShieldCheck size={23} color={theme.success} /><Text style={[styles.flex, { color: theme.text, lineHeight: 22 }]}>Agree on the task details, verify the start code in person, and choose whether to share a SafeTask guardian link. Safety reports remain available during task coordination.</Text></View><Text style={{ color: theme.muted, lineHeight: 20 }}>Payments are arranged directly with Task Posters. UniWork does not handle or protect them.</Text></Card></View>
    <View style={[styles.brandEnd, { borderColor: theme.border }]}><Sparkles size={18} color={theme.accent} /><Wordmark /><Text style={{ color: theme.muted }}>Small tasks. Bigger possibilities.</Text></View>
  </Screen>;
}
const styles = StyleSheet.create({ hero: { minHeight: 345, justifyContent: 'flex-end', overflow: 'hidden', borderRadius: 6 }, overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#111111bb' }, heroContent: { gap: 16, padding: 23 }, heroTitle: { color: '#FFFFFF', fontSize: 36, lineHeight: 38, fontWeight: '700', letterSpacing: -1.4 }, heroCopy: { color: '#F1F1F1', fontSize: 14, lineHeight: 21 }, section: { gap: 13, marginTop: 12 }, eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.4 }, title: { fontSize: 24, lineHeight: 29, fontWeight: '700', letterSpacing: -.6 }, row: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' }, flex: { flex: 1 }, stepTitle: { fontWeight: '700', fontSize: 16, marginBottom: 4 }, brandEnd: { marginTop: 12, borderTopWidth: 1, paddingTop: 28, paddingBottom: 20, alignItems: 'center', gap: 9 } });
