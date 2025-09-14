import { useCallback, useRef, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, Pressable, View, ViewStyle } from "react-native"
import { Image, ImageStyle } from "expo-image"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { ImagePickerWithCropping } from "@/components/ImagePickerWithCroping"
import { ImageUploader } from "@/components/ImageUploader"
import { ListView } from "@/components/ListView"
import { Tabs } from "@/components/Tab"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { Switch } from "@/components/Toggle/Switch"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { TAB_ITEMS, type TabKey, validateTitle } from "./editorConstant"
import type { LocationItem, LocationForm } from "./types"

type Props = {
  currentTab: TabKey
  setCurrentTab: (k: TabKey) => void
  quotaLimit: number
  locations: LocationItem[]
  form: LocationForm
  setImage: (uri: string | null) => void
  setName: (name: string) => void
  setHideName: (hide: boolean) => void
  addLocation: (item: LocationItem) => void
  onConfirm: (item: LocationItem) => void
}

export function LocationSheet({
  currentTab,
  setCurrentTab,
  quotaLimit,
  locations,
  form,
  setImage,
  setName,
  setHideName,
  addLocation,
  onConfirm,
}: Props) {
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()

  const pickerRef = useRef<{ pickImage: () => Promise<void> }>(null)
  const [isAddLocation, setIsAddLocation] = useState(false)

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const onPick = useCallback(() => pickerRef.current?.pickImage(), [])
  const onRemove = useCallback(() => setImage(null), [setImage])

  const onSave = useCallback(() => {
    if (!form.image) {
      Alert.alert("Add Location", "Please select an image first.")
      return
    }
    const err = validateTitle(form.name)
    if (err) {
      Alert.alert("Invalid Name", err)
      return
    }
    addLocation({ image: form.image, name: form.name.trim(), hideName: form.hideName })
    setIsAddLocation(false)
  }, [form, addLocation])

  const locationTextMax = 50
  const nameError = validateTitle(form.name)
  const nameHelper = nameError
    ? nameError
    : `${Math.min(form.name.length, locationTextMax)}/${locationTextMax} characters`

  const LocationSeparator = useCallback(() => <View style={{ height: 12 }} />, [])
  const keyExtractor = useCallback(
    (item: LocationItem, index: number) => `${item.name}-${index}`,
    [],
  )

  const RenderItem = useCallback(
    ({ item, index }: { item: LocationItem; index: number }) => {
      const isSelected = selectedIndex === index
      return (
        <Pressable
          onPress={() => setSelectedIndex((cur) => (cur === index ? null : index))}
          hitSlop={6}
          style={[{ flex: 1, margin: 6 }]}
        >
          <Image
            source={{ uri: item.image }}
            style={[themed($imageStyle), isSelected && themed($imageSelectedStyle)]}
            contentFit="cover"
            transition={100}
          />
          {!item.hideName && <Text text={item.name} numberOfLines={1} />}
        </Pressable>
      )
    },
    [colors.palette.neutral800, colors.tint, selectedIndex],
  )

  const selectedItem = selectedIndex != null ? locations[selectedIndex] : null

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ImagePickerWithCropping ref={pickerRef} onImageSelected={setImage} aspect={[16, 9]} />

      <View style={$headerRow}>
        <Text text={isAddLocation ? "Add Location" : "Select Location"} preset="titleHeading" />
        <Text text={`${locations.length}/${quotaLimit}`} />
      </View>

      {!isAddLocation ? (
        <>
          <Tabs
            value={currentTab}
            items={TAB_ITEMS}
            onChange={(k) => setCurrentTab(k as TabKey)}
            containerStyle={themed({ marginBottom: 20 })}
            fullWidth
            gap={8}
          />

          <ListView<LocationItem>
            data={locations}
            extraData={{ locations, selectedIndex }} // re-render on selection
            estimatedItemSize={locations.length || 1}
            ItemSeparatorComponent={LocationSeparator}
            ListEmptyComponent={
              <View style={{ paddingVertical: spacing.lg, alignItems: "center" }}>
                <Text preset="description" text="No locations yet. Add one to get started." />
              </View>
            }
            numColumns={2}
            keyExtractor={keyExtractor}
            renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
          />

          {/* Add new location button */}
          <View style={themed($addDashed)}>
            <Icon icon="plus" size={24} />
            <Text weight="medium" onPress={() => setIsAddLocation(true)}>
              Add Location
            </Text>
          </View>

          <Button
            text="Confirm"
            disabled={!selectedItem}
            onPress={() => selectedItem && onConfirm(selectedItem)}
            style={[themed($confirmBtn), !selectedItem && { opacity: 0.6 }]}
          />
        </>
      ) : (
        <View>
          <ImageUploader
            coverImage={form.image}
            uploadText="Upload Location Image"
            onPressUpload={onPick}
            onPressRemove={onRemove}
          />

          <TextField
            value={form.name}
            onChangeText={setName}
            placeholder="Enter Location name"
            label="Location Name"
            helper={nameHelper}
            status={nameError ? "error" : undefined}
            maxLength={locationTextMax}
            autoCapitalize="words"
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={themed($toggleContainer)}>
              <Text text="Hide Location Name" style={$locationTitle} />
              <Text preset="description" style={$description}>
                Enable to hide the location name from {"\n"}displaying in your script
              </Text>
            </View>
            <Switch value={form.hideName} onValueChange={setHideName} />
          </View>

          <Button text="Save" style={themed($saveBtn)} onPress={onSave} />
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

/** styles */
const $headerRow: View["props"]["style"] = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 20,
  alignItems: "center",
}

const $toggleContainer: View["props"]["style"] = { marginTop: 20 }
const $locationTitle: any = { fontSize: 14, fontWeight: "500" }
const $description: any = { fontSize: 14, fontWeight: "300", textAlign: "left" }

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

const $confirmBtn: ThemedStyle<ViewStyle> = () => ({
  minWidth: 120,
  height: 44,
  marginTop: 14,
})

const $saveBtn: ThemedStyle<any> = () => ({ height: 44, marginTop: 70 })

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
})
