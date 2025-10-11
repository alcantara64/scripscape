import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Text } from "@/components/Text"
import { Button } from "./Button"

export interface ConfirmActionProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  question: string
  onConfirm: () => void
  onCancel: () => void
  title: string
  confirmBtnText?: string
  cancelBtnText?: string
  highlightedText?: string
}

/**
 * Describe your component here
 */
export const ConfirmAction = (props: ConfirmActionProps) => {
  const {
    style,
    onCancel,
    onConfirm,
    title = "Confirm Action",
    question,
    confirmBtnText = "Confirm",
    cancelBtnText = "Cancel",
    highlightedText,
  } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  return (
    <View style={$styles}>
      <Text preset="sectionHeader">{title}</Text>
      <Text preset="description" style={themed($text)}>
        {question} {highlightedText && <Text>{highlightedText}</Text>}?
      </Text>
      <Button onPress={onConfirm} text={confirmBtnText} style={themed($saveBtn)} />
      <Button
        onPress={onCancel}
        text={cancelBtnText}
        style={[themed($saveBtn), themed($cancelButton)]}
      />
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
}

const $text: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  fontWeight: 300,
  marginBottom: 20,
  color: colors.palette.neutral300,
})

const $saveBtn: ThemedStyle<ViewStyle> = () => ({ height: 44, bottom: 0 })

const $cancelButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  marginTop: 8,
})
