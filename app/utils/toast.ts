// src/utils/toast.ts
import Toast from "react-native-toast-message"

// infer the correct options type from the lib
type ToastParams = Parameters<typeof Toast.show>[0]
type BuiltinType = Extract<ToastParams["type"], "success" | "error" | "info">

type ShowOptions = {
  title?: string
  message?: string
  type?: BuiltinType // "success" | "error" | "info"
  duration?: number // ms
  position?: "top" | "bottom"
  dedupeKey?: string // avoid spamming the same toast
}

let lastKey: string | undefined
let lastAt = 0

function shouldDedupe(key?: string, windowMs = 1500) {
  if (!key) return false
  const now = Date.now()
  const dup = key === lastKey && now - lastAt < windowMs
  lastKey = key
  lastAt = now
  return dup
}

export function showToast({
  title,
  message,
  type = "info",
  duration = 3500,
  position = "top",
  dedupeKey,
}: ShowOptions) {
  if (shouldDedupe(dedupeKey ?? [type, title, message].filter(Boolean).join("|"))) return

  Toast.show({
    type,
    text1: title,
    text2: message,
    position,
    visibilityTime: duration,
    autoHide: true,
  })
}

export const toast = {
  success: (message: string, title = "Success") =>
    showToast({ type: "success", title, message, position: "top" }),
  error: (message: string, title = "Something went wrong") =>
    showToast({ type: "error", title, message }),
  info: (message: string, title?: string) => showToast({ type: "info", title, message }),
  hide: () => Toast.hide(),
}
