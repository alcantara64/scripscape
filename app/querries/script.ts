import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { CreatePart, CreateScript, Part } from "@/interface/script"
import { scriptService } from "@/services/scriptService"
import { getOrThrow } from "@/utils/query"
type ReorderVars = { script_id: number; parts: Part[] }
type UpdateVars = { part_id: number; part: Partial<Omit<Part, "part_id">> }
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

async function createPart(payload: CreatePart) {
  return getOrThrow(scriptService.createScriptParts(payload.script_id, payload))
}

export const useCreateScriptPart = () => {
  return useMutation({
    mutationFn: createPart,
  })
}

export const useGetPartsByScript = (script_id: number) => {
  return useQuery({
    queryKey: ["get-parts", script_id],
    queryFn: () => getOrThrow(scriptService.getPartsByScript(script_id)),
  })
}

async function reorderParts(vars: ReorderVars) {
  return getOrThrow(scriptService.reorderScriptParts(vars.script_id, vars.parts))
}

export const useOrderScriptParts = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reorderParts,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["get-parts"] })
    },
  })
}

async function updatePart(vars: UpdateVars) {
  return getOrThrow(scriptService.updateScriptPart(vars.part_id, vars.part))
}

export const useUpdateScriptPart = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updatePart,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["get-parts"] })
    },
  })
}
