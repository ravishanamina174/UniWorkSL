import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { getClerkPublishableKey } from '@/lib/config';
import { useTheme } from '@/theme';
import { LoadingState } from '@/components/ui';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  let publishableKey: string;
  try {
    publishableKey = getClerkPublishableKey();
  } catch (error) {
    return <SetupScreen message={error instanceof Error ? error.message : 'Configure Clerk to continue.'} />;
  }

  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <AuthenticatedStack />
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

function AuthenticatedStack() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const segments = useSegments();
  const theme = useTheme();
  const isAuthRoute = segments[0] === 'sign-in' || segments[0] === 'sign-up';

  if (!isLoaded) return <LoadingState label="Connecting to Clerk…" />;
  if (!isSignedIn && !isAuthRoute) return <Redirect href="/sign-in" />;
  if (isSignedIn && isAuthRoute) return <Redirect href="/" />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(student)" />
    </Stack>
  );
}

function SetupScreen({ message }: { message: string }) {
  const theme = useTheme();
  return <SafeAreaProvider><View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: 24 }}><LoadingState label={message} /></View></SafeAreaProvider>;
}
