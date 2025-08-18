import { FC, useState } from "react"
import {
  ImageBackground,
  ImageStyle,
  SafeAreaView,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Icon } from "@/components/Icon"
import { Line } from "@/components/Line"
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
  const [currentTab, setCurrentTab] = useState<"followers" | "script">("script")

  const toggleScriptFollowerTab = (type: "followers" | "script") => {
    setCurrentTab(type)
  }
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
        <View style={$profileCardContainer}>
          <ProfileCard
            picture={{ uri: "https://i.pravatar.cc/150?img=4" }}
            name="W_Matterhorn"
            showUpdateButton
            isPro={true}
          />
          <TouchableOpacity style={$editContainer}>
            <Icon containerStyle={$editContentItems as ImageStyle} icon="edit" />
            <Text text="Edit" style={$editContentItems} />
          </TouchableOpacity>
        </View>
        <View style={$statsContainer}>
          <View style={$startFirstItem}>
            <View style={$iconsDescriptionContainer}>
              <Icon icon="community" size={15} />
              <Text text="Followers" weight="normal" size="xxs" />
            </View>
            <Text text="456K" preset="titleHeading" />
          </View>
          <View>
            <View style={$iconsDescriptionContainer}>
              <Icon icon="community" size={15} />
              <Text text="Script" weight="normal" size="xxs" />
            </View>
            <Text preset="titleHeading" text="56" />
          </View>
        </View>
        <View>
          <Text text="Bio" preset="subheading" />
          <Text
            text="Watkins is a seasoned scriptwriter known for crafting compelling narratives across film and television. With a sharp ear for dialogue and story structure, he brings ideas to life with emotional depth.Read more"
            preset="description"
            numberOfLines={4}
          />
        </View>
        <TouchableOpacity style={$bioBtn}>
          <Icon icon="edit" />
          <Text text="Edit Bio" preset="description" />
        </TouchableOpacity>
        <Line style={$line} color="#BEB6D1" />

        {/* Tabs */}
        <View style={themed($tabRow)}>
          <TouchableOpacity
            style={$tab}
            onPress={() => {
              toggleScriptFollowerTab("script")
            }}
          >
            <Text
              style={[
                currentTab === "script" && $activeTabText,
                currentTab === "script" && $activeTab,
                $tabText,
              ]}
              preset="description"
            >
              Script
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={$tab}
            onPress={() => {
              toggleScriptFollowerTab("followers")
            }}
          >
            <Text
              style={[
                currentTab === "followers" && $activeTabText,
                currentTab === "followers" && $activeTab,
                $tabText,
              ]}
            >
              Followers
            </Text>
          </TouchableOpacity>
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
  padding: 12,
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

const $uploadButtonItem: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm + 2,
  alignItems: "center",
})

const $profileCardContainer: ViewStyle = {
  flexDirection: "row",
}
const $editContainer: ViewStyle = {
  flexDirection: "row",
  gap: 2,
  alignItems: "baseline",
  paddingTop: 12,
  marginLeft: 4,
}
const $editContentItems: ViewStyle = {
  alignSelf: "center",
}

const $statsContainer: ViewStyle = {
  flexDirection: "row",
  paddingVertical: 8,
}
const $startFirstItem: ViewStyle = { marginRight: 140 }
const $iconsDescriptionContainer: ViewStyle = {
  flexDirection: "row",
  gap: 4,
}
const $bioBtn: ViewStyle = {
  borderWidth: 1,
  borderColor: "#fff",
  paddingVertical: 8,
  borderRadius: 8,
  alignSelf: "flex-start",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  gap: 8,
  marginVertical: 8,
}

const $line: ViewStyle = { marginVertical: spacing.md }
const $tab: ViewStyle = { flex: 1, padding: 8, alignItems: "center" }
const $activeTab: ViewStyle = { borderRadius: 8, backgroundColor: "#6a11cb" }
const $activeTabText: TextStyle = {
  flex: 1,
  width: "100%",
  padding: 4,
}
const $tabText: TextStyle = { color: "#ECEFFD", padding: 4, textAlign: "center" }

const $tabRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  backgroundColor: colors.tabBackground,
  marginTop: 10,
  borderRadius: spacing.sm,
})
