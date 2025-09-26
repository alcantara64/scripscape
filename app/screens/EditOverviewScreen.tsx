import { FC, useEffect, useMemo, useRef, useState } from "react"
import {
  ImageSourcePropType,
  Pressable,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { useNavigation } from "@react-navigation/native"

import { AppBottomSheet, BottomSheetController } from "@/components/AppBottomSheet"
import { Icon, PressableIcon } from "@/components/Icon"
import { ImagePickerWithCropping } from "@/components/ImagePickerWithCroping"
import { ImageUploader } from "@/components/ImageUploader"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { Switch } from "@/components/Toggle/Switch"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useGetScriptById } from "@/querries/script"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"

import { validateTitle } from "./AddScripts/AddParts/editorConstant"
import { Category, Tags } from "@/interface/script"
import { Button } from "@/components/Button"
// import { useNavigation } from "@react-navigation/native"

interface EditOverviewScreenProps extends AppStackScreenProps<"EditOverview"> {}

export const EditOverviewScreen: FC<EditOverviewScreenProps> = ({ route }) => {
  // Pull in navigation via hook
  const { script_id } = route.params
  const navigation = useNavigation()
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()

  const [scriptTitle, setScriptTitle] = useState("")

  const titleMax = 50
  const titleErr = useMemo(() => validateTitle(scriptTitle), [scriptTitle])
  const titleHelper = titleErr
    ? titleErr
    : `${Math.min(scriptTitle.length, titleMax)}/${titleMax} characters`

  // Overview
  const [overview, setOverview] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(
    "https://images.unsplash.com/photo-1441716844725-09cedc13a4e7?q=80&w=1200",
  )
  const [matureContentFilter, setMatureContentFilter] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [tags, setTags] = useState<Array<Tags>>([])
  const [categories, setCategories] = useState<Array<Category>>([])

  const overviewMax = 200

  const coverImageRef = useRef<{ pickImage: () => Promise<void> }>(null)
  const overviewHelper = `${Math.min(overview.length, overviewMax)}/${overviewMax} characters`
  const sheetRef = useRef<BottomSheetController>(null)

  const { isLoading, data: scriptData } = useGetScriptById(script_id)

  const onChangeTitle = (text: string) => setScriptTitle(text.slice(0, titleMax))

  const onChangeOverview = (text: string) => setOverview(text.slice(0, overviewMax))

  const handleCoverImageSelected = (uri: string) => {
    setCoverImage(uri)
  }

  useEffect(() => {
    if (scriptData) {
      setScriptTitle(scriptData?.title)
      setOverview(scriptData?.summary)
      setCategories(scriptData?.categories)
      setTags(scriptData?.tags)
    }
  }, [scriptData])
  return (
    <>
      <ImagePickerWithCropping
        ref={coverImageRef}
        onImageSelected={handleCoverImageSelected}
        aspect={[16, 9]}
      />
      <Screen
        style={$root}
        preset="scroll"
        safeAreaEdges={["top", "bottom"]}
        gradientColors={["#4b276b", "#0e1636"]}
        ScrollViewProps={{ stickyHeaderIndices: [0] }}
      >
        <View>
          <View style={themed($headerContainer)}>
            <View style={$headTextContainer}>
              <TouchableOpacity onPress={navigation.goBack}>
                <Icon icon="arrowLeft" />
              </TouchableOpacity>
              <Text text="Edit Overview" preset="sectionHeader" />
            </View>
            <View>
              <View style={themed($draft)}>
                <Icon icon="write" color="#FFC773" size={11} />
                <Text text="Draft" style={themed($draftText)} />
              </View>
            </View>
          </View>
        </View>

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
        <View style={$sectionContainer}>
          <View>
            <Text text="Category" style={themed($sectionTitle)} />
            <View style={$sectionItems}>
              <View style={themed($pillContainer)}>
                <Text text="Drama" style={themed($pillText)} />
              </View>
              <View style={themed($pillContainer)}>
                <Text text="Sci-fiction" style={themed($pillText)} />
              </View>
            </View>
          </View>
          <View style={$iconContainer}>
            <Icon icon="edit" />
            <Text text="Edit" />
          </View>
        </View>
        <View style={$sectionContainer}>
          <View>
            <Text text="Tags" style={themed($sectionTitle)} />
            <View style={$sectionItems}>
              <View style={[themed($pillContainer), themed($tagContainerStyle)]}>
                <Text text="#Starwars" style={[themed($pillText), themed($tagText)]} />
              </View>
              <View style={[themed($pillContainer), themed($tagContainerStyle)]}>
                <Text text="Starfighter" style={[themed($pillText), themed($tagText)]} />
              </View>
            </View>
          </View>
          <View style={$iconContainer}>
            <Icon icon="edit" />
            <Text text="Edit" />
          </View>
        </View>
        <View style={$sectionContainer}>
          <View>
            <Text text="Mature Filter" style={themed($sectionTitle)} />
            <View>
              <Text style={themed($descriptionText)}>
                Enable this option if your script contains graphic depictions of violence,
                sexuality, and/or other mature themes.
              </Text>
            </View>
          </View>
          <View style={$iconContainer}>
            <Switch value={matureContentFilter} onValueChange={setMatureContentFilter} />
          </View>
        </View>
        <View style={$sectionContainer}>
          <View>
            <Text text="Completed" style={themed($sectionTitle)} />
            <View>
              <Text style={themed($descriptionText)}>
                Enable this option if your script is completed. If it is incomplete or updates are
                ongoing, do not enable this option.
              </Text>
            </View>
          </View>
          <View style={$iconContainer}>
            <Switch value={isCompleted} onValueChange={setIsCompleted} />
          </View>
        </View>
      </Screen>
      <View style={themed($bottomButton)}>
        <View style={$saveAndPusblishContainer}>
          <Button text="Save Changes" style={{ flex: 1 }} />
          <Button text="Publish" style={{ flex: 1 }} />
        </View>
        <Pressable
          style={themed($cabtn)}
          onPress={() => {
            navigation.navigate("WriteScriptTableContents", { scriptId: script_id })
          }}
        >
          <Text style={themed($skipTxt)}>Edit Table of Contents</Text>
        </Pressable>
      </View>
      <AppBottomSheet controllerRef={sheetRef} snapPoints={["32%"]}>
        <View></View>
      </AppBottomSheet>
    </>
  )
}

