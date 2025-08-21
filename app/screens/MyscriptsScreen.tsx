import { FC } from "react"
import { ViewStyle } from "react-native"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
// import { useNavigation } from "@react-navigation/native"

interface MyScriptsScreenProps extends AppStackScreenProps<"MyScripts"> {}

export const MyScriptsScreen: FC<MyScriptsScreenProps> = () => {
  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
      <Text text="myscripts" />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
