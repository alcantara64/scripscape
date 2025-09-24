import { View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { ScriptRowSkeleton } from "@/components/skeleton/ScriptRowSkeleton"
import { Skeleton } from "@/components/skeleton/Skeleton"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export const MyScriptsSkeleton = () => {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()

  return (
    <Screen safeAreaEdges={["top"]} contentContainerStyle={themed($content)}>
      {/* List */}
      <View style={{ marginTop: spacing.md, gap: spacing.md }}>
        <ScriptRowSkeleton titleRatio={0.9} />
        <ScriptRowSkeleton titleRatio={0.75} />
        <ScriptRowSkeleton titleRatio={0.85} withRightChip />
        <ScriptRowSkeleton titleRatio={0.8} />
        <ScriptRowSkeleton titleRatio={0.6} />
        <ScriptRowSkeleton titleRatio={0.6} />
      </View>
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.lg,
})
