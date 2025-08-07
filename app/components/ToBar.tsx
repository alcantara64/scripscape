import { StyleProp, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface ToBarProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const ToBar = (props: ToBarProps) => {
  const { style } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  return (
    <View style={$styles}>
      <View>
        <Text style={themed($text)}>Logo</Text>
      </View>
      <View>
        <View style={themed($text)}>Hello</View>
        <View style={themed($text)}>Hello</View>
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "space-between",
}

const $text: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.palette.neutral100,
})
