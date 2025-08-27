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
import * as SecureStore from "expo-secure-store"
import { useMMKVString } from "react-native-mmkv"

import { AuthSheet } from "@/components/AuthSheet" // <- your AuthSheet component
// If you already have this type elsewhere, import it instead:
import { User } from "@/interface/auth"

export type AuthContextType = {
  isAuthenticated: boolean
  authToken?: string
  authEmail?: string
  setAuthToken: (token?: string) => void
  setAuthEmail: (email: string) => void
  logout: () => void
  validationError: string

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

export const AuthProvider: FC<PropsWithChildren<AuthProviderProps>> = ({
  children,
  googleClientId,
}) => {
  const [authToken, setAuthToken] = useMMKVString("AuthProvider.authToken")
  const [authEmail, setAuthEmail] = useMMKVString("AuthProvider.authEmail")

  const [sheetVisible, setSheetVisible] = useState(false)
  const waiterRef = useRef<Deferred | null>(null)

  const openAuthSheet = useCallback(() => setSheetVisible(true), [])
  const closeAuthSheet = useCallback(() => setSheetVisible(false), [])

  const logout = useCallback(() => {
    setAuthToken(undefined)
    setAuthEmail("")
    closeAuthSheet()
  }, [setAuthEmail, setAuthToken, closeAuthSheet])

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
    console.log({ isAuthenticated })
    if (isAuthenticated) return Promise.resolve()
    if (!waiterRef.current) waiterRef.current = defer()
    openAuthSheet()
    return waiterRef.current.promise
  }, [isAuthenticated, openAuthSheet])

  // Called by the sheet when login succeeds
  const handleAuthenticated = useCallback(
    async (_user: User) => {
      // The AuthSheet helpers store tokens in SecureStore; mirror into MMKV for your app state
      const token = await SecureStore.getItemAsync("accessToken")
      if (token) setAuthToken(token)

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
    [setAuthEmail, setAuthToken, closeAuthSheet],
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
