// api/rq.ts

import { ApiResult } from "@/services/api/types"

export async function getOrThrow<T>(p: Promise<ApiResult<T>>): Promise<T> {
  const res = await p
  if (res.ok) return res.data
  // Map problems to user-friendly messages
  console.log({ res })
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
