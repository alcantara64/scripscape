import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Text } from "@/components/Text"

export interface PlusIconProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const PlusIcon = (props: PlusIconProps) => {
  const { style } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  return (
    <View style={$circle}>
      {/* vertical line */}
      <View style={[$line, $vertical]} />
      {/* horizontal line */}
      <View style={[$line, $horizontal]} />
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
}
const $circle: ViewStyle = {
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: "#F6BD4A", // yellow background
  justifyContent: "center",
  alignItems: "center",
}
const $line: ViewStyle = {
  position: "absolute",
  backgroundColor: "#2D126C",
}
const $vertical: ViewStyle = {
  width: 5,
  height: 23,
}
const $horizontal: ViewStyle = {
  width: 23,
  height: 5,
}
