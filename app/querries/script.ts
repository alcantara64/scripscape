import * as DocumentPicker from "expo-document-picker"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { CreatePart, CreateScript, Dialogue, Part, ScriptCharacter } from "@/interface/script"
import { categoryService } from "@/services/categoryService"
import { scriptService } from "@/services/scriptService"
import { getOrThrow } from "@/utils/query"

type ReorderVars = { script_id: number; parts: Part[] }
type UpdateVars = { part_id: number; part: Partial<Omit<Part, "part_id">> }

type CreatePartCharactersVars = {
  part_id: number
  character: Omit<ScriptCharacter, "id">
}
type CreatePartDialogueVars = {
  part_id: number
  dialogue: Omit<Dialogue, "id" | "part_id" | "created_at" | "dialogueCharacter"> & {
    audioFile?: DocumentPicker.DocumentPickerAsset
  }
}
type UpdateScriptVar = {
  scriptId: number
  payload: CreateScript
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

function buildUpdateFormData(fields: CreateScript): FormData {
  const fd = new FormData()
  // File (optional)
  if (fields.postalImage) {
    fd.append("postalImage", fields.postalImage as File)
  }
  if (fields.title != null) fd.append("title", fields.title)
  if (fields.summary !== undefined) fd.append("summary", fields.summary ?? "")
  if (fields.status) fd.append("status", fields.status)

  // Arrays → repeat the key (multer-friendly)
  if (fields.categories?.length) {
    fields.categories.forEach((id) => fd.append("categoryIds[]", String(id)))
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
  return useMutation({
    mutationFn: createScript,
  })
}

export function useUpdateScript() {
  return useMutation({
    mutationFn: updateScript,
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

export const useGetCharactersByScript = (script_id: number) => {
  return useQuery({
    queryKey: ["get-part-characters", script_id],
    queryFn: () => getOrThrow(scriptService.getCharactersByScript(script_id)),
  })
}
async function createPartCharacter(vars: CreatePartCharactersVars) {
  return getOrThrow(scriptService.createScriptCharacters(vars.part_id, vars.character))
}
export const useScriptCreatePartCharacter = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPartCharacter,
    onSuccess: (response, variables) => {
      qc.invalidateQueries({ queryKey: ["get-get-part-characters", variables.part_id] })
    },
  })
}
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
