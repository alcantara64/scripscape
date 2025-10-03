import { useEffect, useMemo, useState } from "react"
import { StyleProp, View, ViewStyle, StyleSheet, ActivityIndicator } from "react-native"
import { Image, ImageSource, ImageStyle } from "expo-image"

import { useAppTheme } from "@/theme/context"

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
  onError?: () => void
}

/**
 * Describe your component here
 */

const isRemote = (src: ImageSource | undefined): boolean => {
  if (!src) return false
  if (Array.isArray(src)) return true // array of URIs
  const t = typeof src
  if (t === "number") return false // require(...)
  if (t === "string") return true // URI
  // object with { uri }
  // @ts-ignore - runtime check
  return Boolean(src?.uri)
}
export const SmartImage = (props: SmartImageProps) => {
  const {
    style,
    fallBackImage = require("../../assets/images/fallback.png"),
    image = { uri: "https://example.com/avatar.jpg" },
    blurhash,
    imageStyle,
    onError,
  } = props
  const $styles = [$container, style]
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setError(false)
    setLoading(false)
  }, [image])

  const sourceToUse = useMemo(() => {
    return error || !image.uri ? fallBackImage : image
  }, [error, image, fallBackImage])

  const remote = useMemo(() => isRemote(sourceToUse), [sourceToUse])
  return (
    <View style={$styles}>
      <Image
        style={imageStyle}
        source={sourceToUse}
        placeholder={{ blurhash }} // 👈 local placeholder shown instantly
        contentFit="cover"
        transition={1000} // fade-in when loaded
        onLoadStart={() => {
          if (remote) setLoading(true)
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          onError?.()
          setError(true)
          setLoading(false)
        }}
      />
      {loading && remote && (
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
