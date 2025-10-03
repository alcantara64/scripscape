import { View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Skeleton } from "@/components/skeleton/Skeleton"
import { SkeletonCircle } from "@/components/skeleton/SkeletonCircle"
import { SkeletonRow } from "@/components/skeleton/SkeletonRow"
import { SkeletonTag } from "@/components/skeleton/SkeletonTag"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const EditOverViewScreenSkeleton = () => {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()

  return (
    <Screen safeAreaEdges={["top"]} contentContainerStyle={themed($content)}>
      <View>
        <Skeleton h={203} />
      </View>
      <Skeleton h={96} />
      <Skeleton h={180} />
      <View style={$rowBetween}>
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
      </View>
      <View style={$row}>
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
      </View>
      <View style={$row}>
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
      </View>
      <View style={$rowBetween}>
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
      </View>
      <View style={$row}>
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
      </View>
      <View style={$row}>
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
      </View>
      <View style={$rowBetween}>
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
      </View>
      <View style={$rowBetween}>
        <Skeleton w={70} h={20} />
        <Skeleton w={70} h={20} />
      </View>
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.sm,
  gap: 20,
})

const $row: ViewStyle = {
  flexDirection: "row",
  //   alignItems: "center",
  gap: 10,
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
