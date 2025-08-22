import { useState } from "react"
import { ActivityIndicator, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { ContentStyle } from "@shopify/flash-list"

import { Text } from "@/components/Text"
import { IFollowers } from "@/interface/follower"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { EmptyState } from "./EmptyState"
import { FollowerCard } from "./FollowerCard"
import { ListView } from "./ListView"
import { spacing } from "@/theme/spacing"

export interface FollowersListProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  data: Array<IFollowers>
  refresh: () => void
}

/**
 * Describe your component here
 */
export const FollowersList = (props: FollowersListProps) => {
  const { style, data, refresh } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const Separator = () => <View style={$separator} />

  return (
    <ListView<IFollowers>
      contentContainerStyle={themed([$container, $listContentContainer])}
      data={data}
      extraData={data.length}
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
      // ListHeaderComponent={
      //   <View style={themed($heading)}>
      //     <Text preset="heading" tx="demoPodcastListScreen:title" />
      //     {(favoritesOnly || episodesForList.length > 0) && (
      //       <View style={themed($toggle)}>
      //         <Switch
      //           value={favoritesOnly}
      //           onValueChange={() => toggleFavoritesOnly()}
      //           labelTx="demoPodcastListScreen:onlyFavorites"
      //           labelPosition="left"
      //           labelStyle={$labelStyle}
      //           accessibilityLabel={translate("demoPodcastListScreen:accessibility.switch")}
      //         />
      //       </View>
      //     )}
      //   </View>
      // }
      renderItem={({ item }) => (
        <FollowerCard
          picture={{ uri: item.avatar }}
          name={item.name}
          scripts={item.scripts}
          followers={item.followers}
          isPro={item.isPro}
        />
      )}
    />
  )
}

const $container: ViewStyle = {}

const $listContentContainer: ThemedStyle<ContentStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingBottom: spacing.lg,
})

const $separator: ViewStyle = {
  height: spacing.lg, // This is the gap
}
