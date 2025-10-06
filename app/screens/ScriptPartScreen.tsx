import { FC, useMemo } from "react"
import { Linking, Platform, View, ViewStyle } from "react-native"
import WebView from "react-native-webview"

import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { editorContentStyle } from "./AddScripts/AddParts/editorConstant"
import { useGetPartsById } from "@/querries/script"
import { useNavigation } from "@react-navigation/native"
import { dialogueBridgeJS } from "@/utils/insertDialogueBubble"

// import { useNavigation } from "@react-navigation/native"

interface ScriptPartScreenProps extends AppStackScreenProps<"ScriptPart"> {}

export const ScriptPartScreen: FC<ScriptPartScreenProps> = ({ route }) => {
  const { part_id } = route.params
  // Pull in navigation via hook
  const navigation = useNavigation()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { data: partData, isLoading } = useGetPartsById(part_id)
  const { contentCSSText } = editorContentStyle(colors)
  const pageHtml = useMemo(() => {
    // Convert editorContentStyle(colors) into CSS. If your editorContentStyle
    // returns a JS object, you likely already baked class names into the HTML.
    // Add a few read-only guards here.
    const css = `
      /* Base reset */
      html, body { margin: 0; padding: 0; }
      body {
        -webkit-text-size-adjust: 100%;
        font-family: -apple-system, system-ui, "Helvetica Neue", Arial;
        color: ${colors.text};
        // background: ${colors.background};
        padding:24px;
      }

      /* Make images responsive */
      img, video, audio, canvas { max-width: 100%; height: auto; }

      /* Preserve your editor look & feel */
      ${contentCSSText}

      /* READ-ONLY: prevent caret, long-press, selection, and pointer edits */
      .ss-readonly, .ss-readonly * {
        -webkit-user-select: none; user-select: none;
        -webkit-touch-callout: none;
        caret-color: transparent;
      }

      /* Keep links clickable */
      .ss-readonly a, .ss-readonly a * {
        pointer-events: auto !important;
        -webkit-user-select: text; user-select: text;
        caret-color: auto;
      }

      /* Safe figure default */
      figure { margin: 0 0 12px 0; }
      figcaption { opacity: 0.8; font-size: 12px; margin-top: 6px; }
    `.trim()

    // Wrap your stored HTML inside a container we control
    const wrapped = `
      <!doctype html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <style>${css}</style>
        </head>
        <body>
          <main class="ss-readonly">
            ${partData?.content || "<p style='opacity:.6'>No content yet.</p>"}
          </main>
          <script>
            // Block contentEditable toggles just in case
            Array.from(document.querySelectorAll('[contenteditable]'))
              .forEach(el => el.setAttribute('contenteditable', 'false'));
          </script>
        </body>
      </html>
    `
    return wrapped
  }, [colors, partData])

  const goBack = () => {
    navigation.goBack()
  }
  if (isLoading) {
    return <Text text="loading ..." />
  }
  return (
    <Screen
      style={$root}
      preset="auto"
      safeAreaEdges={["top"]}
      ScrollViewProps={{ contentContainerStyle: { flexGrow: 1 } }}
    >
      <View style={$container}>
        {/* Header (same layout as AddPart, just no inputs/actions) */}
        <View style={themed($headerRow)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <PressableIcon icon="arrowLeft" onPress={goBack} hitSlop={10} />
            <Text preset="sectionHeader" weight="semiBold">
              Part {partData?.index}
            </Text>
          </View>
        </View>

        {/* Title */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 6 }}>
          <Text preset="subheading" weight="semiBold" numberOfLines={2}>
            {partData?.title || "Untitled"}
          </Text>
        </View>

        {/* Read-only content */}

        <WebView
          originWhitelist={["*"]}
          source={{ html: pageHtml }}
          injectedJavaScript={dialogueBridgeJS}
          // Keep scrollable, but no zoom to mimic editor
          scalesPageToFit={false}
          scrollEnabled
          // Disable text selection callouts on iOS
          dataDetectorTypes="all"
          // Allow tapping links to open externally
          onShouldStartLoadWithRequest={(req) => {
            const isHttp = /^https?:\/\//i.test(req.url)
            // Let the initial "about:blank" / internal doc load
            if (req.navigationType === "other" && !isHttp) return true
            if (isHttp) {
              Linking.openURL(req.url).catch(() => {})
              return false
            }
            return true
          }}
          // Performance niceties
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          // Android: improves hardware-acceleration text clarity
          androidLayerType={Platform.OS === "android" ? "hardware" : undefined}
          // Prevent keyboard popping (no inputs anyway)
          keyboardDisplayRequiresUserAction
          allowsInlineMediaPlayback // iOS: needed for inline <audio>
          mediaPlaybackRequiresUserAction // keep true; play() is user-initiated via click
          style={$webview}
        />
      </View>
    </Screen>
  )
}

const $root: ViewStyle = {
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

const $webview: ViewStyle = {
  flex: 1,
  backgroundColor: "transparent",
}

const $container: ViewStyle = { flex: 1 }
