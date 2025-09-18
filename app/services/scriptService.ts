import { ScriptResponse } from "@/interface/script"

import { Api } from "./api"
import { ApiResult } from "./api/types"

export class ScriptService {
  constructor(private httpClient: Api) {}

  create(payload: FormData): Promise<ApiResult<ScriptResponse>> {
    return this.httpClient.post<ScriptResponse>("/script", payload)
  }
  getScript(scriptId: number): Promise<ApiResult<ScriptResponse>> {
    return this.httpClient.post<ScriptResponse>(`/script/${scriptId}`)
  }
}

export const scriptService = new ScriptService(new Api())
