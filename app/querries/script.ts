import { useMutation } from "@tanstack/react-query"

import { CreateScript } from "@/interface/script"
import { scriptService } from "@/services/scriptService"
import { getOrThrow } from "@/utils/query"

async function createScript(payload: CreateScript) {
  const form = buildFormData(payload)
  return getOrThrow(scriptService.create(form))
}

function buildFormData(payload: CreateScript) {
  const fd = new FormData()
  fd.append("title", payload.title || "Untitled")
  if (payload.summary) fd.append("summary", payload.summary)

  if (payload.postalImage !== undefined) {
    if (payload.postalImage) fd.append("postalImage", payload.postalImage as any)
  }

  return fd
}

export function useCreateScript() {
  return useMutation({
    mutationFn: createScript,
  })
}
