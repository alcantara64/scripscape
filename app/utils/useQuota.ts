// src/hooks/useQuota.ts
import { useMemo } from "react"

type Plan = "pro" | "free"

export type QuotaItem = { used: number; limit: number }
export type QuotaMap = {
  poster: QuotaItem
  embedded: QuotaItem
  location: QuotaItem
  character: QuotaItem
}

export type Limits = {
  poster: number
  embedded: number
  location: number
  character: number
}

const DEFAULT_LIMITS: Record<Plan, Limits> = {
  pro: { poster: 1, embedded: 50, location: 50, character: 50 },
  free: { poster: 1, embedded: 10, location: 15, character: 15 },
}

// If you ever need to override limits (A/B test, feature flags), pass `customLimits`.
export function useQuota(params: {
  isPro: boolean
  used: { poster?: number; embedded: number; location: number; character: number }
  customLimits?: Partial<Limits>
}) {
  const { isPro, used, customLimits } = params

  const limits = useMemo<Limits>(() => {
    const base = isPro ? DEFAULT_LIMITS.pro : DEFAULT_LIMITS.free
    return { ...base, ...customLimits }
  }, [
    isPro,
    customLimits?.poster,
    customLimits?.embedded,
    customLimits?.location,
    customLimits?.character,
  ])

  const quota = useMemo<QuotaMap>(() => {
    return {
      poster: { used: used.poster ?? 1, limit: limits.poster },
      embedded: { used: used.embedded, limit: limits.embedded },
      location: { used: used.location, limit: limits.location },
      character: { used: used.character, limit: limits.character },
    }
  }, [limits, used.poster, used.embedded, used.location, used.character])

  const progress = useMemo(() => {
    const totals = Object.values(quota).reduce(
      (acc, q) => {
        acc.used += q.used
        acc.total += q.limit
        return acc
      },
      { used: 0, total: 0 },
    )
    return { ...totals, pct: totals.total ? totals.used / totals.total : 0 }
  }, [quota])

  return { limits, quota, progress }
}
