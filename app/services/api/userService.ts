import type { AuthResponse, MeResponse, SignUpResponse } from "@/interface/auth"

import { ApiResult } from "./types"

import { Api } from "./"

export class UserService {
  constructor(private httpClient: Api) {}

  me(): Promise<ApiResult<MeResponse>> {
    return this.httpClient.get<MeResponse>("/users/me")
  }
}

export const userService = new UserService(new Api())
