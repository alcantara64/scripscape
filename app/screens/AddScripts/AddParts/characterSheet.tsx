// CharacterSheet.tsx
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react"
import {
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  TextStyle,
  ScrollView,
} from "react-native"
import * as DocumentPicker from "expo-document-picker"
import { Image, ImageStyle } from "expo-image"
import * as ImagePicker from "expo-image-picker"

import { AppBottomSheet, type BottomSheetController } from "@/components/AppBottomSheet"
import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { ListView } from "@/components/ListView"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { TEXT_BACKGROUND_COLORS, TEXT_COLOR } from "./editorConstant"
import { BackgroundColorType, CharacterForm, CharacterItem, TextColorType } from "./types"
import { ProBadge } from "@/components/ProBadge"

export type CharacterResult = {
  name: string
  avatarUri?: string
  bubbleBg?: string
  textColor?: string
  dialogue?: string
  audioUri?: string
}

type Props = {
  characters: CharacterItem[]
  form: CharacterForm
  isPro: boolean
  setCharacterImage: (uri: string | null) => void
  setCharacterName: (name: string) => void
  setCharacterTextColor: (color: TextColorType) => void
  setCharacterTextBackgroundColor: (color: BackgroundColorType) => void
  addCharacter: (item: CharacterItem) => void
  onConfirm: (item: CharacterItem) => void
  selectedCharacterTextColor: TextColorType
  selectedCharacterTextBackgroundColor: BackgroundColorType
  onAddAdditionalImages: (uri: string) => void
  additionalImages: Array<{ imageUri: string }>
  onSave: (res: CharacterResult) => void
  quota: { used: number; limit: number }
  onLimitReached: () => void
}

type Mode = "add-character" | "add-dialogue" | "choose-character"

export type CharacterSheetHandle = BottomSheetController & {
  openWith(prefill?: Partial<CharacterResult>): void
}

