import { useEffect, useMemo, useRef, useState } from "react"
import {
  Pressable,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native"
import * as FileSystem from "expo-file-system"
import { RichEditor } from "react-native-pell-rich-editor"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { bindDialogueClick } from "@/utils/insertDialogueBubble"

import { AppBottomSheet, BottomSheetController } from "./AppBottomSheet"
import { Button } from "./Button"
import { Icon, PressableIcon } from "./Icon"
import { ImagePickerWithCropping } from "./ImagePickerWithCroping"
import { ImageUploader } from "./ImageUploader"
import { KeyboardToolbar } from "./KeyboardToolbar"
import { ListView } from "./ListView"
import { Tabs } from "./Tab"
import { TextField } from "./TextField"
import { Switch } from "./Toggle/Switch"
import { Image } from "expo-image"

export interface AddPartProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  onBack: () => void
}

/**
 * Describe your component here
 */

type UploadQuota = {
  poster: { used: number; limit: number }
  location: { used: number; limit: number }
  embedded: { used: number; limit: number }
  character: { used: number; limit: number }
}

const DIALOGUE_CSS = `
  .ss-dialogue-wrap{
    position:relative; margin:10px 0;
    -webkit-user-select:none; user-select:none;
    -webkit-user-modify:read-only; /* iOS WebKit */
    caret-color: transparent;
  }
  /* Overlay button captures taps; prevents caret from entering */
  .ss-dialogue-tap{
    position:absolute; inset:0; background:transparent; border:0; padding:0; margin:0;
    z-index:2; cursor:pointer;
  }
  /* Underlay content ignores pointer events so only the overlay is clickable */
  .ss-dialogue{ pointer-events:none; display:flex; align-items:flex-start; gap:10px; }
  .ss-avatar{ width:28px; height:28px; border-radius:50%; overflow:hidden; flex:0 0 28px; background:#2B2A45; }
  .ss-avatar img{ width:100%; height:100%; object-fit:cover; display:block; }
  .ss-bubble{ position:relative; flex:1; border-radius:14px; padding:10px 44px 10px 12px; box-shadow:0 2px 8px rgba(0,0,0,.18); }
  .ss-name{ font-weight:700; font-size:13px; line-height:16px; margin-bottom:2px; }
  .ss-text{ font-size:14px; line-height:20px; white-space:pre-wrap; }
  .ss-play{ position:absolute; right:8px; top:50%; transform:translateY(-50%); width:36px; height:28px; border-radius:14px;
            background:rgba(255,255,255,.75); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; }
`.trim()

const TAB_ITEMS = [
  { label: "Last Used", key: "last_used" },
  { label: "A-Z", key: "asc" },
  { label: "Z-A", key: "des" },
]

const validateTitle = (v: string) =>
  v.trim().length < 3 ? "Title must be at least 3 characters" : undefined

