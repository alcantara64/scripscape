import { useEffect, useMemo, useRef, useState } from "react"
import {
  Pressable,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
  Platform,
  KeyboardAvoidingView,
  InputAccessoryView,
  Alert,
} from "react-native"
import { RichEditor } from "react-native-pell-rich-editor"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Icon, PressableIcon } from "./Icon"
import { TextField } from "./TextField"
import { KeyboardToolbar } from "./KeyboardToolbar"
import { ImagePickerWithCropping } from "./ImagePickerWithCroping"
import * as FileSystem from "expo-file-system"
import { bindDialogueClick } from "@/utils/insertDialogueBubble"
import { AppBottomSheet } from "./AppBottomSheet"

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
  episode: { used: number; limit: number }
  cover: { used: number; limit: number }
  other: { used: number; limit: number }
}
type TBProps = { editorRef: React.RefObject<RichEditor | null>; style?: ViewStyle }

function Row({ children }: { children: React.ReactNode }) {
  return <View style={$row}>{children}</View>
}

function Tool({ onPress, icon }: { onPress: () => void; label?: string; icon?: string }) {
  const { themed } = useAppTheme()
  return (
    <Pressable onPress={onPress} style={themed($tool)}>
      {<Icon icon={(icon as any) || "dot"} />}
    </Pressable>
  )
}

function Divider() {
  const { themed } = useAppTheme()
  return <View style={themed($divider)} />
}
const TOOLBAR_ID = "AddPartToolbar"

function EditorToolbar({ editorRef, style }: TBProps) {
  const { themed, spacing } = useAppTheme()
  const editor = editorRef.current

  const exec = (fn: () => void) => fn()

  return (
    <View style={[themed($toolbar), style]}>
      <Row>
        <View style={{ flexDirection: "row", gap: 24 }}>
          <Tool onPress={() => exec(() => editor?.insertImage("location"))} icon="image" />
          <Tool onPress={() => exec(() => editor?.setItalic?.())} icon="gps" />
          <Tool onPress={() => exec(() => editor?.setUnderline?.())} icon="chatBubble" />
          <Tool onPress={() => exec(() => editor?.heading1?.())} icon="person" />
          <Tool onPress={() => exec(() => editor?.heading2?.())} icon="text" />
        </View>
        <View>
          <Tool onPress={() => exec(() => editor?.blur?.())} icon="keyboardDown" />
        </View>
      </Row>
    </View>
  )
}
const DIALOGUE_CSS = `
  .ss-dialogue{display:flex;align-items:flex-start;gap:10px;margin:10px 0;user-select:none;}
  .ss-dialogue .ss-avatar{width:28px;height:28px;border-radius:50%;background:#2B2A45;overflow:hidden;flex:0 0 28px;}
  .ss-dialogue .ss-avatar img{width:100%;height:100%;object-fit:cover;display:block;}
  .ss-dialogue .ss-bubble{position:relative;flex:1;border-radius:14px;padding:10px 44px 10px 12px;box-shadow:0 2px 8px rgba(0,0,0,.18);}
  .ss-dialogue .ss-name{font-weight:700;font-size:13px;line-height:16px;margin-bottom:2px;}
  .ss-dialogue .ss-text{font-size:14px;line-height:20px;white-space:pre-wrap;}
  .ss-dialogue .ss-play{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:36px;height:28px;border-radius:14px;background:rgba(255,255,255,.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;}
  .ss-dialogue[contenteditable="false"]{cursor:default;}
`.trim()
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
  const [showQuota, setShowQuota] = useState(true)
  const [editorFocused, setEditorFocused] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)

  const focusEditor = () => editorRef.current?.focusContentEditor?.()

  const quota: UploadQuota = useMemo(
    () => ({
      poster: { used: 1, limit: 1 },
      episode: { used: 9, limit: 10 },
      cover: { used: 10, limit: 15 },
      other: { used: 10, limit: 15 },
    }),
    [],
  )

  const progress = useMemo(() => {
    const total = quota.poster.limit + quota.episode.limit + quota.cover.limit + quota.other.limit
    const used = quota.poster.used + quota.episode.used + quota.cover.used + quota.other.used
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

          <KeyboardToolbar editorRef={editorRef} visible={editorFocused} />
        </KeyboardAvoidingView>
      </View>
      <AppBottomSheet>
        <View></View>
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

const $toolbar: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderTopWidth: 1,
  borderColor: colors.palette.neutral100,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
}

const $tool: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 24,
  minWidth: 24,
  // paddingHorizontal: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
})

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 1,
  height: 22,
  backgroundColor: colors.border,
  marginHorizontal: 4,
})
