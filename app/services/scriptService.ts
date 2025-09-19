import { CreatePart, Part, ScriptPartLocationImage, ScriptResponse } from "@/interface/script"

import { Api } from "./api"
import { ApiResult } from "./api/types"

export class ScriptService {
  constructor(private httpClient: Api) {}

  create(payload: FormData): Promise<ApiResult<ScriptResponse>> {
    return this.httpClient.post<ScriptResponse>("/script", payload)
  }
  getScript(scriptId: number): Promise<ApiResult<ScriptResponse>> {
    return this.httpClient.get<ScriptResponse>(`/script/${scriptId}`)
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
}

export const scriptService = new ScriptService(new Api())
