import { useEffect, useMemo, useRef, useState, useCallback } from "react"
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
import { Image } from "expo-image"
import { RichEditor } from "react-native-pell-rich-editor"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { bindDialogueClick } from "@/utils/insertDialogueBubble"

import { AppBottomSheet, type BottomSheetController } from "./AppBottomSheet"
import { Button } from "./Button"
import { Icon, PressableIcon } from "./Icon"
import { ImagePickerWithCropping } from "./ImagePickerWithCroping"
import { ImageUploader } from "./ImageUploader"
import { KeyboardToolbar } from "./KeyboardToolbar"
import { ListView } from "./ListView"
import { Tabs } from "./Tab"
import { TextField } from "./TextField"
import { Switch } from "./Toggle/Switch"

export interface AddPartProps {
  style?: StyleProp<ViewStyle>
  onBack: () => void
}
type SheetMode = "location" | "character"

type UploadQuota = {
  poster: { used: number; limit: number }
  location: { used: number; limit: number }
  embedded: { used: number; limit: number }
  character: { used: number; limit: number }
}

type TabKey = "last_used" | "asc" | "des"
const TAB_ITEMS: Array<{ label: string; key: TabKey }> = [
  { label: "Last Used", key: "last_used" },
  { label: "A–Z", key: "asc" },
  { label: "Z–A", key: "des" },
]

type LocationItem = { name: string; image: string; hideName: boolean }

const DIALOGUE_CSS = `
  .ss-dialogue-wrap{
    position:relative; margin:10px 0;
    -webkit-user-select:none; user-select:none;
    -webkit-user-modify:read-only;
    caret-color: transparent;
  }
  .ss-dialogue-tap{
    position:absolute; inset:0; background:transparent; border:0; padding:0; margin:0;
    z-index:2; cursor:pointer;
  }
  .ss-dialogue{ pointer-events:none; display:flex; align-items:flex-start; gap:10px; }
  .ss-avatar{ width:28px; height:28px; border-radius:50%; overflow:hidden; flex:0 0 28px; background:#2B2A45; }
  .ss-avatar img{ width:100%; height:100%; object-fit:cover; display:block; }
  .ss-bubble{ position:relative; flex:1; border-radius:14px; padding:10px 44px 10px 12px; box-shadow:0 2px 8px rgba(0,0,0,.18); }
  .ss-name{ font-weight:700; font-size:13px; line-height:16px; margin-bottom:2px; }
  .ss-text{ font-size:14px; line-height:20px; white-space:pre-wrap; }
  .ss-play{ position:absolute; right:8px; top:50%; transform:translateY(-50%); width:36px; height:28px; border-radius:14px;
            background:rgba(255,255,255,.75); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; }
`.trim()

const validateTitle = (v: string) =>
  v.trim().length < 3 ? "Title must be at least 3 characters" : undefined

