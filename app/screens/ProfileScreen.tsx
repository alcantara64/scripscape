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

import { AppBottomSheet, BottomSheetController } from "@/components/AppBottomSheet"
import { AvatarEditor } from "@/components/AvatarEditor"
import { FieldEditor } from "@/components/FieldEditor"
import { FollowersList } from "@/components/FollowersList"
import { Icon } from "@/components/Icon"
import { ImagePickerWithCropping } from "@/components/ImagePickerWithCroping"
import { Line } from "@/components/Line"
import { ProfileCard } from "@/components/ProfileCard"
import ReadMoreText from "@/components/ReadMore"
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

type EditorConfig = {
  key: "username" | "bio"
  title: string
  label: string
  icon: string
  initialValue: string
  maxLength?: number
  multiline?: boolean
  validate?: (v: string) => string | undefined
}

export const ProfileScreen: FC<ProfileScreenProps> = () => {
  // Pull in navigation via hook
  const navigation = useNavigation()
  const { themed } = useAppTheme()

  const avatarPickerRef = useRef<{
    pickImage: () => Promise<void>
    takePhoto?: () => Promise<void>
  }>(null)
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null)
  const [sheetView, setSheetView] = useState<"field" | "avatar" | "background" | null>(null)

  const [currentTab, setCurrentTab] = useState<"followers" | "script">("followers")
  const bgPickerRef = useRef<{ pickImage: () => Promise<void> }>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const sheet = useRef<BottomSheetController | null>(null)
  const [editorConfig, setEditorConfig] = useState<EditorConfig | null>(null)
  const [username, setUsername] = useState("W_Matterhorn")
  const [bio, setBio] = useState(
    "Watkins is a seasoned scriptwriter known for crafting compelling narratives across film and television. With a sharp ear for dialogue and story structure, he brings ideas to life with emotional depth.",
  )
  const [pendingBackground, setPendingBackground] = useState<string | null>(null)

  const toggleScriptFollowerTab = (type: "followers" | "script") => {
    setCurrentTab(type)
  }

  const openUsernameEditor = () => {
    setEditorConfig({
      key: "username",
      title: "Edit Username",
      label: "Username",
      icon: "person",
      initialValue: username,
      maxLength: 15,
      validate: (v) => {
        if (v.trim().length < 6) return "Username must be at least 6 characters"
        if (!/^[a-z0-9_]+$/i.test(v)) return "cannot include any spaces or special characters"
        return undefined
      },
    })
    setSheetView("field")
    sheet.current?.open()
  }

  const openBioEditor = () => {
    setEditorConfig({
      key: "bio",
      title: "Edit Bio",
      label: "Bio",
      icon: "info",
      initialValue: bio,
      maxLength: 300,
      multiline: true,
      validate: (v) => (v.trim().length === 0 ? "Bio can't be empty" : undefined),
    })
    setSheetView("field")
    sheet.current?.open()
  }

  const handleSave = async (value: string) => {
    if (!editorConfig) return
    if (editorConfig.key === "username") {
      // await api.updateUsername(value)
      setUsername(value)
    } else if (editorConfig.key === "bio") {
      // await api.updateBio(value)
      setBio(value)
    }
  }

  const defaultProfileImage = DEFAULT_IMAGE

  const handleBgImageSelected = (uri: string) => {
    setPendingBackground(uri)
  }

  return (
    <>
      <ImagePickerWithCropping
        ref={bgPickerRef}
        onImageSelected={handleBgImageSelected}
        aspect={[16, 9]} // wide ratio for background
      />

      {/* Avatar editor picker (hidden) */}
      <ImagePickerWithCropping
        ref={avatarPickerRef}
        onImageSelected={(uri) => setPendingAvatar(uri)}
        aspect={[1, 1]}
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
              setPendingBackground(backgroundImage ?? null)
              setSheetView("background")
              sheet.current?.open()
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
            onUpload={() => {
              setPendingAvatar(profileImage ?? null)
              setSheetView("avatar")
              sheet.current?.open()
            }}
          />
          <TouchableOpacity style={$editContainer} onPress={openUsernameEditor}>
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
          {/* <Text
            text="Watkins is a seasoned scriptwriter known for crafting compelling narratives across film and television. With a sharp ear for dialogue and story structure, he brings ideas to life with emotional depth."
            preset="description"
            style={$profileDescription}
            numberOfLines={4}
          /> */}
          <ReadMoreText
            textStyle={$profileDescription}
            maxChars={200}
            preset="description"
            content="Watkins is a seasoned scriptwriter known for crafting compelling narratives across film and television. With a sharp ear for dialogue and story structure, he brings ideas to life with emotional depth. ssdd,Watkins is a seasoned scriptwriter known for crafting compelling narratives across film and television. With a sharp ear for dialogue and story structure, he brings ideas to life with emotional depth.  "
          />
        </View>
        <TouchableOpacity style={$bioBtn} onPress={openBioEditor}>
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
      <AppBottomSheet controllerRef={sheet} snapPoints={["75%", "85%"]}>
        {sheetView === "field" && editorConfig ? (
          <FieldEditor
            title={editorConfig.title}
            label={editorConfig.label}
            icon={editorConfig.icon}
            initialValue={editorConfig.initialValue}
            maxLength={editorConfig.maxLength}
            multiline={editorConfig.multiline}
            validate={editorConfig.validate}
            inputWrapperStyle={$inputWrapperStyle}
            onSave={handleSave}
            onClose={() => sheet.current?.close()}
          />
        ) : sheetView === "avatar" ? (
          <AvatarEditor
            value={pendingAvatar ?? profileImage}
            onUpload={() => avatarPickerRef.current?.pickImage()}
            onTakePhoto={() => avatarPickerRef.current?.takePhoto?.()}
            onSave={() => {
              if (pendingAvatar) setProfileImage(pendingAvatar)
              sheet.current?.close()
            }}
            onClose={() => sheet.current?.close()}
          />
        ) : sheetView === "background" ? (
          <AvatarEditor
            // reuse the same component for background too
            value={pendingBackground ?? backgroundImage}
            onUpload={() => bgPickerRef.current?.pickImage()} // uses 16:9 aspect picker
            onSave={() => {
              if (pendingBackground) setBackgroundImage(pendingBackground)
              sheet.current?.close()
            }}
            onClose={() => sheet.current?.close()}
          />
        ) : (
          <View style={{ padding: 12 }}>
            <Text text="Nothing to edit yet." />
          </View>
        )}
      </AppBottomSheet>
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
const $inputWrapperStyle: ViewStyle = { paddingTop: 4, paddingBottom: 4 }
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
  paddingTop: 18,
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
const $fieldTitle: ViewStyle = {
  gap: 20,
}

const $buttonStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.buttonBackground,
  borderRadius: 12,
  borderWidth: 0,
})
