import { FC } from "react"
import { ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

import { AnnouncementBox } from "@/components/AnnouncementBox"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"
// import { useNavigation } from "@react-navigation/native"
const BannerPlaceHolder = require("../../assets/images/cover.png")

interface HomeScreenProps extends AppStackScreenProps<"Home"> {
  onOpenDraw?: (x: boolean) => void
}

export const HomeScreen: FC<HomeScreenProps> = ({ onOpenDraw }) => {
  // Pull in navigation via hook
  // const navigation = useNavigation()

  const openDraw = () => {
    if (onOpenDraw) {
      onOpenDraw(true)
    }
  }

  const { themed } = useAppTheme()
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
      <View style={$headerContainer}>
        <View style={$logoContainer}>
          <View style={$logoIcon}>
            <Icon icon="logo" size={28} color={colors.palette.neutral100} />
          </View>
          <Text text="Scripscape" style={themed($logoTextStyle)} />
        </View>
        <View style={$actionSection}>
          <View>
            <Icon icon="search" size={24} color={colors.palette.neutral100} />
          </View>
          <TouchableOpacity onPress={openDraw}>
            <Icon icon="profileAvatar" size={spacing.xl} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={$welcomeTextContainer}>
        <Text text="👋 Welcome back, MollyMoonbeam!" style={themed($welcomeTextStyle)} />
      </View>
      <View>
        <AnnouncementBox
          imageSource={BannerPlaceHolder}
          title="Stories Worth Discovering"
          description="We’ve been on the lookout for hidden gems — scripts that haven’t gotten many views (yet).
          Here are a few we ..."
        />
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
})
