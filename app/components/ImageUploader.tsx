import { View, Pressable, ImageSourcePropType, ViewStyle, TextStyle } from "react-native"
import { ImageBackground, ImageStyle } from "expo-image"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { Icon } from "./Icon" // Assuming you have an Icon component

// Define the props for the reusable component
interface ImageUploaderProps {
  coverImage: ImageSourcePropType | null
  onPressUpload: () => void
  onPressRemove: () => void
  uploadText?: string
}

export function ImageUploader({
  coverImage,
  onPressUpload,
  onPressRemove,
  uploadText = "Upload Poster Image",
}: ImageUploaderProps) {
  // Styles for the component (replace with your actual styles)
  const { themed, theme } = useAppTheme()

  return (
    <Pressable style={$upload}>
      {!coverImage ? (
        <View style={themed($uploadContainer)}>
          <View style={$uploadButtonIcon}>
            <Icon icon="upload" size={20} color="#fff" />
          </View>
          <Text preset="titleHeading" style={themed($title)}>
            {uploadText}
          </Text>
          <Pressable style={$browseBtn} onPress={onPressUpload}>
            <Text style={$browseText}>Browse Images</Text>
          </Pressable>
        </View>
      ) : (
        <ImageBackground source={coverImage} imageStyle={$image} style={themed($imageContainer)}>
          <Pressable onPress={onPressRemove} style={themed($removeContainer)}>
            <Icon icon="trash" size={24} color={theme.colors.palette.neutral300} />
            <Text style={themed($skipTxt)}>Remove Image</Text>
          </Pressable>
        </ImageBackground>
      )}
    </Pressable>
  )
}

const $upload: ViewStyle = {
  borderWidth: 1,
  borderStyle: "dashed",
  borderColor: "rgba(234, 231, 240, 0.40)",
  borderRadius: 12,
  marginVertical: 12,
  marginTop: 24,
  height: 203,
}
const $uploadContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 28,
})

const $title: ThemedStyle<TextStyle> = () => ({
  marginTop: 4,
  fontSize: 15,
  fontWeight: "500", // <- must be string
  lineHeight: 20,
})

const $browseBtn: ViewStyle = {
  marginTop: 12,
  backgroundColor: "#3A57E8",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 12,
}

const $browseText: TextStyle = {
  color: "#fff",
  fontSize: 12,
  padding: 8,
  fontWeight: "500", // <- must be string
  lineHeight: 20,
}

const $uploadButtonIcon: ViewStyle = {
  height: 38,
  width: 38,
  borderRadius: 16,
  backgroundColor: "rgba(234, 231, 240, 0.10)",
  alignItems: "center",
  justifyContent: "center",
}
const $imageContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: 20,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  flex: 1,
})
const $image: ImageStyle = {
  borderRadius: 12,
}

const $skipTxt: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral300,
  fontSize: 18,
  fontWeight: 500,
  lineHeight: 20,
})
const $removeContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.sm + 2,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  flexDirection: "row",
  gap: 8,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
})
