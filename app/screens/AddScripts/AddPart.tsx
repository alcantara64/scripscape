import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { View, Platform, KeyboardAvoidingView, StyleProp, ViewStyle, TextStyle } from "react-native"
import * as DocumentPicker from "expo-document-picker"
import { RichEditor } from "react-native-pell-rich-editor"

import { AppBottomSheet, type BottomSheetController } from "@/components/AppBottomSheet"
import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { KeyboardToolbar } from "@/components/KeyboardToolbar"
import { ProgressRing } from "@/components/ProgressRing"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UpgradeProPopup } from "@/components/UprogradePropPup"
import { Dialogue, Part } from "@/interface/script"
import { useScriptCreateDialoguePart } from "@/querries/script"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { bindDialogueClick, insertDialogue } from "@/utils/insertDialogueBubble"

import { CharacterSheet } from "./AddParts/characterSheet"
import { buildLocationHTML, editorContentStyle, type TabKey } from "./AddParts/editorConstant"
import { LocationSheet } from "./AddParts/locationSheet"
import { useDialogue } from "./AddParts/useDialogue"
import { useLocations } from "./AddParts/useLocation"

export interface AddPartProps {
  style?: StyleProp<ViewStyle>
  onBack: () => void
  nextPartNumber: number
  selectedPart: Part | null
  onUpdate: (id: number, payload: Omit<Part, "part_id">) => void | Promise<void>
  onSave: (draft: Omit<Part, "id" | "script_id">) => void | Promise<void>
}
type SheetMode = "location" | "character" | "upload-details"

