import { useRef, useState } from "react"
import { Platform, Pressable, View, type ViewStyle } from "react-native"
import * as FileSystem from "expo-file-system"
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { compressImage, toRNFile } from "@/utils/image"
import { insertDialogue } from "@/utils/insertDialogueBubble"
import { useKeyboardHeight } from "@/utils/useKeyboardHeight"

import { ImagePickerWithCropping } from "./ImagePickerWithCroping"
import { useUpdateScriptPart } from "@/querries/script"
import { useCreateScriptEmbeddedImages } from "@/querries/embedded-images"

type Props = {
  editorRef: React.RefObject<RichEditor | null>
  visible: boolean
  onLocation: () => void
  onCharacter: () => void
  embeddedImageUsed: number
  setEmbeddedImageUsed: (x: number) => void
  embeddedImageLimit: number
  onLimitReached: () => void
  scriptId: number
}

const BAR_HEIGHT = Platform.OS === "ios" ? 64 : 110

export function KeyboardToolbar({
  editorRef,
  visible,
  onLocation,
  onCharacter,
  embeddedImageLimit,
  embeddedImageUsed,
  setEmbeddedImageUsed,
  onLimitReached,
  scriptId,
}: Props) {
  const kb = useKeyboardHeight()
  const insets = useSafeAreaInsets()
  const { themed } = useAppTheme()
  const createScriptEmbeddedImage = useCreateScriptEmbeddedImages()

  const coverImageRef = useRef<{ pickImage: () => Promise<void> }>(null)
  const bottom = Math.max(0, kb - (Platform.OS === "ios" ? insets.bottom : 0))
  const [showFormatBar, setShowFormatBar] = useState(false)

  const aStyle = useAnimatedStyle(() => {
    const shown = visible && kb > 0
    return {
      transform: [{ translateY: withTiming(shown ? 0 : BAR_HEIGHT + 20, { duration: 180 }) }],
      opacity: withTiming(shown ? 1 : 0, { duration: 120 }),
    }
  })

  const editor = editorRef.current
  const run = (fn?: () => void) => fn?.()

  const handleCoverImageSelected = async (uri: string, mimeType?: string) => {
    if (embeddedImageUsed >= embeddedImageLimit) {
      onLimitReached()
    } else {
      const img = await compressImage(uri)
      createScriptEmbeddedImage.mutate(
        {
          script_id: scriptId,
          payload: { image: img.uri },
        },

        {
          onSuccess: (response) => {
            console.log({ response })
            editorRef.current?.focusContentEditor?.()
            editorRef.current?.insertHTML?.(`
    <figure style="margin:12px 0;" id="embedded-image${response.id}">
      <img src="${response.url}" alt="${response.caption ?? "image"}"
           style="max-width:100%;max-height:204px;display:block;border-radius:4px;" />
    </figure>
  `)
            setEmbeddedImageUsed(embeddedImageUsed + 1)
          },
        },
      )
    }
  }

  return (
    <Animated.View
      style={[
        themed($wrap),
        aStyle,
        { bottom, height: BAR_HEIGHT, position: "absolute", left: 0, right: 0, zIndex: 9999 },
      ]}
      pointerEvents={visible && kb > 0 ? "auto" : "none"}
    >
      {showFormatBar && (
        <RichToolbar
          style={{ position: "absolute", bottom: 80, left: 80, right: 80, borderRadius: 12 }}
          editor={editorRef.current}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.alignLeft,
            actions.alignCenter,
            actions.alignRight,
          ]}
        />
      )}
      <ImagePickerWithCropping
        ref={coverImageRef}
        onImageSelected={handleCoverImageSelected}
        aspect={[16, 9]} // wide ratio for background
      />
      <View style={themed($bar)}>
        <Row>
          <View
            style={{
              flexDirection: "row",
              gap: 24,
            }}
          >
            <Pill onPress={onLocation} icon="gps" />
            <Pill
              onPress={() => {
                setShowFormatBar(false)
                run(() => coverImageRef?.current?.pickImage())
              }}
              icon="image"
            />

            <Pill
              onPress={() => {
                setShowFormatBar(false)
                onCharacter()
              }}
              icon="chatBubble"
            />
            <Pill
              onPress={() => {
                setShowFormatBar(true)
              }}
              icon="text"
            />
          </View>
          <View>
            <Pill
              onPress={() => {
                setShowFormatBar(false)
                run(() => editor?.dismissKeyboard())
              }}
              icon="keyboardDown"
            />
          </View>
        </Row>
      </View>
    </Animated.View>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={$row}>{children}</View>
}

function Pill({ onPress, icon }: { onPress: () => void; text?: string; icon?: string }) {
  const { themed } = useAppTheme()
  return (
    <Pressable onPress={onPress} style={themed($pill)}>
      <Icon icon={(icon as any) || "dot"} />
    </Pressable>
  )
}

function guessMime(uri: string, fallback?: string) {
  if (fallback) return fallback
  const lower = uri.toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".gif")) return "image/gif"
  return "image/jpeg"
}

const $wrap: ThemedStyle<ViewStyle> = () => ({
  // container for animation & positioning only
  flex: 1,
})

const $bar: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  // taller padding for better touch targets
  paddingVertical: spacing.sm,
  borderTopWidth: 0.5,
  borderColor: colors.palette.accentActive,
})

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  marginHorizontal: 4,
}

const $pill: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: 36,
  minWidth: 36,
  alignItems: "center",
  justifyContent: "center",
})
