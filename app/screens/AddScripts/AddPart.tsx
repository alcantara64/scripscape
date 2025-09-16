import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { View, Platform, KeyboardAvoidingView, StyleProp, ViewStyle, TextStyle } from "react-native"
import { RichEditor } from "react-native-pell-rich-editor"

import { AppBottomSheet, type BottomSheetController } from "@/components/AppBottomSheet"
import { PressableIcon } from "@/components/Icon"
import { KeyboardToolbar } from "@/components/KeyboardToolbar"
import { ProgressRing } from "@/components/ProgressRing"
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
import { useDialogue } from "./AddParts/useDialogue"
import { useLocations } from "./AddParts/useLocation"
import { Button } from "@/components/Button"

export interface AddPartProps {
  style?: StyleProp<ViewStyle>
  onBack: () => void
}
type SheetMode = "location" | "character" | "upload-details"

export default function AddPart({ style, onBack }: AddPartProps) {
  const $styles = [$container, style, Platform.OS === "android" && { marginTop: 24 }]
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const [sheetMode, setSheetMode] = useState<SheetMode>("location")
  const editorRef = useRef<RichEditor>(null)
  const sheetRef = useRef<BottomSheetController>(null)
  const isPro = false

  const [title, setTitle] = useState("")
  const [html, setHtml] = useState(
    `<p>Tucked between misty hills and a quiet shoreline, the village felt untouched by time…</p>`,
  )
  const [editorFocused, setEditorFocused] = useState(false)
  const [currentTab, setCurrentTab] = useState<TabKey>("last_used")
  const charRef = useRef<CharacterSheetHandle>(null)
  const [embeddedImageUsed, setEmbeddedImageUsed] = useState(0)

  const {
    locations,
    addLocation,
    sortedLocations,
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
    characterForm,
    onAddMoreImages,
  } = useDialogue()

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

    // const html = buildCharacterDialogueHTML({
    //   id,
    //   name: res.name,
    //   avatar: res.avatarUri,
    //   bubbleBg: res.bubbleBg ?? "#2C1A67",
    //   textColor: res.textColor ?? "#FFFFFF",
    //   dialogue: res.dialogue ?? "",
    //   audioSrc: res.audioUri, // only set when PRO selected audio
    // })
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
            onLimitReached={showUPloadDetail}
          />
        ) : (
          <CharacterSheet
            quota={quota.character}
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
