import { useEffect, useState } from 'react';
import { Redirect, type Href } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { ApiRequestError } from '@/lib/api';
import { useUniWorkApi } from '@/lib/use-api';
import { AppButton, ErrorState, LoadingState, Screen } from '@/components/ui';

export default function EntryScreen() {
  const { api, error: configError } = useUniWorkApi();
  const { signOut } = useAuth();
  const [destination, setDestination] = useState<'onboarding' | 'dashboard' | 'role-error' | 'error' | null>(null);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (configError || !api) {
      setMessage(configError || 'API configuration is unavailable.');
      setDestination('error');
      return;
    }
    let active = true;
    api.getProfile().then(() => {
      if (active) setDestination('dashboard');
    }).catch((error: unknown) => {
      if (!active) return;
      if (error instanceof ApiRequestError && ['STUDENT_PROFILE_REQUIRED', 'STUDENT_PROFILE_INCOMPLETE'].includes(error.code)) {
        setDestination('onboarding');
      } else if (error instanceof ApiRequestError && error.status === 403) {
        setMessage('This Clerk account already has a different UniWork role. For safety, roles cannot be switched. Sign in with a Student account.');
        setDestination('role-error');
      } else {
        setMessage(error instanceof Error ? error.message : 'Could not check your Student profile.');
        setDestination('error');
      }
    });
    return () => { active = false; };
  }, [api, configError, attempt]);

  if (destination === 'dashboard') return <Redirect href={'/(student)/(tabs)/dashboard' as Href} />;
  if (destination === 'onboarding') return <Redirect href="/onboarding" />;
  if (destination === 'role-error') return <Screen><ErrorState message={message} /><AppButton title="Sign out" variant="secondary" onPress={async () => { await signOut(); }} /></Screen>;
  if (destination === 'error') return <Screen><ErrorState message={message} onRetry={() => { setDestination(null); setAttempt((value) => value + 1); }} /></Screen>;
  return <LoadingState label="Checking your Student profile…" />;
}
