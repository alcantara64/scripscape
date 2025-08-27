import type { AuthResponse, MeResponse } from "@/interface/auth"

import { Api } from "./api"
import { ApiResult } from "./api/types"

export class AuthService {
  constructor(private httpClient: Api) {}

  login(identifier: string, password: string): Promise<ApiResult<AuthResponse>> {
    return this.httpClient.post<AuthResponse>("/api/v1/users/login", { identifier, password })
  }

  loginWithGoogle(id_token: string): Promise<ApiResult<AuthResponse>> {
    return this.httpClient.post<AuthResponse>("/api/v1/auth/google", { id_token })
  }

  loginWithApple(id_token: string): Promise<ApiResult<AuthResponse>> {
    return this.httpClient.post<AuthResponse>("/api/v1/auth/apple", { id_token })
  }

  refresh(
    refreshToken: string,
  ): Promise<ApiResult<Pick<AuthResponse, "accessToken" | "tokenType" | "expiresIn">>> {
    return this.httpClient.post("/api/v1/users/refresh", { refreshToken })
  }

  me(): Promise<ApiResult<MeResponse>> {
    return this.httpClient.get<MeResponse>("/api/v1/users/me")
  }
}

export const authService = new AuthService(new Api())
