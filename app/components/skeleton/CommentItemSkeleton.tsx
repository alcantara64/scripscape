import { View, ViewStyle } from "react-native"

import { Skeleton } from "@/components/skeleton/Skeleton"
import { SkeletonCircle } from "@/components/skeleton/SkeletonCircle"
import { useAppTheme } from "@/theme/context"

export const CommentItemSkeleton = () => {
  const {
    theme: { spacing },
  } = useAppTheme()
  return (
    <View style={$row}>
      <SkeletonCircle h={36} w={36} />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Skeleton h={14} w={"40%"} />
        <Skeleton h={14} w={"95%"} style={{ marginTop: 6 }} />
        <Skeleton h={14} w={"70%"} style={{ marginTop: 6 }} />
        <View style={$pillRow}>
          <Skeleton h={12} w={44} r={999} />
          <Skeleton h={12} w={60} r={999} />
        </View>
      </View>
    </View>
  )
}

const $row: ViewStyle = { flexDirection: "row", alignItems: "flex-start" }
const $pillRow: ViewStyle = { flexDirection: "row", gap: 10, marginTop: 8 }
