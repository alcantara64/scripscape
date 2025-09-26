import { Platform } from "react-native"
import * as DocumentPicker from "expo-document-picker"
import * as FileSystem from "expo-file-system"

import {
  CreatePart,
  Dialogue,
  IScript,
  Part,
  ScriptPartCharacter,
  ScriptPartLocationImage,
  ScriptResponse,
} from "@/interface/script"

import { Api } from "./api"
import { ApiResult } from "./api/types"

export class ScriptService {
  constructor(private httpClient: Api) {}

  private guessType(name?: string, fallback = "audio/mpeg") {
    if (!name) return fallback
    const ext = name.split(".").pop()?.toLowerCase()
    if (ext === "mp3") return "audio/mpeg"
    if (ext === "m4a") return "audio/m4a"
    if (ext === "wav") return "audio/wav"
    if (ext === "aac") return "audio/aac"
    return fallback
  }

  create(payload: FormData): Promise<ApiResult<ScriptResponse>> {
    return this.httpClient.post<ScriptResponse>("/script", payload)
  }
  update(script_id: number, payload: FormData): Promise<ApiResult<ScriptResponse>> {
    return this.httpClient.put<ScriptResponse>("/script", payload)
  }
  getScript(scriptId: number): Promise<ApiResult<IScript>> {
    return this.httpClient.get<IScript>(`/script/${scriptId}`)
  }
  getScripts(): Promise<ApiResult<ScriptResponse>> {
    return this.httpClient.get<ScriptResponse>(`/script/`)
  }
  getMyScripts(): Promise<ApiResult<Array<IScript>>> {
    return this.httpClient.get<Array<IScript>>(`/script/me`)
  }
  getPartsByScript(scriptId: number): Promise<ApiResult<Array<Part>>> {
    return this.httpClient.get<Array<Part>>(`/script/${scriptId}/parts`)
  }
  createScriptParts(scriptId: number, payload: CreatePart): Promise<ApiResult<Part>> {
    return this.httpClient.post<Part>(`/script/${scriptId}/parts`, payload)
  }
  reorderScriptParts(
    scriptId: number,
    payload: Array<Pick<Part, "part_id">>,
  ): Promise<ApiResult<Part>> {
    const order = payload.map((p) => p.part_id)

    return this.httpClient.put<Part>(`/script/${scriptId}/parts/reorder`, { order })
  }

  updateScriptPart(
    part_id: number,
    payload: Partial<Omit<Part, "part_id">>,
  ): Promise<ApiResult<Part>> {
    const fd = new FormData()
    if (payload.postalImage) {
      fd.append("postalImage", payload.postalImage)
    }
    if (payload.title) {
      fd.append("title", payload.title)
    }
    if (payload.content) {
      fd.append("content", payload.content)
    }

    return this.httpClient.patch<Part>(`/script/parts/${part_id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }
  createScriptPartLocation(
    part_id: number,
    payload: Omit<ScriptPartLocationImage, "id">,
  ): Promise<ApiResult<ScriptPartLocationImage>> {
    const fd = new FormData()
    if (payload.image) {
      fd.append("image", payload.image)
    }
    if (payload.name) {
      fd.append("name", payload.name)
    }
    if (payload.hideName) {
      fd.append("hideName", payload.hideName)
    }

    return this.httpClient.post<ScriptPartLocationImage>(`/script/parts/${part_id}/locations`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }

  getCharactersByPart(partId: number): Promise<ApiResult<Array<ScriptPartCharacter>>> {
    return this.httpClient.get<Array<ScriptPartCharacter>>(`/script/dialogues/${partId}/characters`)
  }
  createPartCharacters(
    part_id: number,
    payload: Omit<ScriptPartCharacter, "id" | "part">,
  ): Promise<ApiResult<ScriptPartCharacter>> {
    const fd = new FormData()
    if (payload.image) {
      console.log("image ==>", payload.image)
      fd.append("image", payload.image)
    }
    if (payload.text_background_color) {
      fd.append("text_background_color", payload.text_background_color)
    }
    if (payload.text_color) {
      fd.append("text_color", payload.text_color)
    }
    if (payload.name) {
      fd.append("name", payload.name)
    }

    return this.httpClient.post<ScriptPartCharacter>(
      `/script/dialogues/${part_id}/characters`,
      fd,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    )
  }
  async createDialogue(
    part_id: number,
    payload: Omit<Dialogue, "id" | "part_id" | "created_at" | "dialogueCharacter"> & {
      audioFile?: DocumentPicker.DocumentPickerAsset
    },
  ): Promise<ApiResult<Dialogue>> {
    const fd = new FormData()
    if (payload.audioFile) {
      let { uri, name, mimeType } = payload.audioFile
      if (uri.startsWith("content://")) {
        const dest = `${FileSystem.cacheDirectory}${name ?? "audio.mp3"}`
        await FileSystem.copyAsync({ from: uri, to: dest })
        uri = dest
      }
      if (!name) {
        // Try to infer extension from mimeType; default to .mp3
        const ext = mimeType?.includes("mpeg")
          ? "mp3"
          : mimeType?.includes("wav")
            ? "wav"
            : mimeType?.includes("m4a")
              ? "m4a"
              : "mp3"
        name = `audio.${ext}`
      }
      if (!name) {
        // Try to infer extension from mimeType; default to .mp3
        const ext = mimeType?.includes("mpeg")
          ? "mp3"
          : mimeType?.includes("wav")
            ? "wav"
            : mimeType?.includes("m4a")
              ? "m4a"
              : "mp3"
        name = `audio.${ext}`
      }
      const type = mimeType ?? this.guessType(name)
      fd.append("audio", { uri, name, type } as any)
    }

    fd.append("character_id", payload.character_id.toString())

    fd.append("dialogue", payload.dialogue)

    return this.httpClient.post<Dialogue>(`/script/parts/${part_id}/dialogues`, fd)
  }
}

export const scriptService = new ScriptService(new Api())
