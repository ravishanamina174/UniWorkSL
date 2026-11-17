import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppButton, Card, Screen } from '@/components/ui';
import { Wordmark } from '@/components/brand';
import { useTheme } from '@/theme';

export function AuthEntry({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const { startHostedAuth } = useHostedAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isSignup = mode === 'sign-up';

  async function begin() {
    setError('');
    setLoading(true);
    try {
      await startHostedAuth({ mode });
    } catch {
      setError('Clerk sign-in could not start. Check native app setup and your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: 28, paddingBottom: 36 }}>
        <Wordmark />
        <View style={{ gap: 10 }}>
          <Text accessibilityRole="header" style={{ color: theme.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.7 }}>
            {isSignup ? 'Find work close to home.' : 'Welcome back.'}
          </Text>
          <Text style={{ color: theme.muted, fontSize: 15, lineHeight: 23 }}>
            {isSignup ? 'Create a Student account to discover local tasks and opportunities.' : 'Sign in to see your applications and accepted tasks.'}
          </Text>
        </View>
        <Card>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>For university students</Text>
          <Text style={{ color: theme.muted, fontSize: 14, lineHeight: 21 }}>Student access is assigned by UniWork during profile onboarding. Existing Task Poster accounts cannot change roles.</Text>
          {error ? <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 13 }}>{error}</Text> : null}
          <AppButton title={isSignup ? 'Create account' : 'Continue to sign in'} onPress={begin} loading={loading} />
        </Card>
        <Text style={{ color: theme.muted, fontSize: 12, lineHeight: 18 }}>
          Payments are arranged directly between the Student and Task Poster. UniWork does not process payments.
        </Text>
      </View>
    </Screen>
  );
}
