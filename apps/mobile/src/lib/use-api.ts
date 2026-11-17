import { useAuth } from '@clerk/expo';
import { useMemo } from 'react';
import { getApiBaseUrl } from './config';
import { UniWorkApi } from './api';

export function useUniWorkApi() {
  const { getToken, signOut } = useAuth();
  return useMemo(() => {
    try {
      return { api: new UniWorkApi(getApiBaseUrl(), getToken, () => signOut()), error: null as string | null };
    } catch (error) {
      return { api: null, error: error instanceof Error ? error.message : 'Mobile API configuration is invalid.' };
    }
  }, [getToken, signOut]);
}
