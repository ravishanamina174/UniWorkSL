"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiRequest } from "@/services/api-client";

export function useAuthenticatedApi() {
  const { getToken } = useAuth();
  return useCallback(<T,>(path: string, options: Omit<RequestInit, "headers"> & { headers?: HeadersInit } = {}) =>
    apiRequest<T>(path, { ...options, getAccessToken: async () => (await getToken()) ?? null }), [getToken]);
}
