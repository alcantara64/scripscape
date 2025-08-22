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

import { PressableIcon } from "./Icon"
import { ProBadge } from "./ProBadge"

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
  onUpload?: () => void
}

/**
 * Describe your component here
 */
export const ProfileCard = (props: ProfileCardProps) => {
  const { style, name, email, isPro, picture, showUpdateButton, onUpload } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  return (
    <View style={$styles}>
      <View style={$profileSection}>
        <Pressable style={$imageContainer}>
          {showUpdateButton && (
            <PressableIcon
              onPress={onUpload}
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
          <Text text={name} style={themed($name)} preset="default" weight="semiBold" size="xl" />
          {email && <Text style={$email}>{email}</Text>}
          {isPro && <ProBadge />}
        </View>
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
}
const $name: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.fadedTint,
  lineHeight: 33,
  fontWeight: 400,
})

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
  backgroundColor: colors.buttonBackground,
})
const $uploadItem: ImageStyle = {
  alignSelf: "center",
  padding: 4,
  paddingBottom: 8,
  marginTop: 2,
}
