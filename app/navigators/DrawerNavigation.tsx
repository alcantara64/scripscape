import { JSX, useImperativeHandle, useState } from "react"
import { View, Image, ViewStyle, TextStyle, TouchableOpacity, ImageStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Drawer } from "react-native-drawer-layout"

import { Icon } from "@/components/Icon"
import { ProfileCard } from "@/components/ProfileCard"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import { AppStackParamList } from "./AppNavigator"
import { drawerRef } from "./Drawer"
import { DEFAULT_IMAGE } from "@/utils/app.default"

interface NavBarListItem {
  title: string
  icon: JSX.Element
  screen: keyof AppStackParamList
  authenticated: boolean
}

export const DrawerNavigation = (props) => {
  const $drawerInsets = useSafeAreaInsetsStyle(["top"])
  const [open, setOpen] = useState(false)
  const navigation = useNavigation()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const NAV_ITEMS: Array<NavBarListItem> = [
    {
      title: "Sign In or Register",
      icon: <Icon icon="logout" size={24} />,
      screen: "Login",
      authenticated: false,
    },
    {
      title: "Help",
      icon: <Icon icon="help" size={24} />,
      screen: "Login",
      authenticated: false,
    },
    {
      title: "My Profile",
      icon: <Icon icon="person" size={24} />,
      screen: "Profile",
      authenticated: true,
    },
    {
      title: "Settings",
      icon: <Icon icon="settings" size={24} />,
      screen: "Profile",
      authenticated: true,
    },
  ]

  useImperativeHandle(drawerRef, () => ({
    openDrawer: () => setOpen(true),
    closeDrawer: () => setOpen(false),
  }))

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      drawerType="front"
      drawerPosition={"right"}
      drawerStyle={{ backgroundColor: colors.transparent }}
      renderDrawerContent={() => (
        <View style={themed([$drawer, $drawerInsets])}>
          <ProfileCard
            isPro
            picture={DEFAULT_IMAGE}
            name="W_Matterhorn"
            email="W.Matterhorn@gmail.com"
          />
          <View style={$verticalLine} />

          {NAV_ITEMS.map((item) => (
            <TouchableOpacity
              onPress={() => navigation.navigate(item.screen)}
              key={item.title}
              style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 24 }}
            >
              <View>{item.icon}</View>
              <Text text={item.title} />
            </TouchableOpacity>
          ))}
          <View></View>

          <View style={$footer}>
            <TouchableOpacity style={$logoutBtn}>
              <Text style={$logoutText}>Log Out</Text>
            </TouchableOpacity>
            <Text style={$version}>Version 1.0.0.1</Text>
          </View>
        </View>
      )}
    >
      {props.children}
    </Drawer>
  )
}
const $drawer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  flex: 1,
  marginTop: spacing.xxxl,
  padding: spacing.lg,
})

const $verticalLine: ViewStyle = {
  borderBottomWidth: 1,
  borderColor: "#C5CEFA",
}

const $footer: ViewStyle = { marginTop: "auto" }
const $logoutBtn: ViewStyle = {
  borderWidth: 1,
  borderColor: "#fff",
  borderRadius: 12,
  paddingHorizontal: 36,
  paddingVertical: 8,
  marginBottom: 8,
}
const $logoutText: TextStyle = { color: "#fff", fontSize: 14, alignSelf: "center" }
const $version: TextStyle = { color: "#999", fontSize: 10, alignSelf: "center" }
