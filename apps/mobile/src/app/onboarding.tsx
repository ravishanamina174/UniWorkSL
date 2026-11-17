import type { Gender, StudentProfileInput } from '@uniwork/api-contracts';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { AppButton, Card, Screen, ScreenHeader, SelectOption, TextField } from '@/components/ui';
import { useUniWorkApi } from '@/lib/use-api';
import { normalizeNic, validateStudentProfile } from '@/lib/profile-validation';
import type { ProfileFieldErrors } from '@/lib/profile-validation';
import { useTheme } from '@/theme';

const genders: { value: Gender; label: string }[] = [
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const emptyProfile: StudentProfileInput = {
  fullName: '', age: 18, gender: 'PREFER_NOT_TO_SAY', address: '', phoneNumber: '', nic: '', university: '', faculty: '',
};

export default function StudentOnboardingScreen() {
  const { api, error: configError } = useUniWorkApi();
  const theme = useTheme();
  const [profile, setProfile] = useState<StudentProfileInput>(emptyProfile);
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [message, setMessage] = useState(configError || '');
  const [saving, setSaving] = useState(false);

  function update<K extends keyof StudentProfileInput>(key: K, value: StudentProfileInput[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setMessage('');
  }

  async function submit() {
    const nextErrors = validateStudentProfile({ ...profile, nic: normalizeNic(profile.nic) });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (!api) {
      setMessage(configError || 'Set the mobile API configuration before continuing.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await api.saveProfile({ ...profile, nic: normalizeNic(profile.nic) });
      router.replace('/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save your profile. Try again.');
    } finally {
      setSaving(false);
    }
  }

  const field = (key: keyof StudentProfileInput, label: string, props: { keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address'; multiline?: boolean; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; helper?: string } = {}) => (
    <TextField
      label={label}
      value={key === 'age' ? String(profile.age) : String(profile[key])}
      onChangeText={(value) => update(key, (key === 'age' ? (value ? Number.parseInt(value, 10) : 0) : value) as StudentProfileInput[typeof key])}
      error={errors[key]}
      {...props}
    />
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <ScreenHeader title="Complete your Student profile" subtitle="Your profile lets UniWork verify Student access and prepare your task account." />
        <Card>
          {field('fullName', 'Full name', { autoCapitalize: 'words' })}
          {field('age', 'Age', { keyboardType: 'numeric', helper: 'Students must be at least 16.' })}
          <View style={{ gap: 8 }}>
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>Gender</Text>
            <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {genders.map((item) => <SelectOption key={item.value} label={item.label} value={item.value} selected={profile.gender === item.value} onSelect={(value) => update('gender', value)} />)}
            </View>
            {errors.gender ? <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 12 }}>{errors.gender}</Text> : null}
          </View>
          {field('address', 'Home address', { autoCapitalize: 'sentences', multiline: true, helper: 'Kept private and encrypted by UniWork.' })}
          {field('phoneNumber', 'Phone number', { keyboardType: 'phone-pad' })}
          {field('nic', 'NIC number', { autoCapitalize: 'characters', helper: 'Old 10-character or new 12-digit NIC format.' })}
          {field('university', 'University', { autoCapitalize: 'words' })}
          {field('faculty', 'Faculty', { autoCapitalize: 'words' })}
          {message ? <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 13, lineHeight: 19 }}>{message}</Text> : null}
          <AppButton title="Save Student profile" onPress={submit} loading={saving} />
        </Card>
        <Text style={{ color: theme.muted, fontSize: 12, lineHeight: 18 }}>Your profile information is sent securely to the UniWork API. NIC and address are stored encrypted and are not shared with Task Posters.</Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}