export const AddPart = ({ style, onBack }: AddPartProps) => {
  const $styles = [$container, style, Platform.OS === "android" && { marginTop: 24 }]
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const editorRef = useRef<RichEditor>(null)
  const sheetRef = useRef<BottomSheetController>(null)
  const pickerRef = useRef<{ pickImage: () => Promise<void> }>(null)

  // content state
  const [title, setTitle] = useState("")
  const [html, setHtml] = useState(
    `<p>Tucked between misty hills and a quiet shoreline, the village felt untouched by time…</p>`,
  )
  const [editorFocused, setEditorFocused] = useState(false)
  const [sheetMode, setSheetMode] = useState<SheetMode>("location")
  // quotas
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

  // locations
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [currentTab, setCurrentTab] = useState<TabKey>("last_used")
  const [isAddLocation, setIsAddLocation] = useState(false)
  const [locationForm, setLocationForm] = useState<{
    image: string | null
    name: string
    hideName: boolean
  }>({
    image: null,
    name: "",
    hideName: false, // "Hide Location Name" switch
  })

  // effects
  useEffect(() => {
    bindDialogueClick(editorRef)
  }, [])

  // handlers (memoized)
  const focusEditor = useCallback(() => editorRef.current?.focusContentEditor?.(), [])
  const toggleSheetAddLocation = useCallback((on: boolean) => setIsAddLocation(on), [])
  const openLocationSheet = useCallback(() => {
    setSheetMode("location")
    sheetRef.current?.expand()
  }, [])
  const openCharacterSheet = useCallback(() => {
    setSheetMode("character")
    sheetRef.current?.expand()
  }, [])
  const closeLocationSheet = useCallback(() => sheetRef.current?.close(), [])

  const onSheetOpen = useCallback(() => {
    // prevent caret entering editor while sheet is up
    editorRef.current?.blurContentEditor?.()
  }, [])

  const onSheetClose = useCallback(() => {
    setIsAddLocation(false)
    // focus back if needed
    // focusEditor()
  }, [focusEditor])

  const onPickLocationImage = useCallback(() => {
    pickerRef.current?.pickImage()
  }, [])

  const onRemoveLocationImage = useCallback(() => {
    setLocationForm((f) => ({ ...f, image: null }))
  }, [])

  const onChangeLocationName = useCallback((v: string) => {
    setLocationForm((f) => ({ ...f, name: v }))
  }, [])

  const onToggleHideName = useCallback((v: boolean) => {
    setLocationForm((f) => ({ ...f, hideName: v }))
  }, [])

  const onSaveLocation = useCallback(() => {
    if (!locationForm.image) {
      Alert.alert("Add Location", "Please select an image first.")
      return
    }
    const err = validateTitle(locationForm.name)
    if (err) {
      Alert.alert("Invalid Name", err)
      return
    }
    setLocations((prev) => [
      ...prev,
      {
        image: locationForm.image!,
        name: locationForm.name.trim(),
        hideName: locationForm.hideName,
      },
    ])
    // reset form
    setLocationForm({ image: null, name: "", hideName: false })
    toggleSheetAddLocation(false)
  }, [locationForm, toggleSheetAddLocation])

  const onImageSelected = useCallback((uri: string) => {
    setLocationForm((f) => ({ ...f, image: uri }))
  }, [])

  const onEditorMessage = useCallback((msg: string) => {
    // react-native-pell-rich-editor posts strings; guard JSON parsing
    try {
      const data = JSON.parse(msg)
      if (data?.type === "edit-dialogue") {
        // open your modal and pass payload
        Alert.alert("Edit dialogue", JSON.stringify(data?.payload ?? {}, null, 2))
      }
    } catch (e) {
      // ignore non-JSON messages
      console.log(e)
    }
  }, [])

  // derived UI bits
  const locationTextMax = 50
  const nameError = validateTitle(locationForm.name)
  const nameHelper = nameError
    ? nameError
    : `${Math.min(locationForm.name.length, locationTextMax)}/${locationTextMax} characters`

  const sortedLocations = useMemo(() => {
    if (currentTab === "asc") return [...locations].sort((a, b) => a.name.localeCompare(b.name))
    if (currentTab === "des") return [...locations].sort((a, b) => b.name.localeCompare(a.name))
    return locations // “last used”
  }, [locations, currentTab])

  // render helpers
  const LocationSeparator = useCallback(() => <View style={{ height: 12 }} />, [])
  const keyExtractor = useCallback(
    (item: LocationItem, index: number) => `${item.name}-${index}`,
    [],
  )

  const RenderLocationItem = useCallback(
    ({ uri, name, hideName }: { uri: string; name: string; hideName: boolean }) => (
      <View style={{ gap: 6 }}>
        <Image
          source={{ uri }}
          style={{
            width: "100%",
            aspectRatio: 1.5,
            borderRadius: 12,
            backgroundColor: colors.palette.neutral800,
          }}
          contentFit="cover"
          transition={100}
        />
        {!hideName && <Text text={name} numberOfLines={1} />}
      </View>
    ),
    [colors.palette.neutral800],
  )

  const onSaveDraft = useCallback(() => {
    // send to backend as draft (not publish)
    console.log("Saved part draft:", { title, htmlLength: html?.length ?? 0 })
  }, [title, html])

  return (
    <View style={$styles}>
      {/* Header */}
      <View style={themed($headerRow)}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <PressableIcon icon="arrowLeft" onPress={onBack} hitSlop={10} />
          <Text preset="sectionHeader" weight="semiBold">
            Part 1
          </Text>
        </View>

        {/* Quota ring */}
        <Pressable onPress={onSaveDraft} hitSlop={10} style={themed($ring)}>
          <View style={themed($ringTrack)} />
          <View
            style={[themed($ringFill), { width: `${Math.min(100, Math.round(progress * 100))}%` }]}
          />
        </Pressable>
      </View>

      {/* Title + Editor */}
      <View style={{ gap: 8, flex: 1 }}>
        <TextField
          value={title}
          containerStyle={$titleInputContainer}
          onChangeText={setTitle}
          placeholder="Add Part Title here"
          placeholderTextColor={colors.palette.secondary300}
          style={themed($titleInput)}
          onSubmitEditing={focusEditor}
          autoCorrect
          returnKeyType="next"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <RichEditor
            ref={editorRef}
            initialContentHTML={html}
            editorStyle={$editorStyle(colors)}
            placeholder="Add some text, dialogue, or images here"
            onChange={setHtml}
            useContainer={false}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
            style={{ flex: 1, minHeight: 0, paddingHorizontal: 24 }}
            onMessage={onEditorMessage}
          />

          <KeyboardToolbar
            editorRef={editorRef}
            visible={editorFocused}
            onLocation={openLocationSheet}
          />
        </KeyboardAvoidingView>
      </View>

      {/* Location Sheet */}
      <AppBottomSheet
        controllerRef={sheetRef}
        snapPoints={["95%"]}
        style={{ zIndex: 40, pointerEvents: "auto", flex: 1 }}
        onOpen={onSheetOpen}
        onClose={onSheetClose}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ImagePickerWithCropping
            ref={pickerRef}
            onImageSelected={onImageSelected}
            aspect={[16, 9]}
          />

          <View style={$bottomSheetHeaderContainer}>
            <Text text={isAddLocation ? "Add Location" : "Select Location"} preset="titleHeading" />
            <Text text={`${locations.length}/${quota.location.limit}`} />
          </View>

          {!isAddLocation ? (
            <>
              <Tabs
                value={currentTab}
                items={TAB_ITEMS}
                onChange={(k) => setCurrentTab(k as TabKey)}
                containerStyle={themed({ marginBottom: 20 })}
                fullWidth
                gap={8}
              />

              <ListView<LocationItem>
                data={sortedLocations}
                extraData={sortedLocations}
                estimatedItemSize={sortedLocations.length || 1}
                ItemSeparatorComponent={LocationSeparator}
                ListEmptyComponent={
                  <View style={{ paddingVertical: spacing.lg, alignItems: "center" }}>
                    <Text preset="description" text="No locations yet. Add one to get started." />
                  </View>
                }
                numColumns={2}
                keyExtractor={keyExtractor}
                renderItem={({ item }) => (
                  <RenderLocationItem uri={item.image} name={item.name} hideName={item.hideName} />
                )}
              />

              <Pressable
                style={themed($addDashed)}
                onPress={() => toggleSheetAddLocation(true)}
                hitSlop={10}
              >
                <Icon icon="plus" size={24} />
                <Text weight="medium">Add Location</Text>
              </Pressable>
            </>
          ) : (
            <View>
              <ImageUploader
                coverImage={locationForm.image}
                uploadText="Upload Location Image"
                onPressUpload={onPickLocationImage}
                onPressRemove={onRemoveLocationImage}
              />

              <TextField
                value={locationForm.name}
                onChangeText={onChangeLocationName}
                placeholder="Enter Location name"
                label="Location Name"
                helper={nameHelper}
                status={nameError ? "error" : undefined}
                maxLength={locationTextMax}
                autoCapitalize="words"
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={themed($toggleContainer)}>
                  <Text text="Hide Location Name" style={$locationTitle} />
                  <Text preset="description" style={$description}>
                    Enable to hide the location name from {"\n"}displaying in your script
                  </Text>
                </View>
                <Switch value={locationForm.hideName} onValueChange={onToggleHideName} />
              </View>

              <Button text="Save" style={themed($saveBtn)} onPress={onSaveLocation} />
            </View>
          )}
        </KeyboardAvoidingView>
      </AppBottomSheet>
    </View>
  )
}

const $container: ViewStyle = { flex: 1 }

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

const $ringTrack: ThemedStyle<ViewStyle> = () => ({ backgroundColor: "transparent" })

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
const $titleInputContainer: ViewStyle = { borderWidth: 0, paddingHorizontal: 24 }

const $editorStyle = (colors: any) => ({
  backgroundColor: "transparent",
  placeholderColor: colors.palette.secondary300,
  contentCSSText: `font-size:16px; line-height:24px; ${DIALOGUE_CSS}`,
  color: colors.text, // use text color for better contrast
})

const $bottomSheetHeaderContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 20,
  alignItems: "center",
}

const $toggleContainer: ViewStyle = { marginTop: 20 }

const $locationTitle: TextStyle = { fontSize: 14, fontWeight: "500" as const }

const $description: TextStyle = { fontSize: 14, fontWeight: "300" as const, textAlign: "left" }

const $addDashed: ThemedStyle<ViewStyle> = ({ spacing }) => ({
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

const $saveBtn: ThemedStyle<ViewStyle> = () => ({ height: 44, marginTop: 70 })
