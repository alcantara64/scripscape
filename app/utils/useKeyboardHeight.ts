import { useEffect, useState } from "react"
import { Keyboard, KeyboardEvent, Platform } from "react-native"

export function useKeyboardHeight() {
  const [height, setHeight] = useState(0)
  const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
  const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      const h = e.endCoordinates?.height ?? 0
      setHeight(h)
    }
    const onHide = () => setHeight(0)

    const s = Keyboard.addListener(showEvt, onShow)
    const hdl = Keyboard.addListener(hideEvt, onHide)
    return () => {
      s.remove()
      hdl.remove()
    }
  }, [])

  return height
}
