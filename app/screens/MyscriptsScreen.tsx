import { FC } from "react"
import { TextStyle, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Screen } from "@/components/Screen"
import { ScriptList } from "@/components/ScriptList"
import { MyScriptsSkeleton } from "@/components/skeleton/screens/MyScripts"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useGetMyScripts } from "@/querries/script"
// import { useNavigation } from "@react-navigation/native"

interface MyScriptsScreenProps extends AppStackScreenProps<"MyScripts"> {}

export const MyScriptsScreen: FC<MyScriptsScreenProps> = () => {
  // Pull in navigation via hook

  const { data, isLoading } = useGetMyScripts()
  if (isLoading) return <MyScriptsSkeleton />

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
