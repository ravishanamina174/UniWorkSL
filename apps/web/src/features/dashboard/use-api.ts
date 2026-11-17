"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ApiRequestError, apiRequest } from "@/services/api-client";

export function useAuthenticatedApi() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  return useCallback(async <T,>(path: string, options: Omit<RequestInit, "headers"> & { headers?: HeadersInit } = {}) => {
    try {
      return await apiRequest<T>(path, { ...options, getAccessToken: async () => (await getToken()) ?? null });
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.status === 401 && isLoaded && !isSignedIn) router.replace("/sign-in");
      throw cause;
    }
  }, [getToken, isLoaded, isSignedIn, router]);
}
