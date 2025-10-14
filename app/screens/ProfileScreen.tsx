import { FC, useRef, useState } from "react"
import {
  ImageStyle,
  SafeAreaView,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { ImageBackground } from "expo-image"
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
import { ProfileScreenSkeleton } from "@/components/skeleton/screens/ProfileScreenSkeleton"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useUpdateProfile, useUser } from "@/querries/user"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"
import { DEFAULT_PROFILE_IMAGE } from "@/utils/app.default"
import { formatNumber } from "@/utils/formatDate"
import { compressImage, toRNFile } from "@/utils/image"
import { followers } from "@/utils/mock"
import { toast } from "@/utils/toast"

// import { useNavigation } from "@react-navigation/native"

const DEFAULT_BACKGROUND_IMAGE = require("../../assets/images/profile-banner.png")

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
export const ProfileScreen: FC<ProfileScreenProps> = ({ route }) => {
  // Pull in navigation via hook
  const userId = route?.params?.id
  const navigation = useNavigation()
  const { themed } = useAppTheme()
  const { isLoading, data } = useUser()
  const updateProfile = useUpdateProfile()

  const avatarPickerRef = useRef<{
    pickImage: () => Promise<void>
    takePhoto?: () => Promise<void>
  }>(null)
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null)
  const [sheetView, setSheetView] = useState<"field" | "avatar" | "background" | null>(null)

  const [currentTab, setCurrentTab] = useState<"followers" | "script">("script")
  const bgPickerRef = useRef<{ pickImage: () => Promise<void> }>(null)

  const sheet = useRef<BottomSheetController | null>(null)
  const [editorConfig, setEditorConfig] = useState<EditorConfig | null>(null)
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
      initialValue: data?.user.username ?? "",
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
      initialValue: data?.user.bio ?? "",
      maxLength: 300,
      multiline: true,
      validate: (v) => (v.trim().length === 0 ? "Bio can't be empty" : undefined),
    })
    setSheetView("field")
    sheet.current?.open()
  }

  const handleSave = (value: string) => {
    if (!editorConfig) return

    if (editorConfig.key === "username") {
      updateProfile.mutate(
        { username: value },
        {
          onSuccess: () => {
            setEditorConfig(null)
            sheet.current?.close()
          },
        },
      )
    } else if (editorConfig.key === "bio") {
      updateProfile.mutate(
        { bio: value },
        {
          onSuccess: () => {
            setEditorConfig(null)
            sheet.current?.close()
          },
        },
      )
    }
  }

  const saveAvatar = async () => {
    if (!pendingAvatar) return
    const profilePix = await compressImage(pendingAvatar)
    updateProfile.mutate(
      { profilePicture: toRNFile(profilePix.uri, "avatar.jpg") },
      {
        onSuccess: () => {
          setPendingAvatar(null)
          sheet.current?.close()
        },
        onError: (error) => {
          // optional: toast error

          toast.error(error.message)
        },
      },
    )
  }

  const saveBackground = async () => {
    if (!pendingBackground) return
    const bgImage = await compressImage(pendingBackground)
    updateProfile.mutate(
      { coverPhoto: toRNFile(bgImage.uri, "cover.jpg") },
      {
        onSuccess: () => {
          setPendingBackground(null)
          sheet.current?.close()
        },
        onError: (error) => {
          // optional: toast error

          toast.error(error.message)
        },
      },
    )
  }

  const user = data?.user
  const stats = data?.stats

  const handleBgImageSelected = (uri: string) => {
    setPendingBackground(uri)
  }
  if (isLoading) {
    return <ProfileScreenSkeleton />
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
        placeholder={{ blurhash: user?.coverPhotoBlurHash }}
        source={user?.cover_photo_url ? { uri: user.cover_photo_url } : DEFAULT_BACKGROUND_IMAGE}
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
            {userId && (
              <TouchableOpacity>
                <Icon icon="flag" size={36} />
              </TouchableOpacity>
            )}
          </View>

          {!userId && (
            <TouchableOpacity
              style={themed($uploadButtonContainer)}
              onPress={() => {
                setPendingBackground(user?.cover_photo_url ?? DEFAULT_BACKGROUND_IMAGE ?? null)
                setSheetView("background")
                sheet.current?.open()
              }}
            >
              <View style={themed($uploadButtonItem)}>
                <Icon icon="upload" size={16} color="#fff" />
                <Text text="Edit" />
              </View>
            </TouchableOpacity>
          )}
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
            picture={
              user?.profile_picture_url ? { uri: user.profile_picture_url } : DEFAULT_PROFILE_IMAGE
            }
            name={data?.user?.username ?? ""}
            showUpdateButton
            isPro={data?.user?.is_pro}
            onUpload={() => {
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
            <Text text={formatNumber(data?.stats?.followers ?? 0)} preset="titleHeading" />
          </View>
          <View>
            <View style={$iconsDescriptionContainer}>
              <Icon icon="script" size={15} />
              <Text text="Script" weight="normal" size="xxs" />
            </View>
            <Text
              preset="titleHeading"
              text={formatNumber(data?.stats?.scripts ?? 0)}
              numberOfLines={1}
            />
          </View>
        </View>
        <View>
          <Text text="Bio" preset="subheading" />
          <ReadMoreText
            textStyle={$profileDescription}
            maxChars={200}
            preset="description"
            content={user?.bio ?? ""}
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
          <View style={$listContainer}>
            <FollowersList data={followers} />
          </View>
        ) : (
          <View style={$listContainer}>
            <ScriptList data={data?.scripts.items || []} />
          </View>
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
            saving={updateProfile.isPending}
            onClose={() => {}}
          />
        ) : sheetView === "avatar" ? (
          <AvatarEditor
            value={pendingAvatar ?? user?.profile_picture_url ?? DEFAULT_PROFILE_IMAGE}
            onUpload={() => avatarPickerRef.current?.pickImage()}
            onTakePhoto={() => avatarPickerRef.current?.takePhoto?.()}
            onSave={saveAvatar}
            saving={updateProfile.isPending}
            onClose={() => sheet.current?.close()}
          />
        ) : sheetView === "background" ? (
          <AvatarEditor
            // reuse the same component for background too
            value={pendingBackground ?? user?.cover_photo_url ?? DEFAULT_BACKGROUND_IMAGE}
            onUpload={() => bgPickerRef.current?.pickImage()} // uses 16:9 aspect picker
            onSave={saveBackground}
            saving={updateProfile.isPending}
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
const $listContainer: ViewStyle = {
  paddingHorizontal: spacing.sm,
}
