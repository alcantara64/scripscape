import { TextStyle, View, ViewStyle } from "react-native"
import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { EpisodeProvider } from "@/context/EpisodeContext"
import { translate } from "@/i18n/translate"
import { AddScriptScreen } from "@/screens/AddScriptScreen"
import { DemoCommunityScreen } from "@/screens/DemoCommunityScreen"
import { DemoDebugScreen } from "@/screens/DemoDebugScreen"
import { DemoPodcastListScreen } from "@/screens/DemoPodcastListScreen"
import { DemoShowroomScreen } from "@/screens/DemoShowroomScreen/DemoShowroomScreen"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"
import { HomeScreen } from "@/screens/HomeScreen"
import { ContentStyle } from "@shopify/flash-list"
import { useState } from "react"
import { Drawer } from "react-native-drawer-layout"
import { ListView } from "@/components/ListView"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

export type DemoTabParamList = {
  DemoCommunity: undefined
  DemoShowroom: { queryIndex?: string; itemIndex?: string }
  DemoDebug: undefined
  DemoPodcastList: undefined
  Home: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type DemoTabScreenProps<T extends keyof DemoTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<DemoTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createBottomTabNavigator<DemoTabParamList>()

/**
 * This is the main navigator for the demo screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `DemoNavigator`.
 */
export function DemoNavigator() {
  const { bottom } = useSafeAreaInsets()
  const $drawerInsets = useSafeAreaInsetsStyle(["top"])
  const [open, setOpen] = useState(false)
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  interface NavBarListItem {
    name: string
    handlePress?: (sectionIndex: number, itemIndex?: number) => void
  }

  return (
    <EpisodeProvider>
      <Drawer
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        drawerType="front"
        drawerPosition={"right"}
        drawerStyle={{ backgroundColor: colors.transparent }}
        renderDrawerContent={() => (
          <View style={themed([$drawer, $drawerInsets])}>
            <ListView<NavBarListItem>
              contentContainerStyle={themed($listContentContainer)}
              estimatedItemSize={250}
              data={[]}
              keyExtractor={(item) => item.name}
              renderItem={({ item, index: sectionIndex }) => <View />}
            />
          </View>
        )}
      >
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarHideOnKeyboard: true,
            tabBarStyle: themed([$tabBar, { height: bottom + 60 }]),
            tabBarActiveTintColor: colors.palette.neutral100,
            tabBarInactiveTintColor: colors.tintInactive,
            tabBarLabelStyle: themed($tabBarLabel),
            tabBarItemStyle: themed($tabBarItem),
          }}
        >
          <Tab.Screen
            name="Home"
            component={(rest) => <HomeScreen onOpenDraw={setOpen} {...rest} />}
            options={{
              tabBarLabel: translate("bottomTab:home"),
              tabBarIcon: ({ focused }) => (
                <Icon
                  icon="home"
                  color={focused ? colors.palette.neutral100 : colors.tintInactive}
                  size={24}
                />
              ),
            }}
          />

          <Tab.Screen
            name="DemoCommunity"
            component={DemoCommunityScreen}
            options={{
              tabBarLabel: translate("bottomTab:myScript"),
              tabBarIcon: ({ focused }) => (
                <Icon
                  icon="book"
                  color={focused ? colors.palette.neutral100 : colors.tintInactive}
                  size={24}
                />
              ),
            }}
          />
          <Tab.Screen
            name="AddScript"
            component={AddScriptScreen}
            options={{
              tabBarItemStyle: themed($addScriptTabLabel),
              tabBarLabelStyle: themed($addScriptBarLabel),
              tabBarLabel: () => null,
              tabBarIcon: () => (
                <Icon icon="addScript" color={colors.palette.accent500} size={56} />
              ),
            }}
          />

          <Tab.Screen
            name="DemoPodcastList"
            component={DemoPodcastListScreen}
            options={{
              tabBarAccessibilityLabel: translate("bottomTab:activity"),
              tabBarLabel: translate("bottomTab:activity"),
              tabBarIcon: ({ focused }) => (
                <Icon
                  icon="userGroup"
                  color={focused ? colors.palette.neutral100 : colors.tintInactive}
                  size={24}
                />
              ),
            }}
          />

          <Tab.Screen
            name="DemoDebug"
            component={DemoDebugScreen}
            options={{
              tabBarLabel: translate("bottomTab:setting"),
              tabBarIcon: ({ focused }) => (
                <Icon
                  icon="appSetting"
                  color={focused ? colors.palette.neutral100 : colors.tintInactive}
                  size={24}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </Drawer>
    </EpisodeProvider>
  )
}

const $tabBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopColor: colors.border,
})

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
  alignItems: "center",
})

const $tabBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  color: colors.palette.neutral500,
})

const $addScriptTabLabel: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $addScriptBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  lineHeight: 18,
  color: colors.text,
})
const $drawer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  flex: 1,
  marginTop: spacing.xxxl,
})

const $listContentContainer: ThemedStyle<ContentStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
})
