import { memo } from "react"
import {
  View,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
  AccessibilityRole,
} from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

export type TabItem = {
  key: string
  label: string
  // optional: add badge counts, icons, etc. later
}

type TabsProps = {
  items: TabItem[]
  value: string // controlled: active tab key
  onChange: (key: string) => void
  containerStyle?: StyleProp<ViewStyle>
  tabStyle?: StyleProp<ViewStyle>
  tabTextStyle?: StyleProp<TextStyle>
  activeTabStyle?: StyleProp<ViewStyle>
  activeTabTextStyle?: StyleProp<TextStyle>
  // layout
  gap?: number
  fullWidth?: boolean // each tab flexes equally
  accessibilityRole?: AccessibilityRole
}

export const Tabs = memo(function Tabs({
  items,
  value,
  onChange,
  containerStyle,
  tabStyle,
  tabTextStyle,
  activeTabStyle,
  activeTabTextStyle,
  gap = 8,
  fullWidth = true,
  accessibilityRole = "tablist",
}: TabsProps) {
  const { themed } = useAppTheme()
  return (
    <View style={[themed($container), containerStyle]} accessibilityRole={accessibilityRole}>
      {items.map((item) => {
        const isActive = item.key === value
        return (
          <TouchableOpacity
            key={item.key}
            style={[
              $tabBase,
              fullWidth && { flex: 1 },
              tabStyle,
              isActive && [$tabActiveBase, activeTabStyle],
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(item.key)}
          >
            <Text
              style={[
                themed($tabTextBase),
                tabTextStyle,
                isActive && [themed($tabTextActiveBase), activeTabTextStyle],
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
})

/** --- Defaults you can tweak or override via props --- */
const $tabBase: ViewStyle = {
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
}

const $tabActiveBase: ViewStyle = {}

const $tabTextBase: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  padding: 4,
  textAlign: "center",
  fontSize: 14,
  fontWeight: 500,
})

const $tabTextActiveBase: ThemedStyle<TextStyle> = ({ colors }) => ({
  // flex: 1,
  width: "100%",
  padding: 4,
  borderRadius: 8,
  backgroundColor: colors.buttonBackground,
})
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }, gap = 8) => ({
  flexDirection: "row",
  alignItems: "center",
  columnGap: gap,
  backgroundColor: colors.tabBackground,
  borderRadius: spacing.sm,
})
