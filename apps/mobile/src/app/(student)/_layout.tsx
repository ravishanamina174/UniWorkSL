import { useAuth } from '@clerk/expo';
import { Redirect, Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppButton, ErrorState, LoadingState, Screen } from '@/components/ui';
import { ApiRequestError } from '@/lib/api';
import { useUniWorkApi } from '@/lib/use-api';
import { useTheme } from '@/theme';

type GateState = 'checking' | 'student' | 'onboarding' | 'role-blocked' | 'error';

export default function StudentLayout() {
  const { api, error: configError } = useUniWorkApi();
  const { signOut } = useAuth();
  const [state, setState] = useState<GateState>('checking');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    if (!api) {
      setMessage(configError || 'API configuration is unavailable.');
      setState('error');
      return;
    }
    let active = true;
    api.getProfile().then(() => {
      if (active) setState('student');
    }).catch((error: unknown) => {
      if (!active) return;
      if (error instanceof ApiRequestError && ['STUDENT_PROFILE_REQUIRED', 'STUDENT_PROFILE_INCOMPLETE'].includes(error.code)) {
        setState('onboarding');
      } else if (error instanceof ApiRequestError && error.status === 403) {
        setState('role-blocked');
      } else {
        setMessage(error instanceof Error ? error.message : 'Could not verify your Student profile.');
        setState('error');
      }
    });
    return () => { active = false; };
  }, [api, configError, attempt]);

  if (state === 'checking') return <LoadingState label="Checking Student access…" />;
  if (state === 'onboarding') return <Redirect href="/onboarding" />;
  if (state === 'role-blocked') {
    return <Screen><ErrorState message="This account belongs to a different UniWork role. A Task Poster account cannot be changed into a Student account." /><AppButton title="Sign out" variant="secondary" onPress={async () => { await signOut(); router.replace('/sign-in'); }} /></Screen>;
  }
  if (state === 'error') return <Screen><ErrorState message={message} onRetry={() => { setState('checking'); setAttempt((value) => value + 1); }} /></Screen>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="task/[taskId]" />
    <Stack.Screen name="tasks/[taskId]/start" />
    <Stack.Screen name="tasks/[taskId]/complete" />
    <Stack.Screen name="tasks/[taskId]/review" />
    <Stack.Screen name="tasks/[taskId]/report" />
  </Stack>;
}
