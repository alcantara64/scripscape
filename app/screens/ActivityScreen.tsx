import { FC } from "react"
import { ViewStyle } from "react-native"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
// import { useNavigation } from "@react-navigation/native"

interface ActivityScreenProps extends AppStackScreenProps<"Activity"> {}

export const ActivityScreen: FC<ActivityScreenProps> = () => {
  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="scroll">
      <Text text="activity" />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
