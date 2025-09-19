import { useState } from "react"
import { ActivityIndicator, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { ContentStyle } from "@shopify/flash-list"

import { Text } from "@/components/Text"
import { IScript } from "@/interface/script"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"

import { ListView } from "./ListView"
import { ScriptCard } from "./ScriptCard"

export interface ScriptListProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  data: Array<IScript>
  refresh?: () => void
}

/**
 * Describe your component here
 */
export const ScriptList = (props: ScriptListProps) => {
  const { style, data, refresh } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const Separator = () => <View style={$separator} />

  return (
    <ListView<IScript>
      contentContainerStyle={themed([$container, $listContentContainer])}
      data={data}
      extraData={data}
      refreshing={refreshing}
      estimatedItemSize={177}
      ItemSeparatorComponent={Separator}
      onRefresh={refresh}
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator />
        ) : (
          <></>
          // <EmptyState
          //   preset="generic"
          //   style={themed($emptyState)}
          //   headingTx={
          //     favoritesOnly ? "demoPodcastListScreen:noFavoritesEmptyState.heading" : undefined
          //   }
          //   contentTx={
          //     favoritesOnly ? "demoPodcastListScreen:noFavoritesEmptyState.content" : undefined
          //   }
          //   button={favoritesOnly ? "" : undefined}
          //   buttonOnPress={manualRefresh}
          //   imageStyle={$emptyStateImage}
          //   ImageProps={{ resizeMode: "contain" }}
          // />
        )
      }
      renderItem={({ item }) => (
        <ScriptCard
          imageSource={{ uri: item.image }}
          title={item.title}
          status={item.status}
          numberOfParts={item.partsCount}
          viewsCount={item.views}
          likedCount={item.likes}
          commentsCount={item.comments}
          description={item.summary}
        />
      )}
    />
  )
}

const $container: ViewStyle = {}

const $listContentContainer: ThemedStyle<ContentStyle> = ({ spacing }) => ({
  // paddingHorizontal: spacing.sm,
  paddingBottom: spacing.lg,
})

const $separator: ViewStyle = {
  height: spacing.lg, // This is the gap
}
