import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import type { Gender, StudentProfile } from '@uniwork/api-contracts';
import { AppButton, Card, ErrorState, LoadingState, Screen, ScreenHeader, SelectOption, TextField } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';

export default function ProfileScreen() {
  const { api, error: configError } = useUniWorkApi();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(configError || '');
  const load = useCallback(async () => {
    if (!api) { setError(configError || 'API is not configured.'); setLoading(false); return; }
    try { setError(''); setProfile(await api.getProfile()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load your profile.'); }
    finally { setLoading(false); }
  }, [api, configError]);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <LoadingState label="Loading your profile…" />;
  if (!profile) return <Screen><ScreenHeader title="Your profile" /><ErrorState message={error} onRetry={load} /></Screen>;
  const edit = (key: keyof StudentProfile, label: string, keyboardType?: 'default' | 'phone-pad' | 'numeric') => <TextField key={key} label={label} defaultValue={String(profile[key] ?? '')} keyboardType={keyboardType} onChangeText={(value) => setProfile((old) => old ? { ...old, [key]: key === 'age' ? Number(value) : value } : old)} />;
  const genders: { value: Gender; label: string }[] = [{ value: 'FEMALE', label: 'Female' }, { value: 'MALE', label: 'Male' }, { value: 'OTHER', label: 'Other' }, { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }];
  async function save() {
    if (!api) return;
    setSaving(true);
    try { setProfile(await api.saveProfile({ fullName: profile!.fullName, age: profile!.age, gender: profile!.gender, address: profile!.address, phoneNumber: profile!.phoneNumber, nic: profile!.nic, university: profile!.university, faculty: profile!.faculty })); Alert.alert('Profile saved', 'Your Student profile was updated.'); }
    catch (cause) { Alert.alert('Could not save profile', cause instanceof Error ? cause.message : 'Try again.'); }
    finally { setSaving(false); }
  }
  return <Screen><ScreenHeader title="Your profile" subtitle="Keep your Student details up to date." />
    <Card><View style={{ gap: 12 }}>{edit('fullName', 'Full name')}{edit('age', 'Age', 'numeric')}<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{genders.map((item) => <SelectOption key={item.value} label={item.label} value={item.value} selected={profile.gender === item.value} onSelect={(gender) => setProfile((old) => old ? { ...old, gender } : old)} />)}</View>{edit('address', 'Address')}{edit('phoneNumber', 'Phone number', 'phone-pad')}{edit('nic', 'National identity number')}{edit('university', 'University')}{edit('faculty', 'Faculty')}</View>
      <AppButton title="Save profile" loading={saving} onPress={() => void save()} /></Card>
    <Card><ScreenHeader title="Privacy" subtitle="Your profile details are sent to the UniWork API and are not stored as a local app profile." /></Card>
    <AppButton title="Sign out" variant="secondary" onPress={() => Alert.alert('Sign out?', 'You can sign in again anytime.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/sign-in'); } }])} />
  </Screen>;
}
