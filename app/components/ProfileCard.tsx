import React from "react"
import {
  ImageStyle,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
  Image,
  ImageSourcePropType,
  Pressable,
} from "react-native"

import { Text } from "@/components/Text"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Icon } from "./Icon"

export interface ProfileCardProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  name: string
  email?: string
  isPro?: boolean
  picture: ImageSourcePropType | undefined
  showUpdateButton?: boolean
}

/**
 * Describe your component here
 */
export const ProfileCard = (props: ProfileCardProps) => {
  const { style, name, email, isPro, picture, showUpdateButton } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  return (
    <View style={$styles}>
      <View style={$profileSection}>
        <Pressable style={$imageContainer}>
          {showUpdateButton && (
            <Icon
              icon="upload"
              size={24}
              color={colors.text}
              style={$uploadItem}
              containerStyle={themed($uploadButtonContainer)}
            />
          )}
          <Image source={picture} style={themed($avatar)} />
        </Pressable>
        <View>
          <Text text={name} preset="default" weight="semiBold" size="xl" />
          {email && <Text style={$email}>{email}</Text>}
          {isPro && (
            <View style={$proBadge}>
              <Text style={$proText} text="PRO ⭐" weight="bold" size="md" />
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
}

const $profileSection: ViewStyle = { flexDirection: "row", alignItems: "center", marginBottom: 20 }
const $avatar: ThemedStyle<ImageStyle> = ({ colors, spacing }) => ({
  width: spacing.xxxl + 18,
  height: spacing.xxxl + 18,
  borderRadius: (spacing.xxxl + 18) / 2,
  marginRight: spacing.md,
  borderWidth: spacing.xxs - 1,
  borderColor: colors.border2,
})
const $email: TextStyle = { color: "#ccc", fontSize: 12 }
const $proBadge: ViewStyle = {
  backgroundColor: "#3997B4",
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 8,
  marginTop: 5,
  alignSelf: "flex-start",
}

const $proText: TextStyle = {
  color: "#fff",
  fontSize: 10,
  textAlign: "center",
  alignSelf: "center",
}
const $imageContainer: ViewStyle = {
  position: "relative",
}
const $uploadButtonContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  zIndex: 1,
  right: spacing.md + 2,
  bottom: spacing.xxs + 2,
  height: spacing.lg + 2,
  width: spacing.lg,
  borderRadius: spacing.lg / 2,
  backgroundColor: colors.highlighter,
})
const $uploadItem: ImageStyle = {
  alignSelf: "center",
  padding: 4,
  paddingBottom: 8,
  marginTop: 2,
}
