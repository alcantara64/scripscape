import { ImageStyle, Platform, StyleProp, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"

import { AutoImage } from "./AutoImage"
import { SmartImage } from "./SmartImage"

export interface AnnouncementBoxProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  imageSource: any
  title: string
  description: string
}

/**
 * Describe your component here
 */
export const AnnouncementBox = (props: AnnouncementBoxProps) => {
  const { style, imageSource, title, description } = props

  const { themed } = useAppTheme()
  const $styles = [themed($container), style]

  return (
    <View style={$styles}>
      <View>
        <SmartImage imageStyle={$imageStyle} image={imageSource} />
      </View>
      <View style={$textContainer}>
        <Text numberOfLines={1} style={themed($title)}>
          {title}
        </Text>
        <Text numberOfLines={2} style={themed($text)}>
          {description}
        </Text>
      </View>
    </View>
  )
}

const $text: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: spacing.sm,
  color: colors.palette.neutral300,
})

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: spacing.sm,
  borderColor: colors.palette.primary400,
  borderWidth: 1,
  backgroundColor: colors.palette.primary500,
  padding: spacing.xs,

  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
    },
    android: {
      elevation: 10,
    },
  }),
})

const $imageStyle: ImageStyle = {
  borderRadius: spacing.xs,
  width: "100%",
  height: 204,
  maxHeight: 204,
}

const $textContainer: ViewStyle = {
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.sm,
  marginTop: spacing.xs,
  gap: 5,
}

const $title: ThemedStyle<TextStyle> = ({ typography, spacing, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: spacing.lg,
  fontWeight: 500,
  color: colors.palette.neutral200,
})
