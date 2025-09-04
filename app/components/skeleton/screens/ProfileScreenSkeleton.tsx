import { ScrollView, View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Skeleton } from "@/components/skeleton/Skeleton"
import { SkeletonCircle } from "@/components/skeleton/SkeletonCircle"
import { SkeletonRow } from "@/components/skeleton/SkeletonRow"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const ProfileScreenSkeleton = () => {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()

  return (
    <Screen contentContainerStyle={themed($content)} showsVerticalScrollIndicator={false}>
      {/* Cover / banner */}
      <Skeleton h={180} r={0} />

      {/* Header row: back + title + flag/edit (approximate spacing) */}
      <View style={[themed($overlayHeader), { marginTop: -36 }]}>
        <Skeleton w={110} h={22} r={8} />
        <Skeleton w={64} h={32} r={12} />
      </View>

      {/* Card header with avatar + name + pro chip */}
      <View style={[themed($card), { marginTop: spacing.md }]}>
        <View style={$avatarRow}>
          <SkeletonCircle h={76} w={76} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Skeleton w={"60%"} h={24} />
            <View style={$row}>
              <Skeleton h={22} w={70} r={999} style={{ marginTop: spacing.xs }} />
            </View>
          </View>
        </View>

        {/* Stats (Followers | Script) */}
        <View style={[$rowBetween, { marginTop: spacing.lg }]}>
          <View>
            <Skeleton w={90} h={16} />
            <Skeleton w={80} h={28} style={{ marginTop: spacing.xs }} />
          </View>
          <View>
            <Skeleton w={70} h={16} />
            <Skeleton w={60} h={28} style={{ marginTop: spacing.xs }} />
          </View>
        </View>

        {/* Bio heading + text + Read More */}
        <Skeleton w={60} h={20} style={{ marginTop: spacing.lg }} />
        <SkeletonRow
          lines={3}
          gap={8}
          widthPattern={(i) => (i === 2 ? "70%" : "100%")}
          style={{ marginTop: spacing.sm }}
        />
        <Skeleton w={100} h={18} r={8} style={{ marginTop: spacing.xs }} />

        {/* Edit Bio button */}
        <Skeleton h={48} r={14} style={{ marginTop: spacing.md }} />
      </View>

      {/* Divider */}
      <Skeleton h={1} w={"100%"} r={0} style={{ marginTop: spacing.lg }} />

      {/* Tabs: Script | Followers */}
      <View style={[themed($tabs), { marginTop: spacing.md }]}>
        <Skeleton h={44} w={"48%"} r={14} />
        <Skeleton h={44} w={"48%"} r={14} />
      </View>

      {/* Script list items */}
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[themed($listItem), { marginTop: spacing.md }]}>
          <Skeleton h={110} w={150} r={12} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Skeleton w={"85%"} h={20} />
            <View style={$row}>
              <Skeleton h={22} w={100} r={999} style={{ marginTop: 8 }} />
              <Skeleton h={22} w={78} r={999} style={{ marginTop: 8, marginLeft: 8 }} />
            </View>
            <SkeletonRow
              lines={2}
              gap={6}
              widthPattern={(j) => (j === 0 ? "95%" : "70%")}
              style={{ marginTop: 8 }}
            />
            <View style={$statsRow}>
              <Skeleton w={60} h={12} r={8} />
              <Skeleton w={60} h={12} r={8} />
              <Skeleton w={60} h={12} r={8} />
            </View>
          </View>
        </View>
      ))}

      <View style={{ height: 90 }} />
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.lg,
})

const $overlayHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.sm,
  borderRadius: 16,
  padding: spacing.lg,
})

const $avatarRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $rowBetween: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
}

const $tabs: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: spacing.lg,
})

const $listItem: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  marginHorizontal: spacing.lg,
  padding: spacing.md,
  borderRadius: 16,
})

const $statsRow: ViewStyle = {
  flexDirection: "row",
  gap: 12,
  marginTop: 8,
}
