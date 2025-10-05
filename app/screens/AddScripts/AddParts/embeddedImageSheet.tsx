import { useCallback, useRef, useState } from "react"
import { Pressable, View, ViewStyle } from "react-native"
import { ImageBackground, ImageStyle } from "expo-image"

import { Icon, PressableIcon } from "@/components/Icon"
import { ListView } from "@/components/ListView"
import { Tabs } from "@/components/Tab"
import { Text } from "@/components/Text"
import { EmbeddedImage, ScriptLocationImage } from "@/interface/script"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { TAB_ITEMS, type TabKey } from "./editorConstant"
import { ImagePickerWithCropping } from "@/components/ImagePickerWithCroping"
import { compressImage } from "@/utils/image"
import { useCreateScriptEmbeddedImages } from "@/querries/embedded-images"

type Props = {
  currentTab: TabKey
  setCurrentTab: (k: TabKey) => void
  quotaLimit: number
  embeddedImages: EmbeddedImage[]
  scriptId: number
  onLimitReached: () => void
}

export function EmbeddedImageSheet({
  currentTab,
  setCurrentTab,
  quotaLimit,
  onLimitReached,
  embeddedImages,
  scriptId,
}: Props) {
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()

  const pickerRef = useRef<{ pickImage: () => Promise<void> }>(null)

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const onPick = useCallback(() => pickerRef.current?.pickImage(), [])
  const onRemove = () => {}
  const selectedItem = selectedIndex != null ? embeddedImages[selectedIndex] : null

  const createScriptEmbeddedImage = useCreateScriptEmbeddedImages()

  const LocationSeparator = useCallback(() => <View style={{ height: 12 }} />, [])
  const keyExtractor = useCallback(
    (item: EmbeddedImage, index: number) => `${item.id}-${index}`,
    [],
  )

  const handleCoverImageSelected = async (uri: string, mimeType?: string) => {
    if (embeddedImages.length >= quotaLimit) {
      onLimitReached()
    } else {
      const img = await compressImage(uri)
      createScriptEmbeddedImage.mutate({
        script_id: scriptId,
        payload: { image: img.uri },
      })
    }
  }

  const RenderItem = useCallback(
    ({ item, index }: { item: EmbeddedImage; index: number }) => {
      const isSelected = selectedIndex === index
      return (
        <Pressable
          onPress={() => setSelectedIndex((cur) => (cur === index ? null : index))}
          hitSlop={6}
          style={{ flex: 1, margin: 6 }}
        >
          <ImageBackground
            source={{ uri: item.url }}
            placeholder={{ blurhash: item.blurhash }}
            style={[themed($imageStyle), isSelected && themed($imageSelectedStyle)]}
            contentFit="cover"
            transition={100}
          >
            <View style={themed($checkIconContainer)}>
              <Icon icon="check" size={16} />
            </View>
          </ImageBackground>
        </Pressable>
      )
    },
    [colors.palette.neutral800, colors.tint, selectedIndex],
  )

  const haReachedLimit = embeddedImages.length >= quotaLimit
  return (
    <View>
      <ImagePickerWithCropping
        ref={pickerRef}
        onImageSelected={handleCoverImageSelected}
        aspect={[16, 9]} // wide ratio for background
      />
      <View style={$headerRow}>
        <View style={$titleContainer}>
          <PressableIcon
            icon="arrowLeft"
            onPress={() => {
              //   setIsAddLocation(false)
            }}
          />
          <Text text={"Manage Images"} preset="titleHeading" />
        </View>
        <Text text={`${embeddedImages.length}/${quotaLimit}`} />
      </View>

      <>
        <Tabs
          value={currentTab}
          items={TAB_ITEMS}
          onChange={(k) => setCurrentTab(k as TabKey)}
          containerStyle={themed({ marginBottom: 20 })}
          fullWidth
          gap={8}
        />

        <ListView<EmbeddedImage>
          data={embeddedImages}
          extraData={{ embeddedImages, selectedIndex }} // re-render on selection
          estimatedItemSize={embeddedImages.length || 1}
          ItemSeparatorComponent={LocationSeparator}
          ListEmptyComponent={
            <View style={{ paddingVertical: spacing.lg, alignItems: "center" }}>
              <Text preset="description" text="No Image yet. Add one to get started." />
            </View>
          }
          numColumns={3}
          keyExtractor={keyExtractor}
          renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
        />

        <Pressable
          disabled={haReachedLimit}
          style={[themed($addDashed), haReachedLimit && { opacity: 0.6 }]}
          onPress={() => {
            if (haReachedLimit) {
              onLimitReached()
            }
            onPick()
          }}
        >
          <Icon icon="plus" size={22} />
          <Text weight="medium">Add Images</Text>
        </Pressable>
      </>
    </View>
  )
}

/** styles */
const $headerRow: View["props"]["style"] = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 20,
  alignItems: "center",
}

const $addDashed: ThemedStyle<any> = ({ spacing }) => ({
  borderWidth: 1,
  borderStyle: "dashed",
  borderColor: "rgba(197, 206, 250, 0.50)",
  borderRadius: spacing.sm,
  height: 56,
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  marginTop: spacing.sm,
  flexDirection: "row",
})

const $checkIconContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 25,
  width: 25,
  borderRadius: 25 / 2,
  //   backgroundColor: colors.success,
  borderColor: colors.palette.neutral100,
  borderWidth: 2,
  alignItems: "center",
  justifyContent: "center",
  padding: 8,
  alignSelf: "flex-end",
})

const $imageSelectedStyle: ThemedStyle<ImageStyle> = ({ colors }) => ({
  borderWidth: 2,
  borderColor: colors.palette.primary200,
  padding: 2,
  borderRadius: 4,
})
const $imageStyle: ThemedStyle<ImageStyle> = ({ colors }) => ({
  width: "100%",
  aspectRatio: 1.5,
  backgroundColor: colors.palette.neutral800,
  padding: 4,
})
const $titleContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}