export const CharacterSheet = ({
  isPro,
  characters,
  form,
  setCharacterImage,
  setCharacterName,
  selectedCharacterTextBackgroundColor,
  selectedCharacterTextColor,
  setCharacterTextColor,
  setCharacterTextBackgroundColor,
  additionalImages,
  onAddAdditionalImages,
  addCharacter,
  onSave,
  quota,
  onLimitReached,
}: Props) => {
  const ctrl = useRef<BottomSheetController>(null)
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()
  const [state, setState] = useState<CharacterResult>({
    name: "Queen Myrrh of the Glimmer",
    avatarUri: undefined,
    bubbleBg: "#2C1A67",
    textColor: "#FFFFFF",
    dialogue: "",
    audioUri: undefined,
  })

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>("choose-character")

  const pickAvatar = async (isAdditionalImage?: boolean) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    })
    if (!res.canceled) {
      if (isAdditionalImage) {
        onAddAdditionalImages(res.assets[0].uri)
      } else {
        setState((s) => ({ ...s, avatarUri: res.assets[0].uri }))
      }
    }
  }

  const LocationSeparator = useCallback(() => <View style={{ height: 12 }} />, [])
  const keyExtractor = useCallback(
    (item: CharacterItem, index: number) => `${item.name}-${index}`,
    [],
  )

  const pickAudio = async () => {
    // Gate for PRO
    if (!isPro) return
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: "audio/*",
      multiple: false,
    })
    if (res.type === "success") {
      setState((s) => ({ ...s, audioUri: res.uri }))
    }
  }

  const save = () => {
    onSave({
      avatarUri: selectedItem?.image as string,
      name: selectedItem?.name as string,
      bubbleBg: selectedCharacterTextBackgroundColor,
      textColor: selectedCharacterTextColor,
      dialogue: state.dialogue,
      //todo remove uri
      audioUri: "hrrrrppp",
    })
    // onSave(state)
  }
  const RenderItem = useCallback(
    ({ item, index }: { item: CharacterItem; index: number }) => {
      const isSelected = selectedIndex === index
      return (
        <Pressable
          onPress={() => setSelectedIndex((cur) => (cur === index ? null : index))}
          hitSlop={6}
          style={{ flex: 1, alignItems: "center" }}
        >
          <Image
            source={{ uri: item.image }}
            style={[themed($imageStyle), isSelected && themed($imageSelectedStyle)]}
            contentFit="cover"
            transition={100}
          />
          {<Text text={item.name} numberOfLines={1} />}
        </Pressable>
      )
    },
    [colors.palette.neutral800, colors.tint, selectedIndex],
  )

  const selectedItem = selectedIndex != null ? characters[selectedIndex] : null

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View>
        <View style={$headerRow}>
          <Text preset="titleHeading">
            {mode === "choose-character" ? "Add Dialogue" : "Add Character"}
          </Text>
          {mode === "add-character" && <Text text={`${characters.length}/${quota.limit}`} />}
        </View>
        {(mode === "add-dialogue" || mode === "choose-character") && (
          <View style={themed($subTitleContainer)}>
            <View style={themed($steps)}>
              <View style={themed($iconContainer)}>
                <Icon icon="person" size={16} />
              </View>
              <View>
                <Text style={themed($stepTitle)} text="Step 1" />
                <Text style={themed($stepDescription)} text="Choose Character" />
              </View>
            </View>
            <View style={themed($steps)}>
              <View
                style={[
                  themed($iconContainer),
                  mode === "choose-character" && themed($iconInActiveContainer),
                ]}
              >
                <Icon icon="chatBubble" size={16} />
              </View>
              <View>
                <Text
                  style={[
                    themed($stepTitle),
                    mode === "choose-character" && themed($stepInActiveDescription),
                  ]}
                  text="Step 2"
                />
                <Text
                  style={[
                    themed($stepDescription),
                    mode === "choose-character" && themed($stepInActiveDescription),
                  ]}
                  text="Add Dialogue"
                />
              </View>
            </View>
          </View>
        )}
        {mode === "choose-character" && (
          <>
            <ListView<CharacterItem>
              data={characters}
              extraData={{ characters }} // re-render on selection
              estimatedItemSize={characters.length || 1}
              ItemSeparatorComponent={LocationSeparator}
              ListEmptyComponent={
                <View style={{ paddingVertical: spacing.lg, alignItems: "center" }}>
                  <Text preset="description" text="No character yet. Add one to get started." />
                </View>
              }
              numColumns={3}
              keyExtractor={keyExtractor}
              renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
            />
            <View style={{ gap: 12 }}>
              <Pressable
                style={themed($addDashed)}
                onPress={() => {
                  if (quota.used >= quota.limit) {
                    onLimitReached()
                  } else {
                    setMode("add-character")
                  }
                }}
              >
                <Icon icon="plus" size={24} />
                <Text weight="medium">Add Character</Text>
              </Pressable>

              <Button text="Continue" onPress={() => setMode("add-dialogue")} />
            </View>
          </>
        )}
        {mode === "add-character" && (
          <>
            <ScrollView style={{ marginBottom: 20 }}>
              <Pressable
                onPress={() => {
                  pickAvatar(false)
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                {state.avatarUri ? (
                  <Image
                    source={{ uri: state.avatarUri }}
                    style={{ width: 94, height: 94, borderRadius: 47 }}
                  />
                ) : (
                  <View
                    style={{ width: 94, height: 94, borderRadius: 47, backgroundColor: "#3A2A84" }}
                  />
                )}
                <View>
                  <Text style={themed($labelStyle)}>Upload Character Image</Text>
                  <Button
                    text="Browse Images"
                    onPress={() => {
                      pickAvatar(false)
                    }}
                  />
                </View>
              </Pressable>
              <View style={{ marginVertical: 12 }}>
                <Text style={themed($labelStyle)} text="Upload Additional Images" />
                <View style={$additionalImageContainer}>
                  {additionalImages.map((additionalImage) => (
                    <Image
                      style={themed($additionalImageItem)}
                      key={additionalImage.imageUri}
                      source={{ uri: additionalImage.imageUri }}
                    />
                  ))}
                  {additionalImages.length < 5 && (
                    <Pressable
                      onPress={() => {
                        pickAvatar(true)
                      }}
                      style={themed($additionalImageAddButton)}
                    >
                      <Icon icon="plus" size={16} />
                    </Pressable>
                  )}
                </View>
              </View>

              <View style={{ gap: 24 }}>
                <TextField
                  label="Character Name"
                  value={state.name}
                  onChangeText={(name) => setState((s) => ({ ...s, name }))}
                  placeholder="e.g., Queen Myrth of The Glimmer"
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    color: "white",
                  }}
                  helper="20/50 Character"
                />
                <View>
                  <Text style={themed($labelStyle)}>Choose Text Background Color</Text>
                  {/* <TextField
                  value={state.bubbleBg}
                  onChangeText={(bubbleBg) => setState((s) => ({ ...s, bubbleBg }))}
                  placeholder="#2C1A67"
                  autoCapitalize="none"
                  style={{
                    padding: 12,
                    backgroundColor: "#1C1147",
                    borderRadius: 12,
                    color: "white",
                  }}
                  helper="20/50 Character"
                /> */}
                  <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between" }}>
                    {TEXT_BACKGROUND_COLORS.map((color) => (
                      <Pressable key={color} onPress={() => setCharacterTextBackgroundColor(color)}>
                        <View
                          style={[
                            { height: 32, width: 32, borderRadius: 16, backgroundColor: color },
                            selectedCharacterTextBackgroundColor === color && $selectedColor,
                          ]}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View>
                  <Text style={themed($labelStyle)}>Choose Text Color</Text>
                  {/* <TextField
                value={state.textColor}
                onChangeText={(textColor) => setState((s) => ({ ...s, textColor }))}
                placeholder="#FFFFFF"
                autoCapitalize="none"
                style={{
                  padding: 12,
                  backgroundColor: "#1C1147",
                  borderRadius: 12,
                  color: "white",
                }}
              /> */}
                  <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between" }}>
                    {TEXT_COLOR.map((color) => (
                      <Pressable key={color} onPress={() => setCharacterTextColor(color)}>
                        <View
                          style={[
                            { height: 32, width: 32, borderRadius: 16, backgroundColor: color },
                            selectedCharacterTextColor === color && $selectedColor,
                          ]}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View>
                  <Text style={themed($labelStyle)} text="Dialogue Color Examples" />
                  <View style={$exampleDialogueContainer}>
                    {state.avatarUri ? (
                      <Image
                        source={{ uri: state.avatarUri }}
                        style={{ width: 36, height: 36, borderRadius: 18 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#3A2A84",
                          borderWidth: 0.5,
                          borderColor: "#fff",
                        }}
                      />
                    )}

                    <View
                      style={{
                        gap: 4,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: selectedCharacterTextBackgroundColor,
                        borderRadius: 12,
                        width: "88%",
                      }}
                    >
                      <Text
                        style={{
                          color: selectedCharacterTextColor,
                          fontSize: 14,
                          fontWeight: 600,
                          lineHeight: 16,
                        }}
                        text={state.name || " Character Name"}
                      />
                      <Text
                        numberOfLines={0}
                        style={{
                          color: selectedCharacterTextColor,
                          fontSize: 14,
                          fontWeight: 400,
                          flexShrink: 1,
                        }}
                      >
                        Tomorrow is booked. I’ve got a siege at dawn a famine at noon, and a public
                        execution I’m morally opposed to but politically committed to by dusk
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
            <Button
              text="Save"
              onPress={() => {
                addCharacter({
                  image: state.avatarUri!,
                  name: state.name,
                  textBackgroundColor: selectedCharacterTextBackgroundColor,
                  textColor: selectedCharacterTextColor,
                })
                setMode("choose-character")
              }}
            />
          </>
        )}
        {mode === "add-dialogue" && (
          <View style={$step2Container}>
            <View style={$characterDialogueContainer}>
              <Image source={{ uri: selectedItem?.image }} style={$dialogueCharacterImage} />
              <Text text={selectedItem?.name} />
            </View>
            <View>
              <TextField
                label="Add Character Dialogue"
                value={state.dialogue}
                multiline
                maxLength={360}
                onChangeText={(dialogue) => setState((s) => ({ ...s, dialogue }))}
                placeholder="Enter dialogue here"
                helper={`${state.dialogue?.length}/360 characters`}
                style={{
                  minHeight: 144,
                  padding: 12,
                  borderRadius: 12,
                  color: "white",
                }}
              />
            </View>
            <View>
              <Pressable
                onPress={pickAudio}
                disabled={!isPro}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderStyle: "dashed",

                  borderColor: "rgba(197, 206, 250, 0.50)",
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: "row", gap: 8, alignSelf: "center" }}>
                  <Icon icon="audio" size={24} />
                  <Text>{state.audioUri ? "Audio Selected ✔︎" : "Add Audio"}</Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#3997B4",
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    padding: 12,
                    borderRadius: 12,
                    gap: 4,
                  }}
                >
                  <Text text="Unlock Feature with" />
                  <ProBadge style={{ borderWidth: 1, borderColor: "#fff" }} />
                </View>
              </Pressable>
            </View>
            <Button text="Save" onPress={save} />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const $headerRow: ViewStyle = {
  flexDirection: "row",
  marginBottom: 20,
  justifyContent: "space-between",
}
const $subTitleContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  marginBottom: 14,
  gap: 24,
})
const $iconContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  backgroundColor: colors.palette.primary300,
  padding: 7,
  alignItems: "center",
})
const $iconInActiveContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  opacity: 0.2,
})
const $steps: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  gap: 8,
  alignItems: "center",
})
const $additionalImageContainer: ViewStyle = {
  flexDirection: "row",
  gap: 12,
}
const $additionalImageItem: ThemedStyle<ImageStyle> = ({ colors }) => ({
  borderWidth: 1,
  borderColor: "#fff",
  height: 50,
  width: 50,
  borderRadius: 25,
  alignItems: "center",
  justifyContent: "center",
})
const $additionalImageAddButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderWidth: 1,
  borderColor: "#fff",
  height: 50,
  width: 50,
  borderRadius: 25,
  alignItems: "center",
  justifyContent: "center",
  borderStyle: "dashed",
})
const $stepTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: spacing.sm,
  fontWeight: 700,
  lineHeight: 20,
})
const $stepDescription: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: spacing.sm + 2,
  fontWeight: 500,
  lineHeight: 20,
})
const $stepInActiveDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  opacity: 0.3,
})
const $imageSelectedStyle: ThemedStyle<ImageStyle> = ({ colors }) => ({
  borderWidth: 2,
  borderColor: colors.palette.primary200,
})
const $imageStyle: ThemedStyle<ImageStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral800,
  height: 88,
  width: 88,
  borderRadius: 44,
})
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

const $exampleDialogueContainer: ViewStyle = {
  flexDirection: "row",
  gap: 8,
}
const $selectedColor: ViewStyle = {
  flexDirection: "row",
  borderWidth: 4,
  borderColor: colors.palette.neutral100,
  height: 38,
  width: 38,
  borderRadius: 19,
}
const $labelStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 20,
  color: colors.fadedTint,
  marginBottom: 12,
})

const $dialogueCharacterImage: ImageStyle = {
  height: 62,
  width: 62,
  borderRadius: 31,
}
const $characterDialogueContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}
const $step2Container: ViewStyle = {
  gap: 24,
}
