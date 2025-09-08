import { FC } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
// import { useNavigation } from "@react-navigation/native"

interface AddScriptScreenProps extends AppStackScreenProps<"AddScript"> {}

export const AddScriptScreen: FC<AddScriptScreenProps> = () => {
  // Pull in navigation via hook
  // const navigation = useNavigation()
  const { themed, spacing } = useAppTheme()
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
      <Text preset="sectionHeader" text="Create New Script" />
      <Pressable style={$upload} onPress={() => {}}>
        {/* <Ionicons name="cloud-upload-outline" size={40} color="#9aa0ff" /> */}
        <Text preset="bold" style={themed($title)}>
          Upload Cover Image
        </Text>
        <Pressable style={$browseBtn} onPress={() => {}}>
          <Text style={$browseText}>Browse Images</Text>
        </Pressable>
      </Pressable>
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
  padding: 24,
}
const $title: ThemedStyle<ViewStyle> = () => ({
  marginTop: 4,
})
const $upload: ViewStyle = {
  borderWidth: 1,
  borderStyle: "dashed",
  borderColor: "#444",
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  marginVertical: 12,
}
const $browseBtn: ViewStyle = {
  marginTop: 8,
  backgroundColor: "#3A57E8",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 8,
}
const $browseText: TextStyle = {
  color: "#fff",
  fontSize: 14,
}
