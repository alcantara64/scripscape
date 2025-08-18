import { StyleProp, View, ViewStyle } from "react-native"

export interface LineProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  color?: string
  thickness?: number
  vertical?: boolean
}

/**
 * Describe your component here
 */
export const Line = (props: LineProps) => {
  const { style, color = "#C5CEFA", vertical, thickness = 1 } = props
  const $styles = [style]

  return (
    <View
      style={[
        vertical ? $verTicalLine(thickness) : $horizontalLine(thickness), // horizontal line
        { backgroundColor: color },
        $styles, // allow extra styles if needed
      ]}
    />
  )
}

const $verTicalLine: (num: number) => ViewStyle = (thickness) => ({
  width: thickness,
  height: "100%",
})
const $horizontalLine: (num: number) => ViewStyle = (thickness) => ({
  height: thickness,
  width: "100%",
})
