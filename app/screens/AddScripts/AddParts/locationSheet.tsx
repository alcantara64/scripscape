import { useCallback, useEffect, useRef, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, Pressable, View, ViewStyle } from "react-native"
import { Image, ImageBackground, ImageStyle } from "expo-image"

import { Button } from "@/components/Button"
import { Icon, PressableIcon } from "@/components/Icon"
import { ImagePickerWithCropping } from "@/components/ImagePickerWithCroping"
import { ImageUploader } from "@/components/ImageUploader"
import { ListView } from "@/components/ListView"
import { Tabs } from "@/components/Tab"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { Switch } from "@/components/Toggle/Switch"
import { ScriptLocationImage } from "@/interface/script"
import { useScriptPartLocation, useUpdateScriptLocation } from "@/querries/location"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { compressImage, toRNFile } from "@/utils/image"
import { toast } from "@/utils/toast"

import { TAB_ITEMS, type TabKey, validateTitle } from "./editorConstant"
import type { LocationItem, LocationForm } from "./types"

type Props = {
  currentTab: TabKey
  setCurrentTab: (k: TabKey) => void
  quotaLimit: number
  locations: ScriptLocationImage[]
  form: LocationForm
  setImage: (uri: string | null) => void
  setName: (name: string) => void
  setHideName: (hide: boolean) => void
  addLocation: (item: LocationItem) => void
  onConfirm: (item: LocationItem) => void
  onLimitReached: () => void
  script_id: number
  isEditMode?: boolean
  setLocationForm: (form: { name: string; image: string; id: number; hideName: boolean }) => void
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
  onLimitReached,
  script_id,
  isEditMode,
  setLocationForm,
}: Props) {
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()
  const scriptLocation = useScriptPartLocation()
  const updateScriptLocationQuery = useUpdateScriptLocation()

  const pickerRef = useRef<{ pickImage: () => Promise<void> }>(null)
  const [isAddLocation, setIsAddLocation] = useState(false)

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const onPick = useCallback(() => pickerRef.current?.pickImage(), [])
  const onRemove = useCallback(() => setImage(null), [setImage])
  const selectedItem = selectedIndex != null ? locations[selectedIndex] : null
  const setInitialForm = useCallback(() => {
    if (selectedItem) {
      setLocationForm({
        id: selectedItem?.id,
        name: selectedItem?.name,
        hideName: selectedItem?.hideName,
        image: selectedItem?.image || "",
      })
    }
  }, [selectedItem])

  useEffect(() => {
    if (isEditMode) {
      setInitialForm()
    }
  }, [isEditMode, setInitialForm])

  const onSave = useCallback(async () => {
    if (!form.image) {
      Alert.alert("Add Location", "Please select an image first.")
      return
    }
    const err = validateTitle(form.name)
    if (err) {
      Alert.alert("Invalid Name", err)
      return
    }
    const img = await compressImage(form.image)

    scriptLocation.mutate({
      script_id: script_id,
      Loc: {
        image: toRNFile(img.uri, `${form.name.trim()}.png`) as any,
        name: form.name.trim(),
        hideName: form.hideName,
      },
    })
    setIsAddLocation(false)
  }, [form, addLocation])

  const updateScriptLocation = async () => {
    const payload = {
      script_id: script_id,
      payload: { id: form.id!, name: form.name, hideName: form.hideName },
    }

    if (form.image && selectedItem?.image !== form.image) {
      const img = await compressImage(form.image)
      payload.payload.image = toRNFile(img.uri, `${form.name.trim()}.png`)
    }
    console.log(payload)
    const response = await updateScriptLocationQuery.mutateAsync(payload)
    if (response) {
      toast.success(`${form.name} updated Successfully`)
    }
  }

  const locationTextMax = 50
  const nameError = validateTitle(form.name)
  const nameHelper = nameError
    ? nameError
    : `${Math.min(form.name.length, locationTextMax)}/${locationTextMax} characters`

  const LocationSeparator = useCallback(() => <View style={{ height: 12 }} />, [])
  const keyExtractor = useCallback(
    (item: ScriptLocationImage, index: number) => `${item.name}-${index}`,
    [],
  )

  const RenderItem = useCallback(
    ({ item, index }: { item: ScriptLocationImage; index: number }) => {
      const isSelected = selectedIndex === index
      return (
        <Pressable
          onPress={() => setSelectedIndex((cur) => (cur === index ? null : index))}
          hitSlop={6}
          style={{ flex: 1, margin: 6 }}
        >
          <ImageBackground
            source={{ uri: item.image }}
            placeholder={{ blurhash: item.blurhash }}
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

  const haReachedLimit = locations.length >= quotaLimit
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ImagePickerWithCropping ref={pickerRef} onImageSelected={setImage} aspect={[16, 9]} />

      <View style={$headerRow}>
        <View style={$titleContainer}>
          <PressableIcon
            icon="arrowLeft"
            onPress={() => {
              setIsAddLocation(false)
            }}
          />
          <Text
            text={
              isAddLocation ? (isEditMode ? "Edit Location" : "Add Location") : "Select Location"
            }
            preset="titleHeading"
          />
        </View>
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

          <ListView<ScriptLocationImage>
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

          <Pressable
            disabled={haReachedLimit}
            style={[themed($addDashed), haReachedLimit && { opacity: 0.6 }]}
            onPress={() => {
              if (haReachedLimit) {
                onLimitReached()
              } else {
                setIsAddLocation(true)
              }
            }}
          >
            <Icon icon="plus" size={24} />
            <Text weight="medium">Add Location</Text>
          </Pressable>

          <Button
            text="Confirm"
            disabled={!selectedItem}
            onPress={() => {
              if (!selectedItem) return
              if (isEditMode) {
                setIsAddLocation(true)
              } else {
                onConfirm(selectedItem)
              }
            }}
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
          <View style={$actionContainer}>
            {!isEditMode && (
              <Button
                disabled={!form.image || !form.name}
                text="Save"
                style={themed($saveBtn)}
                onPress={onSave}
              />
            )}
            {isEditMode && (
              <>
                <Button
                  disabled={
                    (selectedItem?.name === form.name &&
                      selectedItem?.image === form.image &&
                      selectedItem?.hideName === selectedItem?.hideName) ||
                    !form.image ||
                    !form.name
                  }
                  text="Save Changes"
                  style={themed($saveBtn)}
                  onPress={updateScriptLocation}
                />
                <Button
                  text="Delete"
                  style={[themed($saveBtn), themed($deleteButton)]}
                  onPress={onSave}
                />
              </>
            )}
          </View>
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

const $actionContainer: ViewStyle = {
  marginTop: 70,
  gap: 8,
}
const $saveBtn: ThemedStyle<ViewStyle> = () => ({ height: 44, bottom: 0 })

const $deleteButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
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
})
const $titleContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}
