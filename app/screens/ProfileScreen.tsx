import { FC } from "react"
import {
  ImageBackground,
  ImageStyle,
  SafeAreaView,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Icon } from "@/components/Icon"
import { ProfileCard } from "@/components/ProfileCard"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"

// import { useNavigation } from "@react-navigation/native"

const DEFAULT_PROFILE_IMAGE = require("../../assets/images/default-profile.png")
const DEFAULT_BACKGROUND_IMAGE = require("../../assets/images/profile-banner.png")

interface ProfileScreenProps extends AppStackScreenProps<"Profile"> {}

export const ProfileScreen: FC<ProfileScreenProps> = () => {
  // Pull in navigation via hook
  const navigation = useNavigation()
  const { themed } = useAppTheme()
  return (
    <>
      <ImageBackground source={DEFAULT_BACKGROUND_IMAGE} style={$coverImage}>
        <SafeAreaView style={$backgroundImageContainer}>
          <View style={themed($profileHeaderContainer)}>
            <View style={$headTextContainer}>
              <TouchableOpacity onPress={navigation.goBack}>
                <Icon icon="arrowLeft" />
              </TouchableOpacity>
              <Text text="My Profile" preset="subheading" weight="semiBold" size="xl" />
            </View>
            <TouchableOpacity>
              <Icon icon="flag" size={36} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={themed($uploadButtonContainer)}>
            <View style={themed($uploadButtonItem)}>
              <Icon icon="upload" size={16} color="#fff" />
              <Text text="Edit" />
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
      <Screen style={$root} extraContainerStyle={$screenStyle} preset="scroll">
        <View>
          <ProfileCard
            picture={{ uri: "https://i.pravatar.cc/150?img=4" }}
            name="W_Matterhorn"
            isPro={true}
          />
        </View>
      </Screen>
    </>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
const $coverImage: ImageStyle = {
  minHeight: 230,
}
const $profileHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignContent: "center",
  justifyContent: "space-between",
})
const $screenStyle: ViewStyle = {
  borderTopRightRadius: 12,
  borderTopLeftRadius: 12,
}
const $headTextContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}
const $backgroundImageContainer: ViewStyle = {
  paddingVertical: spacing.lg,
  marginHorizontal: spacing.lg,
}
const $uploadButtonContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderWidth: 2,
  borderColor: colors.profileBorder,
  alignSelf: "flex-end",
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 12,
  marginTop: 68,
})

const $uploadButtonItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  gap: 14,
  alignItems: "center",
})
