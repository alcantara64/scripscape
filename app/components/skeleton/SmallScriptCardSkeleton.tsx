import { View, ViewStyle } from "react-native"

import { Skeleton } from "@/components/skeleton/Skeleton"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const SmallScriptCardSkeleton = () => {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()
  return (
    <View style={themed($card)}>
      <Skeleton h={88} w={"100%"} r={2} />
      <Skeleton h={16} w={"85%"} style={{ marginTop: spacing.sm }} />
      <View style={{ flexDirection: "row", gap: 8, marginTop: spacing.xs }}>
        <Skeleton h={18} w={90} r={999} />
        <Skeleton h={18} w={70} r={999} />
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginTop: spacing.xs }}>
        <Skeleton h={12} w={50} r={8} />
        <Skeleton h={12} w={50} r={8} />
        <Skeleton h={12} w={50} r={8} />
      </View>
    </View>
  )
}

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 180,
})
