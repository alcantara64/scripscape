import { FC, useState } from "react"
import { Dimensions, ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Image } from "expo-image"
import { useNavigation } from "@react-navigation/native"

import { AnnouncementBox } from "@/components/AnnouncementBox"
import { AppCarousel } from "@/components/AppCarousel"
import { EmptyStateIllustration } from "@/components/EmptyStateCard"
import { Icon, PressableIcon } from "@/components/Icon"
import { ListView } from "@/components/ListView"
import { Screen } from "@/components/Screen"
import { ScriptCard } from "@/components/ScriptCard"
import { HomeScreenSkeleton } from "@/components/skeleton/screens/HomeScreenSkeleton"
import { Text } from "@/components/Text"
import Config from "@/config"
import { useAuth } from "@/context/AuthContext"
import { Category, IScript, ScriptStatus, WriterStatus } from "@/interface/script"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { drawerRef } from "@/navigators/Drawer"
import { useBanners } from "@/querries/banner"
import {
  useGetFeaturedScript,
  useGetMyCategories,
  useGetTodayTrendingScripts,
} from "@/querries/script"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"
import { DEFAULT_PROFILE_IMAGE } from "@/utils/app.default"

interface HomeScreenProps extends AppStackScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = () => {
  // Pull in navigation via hook
  const navigation = useNavigation()
  const { width } = Dimensions.get("window")
  const { data: banners, isLoading, error } = useBanners()
  const [selectedCategory, setSelectedCategory] = useState<Omit<Category, "id">>({
    name: "All",
    slug: "all",
  })

