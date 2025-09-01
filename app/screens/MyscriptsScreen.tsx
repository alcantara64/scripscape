import { FC } from "react"
import { TextStyle, ViewStyle } from "react-native"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Loader } from "@/components/Loader"
import { ScriptList } from "@/components/ScriptList"
import { mock_scripts } from "@/mockups/script"
// import { useNavigation } from "@react-navigation/native"

interface MyScriptsScreenProps extends AppStackScreenProps<"MyScripts"> {}

export const MyScriptsScreen: FC<MyScriptsScreenProps> = () => {
  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top"]}>
      <Text text="My Scripts" preset="sectionHeader" style={$titleStyle} />
      <ScriptList data={mock_scripts} />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
  paddingHorizontal: 20,
  paddingVertical: 16,
}

const $titleStyle: TextStyle = {
  marginBottom: 24,
}
