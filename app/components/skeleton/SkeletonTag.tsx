import { View, ViewStyle } from "react-native"

import { Skeleton } from "./Skeleton"

export interface SkeletonTagProps {
  width?: number
}

export const SkeletonTag = ({ width = 72 }: SkeletonTagProps) => (
  <View style={$tag}>
    <Skeleton h={16} w={width} r={999} />
  </View>
)

const $tag: ViewStyle = { paddingVertical: 4 }
