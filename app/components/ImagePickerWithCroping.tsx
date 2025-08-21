import { forwardRef, useImperativeHandle } from "react"
import { Alert, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import * as ImagePicker from "expo-image-picker"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface ImagePickerWithCroppingProps {
  onImageSelected: (uri: string) => void
  aspect?: number[]
}

interface ImagePickerRef {
  pickImage: () => Promise<void>
}
/**
 * Describe your component here
 */
export const ImagePickerWithCropping = forwardRef<ImagePickerRef, ImagePickerWithCroppingProps>(
  ({ onImageSelected, aspect = [4, 3] }, ref) => {
    const pickImage = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need camera roll permissions to make this work!",
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect,
        quality: 1,
      })

      if (!result.canceled) {
        onImageSelected(result.assets[0].uri)
      }
    }

    useImperativeHandle(ref, () => ({
      pickImage,
    }))

    return null
  },
)

// ✅ Add a display name for linting/dev tools
ImagePickerWithCropping.displayName = "ImagePickerWithCropping"
