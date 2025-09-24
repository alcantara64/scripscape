import { View, ViewStyle } from "react-native"

import { Skeleton } from "@/components/skeleton/Skeleton"
import { useAppTheme } from "@/theme/context"

export interface ScriptRowSkeletonProps {
  /**
   * Give rows different widths to feel more natural (0–1 multiplier)
   */
  titleRatio?: number
  /**
   * Show an extra right-side chip (e.g., Draft) like in the 3rd item
   */
  withRightChip?: boolean
}

export const ScriptRowSkeleton = ({ titleRatio = 1, withRightChip }: ScriptRowSkeletonProps) => {
  const {
    theme: { spacing },
  } = useAppTheme()

  return (
    <View style={$row}>
      {/* Thumbnail */}
      <Skeleton h={114} w={164} r={12} />

      {/* Body */}
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        {/* Title & optional right chip */}
        <View style={$rowBetween}>
          <Skeleton h={18} w={`${Math.min(85 * titleRatio, 85)}%`} />
          {withRightChip && <Skeleton h={22} w={64} r={999} />}
        </View>

        {/* Status + parts chips */}
        <View style={[$row, { marginTop: 8 }]}>
          <Skeleton h={20} w={96} r={999} />
          <Skeleton h={20} w={86} r={999} style={{ marginLeft: 8 }} />
        </View>

        {/* Description lines */}
        <View style={{ marginTop: 8 }}>
          <Skeleton h={14} w={"95%"} r={8} />
          <Skeleton h={14} w={"70%"} r={8} style={{ marginTop: 6 }} />
        </View>

        {/* Stats row */}
        <View style={[$row, { marginTop: 10 }]}>
          <Skeleton h={12} w={64} r={8} />
          <Skeleton h={12} w={64} r={8} style={{ marginLeft: 12 }} />
          <Skeleton h={12} w={64} r={8} style={{ marginLeft: 12 }} />
        </View>
      </View>
    </View>
  )
}

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
}

const $rowBetween: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}
