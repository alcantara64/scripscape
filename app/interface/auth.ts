// Adjust fields if your backend returns more/less
export type Provider = "local" | "google" | "facebook" | "github" | "apple"

export interface User {
  user_id: number
  username: string
  email?: string | null
  provider: Provider
  profile_picture_url?: string | null
  cover_photo_url?: string | null
  bio?: string | null
  is_pro: boolean
  isNew?: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken?: string
  tokenType: "Bearer"
  expiresIn: string | number
}

export interface CreateAccountResponse {
  user: User
  message: string
}

export interface MeResponse {
  user: User
}
export type SignUpResponse = AuthResponse & { message: string }
