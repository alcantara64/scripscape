import { Pressable, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Text } from "@/components/Text"
import { useEffect, useMemo, useRef } from "react"
import { AnimatedCircularProgress } from "react-native-circular-progress"

export interface ProgressRingProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  value: number // current amount
  total: number // max/goal
  size?: number // diameter
  width?: number // ring thickness
  tintColor?: string // progress color
  backgroundColor?: string // remainder color
  duration?: number // ms animation
  showLabel?: boolean // center label
  lineCap?: "butt" | "round"
  onPress?: () => void
}

/**
 * Describe your component here
 */
export const ProgressRing = (props: ProgressRingProps) => {
  const {
    style,
    total,
    value,
    size = 50,
    width = 6,
    tintColor = "#00E887",
    backgroundColor = "#C9C4FF",
    duration = 800,
    showLabel,
    lineCap = "butt",
    onPress,
  } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  const ref = useRef<any>(null)

  const percent = useMemo(() => {
    if (!isFinite(total) || total <= 0) return 0
    const p = (value / total) * 100
    return Math.max(0, Math.min(100, p))
  }, [value, total])

  useEffect(() => {
    // animate to the new percent whenever value/total changes
    ref.current?.animate(percent, duration)
  }, [percent, duration])

  return (
    <Pressable style={$styles} onPress={onPress}>
      <AnimatedCircularProgress
        ref={ref}
        size={size}
        width={width}
        fill={0} // start from 0; we animate to `percent`
        tintColor={tintColor}
        backgroundColor={backgroundColor}
        lineCap={lineCap}
        rotation={0} // start at 12 o’clock
        arcSweepAngle={360}
      >
        {showLabel
          ? () => <Text style={{ fontWeight: "700" }}>{Math.round(percent)}%</Text>
          : undefined}
      </AnimatedCircularProgress>
    </Pressable>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
}

const $text: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.palette.primary500,
})
