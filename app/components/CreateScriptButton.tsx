import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Text } from "@/components/Text"

export interface CreateScriptButtonProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const CreateScriptButton = (props: CreateScriptButtonProps) => {
  const { style } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme();

  return (
    <View style={$styles}>
      <Text style={themed($text)}>Hello</Text>
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
}

const $text: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.palette.primary500,
})