export const AddPart = (props: AddPartProps) => {
  const { style, onBack } = props
  const $styles = [$container, style, Platform.OS === "android" && { marginTop: 24 }]
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const editorRef = useRef<RichEditor>(null)

  const [title, setTitle] = useState("")
  const [html, setHtml] = useState(
    `<p>Tucked between misty hills and a quiet shoreline, the village felt untouched by time…</p>`,
  )
  const focusEditor = () => editorRef.current?.focusContentEditor?.()
  const [showQuota, setShowQuota] = useState(true)
  const [editorFocused, setEditorFocused] = useState(false)
  const [disableEditor, setDisableEditor] = useState(false)

  const sheetRef = useRef<BottomSheetController>(null)

  //location
  const [currentTab, setCurrentTab] = useState<(typeof TAB_ITEMS)[number]["key"]>("last_used")
  const [isAddLocation, setIsAddLocation] = useState(false)
  const [locationImage, setLocationImage] = useState<string | null>(null)
  const locationImageRef = useRef<{ pickImage: () => Promise<void> }>(null)
  const [locationName, setLocationName] = useState("")
  const [showLocationName, setShowLocationName] = useState(true)
  const [locationData, setLocationData] = useState<
    Array<{ name: string; image: string; isHideName: boolean }>
  >([])

  const handleCoverImageSelected = (uri: string) => {
    setLocationImage(uri)
  }

  const quota: UploadQuota = useMemo(
    () => ({
      poster: { used: 1, limit: 1 },
      location: { used: 9, limit: 10 },
      embedded: { used: 10, limit: 15 },
      character: { used: 10, limit: 15 },
    }),
    [],
  )

  const progress = useMemo(() => {
    const total =
      quota.poster.limit + quota.embedded.limit + quota.character.limit + quota.location.limit
    const used =
      quota.poster.used + quota.embedded.used + quota.character.used + quota.location.used
    return used / total
  }, [quota])

  useEffect(() => {
    bindDialogueClick(editorRef)
  }, [])

  const onSave = () => {
    // TODO: send title/content to backend; this does not publish the script
    // Your actual "Publish" occurs on the publish screen/button elsewhere
    console.log("Saved part draft:", { title })
  }
  const openlocationSheet = () => {
    sheetRef.current?.expand()
    setDisableEditor(true)
  }
  const locationTextMax = 50
  const locationNameErr = useMemo(() => validateTitle(locationName), [locationName])
  const locationNameHelper = locationNameErr
    ? locationNameErr
    : `${Math.min(locationName.length, locationTextMax)}/${locationTextMax} characters`

  const onSaveLocationImage = () => {
    const payload = {
      image: locationImage as string,
      isHideName: showLocationName,
      name: locationName,
    }
    console.log(payload.image)
    setLocationData([...locationData, payload])
    // setDisableEditor(false)
    // sheetRef.current?.close()
    setLocationName("")
    setLocationImage("")
    setIsAddLocation(false)
  }
  const LocationSeparator = () => <View style={{ height: 12 }} />

  const RenderLocationItems = ({ uri, name }) => (
    <View style={{}}>
      <Image source={uri} />
      <Text text={name} />
    </View>
  )

  return (
    <View style={$styles}>
      <View style={themed($headerRow)}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <PressableIcon
            icon="arrowLeft"
            onPress={() => {
              onBack()
            }}
          />
          <Text preset="sectionHeader" weight="semiBold">
            Part 1
          </Text>
        </View>
        <Pressable onPress={() => setShowQuota((s) => !s)} hitSlop={10} style={themed($ring)}>
          {/* simple ring */}
          <View style={themed($ringTrack)} />
          <View
            style={[themed($ringFill), { width: `${Math.min(100, Math.round(progress * 100))}%` }]}
          />
        </Pressable>
      </View>
      <View style={{ gap: 8, flex: 1 }}>
        <TextField
          value={title}
          containerStyle={$titleInputContainer}
          onChangeText={setTitle}
          placeholder="Add Part Title here"
          placeholderTextColor={colors.palette.secondary300}
          style={themed($titleInput)}
          // inputAccessoryViewID={Platform.OS === "ios" ? TOOLBAR_ID : undefined}
          onSubmitEditing={focusEditor}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            flex: 1,
          }}
        >
          <RichEditor
            ref={editorRef}
            initialContentHTML={html}
            editorStyle={$editorStyle(colors)}
            placeholder="Add some text, dialogue, or images here"
            onChange={setHtml}
            disabled={disableEditor}
            useContainer={false}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
            style={{ flex: 1, minHeight: 0, paddingHorizontal: 24 }}
            onMessage={(msg) => {
              try {
                console.log({ msg })
                const data = JSON.parse(msg)
                if (data?.type === "edit-dialogue") Alert.alert(data) // open modal with this data
              } catch {}
            }}
          />

          <KeyboardToolbar
            editorRef={editorRef}
            visible={editorFocused}
            onLocation={openlocationSheet}
          />
        </KeyboardAvoidingView>
      </View>
      <AppBottomSheet
        controllerRef={sheetRef}
        snapPoints={["95%"]}
        style={{ zIndex: 40, pointerEvents: "auto", flex: 1 }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ImagePickerWithCropping
            ref={locationImageRef}
            onImageSelected={handleCoverImageSelected}
            aspect={[16, 9]} // wide ratio for background
          />
          <View style={$bottomSheetHeaderContainer}>
            <Text text={isAddLocation ? "Add Location" : "Select Location"} preset="titleHeading" />
            <Text text={`${locationData.length}/${quota.location.limit}`} />
          </View>
          {!isAddLocation ? (
            <>
              <Tabs
                value={currentTab}
                items={TAB_ITEMS}
                onChange={(k) => setCurrentTab(k as typeof currentTab)}
                containerStyle={themed({ marginBottom: 20 })} // optional
                tabStyle={themed({})}
                activeTabStyle={themed({})}
                tabTextStyle={themed({})}
                activeTabTextStyle={themed({})}
                fullWidth
                gap={8}
              />
              <ListView<{ image: string; name: string; isHideName: boolean }>
                data={locationData || []}
                extraData={locationData}
                estimatedItemSize={locationData.length}
                ItemSeparatorComponent={LocationSeparator}
                ListEmptyComponent={<View />}
                numColumns={2}
                renderItem={({ item }) => <RenderLocationItems uri={item.image} name={item.name} />}
              />
              <Pressable
                style={themed($addDashed)}
                onPress={() => {
                  setIsAddLocation(true)
                }}
              >
                <Icon icon="plus" size={24} />
                <Text weight="medium">Add Location</Text>
              </Pressable>
            </>
          ) : (
            <View>
              <ImageUploader
                coverImage={locationImage}
                uploadText="Upload Location Image"
                onPressUpload={() => {
                  locationImageRef.current?.pickImage()
                }}
                onPressRemove={() => {
                  setLocationImage(null)
                }}
              />
              <TextField
                value={locationName}
                onChangeText={setLocationName}
                placeholder="Enter Location name"
                label="Location Name"
                helper={locationNameHelper}
                status={locationNameErr ? "error" : undefined}
                maxLength={locationTextMax}
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={themed($toggleContainer)}>
                  <Text text="Hide Location Name" style={$locationTitle} />
                  <Text preset="description" style={$description}>
                    Enable to hide the location name from {"\n"}displaying it in your script
                  </Text>
                </View>
                <Switch value={showLocationName} onValueChange={setShowLocationName} />
              </View>
              <Button text="Save" style={themed($saveBtn)} onPress={onSaveLocationImage} />
            </View>
          )}
        </KeyboardAvoidingView>
      </AppBottomSheet>
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
}

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
  gap: spacing.xs,
  paddingHorizontal: 24,
})
const $ring: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 26,
  height: 26,
  borderRadius: 13,
  position: "relative",
  overflow: "hidden",
  backgroundColor: "transparent",
  borderWidth: 4,
  borderColor: colors.success,
})

