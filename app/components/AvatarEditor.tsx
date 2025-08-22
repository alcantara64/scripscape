import { ImageStyle, TouchableOpacity, View, ViewStyle, Image } from "react-native"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { DEFAULT_PROFILE_IMAGE } from "@/utils/app.default"

import { Button } from "./Button"
import { Icon } from "./Icon"
import { Text } from "./Text"

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
        <Image
          style={themed($avatarStyle)}
          source={value ? { uri: value } : DEFAULT_PROFILE_IMAGE}
        />
      </View>

      <View style={$avatarActionsRow}>
        <TouchableOpacity style={themed($chipButton)} onPress={onUpload}>
          <Icon icon="edit" size={14} />
          <Text text="Upload" size="xs" />
        </TouchableOpacity>

        <TouchableOpacity style={themed($chipButton)} onPress={onTakePhoto}>
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
  paddingTop: 33,
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

const $chipButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  borderRadius: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs - 2,
})

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
