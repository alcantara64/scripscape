import * as ImageManipulator from "expo-image-manipulator"

export async function compressImage(uri: string) {
  // Downscale to max width 1280 and JPEG quality 0.8 (tune as you like)
  const manipulated = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1280 } }], {
    compress: 0.8,
    format: ImageManipulator.SaveFormat.JPEG,
  })
  return manipulated // { uri, width, height }
}

export const mimeFromUri = (uri: string) => {
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase()
  if (ext === "png") return "image/png"
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg"
  if (ext === "webp") return "image/webp"
  return "application/octet-stream"
}
export const toRNFile = (uri: string, fallbackName: string) => ({
  uri,
  name: fallbackName,
  type: mimeFromUri(uri),
})
