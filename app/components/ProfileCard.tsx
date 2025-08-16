import {
  ImageStyle,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
  Image,
  ImageSourcePropType,
} from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface ProfileCardProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  name: string
  email?: string
  isPro?: boolean
  picture: ImageSourcePropType | undefined
}

/**
 * Describe your component here
 */
export const ProfileCard = (props: ProfileCardProps) => {
  const { style, name, email, isPro, picture } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  return (
    <View style={$styles}>
      <View style={$profileSection}>
        <Image source={picture} style={themed($avatar)} />
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

const $text: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.palette.primary500,
})

const $profileSection: ViewStyle = { flexDirection: "row", alignItems: "center", marginBottom: 20 }
const $avatar: ThemedStyle<ImageStyle> = ({ colors }) => ({
  width: 82,
  height: 82,
  borderRadius: 41,
  marginRight: 15,
  borderWidth: 3,
  borderColor: colors.border2,
})
const $name: TextStyle = { color: "#fff", fontSize: 16, fontWeight: "bold" }
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
