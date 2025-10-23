import { ImageStyle, Pressable, StyleProp, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { IComment } from "@/interface/script"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { DEFAULT_PROFILE_IMAGE } from "@/utils/app.default"
import { formatNumber, timeAgo } from "@/utils/formatDate"

import { PressableIcon } from "./Icon"
import { SmartImage } from "./SmartImage"

export interface CommentCardProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  profilePicture: string
  name: string
  createDate: string
  comment: string
  replyCount: number
  onPress: (comment: IComment) => void
  isReplyView?: boolean
}

/**
 * Describe your component here
 */
export const CommentCard = (props: CommentCardProps) => {
  const { style, profilePicture, name, createDate, comment, replyCount, onPress, isReplyView } =
    props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  return (
    <Pressable style={$styles} onPress={onPress}>
      <View style={$profileContainer}>
        <SmartImage
          imageStyle={themed($avatar)}
          image={profilePicture ? { uri: profilePicture } : DEFAULT_PROFILE_IMAGE}
        />
        <View style={{ flexShrink: 1 }}>
          <View style={$commentTimeAndNameContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text text={name} />
              <Text preset="description" text={timeAgo(createDate)} />
            </View>
            <PressableIcon icon="ellipsis" />
          </View>
          <Text style={themed($text)}>{comment}</Text>
          <View style={$interactionsContainer}>
            <View style={$item}>
              <PressableIcon icon="like" size={20} />
              <Text preset="description" text={formatNumber(0)} />
            </View>
            {!isReplyView && (
              <View style={$item}>
                <PressableIcon icon="reply" size={20} />
                {replyCount > 0 && (
                  <Text preset="description" text={formatNumber(replyCount) + " replies"} />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const $container: ViewStyle = {}

const $text: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 20,
  color: colors.palette.secondary100,
})
const $avatar: ThemedStyle<ImageStyle> = ({ colors, spacing }) => ({
  width: spacing.xl + 4,
  height: spacing.xl + 4,
  borderRadius: (spacing.xl + 4) / 2,
})
const $profileContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 8,
}
const $commentTimeAndNameContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  justifyContent: "space-between",
}
const $item: ViewStyle = {
  flexDirection: "row",
  gap: 8,
  alignItems: "center",
}
const $interactionsContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 20,
}
