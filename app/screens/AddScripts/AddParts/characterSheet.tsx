// CharacterSheet.tsx
import { useEffect, useState } from "react"
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

import { type BottomSheetController } from "@/components/AppBottomSheet"
import { Button } from "@/components/Button"
import { Icon, PressableIcon } from "@/components/Icon"
import { ProBadge } from "@/components/ProBadge"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { Dialogue, ScriptCharacter } from "@/interface/script"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { CharactersList } from "./characters/charactersList"
import { BackgroundColorType, CharacterForm, CharacterItem, TextColorType } from "./types"
import { AddCharacter } from "./characters/AddCharacter"
import { useScriptUpdateCharacter } from "@/querries/character"
import { toast } from "@/utils/toast"

export type CharacterResult = {
  id?: number
  name: string
  avatarUri?: string
  bubbleBg?: string
  textColor?: string
  dialogue: string
  audioFile?: DocumentPicker.DocumentPickerAsset | null
}

type Props = {
  characters: ScriptCharacter[]
  form: CharacterForm
  isPro: boolean
  setCharacterImage: (uri: string | null) => void
  setCharacterName: (name: string) => void
  setCharacterTextColor: (color: TextColorType) => void
  setCharacterTextBackgroundColor: (color: BackgroundColorType) => void
  addCharacter: (item: Omit<ScriptCharacter, "id" | "part">) => void
  onConfirm: (item: CharacterItem) => void
  selectedCharacterTextColor: TextColorType
  selectedCharacterTextBackgroundColor: BackgroundColorType
  onAddAdditionalImages: (uri: string) => void
  additionalImages: Array<string>
  onSave: (
    res: Omit<Dialogue, "id" | "part_id" | "created_at" | "dialogueCharacter"> & {
      audioFiLe?: DocumentPicker.DocumentPickerAsset | null
    },
  ) => void
  quota: { used: number; limit: number }
  onLimitReached: () => void
  isEditMode?: boolean
  setAdditionalImages?: (images: Array<string>) => void
  scriptId?: number
}

type Mode = "add-character" | "add-dialogue" | "choose-character"

export type CharacterSheetHandle = BottomSheetController & {
  openWith(prefill?: Partial<CharacterResult>): void
}

export const CharacterSheet = ({
  isPro,
  characters,
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
  isEditMode,
  setAdditionalImages,
  scriptId,
}: Props) => {
  const { themed } = useAppTheme()
  const [state, setState] = useState<CharacterResult>({
    name: "",
    avatarUri: undefined,
    bubbleBg: "#2C1A67",
    textColor: "#FFFFFF",
    dialogue: "",
    audioFile: null,
  })

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>("choose-character")
  const selectedItem = selectedIndex != null ? characters[selectedIndex] : null
  const updateScriptCharacter = useScriptUpdateCharacter()

  useEffect(() => {
    if (isEditMode && selectedItem) {
      setState({
        name: selectedItem?.name,
        avatarUri: selectedItem.image,
        textColor: selectedItem.text_color,
        bubbleBg: selectedItem.text_background_color,
        dialogue: "",
        id: selectedItem.id,
      })
      setCharacterTextColor(selectedItem.text_color)
      setCharacterTextBackgroundColor(selectedItem.text_background_color)
      if (selectedItem.additional_images) {
        setAdditionalImages?.(selectedItem.additional_images)
      }
    }
  }, [selectedIndex])

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
  const updateCharacter = (payload: ScriptCharacter) => {
    console.log("script_id", scriptId, payload.id, payload)

    updateScriptCharacter.mutate(
      {
        script_id: scriptId as number,
        character_id: payload.id,
        character: payload,
      },
      {
        onSuccess: () => {
          toast.success("Character updated successfully ")
        },
      },
    )
  }

  const pickAudio = async () => {
    // Gate for PRO
    if (!isPro) return
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: "audio/*",
      multiple: false,
    })
    if (res.assets) {
      setState((s) => ({ ...s, audioFile: res.assets[0] }))
    }
  }

  const save = () => {
    onSave({
      dialogue: state.dialogue,
      character_id: selectedItem?.id as number,
      audioFiLe: state.audioFile,
    })
    onSave(state)
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View>
        <View style={$headerRow}>
          <View style={$titleContainer}>
            <PressableIcon
              icon="arrowLeft"
              onPress={() => {
                setMode("choose-character")
              }}
            />
            <Text preset="titleHeading">
              {mode === "choose-character"
                ? isEditMode
                  ? "Manage Characters"
                  : "Add Dialogue"
                : isEditMode
                  ? "Edit Character"
                  : "Add Character"}
            </Text>
          </View>
          {(mode === "add-character" || isEditMode) && (
            <Text text={`${characters.length}/${quota.limit}`} />
          )}
        </View>
        {(mode === "add-dialogue" || mode === "choose-character") && !isEditMode && (
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
          <CharactersList
            selectedIndex={selectedIndex}
            setMode={setMode}
            selectedItem={selectedItem}
            characters={characters}
            quota={quota}
            onLimitReached={onLimitReached}
            setSelectedIndex={setSelectedIndex}
            isEditMode={isEditMode}
          />
        )}
        {mode === "add-character" && (
          <AddCharacter
            state={state}
            setMode={setMode}
            selectedCharacterTextBackgroundColor={selectedCharacterTextBackgroundColor}
            selectedCharacterTextColor={selectedCharacterTextColor}
            setState={setState}
            pickAvatar={pickAvatar}
            addCharacter={addCharacter}
            additionalImages={additionalImages}
            setCharacterTextBackgroundColor={setCharacterTextBackgroundColor}
            setCharacterTextColor={setCharacterTextColor}
            onUpdate={updateCharacter}
            isEditMode={isEditMode}
          />
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
                  <Text numberOfLines={1}>
                    {state.audioFile ? state.audioFile.name : "Add Audio"}
                  </Text>
                </View>
                {!isPro && (
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
                )}
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

const $titleContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}
