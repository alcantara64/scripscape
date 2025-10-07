import * as DocumentPicker from "expo-document-picker"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  CreatePart,
  CreateScript,
  Dialogue,
  Part,
  ScriptCharacter,
  WriterStatus,
} from "@/interface/script"
import { categoryService } from "@/services/categoryService"
import { scriptService } from "@/services/scriptService"
import { getOrThrow } from "@/utils/query"

type ReorderVars = { script_id: number; parts: Part[] }
type UpdateVars = { part_id: number; part: Partial<Omit<Part, "part_id">> }

type CreatePartDialogueVars = {
  part_id: number
  dialogue: Omit<Dialogue, "id" | "part_id" | "created_at" | "dialogueCharacter"> & {
    audioFile?: DocumentPicker.DocumentPickerAsset
  }
}
type UpdateScriptVar = {
  scriptId: number
  payload: Partial<CreateScript> & { tags?: Array<string | number>; categoryIds?: Array<number> }
}

//Script
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

function buildUpdateFormData(
  fields: Partial<CreateScript> & {
    tags?: Array<string | number>
    categoryIds?: Array<number>
    isMatureContent?: boolean
  },
): FormData {
  const fd = new FormData()
  // File (optional)
  if (fields.postalImage) {
    fd.append("postalImage", fields.postalImage as File)
  }
  if (fields.title != null) fd.append("title", fields.title)
  if (fields.summary !== undefined) fd.append("summary", fields.summary ?? "")
  if (fields.status) fd.append("status", fields.status)
  if (fields.isMatureContent) fd.append("isMatureContent", fields.isMatureContent as any)
  if (fields.writerStatus)
    fd.append(
      "writerStatus",
      fields.writerStatus === WriterStatus.completed ? "completed" : "in_progress",
    )

  // Arrays → repeat the key (multer-friendly)
  if (fields.categoryIds?.length) {
    fields.categoryIds.forEach((id) => fd.append("categoryIds[]", String(id)))
  }

  if (fields.tags?.length) {
    fields.tags.forEach((t) => fd.append("tags[]", String(t)))
  }

  return fd
}

async function updateScript(vars: UpdateScriptVar) {
  const form = buildUpdateFormData(vars.payload)
  return getOrThrow(scriptService.update(vars.scriptId, form))
}

export function useCreateScript() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createScript,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["get-my-scripts"] })
    },
  })
}

export function useUpdateScript() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateScript,
    onSuccess: (response, variables) => {
      qc.invalidateQueries({ queryKey: ["get-script-by-id", variables.scriptId] })
    },
  })
}

//parts
async function createPart(payload: CreatePart) {
  return getOrThrow(scriptService.createScriptParts(payload.script_id, payload))
}

export const useCreateScriptPart = () => {
  return useMutation({
    mutationFn: createPart,
  })
}

export const useGetPartsById = (partId: number) => {
  return useQuery({
    queryKey: ["get-part-by-id", partId],
    queryFn: () => getOrThrow(scriptService.getPartById(partId)),
  })
}

export const useGetPartsByScript = (script_id: number) => {
  return useQuery({
    queryKey: ["get-parts", script_id],
    queryFn: () => getOrThrow(scriptService.getPartsByScript(script_id)),
  })
}

export const useGetMyScripts = () => {
  return useQuery({
    queryKey: ["get-my-scripts"],
    queryFn: () => getOrThrow(scriptService.getMyScripts()),
  })
}

export const useGetScriptById = (scriptId: number) => {
  return useQuery({
    queryKey: ["get-script-by-id", scriptId],
    queryFn: () => getOrThrow(scriptService.getScript(scriptId)),
  })
}

async function reorderParts(vars: ReorderVars) {
  return getOrThrow(scriptService.reorderScriptParts(vars.script_id, vars.parts))
}

export const useOrderScriptParts = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reorderParts,
    onSuccess: (data, variable) => {
      qc.invalidateQueries({ queryKey: ["get-parts", variable.script_id] })
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
    onSuccess: (data, variable) => {
      qc.invalidateQueries({ queryKey: ["get-parts", `${data.script_id}`] })
    },
  })
}

//character

async function createPartDialogue(vars: CreatePartDialogueVars) {
  return getOrThrow(scriptService.createDialogue(vars.part_id, vars.dialogue))
}

export const useScriptCreateDialoguePart = () => {
  return useMutation({
    mutationFn: createPartDialogue,
  })
}

// category
export const useGetMyCategories = () => {
  return useQuery({
    queryKey: ["get-my-categories"],
    queryFn: () => getOrThrow(categoryService.getCategories()),
  })
}
