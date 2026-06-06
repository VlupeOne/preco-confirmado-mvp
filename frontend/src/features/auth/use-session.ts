"use client";

import { useQuery } from "@tanstack/react-query";

import { getSession } from "@/features/auth/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: getSession,
    retry: false,
  });
}
