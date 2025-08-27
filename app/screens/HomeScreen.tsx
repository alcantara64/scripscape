import { FC, useState } from "react"
import {
  Dimensions,
  ImageStyle,
  Pressable,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

import { AnnouncementBox } from "@/components/AnnouncementBox"
import { AppCarousel } from "@/components/AppCarousel"
import { AutoImage } from "@/components/AutoImage"
import { Icon } from "@/components/Icon"
import { ListView } from "@/components/ListView"
import { Loader } from "@/components/Loader"
import { Screen } from "@/components/Screen"
import { ScriptCard } from "@/components/ScriptCard"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import { ScriptStatus } from "@/interface/script"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { drawerRef } from "@/navigators/Drawer"
import { useBanners } from "@/querries/banner"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"
import { DEFAULT_PROFILE_IMAGE } from "@/utils/app.default"

// import { useNavigation } from "@react-navigation/native"
const BannerPlaceHolder = require("../../assets/images/cover.png")

interface HomeScreenProps extends AppStackScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = () => {
  // Pull in navigation via hook
  // const navigation = useNavigation()
  const { width } = Dimensions.get("window")
  const { data: banners, isLoading, error } = useBanners()
  const CATEGORIES = ["All", "Action", "Adventure", "Comedy", "Drama", "Drama"]
  const [selectedCategory, setSelectedCategory] = useState("All")

  const openDraw = () => {
    drawerRef.current?.openDrawer()
  }
  const Separator = () => <View style={$separator} />

  const { themed } = useAppTheme()
  const { requireAuth } = useAuth()

  const onLike = async () => {
    console.log("pressed")
    await requireAuth() // pops the sheet if not logged in
    // proceed with the protected action...
  }
  if (isLoading) {
    return (
      <Loader
        message="Fetching your scripts…"
        // Optional: use a remote Lottie URL instead of local file
        // source={{ uri: "https://assets9.lottiefiles.com/packages/lf20_q5pk6p1k.json" }}
        loop
        autoPlay
        speed={1}
        size={180}
        backgroundColor="#240E56"
      />
    )
  }
  return (
    <Screen
      style={$root}
      preset="scroll"
      safeAreaEdges={["top"]}
      ScrollViewProps={{ stickyHeaderIndices: [0] }}
    >
      <View>
        <View style={$headerContainer}>
          <TouchableOpacity
            style={$logoContainer}
            onPress={() => {
              onLike()
            }}
          >
            <View style={$logoIcon}>
              <Icon icon="logo" size={28} color={colors.palette.neutral100} />
            </View>
            <Text text="Scripscape" style={themed($logoTextStyle)} />
          </TouchableOpacity>
          <View style={$actionSection}>
            <View>
              <Icon icon="search" size={24} color={colors.palette.neutral100} />
            </View>
            <TouchableOpacity onPress={openDraw}>
              <AutoImage
                style={themed($profileSectionImage)}
                source={DEFAULT_PROFILE_IMAGE}
                maxWidth={36}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={$welcomeTextContainer}>
        <Text text="👋 Welcome back, MollyMoonbeam!" style={themed($welcomeTextStyle)} />
      </View>
      <View>
        <AppCarousel
          data={banners?.data || []}
          height={331}
          width={width - 28}
          renderItem={({ index, item }) => (
            <AnnouncementBox
              imageSource={{
                uri: `https://cms.scripscape.com${item.Image?.formats.large.url}`,
              }}
              // imageSource={BannerPlaceHolder}
              title={item.Title}
              description={item.Description}
            />
          )}
        />
      </View>
      <View style={$sectionContainer}>
        <Text text="Featured" style={themed($sectionHeader)} />
        <ScriptCard
          imageSource={require("../../assets/images/demo/script-image.png")}
          title="Love Knows No Boundaries"
          description="They came from different worlds—different languages, cultures, ..."
          status={ScriptStatus.completed}
          commentsCount={2400}
          viewsCount={1500000}
          likedCount={55800}
          numberOfParts={25}
        />
      </View>
      <View style={$sectionContainer}>
        <Text text="Trending Today" style={themed($sectionHeader)} />
        <View>
          <ListView
            data={CATEGORIES}
            estimatedItemSize={CATEGORIES.length}
            contentContainerStyle={$categoryContainer}
            horizontal
            ItemSeparatorComponent={Separator}
            keyExtractor={(item) => item}
            renderItem={(category) => (
              <TouchableOpacity
                style={{
                  ...$itemContainer,
                  backgroundColor:
                    category.item === selectedCategory ? colors.buttonBackground : undefined,
                }}
                onPress={() => {
                  setSelectedCategory(category.item)
                }}
              >
                <Text text={category.item} style={$itemText} />
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={$trendingContainers}>
          <View style={$cardWrapper}>
            <ScriptCard
              imageSource={require("../../assets/images/demo/script-image.png")}
              title="Love Knows No Boundaries"
              description="They came from different worlds—different languages, cultures, ..."
              status={ScriptStatus.completed}
              commentsCount={2400}
              viewsCount={1500000}
              likedCount={55800}
              numberOfParts={25}
              isVertical
            />
          </View>
          <View style={$cardWrapper}>
            <ScriptCard
              imageSource={{ uri: "https://reactjs.org/logo-ogs.png" }}
              // imageSource={require("../../assets/images/demo/script-image.png")}
              title="Love Knows No Boundaries"
              description="They came from different worlds—different languages, cultures, ..."
              status={ScriptStatus.inprogress}
              commentsCount={2400}
              viewsCount={1500000}
              likedCount={55800}
              numberOfParts={25}
              isVertical
            />
          </View>
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
