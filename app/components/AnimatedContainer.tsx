import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Text } from "@/components/Text"
import Animated, { FadeInDown, FadeOutDown, Layout } from "react-native-reanimated"

export interface AnimatedContainerProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

/**
 * Describe your component here
 */
export const AnimatedContainer = (props: AnimatedContainerProps) => {
  const { style, children } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  return (
    <Animated.View
      layout={Layout.springify().damping(18).stiffness(180)}
      entering={FadeInDown.duration(380)}
      exiting={FadeOutDown.duration(220)}
      style={$styles}
    >
      {children}
    </Animated.View>
  )
}

export function StaggerItem({ index, children }: { index: number; children: React.ReactNode }) {
  const delay = 80 * index
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(420)}
      exiting={FadeOutDown.duration(180)}
    >
      {children}
    </Animated.View>
  )
}

const $container: ViewStyle = {}
