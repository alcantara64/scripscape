import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import * as DocumentPicker from "expo-document-picker"
import { Image, ImageStyle } from "expo-image"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { ScriptCharacter } from "@/interface/script"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { TEXT_BACKGROUND_COLORS, TEXT_COLOR } from "../editorConstant"
import { BackgroundColorType, TextColorType } from "../types"

type Mode = "add-dialogue" | "add-character" | "choose-character"
type Props = {
  state: {
    id?: number
    name: string
    avatarUri?: string
    bubbleBg?: string
    textColor?: string
    dialogue: string
    audioFile?: DocumentPicker.DocumentPickerAsset | null
  }
  pickAvatar: (status: boolean) => void
  additionalImages: Array<string>
  setCharacterTextBackgroundColor: (color: BackgroundColorType) => void
  setCharacterTextColor: (color: TextColorType) => void
  setState: (ubs: any) => void
  addCharacter: (item: Omit<ScriptCharacter, "id" | "part">) => void
  setMode: (mode: Mode) => void
  selectedCharacterTextColor: TextColorType
  selectedCharacterTextBackgroundColor: BackgroundColorType
  isEditMode?: boolean
  onUpdate?: (item: Omit<ScriptCharacter, "part">) => void
}

export const AddCharacter = ({
  state,
  pickAvatar,
  additionalImages,
  setCharacterTextBackgroundColor,
  setCharacterTextColor,
  setState,
  addCharacter,
  setMode,
  selectedCharacterTextBackgroundColor,
  selectedCharacterTextColor,
  isEditMode,
  onUpdate,
}: Props) => {
  const { themed } = useAppTheme()

  const saveAndUpdateCharacter = () => {
    if (isEditMode && state.id) {
      onUpdate?.({
        image: state.avatarUri!,
        name: state.name,
        text_background_color: selectedCharacterTextBackgroundColor,
        text_color: selectedCharacterTextColor,
        id: state.id!,
        additional_images: additionalImages,
      })
    } else {
      addCharacter({
        image: state.avatarUri!,
        name: state.name,
        text_background_color: selectedCharacterTextBackgroundColor,
        text_color: selectedCharacterTextColor,
        additional_images: additionalImages,
      })
      setMode("choose-character")
    }
  }
  return (
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
            <View style={{ width: 94, height: 94, borderRadius: 47, backgroundColor: "#3A2A84" }} />
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
                key={additionalImage}
                source={{ uri: additionalImage }}
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
      <View style={$actionContainer}>
        <Button text={isEditMode ? "Save Changes" : "Save"} onPress={saveAndUpdateCharacter} />
      </View>
    </>
  )
}

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
const $exampleDialogueContainer: ViewStyle = {
  flexDirection: "row",
  gap: 8,
}
const $actionContainer: ViewStyle = {
  marginBottom: 24,
}
