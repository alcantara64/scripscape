import type { AuthResponse, MeResponse, SignUpResponse } from "@/interface/auth"

import { Api } from "./api"
import { ApiResult } from "./api/types"

export class AuthService {
  constructor(private httpClient: Api) {}

  login(identifier: string, password: string): Promise<ApiResult<AuthResponse>> {
    return this.httpClient.post<AuthResponse>("/users/login", { identifier, password })
  }

  loginWithGoogle(id_token: string, isSignUp?: boolean): Promise<ApiResult<AuthResponse>> {
    return this.httpClient.post<AuthResponse>("/auth/google", { id_token, isSignUp })
  }

  loginWithApple(id_token: string, isSignUp?: boolean): Promise<ApiResult<AuthResponse>> {
    return this.httpClient.post<AuthResponse>("/auth/apple", { id_token, isSignUp })
  }
  forgotPassword(email: string): Promise<ApiResult<{ message: string }>> {
    return this.httpClient.post<{ message: string }>("/auth/forgot", { email })
  }
  verifyCode(email: string, code: string): Promise<ApiResult<{ message: string }>> {
    return this.httpClient.post<{ message: string }>("/auth/verify-code", { email, code })
  }

  updatePassword(password: string, code: string): Promise<ApiResult<{ message: string }>> {
    return this.httpClient.post<{ message: string }>("/auth/reset", { password, code })
  }
  refresh(
    refreshToken: string,
  ): Promise<ApiResult<Pick<AuthResponse, "accessToken" | "tokenType" | "expiresIn">>> {
    return this.httpClient.post("/users/refresh", { refreshToken })
  }

  signUpWithEmailPassword(payload: {
    username: string
    email: string
    password: string
  }): Promise<ApiResult<SignUpResponse>> {
    return this.httpClient.post<SignUpResponse>("/users", payload)
  }

  me(): Promise<ApiResult<MeResponse>> {
    return this.httpClient.get<MeResponse>("/api/v1/users/me")
  }
}

export const authService = new AuthService(new Api())
