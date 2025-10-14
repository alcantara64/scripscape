import { useCallback, useEffect, useState } from "react"
import { ImageStyle, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { Image } from "expo-image"

import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useGetDialogueById } from "@/querries/character"
import { DialogueData, updateDialogue } from "@/utils/insertDialogueBubble"

type Props = {
  sheetRef: any
  diaLogueId: number
  initialDialogueText: string
  editorRef: any
}

export const UpdateDialogue = (prop: Props) => {
  const { sheetRef, diaLogueId, initialDialogueText, editorRef } = prop
  const { isLoading, data } = useGetDialogueById(diaLogueId)
  const [dialogueText, setDialogueText] = useState("")
  const [selectedImage, setSelectedImage] = useState("")
  const [isSelectImageMode, setSelectedImageMode] = useState(false)

  useEffect(() => {
    if (initialDialogueText) {
      setDialogueText(initialDialogueText)
      setSelectedImage(data?.dialogueCharacter?.image || "")
    }
  }, [data?.dialogueCharacter, initialDialogueText])

  const onSave = useCallback(async () => {
    if (!diaLogueId) return
    await updateDialogue(editorRef, {
      id: diaLogueId.toString(),
      name: data?.dialogueCharacter.name,
      textColor: data?.dialogueCharacter.text_color,
      bubbleColor: data?.dialogueCharacter.text_background_color,
      message: dialogueText,
      audioUrl: data?.audio_uri,
      avatarUrl: selectedImage,
    })
    sheetRef.current.close()
  }, [diaLogueId, editorRef, dialogueText])
  if (isLoading) return <Text text="loading..." />
  return (
    <View>
      <View style={$headerRow}>
        <View style={$titleContainer}>
          <PressableIcon
            icon="arrowLeft"
            onPress={() => {
              sheetRef.current.close()
            }}
          />
          <Text preset="titleHeading">Update Dialogue</Text>
        </View>
      </View>
      <View style={$step2Container}>
        <View style={$characterDialogueContainer}>
          {!isSelectImageMode && (
            <Image source={{ uri: selectedImage }} style={$dialogueCharacterImage} />
          )}
          {isSelectImageMode &&
            [data?.dialogueCharacter.image, ...data?.dialogueCharacter.additional_images]?.map(
              (uri) => (
                <Pressable
                  key={uri}
                  onPress={() => {
                    setSelectedImage(uri)
                    setSelectedImageMode(false)
                  }}
                >
                  <Image style={$dialogueCharacterImage} source={{ uri }} />
                </Pressable>
              ),
            )}

          {!isSelectImageMode && (
            <View>
              <Text text={data?.dialogueCharacter?.name} />
              {!!data?.dialogueCharacter &&
                !!data.dialogueCharacter.additional_images &&
                data?.dialogueCharacter?.additional_images?.length > 0 &&
                !isSelectImageMode && (
                  <Button
                    text="Change"
                    onPress={() => {
                      setSelectedImageMode(true)
                    }}
                  />
                )}
            </View>
          )}
        </View>
        <View>
          <TextField
            label="Update Character Dialogue"
            value={dialogueText}
            multiline
            maxLength={360}
            onChangeText={setDialogueText}
            placeholder="Enter dialogue here"
            helper={`${dialogueText?.length}/360 characters`}
            style={$textField}
          />
        </View>

        <Button disabled={isSelectImageMode || !dialogueText} text="Save" onPress={onSave} />
      </View>
    </View>
  )
}

const $headerRow: ViewStyle = {
  flexDirection: "row",
  marginBottom: 20,
  justifyContent: "space-between",
}
const $titleContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}
const $dialogueCharacterImage: ImageStyle = {
  height: 62,
  width: 62,
  borderRadius: 31,
}
const $step2Container: ViewStyle = {
  gap: 24,
}
const $characterDialogueContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}

const $textField: TextStyle = {
  minHeight: 144,
  padding: 12,
  borderRadius: 12,
  color: "white",
}
