// api/rq.ts

import { ApiResult } from "@/services/api/types"
import type { QueryClient } from "@tanstack/react-query"

export async function getOrThrow<T>(p: Promise<ApiResult<T>>): Promise<T> {
  const res = await p
  if (res.ok) return res.data
  // Map problems to user-friendly messages
  const msg =
    res.problem.kind === "bad-data"
      ? "Malformed server response"
      : res.problem.kind === "cannot-connect"
        ? "Cannot connect. Please check your internet."
        : res.problem.kind === "timeout"
          ? "Request timed out. Try again."
          : res.problem.kind.replace("-", " ")
  throw new Error(msg)
}

export function patchScriptInCollections(
  qc: QueryClient,
  scriptId: number,
  patch: (s: any) => any,
) {
  // My scripts
  qc.setQueriesData({ queryKey: ["get-my-scripts"], type: "all" }, (data: any) => {
    if (!data) return data
    if (Array.isArray(data)) return data.map((s) => (s?.id === scriptId ? patch(s) : s))
    if (Array.isArray(data?.items))
      return { ...data, items: data.items.map((s: any) => (s?.id === scriptId ? patch(s) : s)) }
    return data
  })

  // Trending (all categories)
  qc.setQueriesData({ queryKey: ["get-trending-today"], type: "all" }, (data: any) => {
    if (!data) return data
    if (Array.isArray(data)) return data.map((s) => (s?.id === scriptId ? patch(s) : s))
    if (Array.isArray(data?.items))
      return { ...data, items: data.items.map((s: any) => (s?.id === scriptId ? patch(s) : s)) }
    return data
  })

  // Recommendations for any scriptId
  qc.setQueriesData({ queryKey: ["get-script-recommendation"], type: "all" }, (data: any) => {
    if (!data) return data
    if (Array.isArray(data)) return data.map((s) => (s?.id === scriptId ? patch(s) : s))
    if (Array.isArray(data?.items))
      return { ...data, items: data.items.map((s: any) => (s?.id === scriptId ? patch(s) : s)) }
    return data
  })

  // Featured script (single object)
  qc.setQueriesData({ queryKey: ["featured-script"], type: "all" }, (s: any) =>
    s?.id === scriptId ? patch(s) : s,
  )
}