export default function AddPart({
  style,
  onBack,
  nextPartNumber,
  selectedPart,
  onSave,
  onUpdate,
}: AddPartProps) {
  const $styles = [$container, style, Platform.OS === "android" && { marginTop: 24 }]
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [sheetMode, setSheetMode] = useState<SheetMode>("location")
  const editorRef = useRef<RichEditor>(null)
  const sheetRef = useRef<BottomSheetController>(null)
  const isPro = false
  const isEdit = !!selectedPart
  const createDialogue = useScriptCreateDialoguePart()

  const [title, setTitle] = useState(selectedPart?.title || "")
  const [html, setHtml] = useState(selectedPart?.content || "")
  const [editorFocused, setEditorFocused] = useState(false)
  const [currentTab, setCurrentTab] = useState<TabKey>("last_used")
  const [embeddedImageUsed, setEmbeddedImageUsed] = useState(0)

  const { locations, sortedLocations, locationForm, setImage, setName, setHideName, resetForm } =
    useLocations({ currentTab, locations: selectedPart?.partLocations || [] })

  const {
    characters,
    selectedBackgroundColor,
    selectedTextColor,
    setSelectedBackgroundColor,
    setSelectedTextColor,
    additionalImages,
    addCharacter,
    characterForm,
    onAddMoreImages,
  } = useDialogue({ partId: selectedPart?.part_id })

  const quota = useMemo(() => {
    const limits = isPro
      ? { poster: 1, embedded: 50, location: 50, character: 50 }
      : { poster: 1, embedded: 10, location: 15, character: 15 }

    return {
      poster: { used: 1, limit: limits.poster },
      embedded: { used: embeddedImageUsed, limit: limits.embedded },
      location: { used: locations.length, limit: limits.location },
      character: { used: characters.length, limit: limits.character },
    }
  }, [isPro, locations.length, characters.length, embeddedImageUsed])

  const progress = useMemo(() => {
    const total = Object.values(quota).reduce((sum, q) => sum + q.limit, 0)
    const used = Object.values(quota).reduce((sum, q) => sum + q.used, 0)
    return { used, total, pct: used / total }
  }, [quota])

  useEffect(() => {
    bindDialogueClick(editorRef)
  }, [])

  useEffect(() => {
    if (isEdit) return
    ;(async () => {
      if (!isEdit) {
        await onSave({ title, content: html, order: nextPartNumber })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedPart?.part_id) {
      onUpdate(selectedPart.part_id, { title: title.trim(), content: html, order: nextPartNumber })
    }
  }, [title, html])

  const focusEditor = useCallback(() => editorRef.current?.focusContentEditor?.(), [])

  const onEditorMessage = useCallback((msg: any) => {
    try {
      const data: { id: string; type: string } = msg

      if (data?.type === "edit-dialogue") {
        // TODO: open your dialogue modal/sheet and pass data.payload
        console.log("edit-dialogue payload:", data?.type)
      }
    } catch (e) {}
  }, [])

  const openLocationSheet = useCallback(() => {
    setSheetMode("location")
    sheetRef.current?.expand()
  }, [])
  const openCharacterSheet = useCallback(() => {
    setSheetMode("character")
    sheetRef.current?.expand()
  }, [])
  const closeLocationSheet = useCallback(() => sheetRef.current?.close(), [])
  const onSheetOpen = useCallback(() => editorRef.current?.blurContentEditor?.(), [])
  const onSheetClose = useCallback(() => focusEditor(), [focusEditor])

  const onConfirmLocation = useCallback(
    (item: { image: string; name: string; hideName: boolean }) => {
      const html = buildLocationHTML(item)
      editorRef.current?.insertHTML?.(html)
      closeLocationSheet()
      setTimeout(() => editorRef.current?.focusContentEditor?.(), 150)
    },
    [closeLocationSheet],
  )

  const onCharacterSave = async (
    res: Omit<Dialogue, "id" | "part_id" | "created_at" | "dialogueCharacter"> & {
      audioFile?: DocumentPicker.DocumentPickerAsset
    },
  ) => {
    // persist a lightweight record if you want to support re-edit later
    // cacheDialogueData({ id, ...res })

    // const html = buildCharacterDialogueHTML({
    //   id,
    //   name: res.name,
    //   avatar: res.avatarUri,
    //   bubbleBg: res.bubbleBg ?? "#2C1A67",
    //   textColor: res.textColor ?? "#FFFFFF",
    //   dialogue: res.dialogue ?? "",
    //   audioSrc: res.audioUri, // only set when PRO selected audio
    // })
    const result = await createDialogue.mutateAsync({
      part_id: selectedPart?.part_id as number,
      dialogue: res,
    })
    if (result) {
      insertDialogue(editorRef, {
        id: result.id,
        name: result.dialogueCharacter.name,
        nameColor: result.dialogueCharacter.text_color, //res.textColor,
        bubbleColor: result.dialogueCharacter.text_background_color,
        textColor: result.dialogueCharacter.text_color,
        message: result.dialogue,
        avatarUrl: result.dialogueCharacter.image,
        audioUrl:
          "https://scripscape-assets-prod.s3.us-west-2.amazonaws.com/users/1/scripts/1/parts/1/dialogues/audio/9d2d9356-54e7-4ed0-88e5-ed7e3d80a52f.mp3", //result.audio_uri,
      })
    }

    // Insert and add a blank line after
    // editorRef.current?.insertHTML(html + "<p><br/></p>")
    // Keep caret outside and clicks routed to modal
    bindDialogueClick(editorRef) // reuse your util if it adds extra guards
  }

  const UploadDetail = () => {
    const uploadItems: Array<{ label: string; key: keyof typeof quota }> = [
      { label: "Poster Image", key: "poster" },
      { label: "Embedded Images", key: "embedded" },
      { label: "Location Images", key: "location" },
      { label: "Character Images", key: "character" },
    ]
    return (
      <View>
        <View style={themed($headerRow)}>
          <View>
            <Text preset="sectionHeader" weight="semiBold">
              Uploads Remaining
            </Text>
          </View>
          <ProgressRing value={progress.used} total={progress.total} size={27} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {uploadItems.map((item) => (
            <View style={{ width: "48%" }} key={item.key}>
              <Text text={item.label} />
              <Text text={`${quota[item.key].used}/${quota[item.key].limit}`} />
            </View>
          ))}
        </View>
        <Button>Upgrade to </Button>
      </View>
    )
  }

  const showUPloadDetail = () => {
    sheetRef.current?.expand()
    setSheetMode("upload-details")
  }
  const onEditorReady = useCallback(() => {
    bindDialogueClick(editorRef) // <- IMPORTANT
  }, [])

  return (
    <View style={$styles}>
      {/* Header */}
      <View style={themed($headerRow)}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <PressableIcon icon="arrowLeft" onPress={onBack} hitSlop={10} />
          <Text preset="sectionHeader" weight="semiBold">
            Part {isEdit ? selectedPart.index : nextPartNumber}
          </Text>
        </View>
        <ProgressRing
          value={progress.used}
          total={progress.total}
          size={27}
          onPress={showUPloadDetail}
        />
      </View>

      {/* Title + Editor */}
      <View style={{ gap: 8, flex: 1 }}>
        <TextField
          value={title}
          inputWrapperStyle={$titleInputContainer}
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
            editorStyle={editorContentStyle(colors)}
            placeholder="Add some text, dialogue, or images here"
            onChange={setHtml}
            useContainer={false}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
            style={{ flex: 1, minHeight: 0, paddingHorizontal: 24 }}
            onMessage={onEditorMessage}
            editorInitializedCallback={onEditorReady}
            editorProps={{
              allowsInlineMediaPlayback: true,
              mediaPlaybackRequiresUserAction: true,
            }}
          />
          <UpgradeProPopup visible={false} onClose={() => {}} />
          <KeyboardToolbar
            partId={selectedPart?.part_id}
            editorRef={editorRef}
            visible={editorFocused}
            onLocation={openLocationSheet}
            onCharacter={openCharacterSheet}
            embeddedImageUsed={embeddedImageUsed}
            setEmbeddedImageUsed={setEmbeddedImageUsed}
            embeddedImageLimit={quota.embedded.limit}
            onLimitReached={showUPloadDetail}
          />
        </KeyboardAvoidingView>
      </View>

      {/* Location Sheet */}
      <AppBottomSheet
        controllerRef={sheetRef}
        snapPoints={["95%"]}
        style={{ zIndex: 40, pointerEvents: "auto", flex: 1 }}
        // onOpen={onSheetOpen}
        onChange={(index) => {
          if (index > -1) onSheetOpen()
        }}
        onClose={onSheetClose}
      >
        {sheetMode === "upload-details" ? (
          <UploadDetail />
        ) : sheetMode === "location" ? (
          <LocationSheet
            script_id={selectedPart?.script_id as number}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            quotaLimit={quota.location.limit}
            locations={sortedLocations}
            form={locationForm}
            setImage={setImage}
            setName={setName}
            setHideName={setHideName}
            addLocation={(item) => {
              resetForm()
            }}
            onConfirm={onConfirmLocation}
            onLimitReached={showUPloadDetail}
            partId={selectedPart?.part_id as number}
          />
        ) : (
          <CharacterSheet
            quota={quota.character}
            isPro={true}
            onSave={async (res) => {
              await onCharacterSave(res)
              sheetRef.current?.close()
            }}
            selectedCharacterTextBackgroundColor={selectedBackgroundColor}
            selectedCharacterTextColor={selectedTextColor}
            characters={characters}
            setCharacterTextColor={setSelectedTextColor}
            setCharacterTextBackgroundColor={setSelectedBackgroundColor}
            additionalImages={additionalImages}
            onAddAdditionalImages={onAddMoreImages}
            addCharacter={addCharacter}
            onConfirm={() => {}}
            form={characterForm}
            setCharacterImage={() => {}}
            setCharacterName={() => {}}
            onLimitReached={showUPloadDetail}
          />
        )}
      </AppBottomSheet>
    </View>
  )
}

/** styles */
const $container: ViewStyle = { flex: 1 }

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
  gap: spacing.xs,
  paddingHorizontal: 24,
})

const $titleInput: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  // paddingHorizontal: spacing.md,
  // paddingVertical: Platform.select({ ios: spacing.md, android: spacing.sm }),
  // color: colors.text,
  // borderWidth: 0,
})
const $titleInputContainer: ViewStyle = { borderWidth: 0, paddingHorizontal: 24 }
