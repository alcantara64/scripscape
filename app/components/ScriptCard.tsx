import { useState } from "react"
import {
  ImageStyle,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleSheet,
} from "react-native"

import { Text } from "@/components/Text"
import { ScriptStatus } from "@/interface/script"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"
import { formatNumber } from "@/utils/formatDate"

import { AutoImage } from "./AutoImage"
import { Icon } from "./Icon"
import { SmartImage } from "./SmartImage"
import { ImageSource } from "expo-image"

export interface ScriptCardProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  imageSource: ImageSource
  status: ScriptStatus
  numberOfParts: number
  title: string
  description: string
  commentsCount: number
  viewsCount: number
  likedCount: number
  isVertical?: boolean
  script_id: number
  writerStatus: ScriptStatus
  onPress?: (script_id: number) => void
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
    writerStatus,
    script_id,
    onPress,
  } = props
  const $styles = [
    $container(isVertical),
    style,
    { flexDirection: isVertical ? "column" : "row" } as ViewStyle,
  ]
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
    <TouchableOpacity
      style={$styles}
      onPress={() => {
        onPress?.(script_id)
      }}
    >
      <View style={{ position: "relative" }}>
        <SmartImage
          style={$imageContainer}
          imageStyle={$imageStyle}
          image={currentImageSource}
          onError={handleImageError}
        />
        <View pointerEvents="none" style={$overlay} />
      </View>

      <View style={$contentContainer}>
        <View style={$titleContainer}>
          <Text style={themed($titleText)} numberOfLines={1} text={title} />
          {status !== "published" && (
            <View style={themed($draft)}>
              <Icon icon="write" color="#FFC773" size={11} />
              <Text text={status} style={themed($draftText)} />
            </View>
          )}
        </View>
        <View style={$partContainer}>
          <View style={$statusContainer(writerStatus)}>
            <Text text={writerStatus} style={themed($statusText)} />
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

const $container = (isVertical: boolean): ViewStyle => ({
  flexDirection: "row",
  gap: spacing.xs,
  flex: 1,
  maxHeight: isVertical ? "auto" : 98,
})
const $imageContainer: ImageStyle = { maxHeight: 98 }
const $imageStyle: ImageStyle = { height: 98, width: 180, maxWidth: 180 }
const $contentContainer: ViewStyle = {
  flex: 1,
}
const $overlay: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  // backgroundColor: "rgba(0,0,0,0.30)",
}

const $titleContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 5,
  gap: 8,
}

const $titleText: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: spacing.md - 1,
  color: colors.palette.neutral100,
  fontWeight: 500,
  lineHeight: 20,
})

const $partContainer: ViewStyle = {
  flexDirection: "row",
  gap: spacing.xs,
  alignItems: "center",
}
const $statusContainer = (status: ScriptStatus): ViewStyle => ({
  backgroundColor: status === ScriptStatus.completed ? colors.success : colors.palette.accent500,
  gap: spacing.xs,
  borderRadius: 8,
  marginBottom: spacing.xxs,
  paddingVertical: 4,
  paddingHorizontal: 8,
  alignItems: "center",
})
const $draft: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 5,
  borderWidth: 1,
  borderColor: "#FFC773",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 4,
})

const $draftText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: "#FFC773",
  paddingHorizontal: 4,
  textAlign: "center",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 19,
  textTransform: "capitalize",
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
