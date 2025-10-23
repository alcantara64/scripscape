import { useCallback } from "react"
import * as DocumentPicker from "expo-document-picker"
import { useFocusEffect } from "@react-navigation/native"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { CreatePart, CreateScript, Dialogue, IScript, Part, WriterStatus } from "@/interface/script"
import { categoryService } from "@/services/categoryService"
import { scriptService } from "@/services/scriptService"
import { getOrThrow, patchScriptInCollections } from "@/utils/query"
import { loadString, saveString } from "@/utils/storage"

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
      qc.invalidateQueries({ queryKey: ["get-my-scripts"] })
    },
  })
}
async function deleteScript(vars: Pick<UpdateScriptVar, "scriptId">) {
  return getOrThrow(scriptService.deleteScript(vars.scriptId))
}

export function useDeleteScript() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteScript,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["get-my-scripts"] })
    },
  })
}
async function viewScriptScript(vars: { script_id: number }) {
  return getOrThrow(scriptService.viewScript(vars.script_id))
}

export function useTrackScriptView(scriptId: number, hours = 8) {
  const qc = useQueryClient()
  useFocusEffect(
    useCallback(() => {
      const key = `ss:viewed_at:${scriptId}`
      const last = Number(loadString(key) ?? "0")
      const now = Date.now()
      if (now - last < hours * 3600_000) return

      // mark first so we don’t double fire on re-focus
      saveString(key, String(now))

      // optimistic ++ on detail cache
      const detailKey = ["get-script-by-id", scriptId] as const
      const prev = qc.getQueryData<any>(detailKey)
      //todo fix this logic
      if (prev) qc.setQueryData(detailKey, { ...prev, viewCount: (prev.viewCount ?? 0) + 1 })

      viewScriptScript({ script_id: scriptId }).catch(() => {
        // rollback
        const curr = qc.getQueryData<any>(detailKey)
        if (curr)
          qc.setQueryData(detailKey, { ...curr, viewCount: Math.max(0, (curr.viewCount ?? 1) - 1) })
        saveString(key, "0")
      })
    }, [scriptId, hours]),
  )
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
export const useGetScriptRecommendationByScriptId = (scriptId: number) => {
  return useQuery({
    queryKey: ["get-script-recommendation", scriptId],
    queryFn: () => getOrThrow(scriptService.getScriptRecommendation(scriptId)),
  })
}
export const useGetTodayTrendingScripts = (category: string = "all") => {
  return useQuery({
    queryKey: ["get-trending-today", category],
    queryFn: () => getOrThrow(scriptService.getTrendingToday(category)),
  })
}
export const useGetFeaturedScript = () => {
  return useQuery({
    queryKey: ["featured-script"],
    queryFn: () => getOrThrow(scriptService.getFeatured()),
  })
}
async function likeScript(scriptId: number) {
  return getOrThrow(scriptService.likeScript(scriptId))
}
async function unlikeScript(scriptId: number) {
  return getOrThrow(scriptService.unlikeScript(scriptId))
}
export function useToggleScriptLike(scriptId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (nextLike: boolean) =>
      nextLike ? likeScript(scriptId) : unlikeScript(scriptId),
    onMutate: async (nextLike) => {
      // stop outgoing refetches on detail
      await qc.cancelQueries({ queryKey: ["get-script-by-id", scriptId] })
      const detailKey = ["get-script-by-id", scriptId] as const
      const previous = qc.getQueryData<IScript>(detailKey)

      const patcher = (s: IScript) =>
        s
          ? {
              ...s,
              likedByMe: nextLike,
              likes_count: Math.max(0, (s.likes_count ?? 0) + (nextLike ? 1 : -1)),
            }
          : s

      // detail cache
      if (previous) qc.setQueryData(detailKey, patcher(previous))
      // lists
      patchScriptInCollections(qc, scriptId, patcher)

      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      // rollback detail
      if (ctx?.previous) qc.setQueryData(["get-script-by-id", scriptId], ctx.previous)
      // safest: refresh detail
      qc.invalidateQueries({ queryKey: ["get-script-by-id", scriptId] })
    },
    onSuccess: (server) => {
      // trust server counts
      const detailKey = ["get-script-by-id", scriptId] as const
      qc.setQueryData(detailKey, (curr: any) => (curr ? { ...curr, ...server } : curr))
      patchScriptInCollections(qc, scriptId, (s) => (s ? { ...s, ...server } : s))
    },
    onSettled: () => {
      // ensure eventual consistency
      qc.invalidateQueries({ queryKey: ["get-script-by-id", scriptId], exact: true })
    },
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
      qc.invalidateQueries({ queryKey: ["get-part-by-id", variable.part_id] })
    },
  })
}
async function deletePart(vars: { part_id: number }) {
  return getOrThrow(scriptService.deleteScriptPart(vars.part_id))
}

export const useDeleteScriptPart = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletePart,
    onSuccess: (data, variable) => {
      qc.invalidateQueries({ queryKey: ["get-part-by-id", variable.part_id] })
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
