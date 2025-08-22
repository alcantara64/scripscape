import {
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
  Image,
  Pressable,
  ImageSourcePropType,
  ImageStyle,
  TouchableOpacity,
} from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Icon } from "./Icon"
import { ProBadge } from "./ProBadge"
import { SmartImage } from "./SmartImage"
import { ImageSource } from "expo-image"
import { DEFAULT_PROFILE_IMAGE } from "@/utils/app.default"
import { spacing } from "@/theme/spacing"

export interface FollowerCardProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  picture: ImageSource
  name: string
  isPro?: boolean
  scripts: number
  followers: number
}

/**
 * Describe your component here
 */
export const FollowerCard = (props: FollowerCardProps) => {
  const { style, picture, name, isPro, followers, scripts } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  return (
    <View style={$styles}>
      <View style={$profileSection}>
        <Pressable style={$imageContainer}>
          <SmartImage
            image={picture}
            fallBackImage={DEFAULT_PROFILE_IMAGE}
            imageStyle={themed($avatar)}
          />
        </Pressable>
        <View>
          <View style={$nameAndBadgeContainer}>
            <Text text={name} preset="default" weight="medium" size="sm" style={$titleText} />

            {isPro && <ProBadge />}
          </View>
          <View style={$statsContainer}>
            <View style={$iconsDescriptionContainer}>
              <Icon icon="person" size={15} />
              <Text
                text={`${followers}`}
                weight="bold"
                size="xxs"
                preset="description"
                style={$statsNumbers}
              />
            </View>

            <View style={$iconsDescriptionContainer}>
              <Icon icon="script" size={15} />
              <Text
                text={`${scripts}`}
                weight="normal"
                size="xxs"
                preset="description"
                style={$statsNumbers}
              />
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity style={themed($followUnfollowButton)}>
        <Text text="Unfollow" size="sm" style={$followText} />
      </TouchableOpacity>
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "space-between",
  flexDirection: "row",
}

const $profileSection: ViewStyle = { flexDirection: "row", alignItems: "flex-start" }
const $imageContainer: ViewStyle = {
  position: "relative",
  marginRight: spacing.xs,
}

const $avatar: ThemedStyle<ImageStyle> = ({ colors, spacing }) => ({
  width: spacing.xxl,
  height: spacing.xxl,
  borderRadius: spacing.xxxl / 2,
  borderWidth: spacing.xxs - 1,
  borderColor: colors.border2,
})

const $nameAndBadgeContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}

const $titleText: TextStyle = {
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 22,
}

const $followUnfollowButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderRadius: spacing.sm,
  borderColor: colors.fadedTint,
  justifyContent: "center",
  padding: spacing.xs,
})
const $iconsDescriptionContainer: ViewStyle = {
  flexDirection: "row",
  gap: 2,
  alignItems: "center",
}
const $statsContainer: ViewStyle = {
  flexDirection: "row",
  gap: 8,
}
const $statsNumbers: TextStyle = {
  fontWeight: 700,
  lineHeight: 22,
}
const $followText: TextStyle = {
  fontWeight: 500,
  lineHeight: 20,
  fontSize: 12,
}
