import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react"
import { useMMKVString, useMMKVBoolean } from "react-native-mmkv"

import { AuthSheet } from "@/components/AuthSheet" // <- your AuthSheet component
// If you already have this type elsewhere, import it instead:
import { User } from "@/interface/auth"
import { readTokens } from "@/utils/storage/auth"

export type AuthContextType = {
  isAuthenticated: boolean
  authToken?: string
  authEmail?: string
  username?: string
  setAuthToken: (token?: string) => void
  setAuthEmail: (email: string) => void
  logout: () => void
  validationError: string
  currentUser?: User
  isPro?: boolean

  // ---- extras (non-breaking) ----
  requireAuth: () => Promise<void>
  openAuthSheet: () => void
  closeAuthSheet: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthProviderProps {
  /** Mobile client id for Google (passed into AuthSheet) */
  googleClientId: string
}

type Deferred = {
  promise: Promise<void>
  resolve: () => void
  reject: (reason?: any) => void
}
const defer = (): Deferred => {
  let resolve!: () => void
  let reject!: (reason?: any) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}
type TokensArg = { accessToken?: string; refreshToken?: string; tokenType?: string }

export const AuthProvider: FC<PropsWithChildren<AuthProviderProps>> = ({
  children,
  googleClientId,
}) => {
  const [authToken, setAuthToken] = useMMKVString("AuthProvider.authToken")
  const [authEmail, setAuthEmail] = useMMKVString("AuthProvider.authEmail")
  const [username, setUsername] = useMMKVString("AuthProvider.username")
  const [isPro, setIsPro] = useMMKVBoolean("AuthProvider.isPro")
  const [authRefreshToken, setAuthRefreshToken] = useMMKVString("AuthProvider.authRefreshToken")
  const [authTokenType, setAuthTokenType] = useMMKVString("AuthProvider.authTokenType")

  const [sheetVisible, setSheetVisible] = useState(false)
  // const [currentUser, setCurrentUser] = useMMKVString("AuthProvider.currentUser")
  const waiterRef = useRef<Deferred | null>(null)

  const openAuthSheet = useCallback(() => setSheetVisible(true), [])
  const closeAuthSheet = useCallback(() => setSheetVisible(false), [])

  const logout = useCallback(() => {
    setAuthToken(undefined)
    setAuthEmail("")
  }, [setAuthEmail, setAuthToken])

  const isAuthenticated = !!authToken
  // same validation rules you already had
  const validationError = useMemo(() => {
    if (!authEmail || authEmail.length === 0) return "can't be blank"
    if (authEmail.length < 6) return "must be at least 6 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) return "must be a valid email address"
    return ""
  }, [authEmail])

  /**
   * Call this before any protected action:
   *   await requireAuth()
   * If not authenticated, it opens the login sheet and resolves on success.
   */
  const requireAuth = useCallback(() => {
    if (isAuthenticated) return Promise.resolve()
    if (!waiterRef.current) waiterRef.current = defer()
    openAuthSheet()
    return waiterRef.current.promise
  }, [isAuthenticated, openAuthSheet])

  // Called by the sheet when login succeeds
  const handleAuthenticated = useCallback(
    async (_user: User, tokens?: TokensArg) => {
      const saved = await readTokens()
      const accessToken = tokens?.accessToken ?? saved.accessToken ?? undefined
      const refreshToken = tokens?.refreshToken ?? saved.refreshToken ?? undefined
      const tokenType = tokens?.tokenType ?? saved.tokenType ?? "Bearer"
      setIsPro(_user.is_pro)
      // The AuthSheet helpers store tokens in SecureStore; mirror into MMKV for your app state
      if (accessToken) setAuthToken(accessToken)
      if (refreshToken) setAuthRefreshToken?.(refreshToken) // if you track it in state
      setAuthTokenType?.(tokenType)

      if (_user.username) setUsername(_user.username)

      // Try to hydrate email if we didn't get it from the sheet
      if (!_user.email) {
        try {
          //   const r = await  me()
          //   if (r?.user?.email) setAuthEmail(r.user.email)
        } catch {
          /* ignore */
        }
      } else {
        setAuthEmail(_user.email || "")
      }

      closeAuthSheet()
      waiterRef.current?.resolve()
      waiterRef.current = null
    },
    [
      setAuthEmail,
      setAuthToken,
      closeAuthSheet,
      setAuthRefreshToken,
      setUsername,
      setAuthTokenType,
    ],
  )

  // Called by the sheet when dismissed/canceled
  const handleCanceled = useCallback(() => {
    closeAuthSheet()
    waiterRef.current?.reject(new Error("Auth canceled"))
    waiterRef.current = null
  }, [closeAuthSheet])

  const value: AuthContextType = {
    isAuthenticated,
    authToken,
    authEmail,
    setAuthToken,
    setAuthEmail,
    logout,
    validationError,
    // extras
    requireAuth,
    openAuthSheet,
    closeAuthSheet,
    username,
    // currentUser,
    isPro,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}

      <AuthSheet
        visible={sheetVisible}
        onAuthenticated={handleAuthenticated}
        onCanceled={handleCanceled}
        googleClientId={googleClientId}
      />
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
