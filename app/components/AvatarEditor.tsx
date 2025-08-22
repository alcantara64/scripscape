import { ImageStyle, TouchableOpacity, View, ViewStyle, Image } from "react-native"
import { ProfileCard } from "./ProfileCard"
import { Icon } from "./Icon"
import { Text } from "./Text"
import { Button } from "./Button"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { DEFAULT_IMAGE } from "@/utils/app.default"
import { AutoImage } from "./AutoImage"

export function AvatarEditor({
  value,
  onUpload,
  onTakePhoto,
  onSave,
  onClose,
}: {
  value: string | null
  onUpload: () => void
  onTakePhoto?: () => void
  onSave: () => void
  onClose: () => void
}) {
  const { themed } = useAppTheme()
  return (
    <View style={$avatarSheet}>
      <View style={$avatarWrapper}>
        <Image style={themed($avatarStyle)} source={DEFAULT_IMAGE} maxHeight={170} maxWidth={170} />
      </View>

      <View style={$avatarActionsRow}>
        <TouchableOpacity style={$chipButton} onPress={onUpload}>
          <Icon icon="edit" size={14} />
          <Text text="Upload" size="xs" />
        </TouchableOpacity>

        <TouchableOpacity style={$chipButton} onPress={onTakePhoto}>
          <Icon icon="camera" size={14} />
          <Text text="Take Photo" size="xs" />
        </TouchableOpacity>
      </View>

      <Button text="Save" style={themed($saveBtn)} onPress={onSave} />
    </View>
  )
}

const $avatarSheet: ViewStyle = {
  alignItems: "center",
  paddingTop: 12,
  paddingBottom: 24,
  gap: 20,
}

const $avatarWrapper: ViewStyle = { alignItems: "center", justifyContent: "center" }

const $avatarActionsRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
}

const $chipButton: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  borderWidth: 1,
  borderColor: "#FFFFFF",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
}

const $avatarStyle: ThemedStyle<ImageStyle> = ({ colors }) => ({
  borderWidth: 3,
  borderColor: colors.border2,
  width: 170,
  height: 170,
  borderRadius: 170 / 2,
})

const $saveBtn: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignSelf: "stretch",
  marginHorizontal: 12,
  backgroundColor: colors.buttonBackground,
  borderRadius: 10,
  borderWidth: 0,
})
