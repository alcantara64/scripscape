import { useEffect, useRef, useState, useCallback } from "react"
import { View, Platform, KeyboardAvoidingView, StyleProp, ViewStyle, TextStyle } from "react-native"
import * as DocumentPicker from "expo-document-picker"
import { RichEditor } from "react-native-pell-rich-editor"

import IntroArt from "@assets/images/svgviewer-output.svg"

import { AppBottomSheet, type BottomSheetController } from "@/components/AppBottomSheet"
import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { KeyboardToolbar } from "@/components/KeyboardToolbar"
import { OneTimeModal } from "@/components/OneTimeModal"
import { ProgressRing } from "@/components/ProgressRing"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UpgradeProPopup } from "@/components/UprogradePropPup"
import { Dialogue, Part } from "@/interface/script"
import { useEmbeddedImagesByScript } from "@/querries/embedded-images"
import { useGetLocationImagesByScriptId } from "@/querries/location"
import { useScriptCreateDialoguePart } from "@/querries/script"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { bindDialogueClick, getBubbleData, insertDialogue } from "@/utils/insertDialogueBubble"
import { useQuota } from "@/utils/useQuota"

import { CharacterSheet } from "./AddParts/characterSheet"
import { UpdateDialogue } from "./AddParts/dialogue"
import { buildLocationHTML, editorContentStyle, type TabKey } from "./AddParts/editorConstant"
import { LocationSheet } from "./AddParts/locationSheet"
import { useDialogue } from "./AddParts/useDialogue"
import { useLocations } from "./AddParts/useLocation"

export interface AddPartProps {
  style?: StyleProp<ViewStyle>
  onBack: () => void
  nextPartNumber: number
  selectedPart: Part | null
  script_id: number
  onUpdate: (id: number, payload: Omit<Part, "part_id">) => void | Promise<void>
  onSave: (draft: Omit<Part, "id" | "script_id">) => void | Promise<void>
}
type SheetMode = "location" | "character" | "upload-details" | "update-dialogue"

export default function AddPart({
  style,
  onBack,
  nextPartNumber,
  selectedPart,
  onSave,
  onUpdate,
  script_id,
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
  const [dialogueId, setDialogueId] = useState<number | null>(null)
  const [dialogueText, setDialogueText] = useState("")
  const { data: embeddedImages, isLoading: loadingEmbedded } = useEmbeddedImagesByScript(script_id)

  const { data, isLoading } = useGetLocationImagesByScriptId(script_id)

  const { locations, sortedLocations, locationForm, setImage, setName, setHideName, resetForm } =
    useLocations({ currentTab, locations: data?.items || [] })

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
  } = useDialogue({ scriptId: script_id })

  const { quota, progress } = useQuota({
    isPro,
    used: {
      embedded: embeddedImages?.items.length || 0,
      location: locations.length,
      character: characters.length,
      poster: 1,
    },
  })

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

  const onEditorMessage = useCallback(async (msg: any) => {
    try {
      const data: { id: string; type: string } = msg

      if (data?.type === "edit-dialogue") {
        setDialogueId(Number(data.id))
        setSheetMode("update-dialogue")
        const dataObject = await getBubbleData(data.id, editorRef)
        if (dataObject) {
          setDialogueText(dataObject?.message)
        }
        sheetRef.current?.expand()
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
    (item: { image: string; name: string; hideName: boolean; id: number }) => {
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
        audioUrl: result.audio_uri,
      })
    }
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
            editorRef={editorRef}
            visible={editorFocused}
            onLocation={openLocationSheet}
            onCharacter={openCharacterSheet}
            embeddedImageUsed={embeddedImageUsed}
            setEmbeddedImageUsed={setEmbeddedImageUsed}
            embeddedImageLimit={quota.embedded.limit}
            onLimitReached={showUPloadDetail}
            scriptId={script_id}
          />
        </KeyboardAvoidingView>
      </View>
      {isEdit && <OneTimeModal testID="dialog" artwork={<IntroArt />} storageKey="dialog-modal" />}
      {/* Location Sheet */}
      <AppBottomSheet
        controllerRef={sheetRef}
        snapPoints={["95%"]}
        style={{ zIndex: 40, pointerEvents: "auto", flex: 1 }}
        onChange={(index) => {
          if (index > -1) onSheetOpen()
        }}
        onClose={onSheetClose}
      >
        {sheetMode === "upload-details" && <UploadDetail />}
        {sheetMode === "location" && (
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
            resetLocationForm={resetForm}
          />
        )}
        {sheetMode === "character" && (
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
        {sheetMode === "update-dialogue" && dialogueId && (
          <UpdateDialogue
            diaLogueId={dialogueId}
            sheetRef={sheetRef}
            initialDialogueText={dialogueText}
            editorRef={editorRef}
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
