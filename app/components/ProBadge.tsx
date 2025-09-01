import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"
import { spacing } from "@/theme/spacing"
import Svg, { Path } from "react-native-svg"

export interface ProBadgeProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const ProBadge = (props: ProBadgeProps) => {
  const { style } = props
  const $styles = [style]
  const { themed } = useAppTheme()

  return (
    <View style={[$styles, $proBadge]}>
      <Text style={$proText} text="PRO " weight="bold" size="md" />
      <Svg width={10} height={10} viewBox="0 0 24 24" fill="#e4f7fd">
        <Path d="M12 .587l3.668 7.568L24 9.748l-6 5.844 1.416 8.259L12 19.896l-7.416 3.955L6 15.592 0 9.748l8.332-1.593z" />
      </Svg>
    </View>
  )
}

const $proBadge: ViewStyle = {
  backgroundColor: "#3997B4",
  paddingHorizontal: 6,
  paddingVertical: 4,
  borderRadius: 4,
  marginTop: 5,
  alignSelf: "flex-start",
  flexDirection: "row",
}

const $proText: TextStyle = {
  color: colors.fadedTint,
  fontSize: spacing.xs + 2,
  textAlign: "center",
  alignSelf: "center",
  fontWeight: 600,
  lineHeight: 11,
}
