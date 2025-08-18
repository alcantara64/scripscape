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

export interface FollowerCardProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  picture: ImageSourcePropType | undefined
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
          <Image source={picture} style={themed($avatar)} />
        </Pressable>
        <View>
          <View style={$nameAndBadgeContainer}>
            <Text text={name} preset="default" weight="semiBold" size="md" />

            {isPro && (
              <View style={$proBadge}>
                <Text style={$proText} text="PRO" weight="bold" size="md" />
              </View>
            )}
          </View>
          <View style={$statsContainer}>
            <View style={$iconsDescriptionContainer}>
              <Icon icon="person" size={15} />
              <Text text={`${followers}`} weight="normal" size="xxs" />
            </View>

            <View style={$iconsDescriptionContainer}>
              <Icon icon="script" size={15} />
              <Text text={`${scripts}`} weight="normal" size="xxs" />
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity style={themed($followUnfollowButton)}>
        <Text text="Unfollow" size="sm" />
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
}
const $avatar: ThemedStyle<ImageStyle> = ({ colors, spacing }) => ({
  width: spacing.xxl,
  height: spacing.xxl,
  borderRadius: spacing.xxxl / 2,
  marginRight: spacing.md,
  borderWidth: spacing.xxs - 1,
  borderColor: colors.border2,
})

const $proBadge: ViewStyle = {}

const $proText: TextStyle = {
  color: "#fff",
  fontSize: 10,
  paddingHorizontal: 16,
  backgroundColor: "#3997B4",
  borderRadius: 8,
  marginLeft: 8,
}
const $nameAndBadgeContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $followUnfollowButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderRadius: spacing.sm,
  borderColor: colors.fadedTint,
  justifyContent: "center",
  paddingVertical: spacing.xxxs,
  paddingHorizontal: spacing.xs,
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
