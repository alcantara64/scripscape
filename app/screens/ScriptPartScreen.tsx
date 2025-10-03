import { FC } from "react"
import { ViewStyle } from "react-native"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
// import { useNavigation } from "@react-navigation/native"

interface ScriptPartScreenProps extends AppStackScreenProps<"ScriptPart"> {}

export const ScriptPartScreen: FC<ScriptPartScreenProps> = () => {
  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="scroll">
      <Text text="scriptPart" />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
