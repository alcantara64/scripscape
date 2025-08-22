import { FC, useRef, useState } from "react"
import {
  ImageBackground,
  ImageStyle,
  Pressable,
  SafeAreaView,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { useNavigation } from "@react-navigation/native"

import { FollowerCard } from "@/components/FollowerCard"
import { FollowersList } from "@/components/FollowersList"
import { Icon } from "@/components/Icon"
import { ImagePickerWithCropping } from "@/components/ImagePickerWithCroping"
import { Line } from "@/components/Line"
import { ProfileCard } from "@/components/ProfileCard"
import { Screen } from "@/components/Screen"
import { ScriptList } from "@/components/ScriptList"
import { Text } from "@/components/Text"
import { mock_scripts } from "@/mockups/script"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"
import { DEFAULT_IMAGE } from "@/utils/app.default"

// import { useNavigation } from "@react-navigation/native"

const DEFAULT_BACKGROUND_IMAGE = require("../../assets/images/profile-banner.png")

const followers = [
  {
    id: "1",
    name: "John Beacon",
    avatar: "https://randomuser.me/api/portraits/men/31.jpg",
    isPro: true,
    followers: 333,
    scripts: 200,
    isFollowing: true,
  },
  {
    id: "2",
    name: "Johnny Argyle",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    isPro: false,
    followers: 200,
    scripts: 266,
    isFollowing: true,
  },
  {
    id: "3",
    name: "John Tyrone",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    isPro: false,
    followers: 189,
    scripts: 344,
    isFollowing: true,
  },
  {
    id: "4",
    name: "Sarah Vega",
    avatar: "https://randomuser.me/api/portraits/women/21.jpg",
    isPro: true,
    followers: 420,
    scripts: 180,
    isFollowing: false,
  },
  {
    id: "5",
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/18.jpg",
    isPro: false,
    followers: 276,
    scripts: 143,
    isFollowing: true,
  },
  {
    id: "6",
    name: "Lena Alvarez",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    isPro: false,
    followers: 310,
    scripts: 215,
    isFollowing: false,
  },
]

interface ProfileScreenProps extends AppStackScreenProps<"Profile"> {}

export const ProfileScreen: FC<ProfileScreenProps> = () => {
  // Pull in navigation via hook
  const navigation = useNavigation()
  const { themed } = useAppTheme()
  const [currentTab, setCurrentTab] = useState<"followers" | "script">("followers")
  const bgPickerRef = useRef<{ pickImage: () => Promise<void> }>(null)
  const profilePickerRef = useRef<{ pickImage: () => Promise<void> }>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const toggleScriptFollowerTab = (type: "followers" | "script") => {
    setCurrentTab(type)
  }

  const defaultProfileImage = DEFAULT_IMAGE

  const handleBgImageSelected = (uri: string) => {
    setBackgroundImage(uri)
  }
  const handleProfileImageSelected = (uri: string) => {
    setProfileImage(uri)
  }
  return (
    <>
      <ImagePickerWithCropping
        ref={bgPickerRef}
        onImageSelected={handleBgImageSelected}
        aspect={[16, 9]} // wide ratio for background
      />
      <ImagePickerWithCropping
        ref={profilePickerRef}
        onImageSelected={handleProfileImageSelected}
        aspect={[1, 1]} // square for profile
      />
      <ImageBackground
        source={backgroundImage ? { uri: backgroundImage } : DEFAULT_BACKGROUND_IMAGE}
        style={$coverImage}
      >
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

          <TouchableOpacity
            style={themed($uploadButtonContainer)}
            onPress={() => {
              bgPickerRef.current?.pickImage()
            }}
          >
            <View style={themed($uploadButtonItem)}>
              <Icon icon="upload" size={16} color="#fff" />
              <Text text="Edit" />
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
      <Screen
        style={$root}
        extraContainerStyle={$screenStyle}
        preset="scroll"
        gradientColors={["#5B418D", "#240E56"]}
        gradientLocation={[0.079, 0.4045]}
        // gradientStart={{ x: 0.5, y: 0 }}
        // gradientEnd={{ x: 0, y: 1 }}
      >
        <View style={$profileCardContainer}>
          <ProfileCard
            picture={profileImage ? { uri: profileImage } : defaultProfileImage}
            name="W_Matterhorn"
            showUpdateButton
            isPro={true}
            onUpload={() => profilePickerRef.current?.pickImage()}
          />
          <TouchableOpacity style={$editContainer}>
            <Icon containerStyle={$editContentItems as ImageStyle} icon="edit" />
            <Text text="Edit" style={$editContentItems} />
          </TouchableOpacity>
        </View>
        <View style={$statsContainer}>
          <View style={$startFirstItem}>
            <View style={$iconsDescriptionContainer}>
              <Icon icon="person" size={15} />
              <Text text="Followers" weight="normal" size="xxs" />
            </View>
            <Text text="456K" preset="titleHeading" />
          </View>
          <View>
            <View style={$iconsDescriptionContainer}>
              <Icon icon="script" size={15} />
              <Text text="Script" weight="normal" size="xxs" />
            </View>
            <Text preset="titleHeading" text="56" />
          </View>
        </View>
        <View>
          <Text text="Bio" preset="subheading" />
          <Text
            text="Watkins is a seasoned scriptwriter known for crafting compelling narratives across film and television. With a sharp ear for dialogue and story structure, he brings ideas to life with emotional depth."
            preset="description"
            style={$profileDescription}
            numberOfLines={4}
          />
          <Pressable>
            <Text text="Read more" preset="readMore" />
          </Pressable>
        </View>
        <TouchableOpacity style={$bioBtn}>
          <Icon icon="edit" />
          <Text text="Edit Bio" size="xs" />
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
                currentTab === "script" && themed($activeTabText),
                currentTab === "script" && themed($activeTab),
                themed($tabText),
              ]}
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
                currentTab === "followers" && themed($activeTabText),
                currentTab === "followers" && themed($activeTab),
                themed($tabText),
              ]}
            >
              Followers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Script and FollowerList List */}
        {currentTab === "followers" ? (
          <FollowersList data={followers} />
        ) : (
          <ScriptList data={mock_scripts} />
        )}
      </Screen>
    </>
  )
}

const $root: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.xxs,
}
const $coverImage: ImageStyle = {
  minHeight: 140,
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
  paddingVertical: spacing.sm,
  marginHorizontal: spacing.sm,
}
const $uploadButtonContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderWidth: 2,
  borderColor: colors.profileBorder,
  alignSelf: "flex-end",
  paddingHorizontal: spacing.md,
  paddingVertical: 8,
  borderRadius: spacing.sm,
  marginTop: spacing.xxl,
  marginBottom: spacing.sm,
})

const $uploadButtonItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm + 2,
  alignItems: "center",
})

const $profileCardContainer: ViewStyle = {
  flexDirection: "row",
}
const $editContainer: ViewStyle = {
  flexDirection: "row",
  gap: 4,
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
  alignItems: "center",
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
const $activeTab: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  backgroundColor: colors.buttonBackground,
})
const $activeTabText: ThemedStyle<TextStyle> = ({ colors }) => ({
  // flex: 1,
  width: "100%",
  padding: 4,
  color: colors.descriptionText,
})
const $tabText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  padding: 4,
  textAlign: "center",
})

const $tabRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  backgroundColor: colors.tabBackground,
  marginTop: 10,
  borderRadius: spacing.sm,
  marginBottom: 20,
})
const $profileDescription: TextStyle = {
  fontSize: 14,
  lineHeight: 20,
}
