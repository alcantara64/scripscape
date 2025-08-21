import { JSX, useRef, useState } from "react"
import { TextStyle, View, ViewStyle, ImageStyle, TouchableOpacity } from "react-native"
import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps, useNavigation } from "@react-navigation/native"
import { ContentStyle } from "@shopify/flash-list"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { translate } from "@/i18n/translate"
import { ActivityScreen } from "@/screens/ActivityScreen"
import { AddScriptScreen } from "@/screens/AddScriptScreen"
import { DemoCommunityScreen } from "@/screens/DemoCommunityScreen"
import { DemoDebugScreen } from "@/screens/DemoDebugScreen"
import { DemoPodcastListScreen } from "@/screens/DemoPodcastListScreen"
import { HomeScreen } from "@/screens/HomeScreen"
import { MyScriptsScreen, MyscriptsScreen } from "@/screens/MyscriptsScreen"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"
import { DrawerNavigation } from "./DrawerNavigation"
import { ReactComponent as MyIcon } from "../../assets/icons/create-script.svg"
import { PlusIcon } from "@/components/PlusIcon"

export type DemoTabParamList = {
  MyScripts: undefined
  DemoShowroom: { queryIndex?: string; itemIndex?: string }
  Activity: undefined
  AddScript: undefined
  Home: undefined
  Settings: undefined
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
  const drawerRef = useRef(null)

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <DrawerNavigation ref={drawerRef}>
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
        >
          {(props) => <HomeScreen {...props} />}
        </Tab.Screen>

        <Tab.Screen
          name="MyScripts"
          component={MyScriptsScreen}
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
            tabBarIcon: () => <PlusIcon />,
          }}
        />

        <Tab.Screen
          name="Activity"
          component={ActivityScreen}
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
          name="Settings"
          component={SettingsScreen}
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
    </DrawerNavigation>
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
  fontSize: 10,
  fontFamily: typography.primary.normal,
  lineHeight: 16,
  fontWeight: 700,
  color: colors.palette.neutral500,
})

const $addScriptTabLabel: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md + 6,
})

const $addScriptBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  lineHeight: 18,
  color: colors.text,
})
