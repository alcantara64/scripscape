import { FC, useMemo, useRef, useState } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { ImageBackground, ImageStyle } from "expo-image"
import { useNavigation } from "@react-navigation/native"

import { Icon } from "@/components/Icon"
import { ImagePickerWithCropping } from "@/components/ImagePickerWithCroping"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

interface AddScriptScreenProps extends AppStackScreenProps<"AddScript"> {}

const validateTitle = (v: string) =>
  v.trim().length < 3 ? "Title must be at least 3 characters" : undefined

export const AddScriptScreen: FC<AddScriptScreenProps> = () => {
  const navigation = useNavigation()
  const { themed, theme } = useAppTheme()

  // Title
  const [scriptTitle, setScriptTitle] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null)

  const titleMax = 50
  const titleErr = useMemo(() => validateTitle(scriptTitle), [scriptTitle])
  const titleHelper = titleErr
    ? titleErr
    : `${Math.min(scriptTitle.length, titleMax)}/${titleMax} characters`

  // Overview
  const [overview, setOverview] = useState("")
  const overviewMax = 200

  const coverImageRef = useRef<{ pickImage: () => Promise<void> }>(null)
  const overviewHelper = `${Math.min(overview.length, overviewMax)}/${overviewMax} characters`

  const onChangeTitle = (text: string) => setScriptTitle(text.slice(0, titleMax))

  const onChangeOverview = (text: string) => setOverview(text.slice(0, overviewMax))

  const handleCoverImageSelected = (uri: string) => {
    setCoverImage(uri)
  }

  return (
    <>
      <ImagePickerWithCropping
        ref={coverImageRef}
        onImageSelected={handleCoverImageSelected}
        aspect={[16, 9]} // wide ratio for background
      />
      <Screen
        style={$root}
        preset="scroll"
        safeAreaEdges={["top"]}
        gradientColors={["#4b276b", "#0e1636"]} // remove if your Screen doesn't support gradients
      >
        <Text preset="sectionHeader" text="Create Script" />

        <Pressable style={$upload}>
          {!coverImage ? (
            <View style={themed($uploadContainer)}>
              <View style={$uploadButtonIcon}>
                <Icon icon="upload" size={20} color="#fff" />
              </View>
              <Text preset="titleHeading" style={themed($title)}>
                Upload Poster Image
              </Text>
              <Pressable
                style={$browseBtn}
                onPress={() => {
                  coverImageRef.current?.pickImage()
                }}
              >
                <Text style={$browseText}>Browse Images</Text>
              </Pressable>
            </View>
          ) : (
            <ImageBackground
              source={coverImage}
              imageStyle={$image}
              style={themed($imageContainer)}
            >
              <Pressable
                onPress={() => {
                  setCoverImage(null)
                }}
                style={themed($removeContainer)}
              >
                <Icon icon="trash" size={24} color={theme.colors.palette.neutral300} />
                <Text style={themed($skipTxt)}>Remove Image</Text>
              </Pressable>
            </ImageBackground>
          )}
        </Pressable>

        <View>
          <TextField
            label="Script Title"
            value={scriptTitle}
            onChangeText={onChangeTitle}
            placeholder="Enter the script title here"
            helper={titleHelper}
            status={titleErr ? "error" : undefined}
          />

          <TextField
            label="Script Overview"
            value={overview}
            onChangeText={onChangeOverview}
            placeholder="Enter a description for your script here"
            helper={overviewHelper}
            multiline
          />
        </View>
        <View style={{ marginTop: 50 }}>
          <Pressable onPress={() => {}} style={themed($cta)}>
            <Text style={themed($ctaText)}>Start Writing</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              navigation.navigate("WriteScriptTableContents")
            }}
            style={themed($cabtn)}
          >
            <Text style={themed($skipTxt)}>Skip For Now</Text>
          </Pressable>
        </View>
      </Screen>
    </>
  )
}

const $root: ViewStyle = {
  flex: 1,
  padding: 24,
}

const $upload: ViewStyle = {
  borderWidth: 1,
  borderStyle: "dashed",
  borderColor: "rgba(234, 231, 240, 0.40)",
  borderRadius: 12,
  marginVertical: 12,
  marginTop: 24,
  height: 203,
}

const $uploadContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 28,
})

const $title: ThemedStyle<TextStyle> = () => ({
  marginTop: 4,
  fontSize: 15,
  fontWeight: "500", // <- must be string
  lineHeight: 20,
})

const $browseBtn: ViewStyle = {
  marginTop: 12,
  backgroundColor: "#3A57E8",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 12,
}

const $browseText: TextStyle = {
  color: "#fff",
  fontSize: 12,
  padding: 8,
  fontWeight: "500", // <- must be string
  lineHeight: 20,
}

const $uploadButtonIcon: ViewStyle = {
  height: 38,
  width: 38,
  borderRadius: 16,
  backgroundColor: "rgba(234, 231, 240, 0.10)",
  alignItems: "center",
  justifyContent: "center",
}
const $cta: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 48,
  borderRadius: spacing.sm,
  backgroundColor: colors.buttonBackground,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.md,
})
const $ctaText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 16,
  color: colors.palette.neutral100,
})
const $cabtn: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 48,
  borderRadius: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.sm + 2,
  borderWidth: 1,
  borderColor: colors.palette.accentActive,
})
const $imageContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: 20,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  flex: 1,
})
const $image: ImageStyle = {
  borderRadius: 12,
}

const $skipTxt: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral300,
  fontSize: 18,
  fontWeight: 500,
  lineHeight: 20,
})

const $removeContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.sm + 2,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  flexDirection: "row",
  gap: 8,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
})
