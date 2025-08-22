import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"
import { spacing } from "@/theme/spacing"

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
      <Text style={$proText} text="PRO ⭐" weight="bold" size="md" />
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
}

const $proText: TextStyle = {
  color: colors.fadedTint,
  fontSize: spacing.xs + 2,
  textAlign: "center",
  alignSelf: "center",
  fontWeight: 600,
  lineHeight: 11,
}
