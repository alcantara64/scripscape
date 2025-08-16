import {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

import { Text } from "@/components/Text"
import { ScriptStatus } from "@/interface/script"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { AutoImage } from "./AutoImage"
import { formatNumber } from "@/utils/formatDate"
import { spacing } from "@/theme/spacing"
import { colors } from "@/theme/colors"
import { Icon } from "./Icon"

export interface ScriptCardProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  imageSource: ImageSourcePropType
  status: ScriptStatus
  numberOfParts: number
  title: string
  description: string
  commentsCount: number
  viewsCount: number
  likedCount: number
  isVertical?: boolean
}

/**
 * Describe your component here
 */
export const ScriptCard = (props: ScriptCardProps) => {
  const {
    style,
    imageSource,
    status,
    numberOfParts,
    title,
    description,
    viewsCount,
    commentsCount,
    likedCount,
    isVertical,
  } = props
  const $styles = [$container, style, { flexDirection: isVertical ? "column" : "row" } as ViewStyle]
  const { themed } = useAppTheme()

  return (
    <TouchableOpacity style={$styles}>
      <AutoImage style={$imageContainer} source={imageSource} maxWidth={184} />

      <View style={$contentContainer}>
        <Text style={themed($titleText)} numberOfLines={1} text={title} />
        <View style={$partContainer}>
          <View style={$statusContainer(status)}>
            <Text text={status} style={themed($statusText)} />
          </View>
          <View>
            <View />
            <Text text={`${numberOfParts} Parts`} />
          </View>
        </View>
        <Text text={description} numberOfLines={2} />

        <View style={$statsRow}>
          <View style={$statItem}>
            <Icon icon="eye" size={24} />
            <Text text={`${formatNumber(viewsCount)}`} />
          </View>
          <View style={$statItem}>
            <Icon icon="like" size={16} />
            <Text text={`${formatNumber(likedCount)}`} />
          </View>
          <View style={$statItem}>
            <Icon icon="comment" size={16} />
            <Text text={`${formatNumber(commentsCount)}`} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const $container: ViewStyle = {
  flexDirection: "row",
  gap: spacing.xs,
  flex: 1,
}
const $imageContainer: ImageStyle = {
  height: "100%",
}
const $contentContainer: ViewStyle = {
  flex: 1,
}

const $titleText: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: spacing.md,
  color: colors.palette.neutral100,
  fontWeight: 700,
  lineHeight: 20,
  marginBottom: 8,
})

const $partContainer: ViewStyle = {
  flexDirection: "row",
  gap: spacing.xs,
}
const $statusContainer = (status: ScriptStatus): ViewStyle => ({
  backgroundColor: status === ScriptStatus.completed ? colors.success : colors.tint,
  gap: spacing.xs,
  borderRadius: 8,
  marginBottom: spacing.xxs,
})

const $statusText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.palette.secondary400,
  paddingHorizontal: 8,
  fontWeight: 700,
})

const $statsRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  marginTop: spacing.xxs,
}

const $statItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxxs,
}
