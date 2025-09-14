import { useEffect, useRef, useState, useCallback } from "react"
import { View, Platform, KeyboardAvoidingView, StyleProp, ViewStyle, TextStyle } from "react-native"
import { RichEditor } from "react-native-pell-rich-editor"

import { AppBottomSheet, type BottomSheetController } from "@/components/AppBottomSheet"
import { PressableIcon } from "@/components/Icon"
import { KeyboardToolbar } from "@/components/KeyboardToolbar"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { bindDialogueClick, insertDialogue } from "@/utils/insertDialogueBubble"

import { CharacterResult, CharacterSheet, CharacterSheetHandle } from "./AddParts/characterSheet"
import {
  buildCharacterDialogueHTML,
  buildLocationHTML,
  editorContentStyle,
  type TabKey,
} from "./AddParts/editorConstant"
import { LocationSheet } from "./AddParts/locationSheet"
import { useLocations } from "./AddParts/useLocation"
import { useDialogue } from "./AddParts/useDialogue"

export interface AddPartProps {
  style?: StyleProp<ViewStyle>
  onBack: () => void
}
type SheetMode = "location" | "character"

export default function AddPart({ style, onBack }: AddPartProps) {
  const $styles = [$container, style, Platform.OS === "android" && { marginTop: 24 }]
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const [sheetMode, setSheetMode] = useState<SheetMode>("location")
  const editorRef = useRef<RichEditor>(null)
  const sheetRef = useRef<BottomSheetController>(null)

  const [title, setTitle] = useState("")
  const [html, setHtml] = useState(
    `<p>Tucked between misty hills and a quiet shoreline, the village felt untouched by time…</p>`,
  )
  const [editorFocused, setEditorFocused] = useState(false)
  const [currentTab, setCurrentTab] = useState<TabKey>("last_used")
  const charRef = useRef<CharacterSheetHandle>(null)

  const {
    locations,
    addLocation,
    sortedLocations,
    quota,
    progress,
    locationForm,
    setImage,
    setName,
    setHideName,
    resetForm,
  } = useLocations({ currentTab })

  const {
    characters,
    selectedBackgroundColor,
    selectedTextColor,
    setSelectedBackgroundColor,
    setSelectedTextColor,
    additionalImages,
    addCharacter,
    onAddMoreImages,
  } = useDialogue()

  useEffect(() => {
    bindDialogueClick(editorRef)
  }, [])

  const focusEditor = useCallback(() => editorRef.current?.focusContentEditor?.(), [])

  const onEditorMessage = useCallback((msg: string) => {
    try {
      const data = JSON.parse(msg)
      if (data?.type === "dialogue") {
        // TODO: open your dialogue modal/sheet and pass data.payload
        console.log("edit-dialogue payload:", data?.payload)
      }
    } catch {}
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

  const onCharacterSave = (res: CharacterResult) => {
    const id = Date.now().toString()
    // persist a lightweight record if you want to support re-edit later
    // cacheDialogueData({ id, ...res })

    const html = buildCharacterDialogueHTML({
      id,
      name: res.name,
      avatar: res.avatarUri,
      bubbleBg: res.bubbleBg ?? "#2C1A67",
      textColor: res.textColor ?? "#FFFFFF",
      dialogue: res.dialogue ?? "",
      audioSrc: res.audioUri, // only set when PRO selected audio
    })
    insertDialogue(editorRef, {
      name: res.name,
      nameColor: res.textColor,
      bubbleColor: res.bubbleBg,
      textColor: res.textColor,
      message: res.dialogue,
      avatarUrl: res.audioUri,
    })
    // Insert and add a blank line after
    // editorRef.current?.insertHTML(html + "<p><br/></p>")
    // Keep caret outside and clicks routed to modal
    bindDialogueClick(editorRef) // reuse your util if it adds extra guards
  }

  // simple inline form (put it above the return)
  function CharacterForm({
    isPro,
    onSave,
  }: {
    isPro: boolean
    onSave: (r: CharacterResult) => void
  }) {
    const [state, setState] = useState<CharacterResult>({
      name: "",
      avatarUri: undefined,
      bubbleBg: "#2C1A67",
      textColor: "#FFFFFF",
      dialogue: "",
      audioUri: undefined,
    })

    const pickAvatar = async () => {
      const { launchImageLibraryAsync, MediaTypeOptions } = await import("expo-image-picker")
      const res = await launchImageLibraryAsync({
        allowsEditing: true,
        mediaTypes: MediaTypeOptions.Images,
        quality: 0.9,
      })
      // @ts-ignore expo type
      if (!res?.canceled) setState((s) => ({ ...s, avatarUri: res.assets[0].uri }))
    }

    const pickAudio = async () => {
      if (!isPro) return
      const { getDocumentAsync } = await import("expo-document-picker")
      const res = await getDocumentAsync({ type: "audio/*", copyToCacheDirectory: true })
      if (res.type === "success") setState((s) => ({ ...s, audioUri: res.uri }))
    }

    return (
      <View style={{ padding: 16, gap: 12 }}>
        <Text preset="subheading">Add Character</Text>

        <PressableIcon icon="image" onPress={pickAvatar} />
        <TextField
          value={state.name}
          onChangeText={(name) => setState((s) => ({ ...s, name }))}
          placeholder="Character name"
        />

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TextField
            value={state.bubbleBg}
            onChangeText={(bubbleBg) => setState((s) => ({ ...s, bubbleBg }))}
            placeholder="#2C1A67"
            containerStyle={{ flex: 1 }}
          />
          <TextField
            value={state.textColor}
            onChangeText={(textColor) => setState((s) => ({ ...s, textColor }))}
            placeholder="#FFFFFF"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <TextField
          value={state.dialogue}
          onChangeText={(dialogue) => setState((s) => ({ ...s, dialogue }))}
          placeholder="Enter dialogue…"
          multiline
          inputWrapperStyle={{ minHeight: 100 }}
        />

        <PressableIcon
          icon={state.audioUri ? "check" : "music"}
          onPress={pickAudio}
          disabled={!isPro}
          label={state.audioUri ? "Audio selected" : isPro ? "Add audio" : "Unlock audio (PRO)"}
        />

        <PressableIcon icon="addScript" onPress={() => onSave(state)} label="Save" />
      </View>
    )
  }

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

        {/* Progress ring (tap to save draft, if you want) */}
        <View style={themed($ring)}>
          <View style={themed($ringTrack)} />
          <View
            style={[themed($ringFill), { width: `${Math.min(100, Math.round(progress * 100))}%` }]}
          />
        </View>
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
            editorStyle={editorContentStyle(colors)}
            placeholder="Add some text, dialogue, or images here"
            onChange={setHtml}
            useContainer={false}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
            style={{ flex: 1, minHeight: 0, paddingHorizontal: 24 }}
            onMessage={onEditorMessage}
            editorInitializedCallback={() => {
              editorRef.current?.injectJavascript(`
      (function(){
        const root = document.body;
        // Play/Pause
        root.addEventListener('click', function(e){
          const btn = e.target.closest('.audio-btn');
          if (btn) {
            const id = btn.getAttribute('data-id');
            const audio = document.getElementById('audio-' + id);
            if (!audio) return;
            if (audio.paused) { audio.play(); btn.textContent = '⏸︎ Pause'; }
            else { audio.pause(); btn.textContent = '▶︎ Play'; }
            return;
          }
          // Open editor modal when bubble is tapped
          const bubble = e.target.closest('.dlg');
          if (bubble) {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'open-dialogue',
              id: bubble.getAttribute('data-id')
            }));
          }
        }, true);
      })();
      true;
    `)
            }}
            editorProps={{
              allowsInlineMediaPlayback: true,
              mediaPlaybackRequiresUserAction: false,
            }}
          />

          <KeyboardToolbar
            editorRef={editorRef}
            visible={editorFocused}
            onLocation={openLocationSheet}
            onCharacter={openCharacterSheet}
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
        {sheetMode === "location" ? (
          <LocationSheet
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            quotaLimit={quota.location.limit}
            locations={sortedLocations}
            form={locationForm}
            setImage={setImage}
            setName={setName}
            setHideName={setHideName}
            addLocation={(item) => {
              addLocation(item)
              resetForm()
            }}
            onConfirm={onConfirmLocation}
          />
        ) : (
          <CharacterSheet
            isPro={true}
            onSave={(res) => {
              onCharacterSave(res)
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
