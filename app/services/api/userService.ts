import type { AuthResponse, MeResponse, SignUpResponse } from "@/interface/auth"

import { ApiResult } from "./types"

import { Api } from "./"

export class UserService {
  constructor(private httpClient: Api) {}

  me(): Promise<ApiResult<MeResponse>> {
    return this.httpClient.get<MeResponse>("/users/me")
  }
  updateInfo(payload: FormData): Promise<ApiResult<MeResponse>> {
    return this.httpClient.put<MeResponse>("/users/me", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }
}

export const userService = new UserService(new Api())
