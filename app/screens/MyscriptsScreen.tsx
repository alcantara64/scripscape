import { FC } from "react"
import { TextStyle, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { ScriptList } from "@/components/ScriptList"
import { Text } from "@/components/Text"
import { mock_scripts } from "@/mockups/script"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useGetMyScripts } from "@/querries/script"
import { MyScriptsSkeleton } from "@/components/skeleton/screens/MyScripts"
import { useNavigation } from "@react-navigation/native"
// import { useNavigation } from "@react-navigation/native"

interface MyScriptsScreenProps extends AppStackScreenProps<"MyScripts"> {}

export const MyScriptsScreen: FC<MyScriptsScreenProps> = () => {
  // Pull in navigation via hook
  const navigation = useNavigation()
  const { data, isLoading } = useGetMyScripts()
  if (isLoading) return <MyScriptsSkeleton />
  const gotoDetailScreen = () => {
    navigation.navigate("ScriptDetail", { script_id: 42 })
  }
  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top"]}>
      <Text text="My Scripts" preset="sectionHeader" style={$titleStyle} />
      <ScriptList data={data || []} />
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
