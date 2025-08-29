import { ViewStyle, StyleProp } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Schimmer } from "./Schimmer"

export interface SkeletonProps {
  style?: StyleProp<ViewStyle>
  /**
   * Height of the block – default 16
   */
  h?: number
  /**
   * Width – number (px) or '100%' etc – default '100%'
   */
  w?: number | string
  /**
   * Border radius – default 12
   */
  r?: number
}

export const Skeleton = ({ style, h = 16, w = "100%", r = 12 }: SkeletonProps) => {
  const { themed } = useAppTheme()
  return <Schimmer style={[themed($base), { height: h, width: w, borderRadius: r }, style]} />
}

const $base: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: "#8b8888ff", // muted surface
})
