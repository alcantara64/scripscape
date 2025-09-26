import { ScrollView, View, ViewStyle } from "react-native"

import { CommentItemSkeleton } from "@/components/skeleton/CommentItemSkeleton"
import { PartRowSkeleton } from "@/components/skeleton/PartRowSkeleton"
import { Skeleton } from "@/components/skeleton/Skeleton"
import { SkeletonCircle } from "@/components/skeleton/SkeletonCircle"
import { SmallScriptCardSkeleton } from "@/components/skeleton/SmallScriptCardSkeleton"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Screen } from "@/components/Screen"

export const ScriptOverviewSkeleton = () => {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()

  return (
    <Screen
      contentContainerStyle={themed($content)}
      preset="scroll"
      safeAreaEdges={["top"]}
      ScrollViewProps={{ showsVerticalScrollIndicator: false }}
    >
      <View style={$rowBetween}>
        <Skeleton h={22} w={120} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Skeleton h={28} w={28} r={999} />
          <Skeleton h={28} w={28} r={999} />
          <Skeleton h={28} w={28} r={999} />
        </View>
      </View>

      <View style={{ marginTop: spacing.md }}>
        <Skeleton h={170} r={16} />
        <View style={{ position: "absolute", top: spacing.sm, right: spacing.sm }}>
          <Skeleton h={22} w={90} r={999} />
        </View>
      </View>

      {/* Title + meta */}
      <Skeleton h={24} w={"80%"} style={{ marginTop: spacing.md }} />
      <View style={$row}>
        <SkeletonCircle h={18} w={18} />
        <Skeleton h={14} w={120} style={{ marginLeft: 8 }} />
        <Skeleton h={14} w={70} r={999} style={{ marginLeft: 10 }} />
      </View>

      {/* Description section */}
      <Skeleton h={16} w={100} style={{ marginTop: spacing.lg }} />
      <Skeleton h={14} w={"98%"} style={{ marginTop: 8 }} />
      <Skeleton h={14} w={"95%"} style={{ marginTop: 6 }} />
      <Skeleton h={14} w={"90%"} style={{ marginTop: 6 }} />

      {/* Stats row */}
      <View style={$row}>
        <Skeleton h={12} w={60} r={8} />
        <Skeleton h={12} w={60} r={8} style={{ marginLeft: 16 }} />
      </View>

      {/* CTA button */}
      <Skeleton h={48} r={14} style={{ marginTop: spacing.sm }} />

      {/* Writer's Notes card */}
      <View style={themed($card)}>
        <Skeleton h={16} w={120} />
        <Skeleton h={14} w={"97%"} style={{ marginTop: 8 }} />
        <Skeleton h={14} w={"80%"} style={{ marginTop: 6 }} />
        <Skeleton h={18} w={90} r={8} style={{ marginTop: spacing.sm }} />
      </View>

      {/* Comments header */}
      <View style={$rowBetween}>
        <View style={$row}>
          <Skeleton h={16} w={90} />
          <Skeleton h={18} w={40} r={999} style={{ marginLeft: 8 }} />
        </View>
        <Skeleton h={16} w={70} />
      </View>

      {/* Comment items */}
      <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
        <CommentItemSkeleton />
        <CommentItemSkeleton />
      </View>

      {/* Parts header */}
      <View style={themed($sectionHeader)}>
        <Skeleton h={18} w={60} />
        <Skeleton h={16} w={70} />
      </View>

      {/* Parts list */}
      {/* <View style={themed($partsCard)}>
        <PartRowSkeleton />
        <Skeleton h={1} w={"100%"} r={0} style={{ opacity: 0.3 }} />
        <PartRowSkeleton />
        <Skeleton h={1} w={"100%"} r={0} style={{ opacity: 0.3 }} />
        <PartRowSkeleton />
        <Skeleton h={1} w={"100%"} r={0} style={{ opacity: 0.3 }} />
        <PartRowSkeleton />
      </View> */}

      {/* You Might Also Like */}
      <Skeleton h={18} w={180} style={{ marginTop: spacing.lg }} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.sm }}
      >
        <SmallScriptCardSkeleton />
        <SmallScriptCardSkeleton />
        <SmallScriptCardSkeleton />
      </ScrollView>

      <View style={{ height: 90 }} />
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  paddingTop: 2,
  paddingBottom: spacing.xl,
})

const $row: ViewStyle = { flexDirection: "row", alignItems: "center", marginTop: 8 }

const $rowBetween: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 16,
  padding: spacing.sm,
  marginTop: spacing.md,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.lg,
})
