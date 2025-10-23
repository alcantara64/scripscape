import { Platform } from "react-native"
import * as DocumentPicker from "expo-document-picker"
import * as FileSystem from "expo-file-system"

import {
  CreatePart,
  Dialogue,
  EmbeddedImage,
  EmbeddedImageResponse,
  IComment,
  IScript,
  Part,
  ScriptCharacter,
  ScriptLocationImage,
  ScriptLocationImageResponse,
  ScriptResponse,
  TrendingTodayResponse,
} from "@/interface/script"
import { toRNFile } from "@/utils/image"

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
    return this.httpClient.post<ScriptResponse>("/script", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }
  update(script_id: number, payload: FormData): Promise<ApiResult<ScriptResponse>> {
    return this.httpClient.put<ScriptResponse>(`/script/${script_id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }
  deleteScript(script_id: number): Promise<ApiResult<ScriptResponse>> {
    return this.httpClient.delete<ScriptResponse>(`/script/${script_id}`)
  }
  getScript(
    scriptId: number,
  ): Promise<ApiResult<{ script: IScript; mostEngagedComment: IComment }>> {
    return this.httpClient.get<{ script: IScript; mostEngagedComment: IComment }>(
      `/script/${scriptId}`,
    )
  }
  getScriptRecommendation(
    scriptId: number,
  ): Promise<ApiResult<{ script_id: number; recommendations: Array<IScript> }>> {
    return this.httpClient.get<{ script_id: number; recommendations: Array<IScript> }>(
      `/script/${scriptId}/recommendations`,
    )
  }
  getScripts(): Promise<ApiResult<ScriptResponse>> {
    return this.httpClient.get<ScriptResponse>(`/script/`)
  }
  getTrendingToday(category = "all"): Promise<ApiResult<TrendingTodayResponse>> {
    return this.httpClient.get<TrendingTodayResponse>(`/script/trending/today?category=${category}`)
  }
  getFeatured(): Promise<ApiResult<IScript>> {
    return this.httpClient.get<IScript>(`/script/featured/script`)
  }
  getMyScripts(): Promise<ApiResult<Array<IScript>>> {
    return this.httpClient.get<Array<IScript>>(`/script/me`)
  }
  viewScript(script_id: number): Promise<ApiResult<undefined>> {
    return this.httpClient.post(`/script/${script_id}/views`)
  }
  likeScript(script_id: number): Promise<ApiResult<{ created: boolean; likeCount?: number }>> {
    return this.httpClient.post(`/script/${script_id}/like`)
  }
  unlikeScript(script_id: number): Promise<ApiResult<{ deleted: boolean }>> {
    return this.httpClient.delete(`/script/${script_id}/like`)
  }
  getPartsByScript(scriptId: number): Promise<ApiResult<Array<Part>>> {
    return this.httpClient.get<Array<Part>>(`/script/${scriptId}/parts`)
  }
  getPartById(part_id: number): Promise<ApiResult<Part>> {
    return this.httpClient.get<Part>(`/script/parts/${part_id}`)
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
    if (payload.status) {
      fd.append("status", payload.status)
    }

    return this.httpClient.patch<Part>(`/script/parts/${part_id}`, fd)
  }

  deleteScriptPart(part_id: number): Promise<ApiResult<{}>> {
    return this.httpClient.delete(`/script/parts/${part_id}`)
  }

  //location images
  createScriptLocation(
    script_id: number,
    payload: Omit<ScriptLocationImage, "id">,
  ): Promise<ApiResult<ScriptLocationImage>> {
    const fd = new FormData()
    if (payload.image) {
      fd.append("image", payload.image)
    }
    if (payload.name) {
      fd.append("name", payload.name)
    }
    if (payload.hideName) {
      fd.append("hideName", payload.hideName as any)
    }

    return this.httpClient.post<ScriptLocationImage>(`/script/${script_id}/locations`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }
  createEmbedImages(
    script_id: number,
    payload: { image: string },
  ): Promise<ApiResult<EmbeddedImage>> {
    const fd = new FormData()
    if (payload.image) {
      fd.append("image", toRNFile(payload.image, `${new Date().toLocaleString()}.png`) as any)
    }

    return this.httpClient.post<EmbeddedImage>(`/script/${script_id}/images`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }

  getEmbeddedImagesByScript(scriptId: number): Promise<ApiResult<EmbeddedImageResponse>> {
    return this.httpClient.get<EmbeddedImageResponse>(`/script/${scriptId}/images`)
  }

  getLocationsByScript(scriptId: number): Promise<ApiResult<ScriptLocationImageResponse>> {
    return this.httpClient.get<ScriptLocationImageResponse>(`/script/${scriptId}/locations`)
  }

  updateScriptLocation(
    script_id: number,
    payload: ScriptLocationImage,
  ): Promise<ApiResult<ScriptLocationImage>> {
    const fd = new FormData()
    if (payload.image) {
      fd.append("image", payload.image)
    }
    if (payload.name) {
      fd.append("name", payload.name)
    }
    if (payload.hideName) {
      fd.append("hideName", payload.hideName as any)
    }

    return this.httpClient.patch<ScriptLocationImage>(
      `/script/${script_id}/locations/${payload.id}`,
      fd,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    )
  }

  deleteLocationsByScript(
    scriptId: number,
    id: number,
  ): Promise<ApiResult<ScriptLocationImageResponse>> {
    return this.httpClient.delete<ScriptLocationImageResponse>(
      `/script/${scriptId}/locations/${id}`,
    )
  }

  getCharactersByScript(scriptId: number): Promise<ApiResult<Array<ScriptCharacter>>> {
    return this.httpClient.get<Array<ScriptCharacter>>(`/script/dialogues/${scriptId}/characters`)
  }
  createScriptCharacters(
    script_id: number,
    payload: Omit<ScriptCharacter, "id" | "part">,
  ): Promise<ApiResult<ScriptCharacter>> {
    const fd = new FormData()
    if (payload.image) {
      fd.append("image", toRNFile(payload.image, payload.name) as any)
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
    payload.additional_images?.forEach((p, i) => {
      fd.append("additional_images", toRNFile(p, `extra-${i}.jpg`) as any)
    })

    return this.httpClient.post<ScriptCharacter>(`/script/dialogues/${script_id}/characters`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }
  updateScriptCharacters(
    character_id: number,
    script_id: number,
    payload: Omit<ScriptCharacter, "id">,
  ): Promise<ApiResult<ScriptCharacter>> {
    const fd = new FormData()
    if (payload.image) {
      fd.append("image", toRNFile(payload.image, `${payload.name}.png`) as any)
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
    payload.additional_images?.forEach((p, i) => {
      fd.append("additional_images", toRNFile(p, `extra-${i}.jpg`) as any)
    })

    return this.httpClient.put<ScriptCharacter>(
      `/script/${script_id}/characters/${character_id}`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" }, transformRequest: (d) => d },
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

    return this.httpClient.post<Dialogue>(`/script/parts/${part_id}/dialogues`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (d) => d,
    })
  }
  getDialogueById(dialogueId: number): Promise<ApiResult<Dialogue>> {
    return this.httpClient.get<Dialogue>(`/script/dialogue/${dialogueId}`)
  }
}

export const scriptService = new ScriptService(new Api())
