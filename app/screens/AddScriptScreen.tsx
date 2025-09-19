import { FC, useMemo, useRef, useState } from "react"
import { ImageSourcePropType, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { ImageStyle } from "expo-image"
import { useNavigation } from "@react-navigation/native"

import { ImagePickerWithCropping } from "@/components/ImagePickerWithCroping"
import { ImageUploader } from "@/components/ImageUploader"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useCreateScript } from "@/querries/script"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

interface AddScriptScreenProps extends AppStackScreenProps<"AddScript"> {}

const validateTitle = (v: string) =>
  v.trim().length < 3 ? "Title must be at least 3 characters" : undefined

export const AddScriptScreen: FC<AddScriptScreenProps> = () => {
  const navigation = useNavigation()
  const { themed } = useAppTheme()
  const { mutate } = useCreateScript()

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
  const createScript = () => {
    mutate(
      { title: scriptTitle || "Untitled", summary: overview },
      {
        onSuccess: (response) => {
          navigation.navigate("WriteScriptTableContents", { scriptId: 1 })
        },
      },
    )
    // navigation.navigate("WriteScriptTableContents", { scriptId: 3 })
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

        <ImageUploader
          coverImage={coverImage as ImageSourcePropType}
          onPressUpload={() => {
            coverImageRef.current?.pickImage()
          }}
          onPressRemove={() => {
            setCoverImage(null)
          }}
        />
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
          <Pressable onPress={createScript} style={themed($cta)}>
            <Text style={themed($ctaText)}>Start Writing</Text>
          </Pressable>

          <Pressable onPress={createScript} style={themed($cabtn)}>
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

const $skipTxt: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral300,
  fontSize: 18,
  fontWeight: 500,
  lineHeight: 20,
})
