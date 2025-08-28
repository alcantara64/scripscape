import * as SecureStore from "expo-secure-store"
// Somewhere central (auth/storage.ts)
export const AUTH_KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
  type: "tokenType", // e.g. "Bearer"
  accessExp: "accessTokenExpires", // optional unix ms
} as const

export type PersistableTokens = {
  accessToken: string
  refreshToken?: string
  tokenType?: string // e.g. "Bearer"
  accessTokenExpires?: number | string
}

export async function persistTokens(t: PersistableTokens) {
  await SecureStore.setItemAsync(AUTH_KEYS.access, t.accessToken)
  if (t.refreshToken) await SecureStore.setItemAsync(AUTH_KEYS.refresh, t.refreshToken)
  if (t.tokenType) await SecureStore.setItemAsync(AUTH_KEYS.type, t.tokenType)
  if (t.accessTokenExpires !== undefined)
    await SecureStore.setItemAsync(AUTH_KEYS.accessExp, String(t.accessTokenExpires))
}

export async function readTokens() {
  const accessToken = await SecureStore.getItemAsync(AUTH_KEYS.access)
  const refreshToken = await SecureStore.getItemAsync(AUTH_KEYS.refresh)
  const tokenType = await SecureStore.getItemAsync(AUTH_KEYS.type)
  const accessTokenExpiresStr = await SecureStore.getItemAsync(AUTH_KEYS.accessExp)
  const accessTokenExpires = accessTokenExpiresStr ? Number(accessTokenExpiresStr) : undefined
  return { accessToken, refreshToken, tokenType, accessTokenExpires }
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_KEYS.access),
    SecureStore.deleteItemAsync(AUTH_KEYS.refresh),
    SecureStore.deleteItemAsync(AUTH_KEYS.type),
    SecureStore.deleteItemAsync(AUTH_KEYS.accessExp),
  ])
}
