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
import { useState } from "react"

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
  const [currentImageSource, setCurrentImageSource] = useState(imageSource)
  const [hasError, setHasError] = useState(false)

  const defaultImage = require("../../assets/images/sad-face.png")

  const handleImageError = () => {
    // Only set the default image once
    if (!hasError) {
      setCurrentImageSource(defaultImage)
      setHasError(true)
    }
  }

  return (
    <TouchableOpacity style={$styles}>
      <View>
        <AutoImage
          style={$imageContainer}
          source={currentImageSource}
          maxWidth={184}
          onError={handleImageError}
        />
      </View>

      <View style={$contentContainer}>
        <Text style={themed($titleText)} numberOfLines={1} text={title} />
        <View style={$partContainer}>
          <View style={$statusContainer(status)}>
            <Text text={status} style={themed($statusText)} />
          </View>
          <View style={{ flexDirection: "row", gap: 4, alignItems: "center", marginBottom: 4 }}>
            <Icon icon="part" color="#C8D0FF" />
            <Text text={`${numberOfParts} Parts`} preset="description" style={$partsTextStyle} />
          </View>
        </View>
        <Text text={description} numberOfLines={2} preset="description" />

        <View style={$statsRow}>
          <View style={$statItem}>
            <Icon icon="eye" size={15} />
            <Text
              text={`${formatNumber(viewsCount)}`}
              size="sm"
              preset="description"
              style={$cardIconText}
            />
          </View>
          <View style={$statItem}>
            <Icon icon="like" size={15} />
            <Text
              text={`${formatNumber(likedCount)}`}
              size="sm"
              preset="description"
              style={$cardIconText}
            />
          </View>
          <View style={$statItem}>
            <Icon icon="comment" size={15} />
            <Text
              text={`${formatNumber(commentsCount)}`}
              size="sm"
              preset="description"
              style={$cardIconText}
            />
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
const $imageContainer: ImageStyle = { height: 92 }
const $contentContainer: ViewStyle = {
  flex: 1,
}

const $titleText: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: spacing.md - 1,
  color: colors.palette.neutral100,
  fontWeight: 500,
  lineHeight: 20,
  marginBottom: 2,
})

const $partContainer: ViewStyle = {
  flexDirection: "row",
  gap: spacing.xs,
  alignItems: "center",
}
const $statusContainer = (status: ScriptStatus): ViewStyle => ({
  backgroundColor: status === ScriptStatus.completed ? colors.success : colors.tint,
  gap: spacing.xs,
  borderRadius: 8,
  marginBottom: spacing.xxs,
  paddingVertical: 4,
  paddingHorizontal: 8,
  alignItems: "center",
})

const $statusText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontFamily: typography.primary.normal,
  fontSize: spacing.xs + 2,
  color: colors.palette.secondary400,
  paddingHorizontal: 8,
  fontWeight: 700,
  lineHeight: 10,
})
const $partsTextStyle: TextStyle = { fontSize: 10, fontWeight: 700, lineHeight: 16 }

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
const $cardIconText: TextStyle = {
  fontSize: 10,
  lineHeight: 16,
}
