import { View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Skeleton } from "@/components/skeleton/Skeleton"
import { SkeletonCircle } from "@/components/skeleton/SkeletonCircle"
import { SkeletonRow } from "@/components/skeleton/SkeletonRow"
import { SkeletonTag } from "@/components/skeleton/SkeletonTag"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const HomeScreenSkeleton = () => {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()

  return (
    <Screen safeAreaEdges={["top"]} contentContainerStyle={themed($content)}>
      {/* Top Bar */}
      <View style={$rowBetween}>
        <View style={$row}>
          <SkeletonCircle />
          <Skeleton w={120} h={16} style={{ marginLeft: spacing.sm }} />
        </View>
        <View style={$row}>
          <SkeletonCircle style={{ marginLeft: spacing.sm }} />
        </View>
      </View>

      {/* Welcome Text */}
      <Skeleton w={"70%"} h={28} style={{ marginTop: spacing.lg }} />

      {/* Big Carousel Card */}
      <View style={[themed($card), { marginTop: spacing.md }]}>
        <Skeleton h={200} r={16} />
        <View style={{ marginTop: spacing.md }}>
          <SkeletonRow lines={2} gap={10} widthPattern={(i) => (i === 0 ? "90%" : "70%")} />
          <SkeletonRow
            lines={2}
            gap={8}
            widthPattern={(i) => (i === 0 ? "95%" : "85%")}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </View>

      {/* "Featured" heading */}
      <Skeleton w={140} h={22} style={{ marginTop: spacing.xl }} />

      {/* Featured row (thumb + text + stats) */}
      <View style={[themed($featuredRow), { marginTop: spacing.md }]}>
        <Skeleton h={98} w={164} r={12} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Skeleton w={"100%"} h={20} />
          <View style={$pillRow}>
            <SkeletonTag width={90} />
            <SkeletonTag width={64} />
          </View>
          <SkeletonRow lines={2} gap={6} widthPattern={(i) => (i === 0 ? "95%" : "75%")} />
        </View>
      </View>

      {/* "Trending Today" heading */}
      <Skeleton w={200} h={22} style={{ marginTop: spacing.xl }} />

      {/* Category chips */}
      <View style={$chipRow}>
        {["All", "Action", "Adventure", "Comedy", "Drama"].map((_, i) => (
          <Skeleton key={i} h={22} w={60} r={999} />
        ))}
      </View>

      {/* Trending grid cards */}
      <View style={$grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={themed($gridCard)}>
            <Skeleton h={120} r={12} />
            <Skeleton w={"80%"} h={18} style={{ marginTop: spacing.sm }} />
            <Skeleton w={"60%"} h={14} style={{ marginTop: spacing.xs }} />
          </View>
        ))}
      </View>

      {/* Bottom tab bar spacer */}
      <View style={{ height: 90 }} />
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.sm,
})

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $rowBetween: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 16,
})

const $featuredRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 16,
  flexDirection: "row",
  alignItems: "flex-start",
})

const $pillRow: ViewStyle = {
  flexDirection: "row",
  gap: 8,
  marginTop: 8,
  marginBottom: 8,
}

const $chipRow: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 12,
}

const $grid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginTop: 16,
  rowGap: 16,
}

const $gridCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "48%",
  // backgroundColor: colors.palette.neutral800,
  borderRadius: 16,
  padding: spacing.md,
})
