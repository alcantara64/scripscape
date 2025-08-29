import { View, ViewStyle, StyleProp } from "react-native"

import { Skeleton } from "./Skeleton"

export interface SkeletonRowProps {
  lines?: number
  gap?: number
  widthPattern?: (i: number) => number | string
  style?: StyleProp<ViewStyle>
}

export const SkeletonRow = ({ lines = 2, gap = 8, widthPattern, style }: SkeletonRowProps) => {
  const arr = Array.from({ length: lines })
  return (
    <View style={[{ gap }, style]}>
      {arr.map((_, i) => (
        <Skeleton key={i} w={widthPattern ? widthPattern(i) : "100%"} />
      ))}
    </View>
  )
}
