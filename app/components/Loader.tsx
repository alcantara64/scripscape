import { Platform, StyleProp, TextStyle, View, ViewStyle, StyleSheet } from "react-native"
import LottieView from "lottie-react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useEffect, useRef } from "react"

export interface LoaderProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  loop?: boolean
  autoPlay?: boolean
  speed?: number
  // Use local file OR remote URL
  source?: string
  size?: number // diameter of the animation box
  backgroundColor?: string
  textStyle?: object
  message?: string
}

/**
 * Describe your component here
 */
export const Loader = (props: LoaderProps) => {
  const {
    style,
    textStyle,
    backgroundColor,
    size = 160,
    speed = 1,
    source = require("../../assets/loading.json"),
    message = "Loading…",
    loop = true,
    autoPlay = true,
  } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  const lottieRef = useRef<LottieView>(null)

  useEffect(() => {
    // Helpful if you need to imperatively control playback later:
    if (autoPlay && lottieRef.current) {
      // lottieRef.current.play(); // not required if autoPlay is true
    }
  }, [autoPlay])

  return (
    <View style={[$container, { backgroundColor }]}>
      <View style={[$lottieWrap, { width: size, height: size }]} pointerEvents="none">
        <LottieView
          ref={lottieRef}
          source={source}
          autoPlay={autoPlay}
          loop={loop}
          speed={speed}
          style={{ width: 400, height: 200 }}
          // "cover" fills the box, "contain" keeps original aspect
          resizeMode="contain"
          // Improves perf on Android
          enableMergePathsAndroidForKitKatAndAbove
          // Avoids clipped shadows on some animations
          renderMode={Platform.OS === "android" ? "HARDWARE" : "AUTOMATIC"}
        />
      </View>

      {!!message && <Text style={[themed($message), textStyle]}>{message}</Text>}
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
  flex: 1,
  paddingHorizontal: 24,
  alignItems: "center",
  height: "100%",
  width: "100%",
}

const $lottieWrap: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
}
const $message: ThemedStyle<TextStyle> = () => ({
  marginTop: 16,
  fontSize: 16,
  opacity: 0.85,
  textAlign: "center",
  color: "#fff",
})

const $text: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.palette.primary500,
  opacity: 0.85,
  textAlign: "center",
  // color: "#fff",
  marginTop: 16,
})