const $ringTrack: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: "transparent",
})

const $ringFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  backgroundColor: colors.tint,
})

const $titleInput: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: Platform.select({ ios: spacing.md, android: spacing.sm }),
  color: colors.text,
  borderWidth: 0,
})
const $titleInputContainer: ViewStyle = {
  borderWidth: 0,
  paddingHorizontal: 24,
}
const $editorStyle = (colors) => ({
  backgroundColor: "transparent",
  placeholderColor: colors.palette.secondary300,
  contentCSSText: `font-size:16px; line-height:24px; ${DIALOGUE_CSS}`,
  color: colors.palette.secondary300,
})

const $bottomSheetHeaderContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 20,
  alignItems: "center",
}
const $toggleContainer: ViewStyle = {
  marginTop: 20,
}
const $locationTitle: TextStyle = {
  fontSize: 14,
  fontWeight: 500,
}
const $description: TextStyle = {
  fontSize: 14,
  fontWeight: 300,
  textAlign: "left",
}

const $addDashed: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderStyle: "dashed",
  borderColor: "rgba(197, 206, 250, 0.50)",
  borderRadius: spacing.sm,
  height: 56,
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  marginTop: spacing.sm,
  flexDirection: "row",
})

const $saveBtn: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 44,
  marginTop: 70,
})
