import { isDevice } from 'expo-device';
import { Platform } from 'react-native';

export function getApiBaseUrl(
  configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim(),
  platform = Platform.OS,
  isPhysicalDevice = isDevice,
  production = process.env.NODE_ENV === 'production',
): string {
  const value = configured || (platform === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Set EXPO_PUBLIC_API_BASE_URL to a valid absolute HTTP or HTTPS API URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must be an HTTP(S) URL without credentials, query, or fragment.');
  }
  if (production && url.protocol !== 'https:') {
    throw new Error('Production API connections must use HTTPS.');
  }
  if (platform === 'android' && isPhysicalDevice && ['localhost', '127.0.0.1', '10.0.2.2'].includes(url.hostname)) {
    throw new Error('Set EXPO_PUBLIC_API_BASE_URL to your development computer LAN address for a physical Android device.');
  }
  return url.toString().replace(/\/$/, '');
}

export function getClerkPublishableKey(): string {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  if (!key) throw new Error('Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in apps/mobile/.env.local.');
  return key;
}
