import { View, ViewStyle } from "react-native"

import { Skeleton } from "@/components/skeleton/Skeleton"
import { useAppTheme } from "@/theme/context"

export const PartRowSkeleton = () => {
  const {
    theme: { spacing },
  } = useAppTheme()
  return (
    <View style={$row}>
      <View style={{ flex: 1 }}>
        <Skeleton h={16} w={"65%"} />
        <Skeleton h={12} w={"40%"} style={{ marginTop: 6 }} />
      </View>
      <Skeleton h={24} w={24} r={999} style={{ marginLeft: spacing.sm }} />
    </View>
  )
}

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 10,
}
