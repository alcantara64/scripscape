import { useState } from "react"
import { StyleProp, TextStyle, View, ViewStyle, StyleSheet, ActivityIndicator } from "react-native"
import { Image, ImageSource, ImageStyle } from "expo-image"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface SmartImageProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  imageStyle?: ImageStyle
  fallBackImage?: ImageSource
  image: ImageSource
  placeholderImage?: ImageSource
  blurhash?: string
}

/**
 * Describe your component here
 */
export const SmartImage = (props: SmartImageProps) => {
  const {
    style,
    fallBackImage = require("../../assets/images/fallback.png"),
    image = { uri: "https://example.com/avatar.jpg" },
    blurhash,
    imageStyle,
  } = props
  const $styles = [$container, style]
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const { themed } = useAppTheme()

  return (
    <View style={$styles}>
      <Image
        style={imageStyle}
        source={error ? fallBackImage : image}
        placeholder={{ blurhash }} // 👈 local placeholder shown instantly
        contentFit="cover"
        transition={1000} // fade-in when loaded
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError(true)}
      />

      {loading && (
        <View style={$loader}>
          <ActivityIndicator size="small" color="#888" />
        </View>
      )}
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
}

const $loader: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  justifyContent: "center",
  alignItems: "center",
}
