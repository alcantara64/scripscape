import { Keyboard, Pressable, ViewProps } from "react-native"

type Props = ViewProps & { children: React.ReactNode }

export default function DismissKeyboardView({ children, ...rest }: Props) {
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => Keyboard.dismiss()}
      android_disableSound
      accessible={false}
      {...rest}
    >
      {children}
    </Pressable>
  )
}
