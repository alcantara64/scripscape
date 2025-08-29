import { useEffect, useRef } from "react"
import { Animated, Easing, StyleProp, ViewStyle } from "react-native"

export interface SchimmerProps {
  /**
   * Wraps children with a subtle pulse animation.
   * Use it as the base for any skeleton block.
   */
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
  /**
   * How fast the pulse should be (ms). Default: 1200
   */
  duration?: number
}

export const Schimmer = ({ style, children, duration = 1200 }: SchimmerProps) => {
  const opacity = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [duration, opacity])

  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>
}