  const {
    data: trendingTodayData,
    isLoading: isLoadingTrendingToday,
    isError: istrendError,
  } = useGetTodayTrendingScripts(selectedCategory.slug)

  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    isError: isErrorLoadingCat,
  } = useGetMyCategories()
  const {
    data: featuredScriptData,
    isLoading: isLoadingFeatured,
    isError: isErrorFeatured,
  } = useGetFeaturedScript()

  const openDraw = () => {
    drawerRef.current?.openDrawer()
  }
  const Separator = () => <View style={$separator} />

  const { themed } = useAppTheme()
  const { username, profilePicture, profilePictureBlurhash } = useAuth()

  const gotoDetailScreen = (script_id: number) => {
    navigation.navigate("ScriptDetail", { script_id })
  }
  if (isLoading || isLoadingFeatured || isLoadingCategory) return <HomeScreenSkeleton />
  return (
    <Screen
      style={$root}
      preset="scroll"
      safeAreaEdges={["top"]}
      ScrollViewProps={{ stickyHeaderIndices: [0] }}
    >
      <View>
        <View style={$headerContainer}>
          <View style={$logoContainer}>
            <View style={$logoIcon}>
              <Icon icon="logo" size={28} color={colors.palette.neutral100} />
            </View>
            <Text text="Scripscape" style={themed($logoTextStyle)} />
          </View>
          <View style={$actionSection}>
            <PressableIcon
              onPress={() => {
                navigation.navigate("Search")
              }}
              icon="search"
              size={24}
              color={colors.palette.neutral100}
            />

            <TouchableOpacity onPress={openDraw}>
              <Image
                style={themed($profileSectionImage)}
                placeholder={{ blurhash: profilePictureBlurhash }}
                source={profilePicture ? { uri: profilePicture } : DEFAULT_PROFILE_IMAGE}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={$welcomeTextContainer}>
        {username && (
          <Text
            numberOfLines={1}
            text={`👋 Welcome back, ${username}!`}
            style={themed($welcomeTextStyle)}
          />
        )}
        {!username && <Text text={` Welcome to Scripscape`} style={themed($welcomeTextStyle)} />}
      </View>
      <View>
        {!error && banners && banners?.data?.length > 0 && (
          <AppCarousel
            data={banners?.data ?? []}
            height={331}
            width={width - 28}
            renderItem={({ index, item }) => (
              <AnnouncementBox
                imageSource={{
                  uri: `${Config.CMS_URL}${item?.Image?.formats?.large?.url ?? ""}`,
                }}
                title={item?.Title}
                description={item?.Description}
                link={item.Url}
              />
            )}
          />
        )}

        {(error || !banners?.data || banners?.data.length < 1) && (
          <EmptyStateIllustration width={width - 22} height={331} />
        )}
      </View>
      {featuredScriptData && (
        <View style={$sectionContainer}>
          <Text text="Featured" style={themed($sectionHeader)} />
          <ScriptCard
            script_id={featuredScriptData?.script_id}
            imageSource={{ uri: featuredScriptData?.cover_image_url }}
            title={featuredScriptData?.title}
            description={featuredScriptData?.summary}
            status={featuredScriptData?.status}
            commentsCount={featuredScriptData?.comments_count}
            viewsCount={featuredScriptData?.views_count}
            likedCount={featuredScriptData?.likes_count}
            numberOfParts={featuredScriptData?.parts_count}
            writerStatus={featuredScriptData?.writerStatus}
            onPress={() => gotoDetailScreen(featuredScriptData.script_id)}
          />
        </View>
      )}
      <View style={$sectionContainer}>
        <Text text="Trending Today" style={themed($sectionHeader)} />
        <View>
          <ListView
            data={[
              { name: "All", slug: "all" },
              ...(categoryData?.items ? categoryData?.items : []),
            ]}
            extraData={selectedCategory}
            estimatedItemSize={10}
            contentContainerStyle={$categoryContainer}
            horizontal
            ItemSeparatorComponent={Separator}
            keyExtractor={(item) => item.slug.toString()}
            renderItem={(category) => (
              <TouchableOpacity
                style={{
                  ...$itemContainer,
                  backgroundColor:
                    category.item.name === selectedCategory?.name
                      ? colors.buttonBackground
                      : undefined,
                }}
                onPress={() => {
                  setSelectedCategory(category.item)
                }}
              >
                <Text text={category.item.name} style={$itemText} />
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={$trendingContainers}>
          <ListView<IScript>
            data={trendingTodayData?.items}
            numColumns={2}
            extraData={trendingTodayData?.items}
            estimatedItemSize={180}
            keyExtractor={(it) => it.script_id.toString()}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingVertical: 6 }}
            renderItem={({ item }) => (
              <ScriptCard
                isVertical
                script_id={item.script_id}
                viewsCount={item.views_count}
                title={item.title}
                status={item.status}
                likedCount={item.likes_count}
                numberOfParts={item.parts_count}
                description={item.summary}
                imageSource={{ uri: item.cover_image_url }}
                commentsCount={item.comments_count}
                writerStatus={item.writerStatus}
                onPress={() => {
                  gotoDetailScreen(item.script_id)
                }}
              />
            )}
          />
        </View>
      </View>
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.md,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}
const $logoIcon: ImageStyle = {
  alignSelf: "baseline",
  height: spacing.xl,
}

const $logoContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}

const $logoTextStyle: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.text,
  fontFamily: typography.fonts.Montserrat.bold,
  fontSize: spacing.lg,
  height: spacing.lg,
})

const $actionSection: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}

const $welcomeTextContainer: ViewStyle = {
  marginTop: spacing.xl,
  marginBottom: spacing.md,
}
const $welcomeTextStyle: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: spacing.lg - 2,
  lineHeight: 22,
  fontWeight: 400,
})

const $sectionContainer: ViewStyle = {
  marginTop: spacing.md,
}

const $sectionHeader: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: spacing.lg,
  marginBottom: spacing.xs,
  fontWeight: "500",
  lineHeight: 33,
})
const $categoryContainer: ViewStyle = {}
const $separator: ViewStyle = {
  width: spacing.xs, // This is the gap
}
const $itemContainer: ViewStyle = {
  borderRadius: spacing.sm,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
}
const $itemText: TextStyle = {
  fontSize: spacing.md - 2,
  fontWeight: 500,
  padding: 8,
}

const $trendingContainers: ViewStyle = {
  marginTop: spacing.sm,
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  flexWrap: "wrap",
}

const $cardWrapper: ViewStyle = {
  flexBasis: "48%", // slightly less than 50% for spacing
  marginBottom: spacing.sm,
}
const $profileSectionImage: ThemedStyle<ImageStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderRadius: (spacing.xl + 4) / 2,
  height: spacing.xl + 4,
  width: spacing.xl + 4,
  borderColor: colors.profileBorder,
})
