import { useAuth } from '@clerk/expo';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import type { Availability, Gender, ProfessionalLanguage, StudentProfessionalProfile, StudentProfile } from '@uniwork/api-contracts';
import { AppButton, Card, ErrorState, LoadingState, Screen, ScreenHeader, SelectOption, TextField } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import { IdentitySection } from '@/components/identity-section';

export default function ProfileScreen() {
  const { api, error: configError } = useUniWorkApi();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [professional, setProfessional] = useState<StudentProfessionalProfile | null>(null);
  const [professionalOpen, setProfessionalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(configError || '');
  const load = useCallback(async () => {
    if (!api) { setError(configError || 'API is not configured.'); setLoading(false); return; }
    try { setError(''); const [base, worker] = await Promise.all([api.getProfile(), api.getProfessionalProfile()]); setProfile(base); setProfessional(worker); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load your profile.'); }
    finally { setLoading(false); }
  }, [api, configError]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  if (loading) return <LoadingState label="Loading your profile…" />;
  if (!profile) return <Screen><ScreenHeader title="Your profile" /><ErrorState message={error} onRetry={load} /></Screen>;
  const edit = (key: keyof StudentProfile, label: string, keyboardType?: 'default' | 'phone-pad' | 'numeric') => <TextField key={key} label={label} defaultValue={String(profile[key] ?? '')} keyboardType={keyboardType} onChangeText={(value) => setProfile((old) => old ? { ...old, [key]: key === 'age' ? Number(value) : value } : old)} />;
  const genders: { value: Gender; label: string }[] = [{ value: 'FEMALE', label: 'Female' }, { value: 'MALE', label: 'Male' }, { value: 'OTHER', label: 'Other' }, { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }];
  async function save() {
    if (!api) return;
    setSaving(true);
    try { setProfile(await api.saveProfile({ fullName: profile!.fullName, age: profile!.age, gender: profile!.gender, address: profile!.address, phoneNumber: profile!.phoneNumber, nic: profile!.nic, university: profile!.university, faculty: profile!.faculty })); if (professional) await api.saveProfessionalProfile(professional); Alert.alert('Profile saved', 'Your Student profile was updated.'); }
    catch (cause) { Alert.alert('Could not save profile', cause instanceof Error ? cause.message : 'Try again.'); }
    finally { setSaving(false); }
  }
  return <Screen><ScreenHeader title="Your profile" subtitle="Keep your Student details up to date." />
    <Card><View style={{ gap: 12 }}>{edit('fullName', 'Full name')}{edit('age', 'Age', 'numeric')}<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{genders.map((item) => <SelectOption key={item.value} label={item.label} value={item.value} selected={profile.gender === item.value} onSelect={(gender) => setProfile((old) => old ? { ...old, gender } : old)} />)}</View>{edit('address', 'Address')}{edit('phoneNumber', 'Phone number', 'phone-pad')}{profile.verificationStatus === 'VERIFIED' || profile.verificationStatus === 'MANUAL_REVIEW_PENDING' ? <Text>{profile.verificationStatus === 'VERIFIED' ? 'NIC Matched' : 'NIC review pending'} · ••••••••{profile.nic.slice(-4)}. This number is locked.</Text> : edit('nic', 'National identity number')}{edit('university', 'University')}{edit('faculty', 'Faculty')}</View>
      <AppButton title="Save profile" loading={saving} onPress={() => void save()} /></Card>
    {api ? <IdentitySection api={api} initialStatus={profile.verificationStatus} onMatched={() => void load()} /> : null}
    {professional ? <Card><Pressable accessibilityRole="button" accessibilityState={{ expanded: professionalOpen }} onPress={() => setProfessionalOpen((open) => !open)}><Text style={{ color: '#171717', fontSize: 17, fontWeight: '600' }}>{professionalOpen ? '⌄' : '›'} Professional Worker Profile</Text></Pressable>{professionalOpen ? <View style={{ gap: 12, marginTop: 12 }}><Text style={{ color: '#737373', fontSize: 13 }}>Optional professional details help Task Posters discover you. Your home address, phone, NIC, age, and gender are never shared.</Text><TextField label="Professional summary" multiline maxLength={1200} value={professional.professionalSummary ?? ''} helper={`${wordCount(professional.professionalSummary ?? '')}/120 words`} onChangeText={(value) => setProfessional({ ...professional, professionalSummary: value })} /><TextField label="Primary location" value={professional.primaryLocation ?? ''} onChangeText={(value) => setProfessional({ ...professional, primaryLocation: value })} /><TextField label="Secondary location" value={professional.secondaryLocation ?? ''} onChangeText={(value) => setProfessional({ ...professional, secondaryLocation: value })} /><TextField label="Skills (one per line)" multiline value={professional.skills.join('\n')} onChangeText={(value) => setProfessional({ ...professional, skills: value.split('\n').map((item) => item.trim()).filter(Boolean).slice(0, 20) })} /><Text style={{ color: '#171717', fontSize: 14, fontWeight: '600' }}>Availability</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{availabilityOptions.map((value) => <SelectOption key={value} label={format(value)} value={value} selected={professional.availability.includes(value)} onSelect={() => setProfessional({ ...professional, availability: toggle(professional.availability, value) })} />)}</View><Text style={{ color: '#171717', fontSize: 14, fontWeight: '600' }}>Languages spoken</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{languageOptions.map((value) => <SelectOption key={value} label={format(value)} value={value} selected={professional.languages.includes(value)} onSelect={() => setProfessional({ ...professional, languages: toggle(professional.languages, value) })} />)}</View><Text style={{ color: '#171717', fontSize: 14, fontWeight: '600' }}>Allow Task Posters to discover my professional profile in Student Lookup.</Text><SelectOption label={professional.discoverable ? 'Discoverable: On' : 'Discoverable: Off'} value="discoverable" selected={professional.discoverable} onSelect={() => setProfessional({ ...professional, discoverable: !professional.discoverable })} /></View> : null}</Card> : null}
    <Card><ScreenHeader title="Privacy" subtitle="Your profile details are sent to the UniWork API and are not stored as a local app profile." /></Card>
    <AppButton title="Sign out" variant="secondary" onPress={() => Alert.alert('Sign out?', 'You can sign in again anytime.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/sign-in'); } }])} />
  </Screen>;
}

const availabilityOptions: Availability[] = ['WEEKENDS', 'WEEKDAYS', 'EVERY_DAY', 'AFTER_5_PM', 'HOLIDAY_FULL_TIME'];
const languageOptions: ProfessionalLanguage[] = ['SINHALA', 'ENGLISH', 'TAMIL'];
function toggle<T>(values: T[], value: T) { return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]; }
function format(value: string) { return value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase()); }
function wordCount(value: string) { return value.trim() ? value.trim().split(/\s+/).length : 0; }