const $root: ViewStyle = {
  flex: 1,
  paddingHorizontal: 20,
}

const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})
const $headTextContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}
const $draft: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 5,
  borderWidth: 1,
  borderColor: "#FFC773",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 4,
})

const $draftText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: "#FFC773",
  paddingHorizontal: 4,
  textAlign: "center",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 19,
  textTransform: "capitalize",
})

const $sectionContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 24,
}
const $iconContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
}
const $sectionItems: ViewStyle = {
  flexDirection: "row",
  gap: 4,
  marginTop: 8,
}
const $sectionTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  lineHeight: 20,
  fontWeight: 500,
  color: colors.palette.accentActive,
})
const $pillContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.accentActive,
  borderRadius: 12,
  paddingVertical: 4,
  paddingHorizontal: 12,
})
const $pillText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 10,
  lineHeight: 14,
  fontWeight: 500,
  color: colors.tint,
})
const $tagContainerStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 12,
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderColor: colors.palette.accentActive,
  borderWidth: 1,
  backgroundColor: "transparent",
})
const $tagText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.accentActive,
})
const $descriptionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.accentActive,
  fontSize: 14,
  fontWeight: 300,
  lineHeight: 20,
  textAlign: "left",
  maxWidth: "85%",
})
const $bottomButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "relative",
  bottom: 0,
  backgroundColor: "#0e1636",
  paddingHorizontal: 20,
  paddingBottom: 40,
})
const $saveAndPusblishContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 8,
}

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
