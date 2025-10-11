import { useEffect, useState } from "react"
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"

import { loadString, saveString, remove as removeKey } from "@/utils/storage"

export interface OneTimeModalProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  artwork: React.ReactNode
  storageKey: string
  onClose?: () => void
  testID?: string
}

/**
 * Describe your component here
 */
export const OneTimeModal = (props: OneTimeModalProps) => {
  const { testID, onClose, artwork, storageKey } = props

  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const seen = loadString(storageKey)
    if (!seen) setVisible(true)
  }, [storageKey])

  const dismiss = (_e?: GestureResponderEvent) => {
    saveString(storageKey, "seen")
    setVisible(false)
    onClose?.()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <Pressable
        style={$backdrop}
        onPress={dismiss}
        testID={testID ? `${testID}-backdrop` : undefined}
      >
        <View style={$artworkWrap}>{artwork}</View>
      </Pressable>
    </Modal>
  )
}

export function resetOneTimeModal(key = "onetime-svg-modal:v1") {
  removeKey(key)
}

const $backdrop: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.5)",
}

const $artworkWrap: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
}
