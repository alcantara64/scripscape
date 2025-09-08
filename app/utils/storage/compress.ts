import * as FileSystem from "expo-file-system"
import * as ImageManipulator from "expo-image-manipulator"

type Compressed = { uri: string; name: string; type: string }

export async function prepareImageForUpload(
  uri: string,
  opts?: { maxWidth?: number; maxHeight?: number; quality?: number; name?: string },
): Promise<Compressed> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, name = "image.jpg" } = opts ?? {}

  // Convert HEIC → JPEG and resize
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth, height: maxHeight } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }, // strips most EXIF
  )

  // Optional: enforce size cap
  const info = await FileSystem.getInfoAsync(result.uri)
  const maxBytes = 5 * 1024 * 1024 // 5 MB
  if (!info.exists || info.size > maxBytes) {
    // Try a second pass with lower quality
    const second = await ImageManipulator.manipulateAsync(result.uri, [], {
      compress: 0.6,
      format: ImageManipulator.SaveFormat.JPEG,
    })
    const info2 = await FileSystem.getInfoAsync(second.uri)
    if (!info2.exists || info2.size > maxBytes) {
      throw new Error("Image is too large even after compression.")
    }
    return { uri: second.uri, name, type: "image/jpeg" }
  }

  return { uri: result.uri, name, type: "image/jpeg" }
}
