import { useMemo, useRef, useState } from "react"
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleProp,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Button } from "./Button"
import { Icon } from "./Icon"
import { TextField } from "./TextField"

export interface TagSheetProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  onBack: () => void
  onSave: (tags: Array<string>) => void
}
const SUGGESTIONS = ["Battlestargalaxy", "Stargalaxy", "Stars", "Startrek", "Starwars", "Starlawn"]
const LAVENDER = "#C8C2EA"
const LAVENDER_DIM = "#A7A0CE"
const OUTLINE = "rgba(200,194,234,0.35)"
/**
 * Describe your component here
 */
export const TagSheet = (props: TagSheetProps) => {
  const { style, onBack, onSave } = props
  const [tags, setTags] = useState<Array<string>>([])
  const $styles = [$container, style]
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const inputRef = useRef<TextInput>(null)

  const [input, setInput] = useState("")
  // example prefilled

  const canAddMore = tags.length < 5

  const filteredSuggestions = useMemo(() => {
    const q = input.replace(/\s+/g, "").toLowerCase()
    return SUGGESTIONS.filter(
      (s) =>
        !tags.map((t) => t.toLowerCase()).includes(s.toLowerCase()) &&
        (!q || s.toLowerCase().includes(q)),
    )
  }, [input, tags])

  const sanitize = (raw: string) => raw.replace(/\s+/g, "").slice(0, 25) // no spaces, max 25

  const tryAddTag = (raw: string) => {
    if (!canAddMore) return
    const clean = sanitize(raw)
    if (!clean) return
    const exists = tags.some((t) => t.toLowerCase() === clean.toLowerCase())
    if (exists) return

    setTags((prev) => [...prev, clean])
    setInput("")
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const removeTag = (name: string) => {
    setTags((prev) => prev.filter((t) => t !== name))
  }

  const onSubmitEditing = () => tryAddTag(input)

  const renderSuggestion = ({ item }: { item: string }) => (
    <Pressable
      onPress={() => tryAddTag(item)}
      style={({ pressed }) => [$suggestion, pressed && { opacity: 0.7 }]}
    >
      <Text style={$suggestionText}>#{item}</Text>
    </Pressable>
  )

  return (
    <View style={$styles}>
      <KeyboardAvoidingView
        style={themed($screen)}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon icon="arrowLeft" size={24} color={colors.tintInactive} />
          </Pressable>
          <View>
            <Text preset="contentTitle" style={themed($title)}>
              Edit Tag
            </Text>
          </View>
        </View>
        <View>
          <View style={$inputWrapper}>
            {tags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => removeTag(tag)}
                hitSlop={8}
                style={({ pressed }) => [$chip, pressed && { opacity: 0.8 }]}
              >
                <Text style={$chipText}>#{tag}</Text>
                <Text style={$chipClose}> ×</Text>
              </Pressable>
            ))}

            {canAddMore && (
              <TextField
                ref={inputRef}
                inputWrapperStyle={$input}
                value={input}
                onChangeText={(t) => setInput(sanitize(t))}
                onSubmitEditing={onSubmitEditing}
                placeholder="Stars"
                placeholderTextColor="#A7A0CE"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
            )}
          </View>
          {/* Helper */}
          <Text style={$helper}>Add up to 5 tags (max 25 characters, no spaces)</Text>

          {/* Suggestions */}
          <FlatList
            data={filteredSuggestions}
            extraData={filteredSuggestions}
            keyExtractor={(item) => item}
            renderItem={renderSuggestion}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
          <Button
            text="Save Changes"
            onPress={() => {
              onSave(tags)
            }}
            disabled={tags.length < 1}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
}
const $screen: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})
const $title: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
})
const $inputWrapper: ViewStyle = {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: OUTLINE,
  paddingHorizontal: 12,
  paddingVertical: 4,
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  alignContent: "space-between",
  gap: 8,
}
const $chipText: TextStyle = {
  color: LAVENDER,
  fontSize: 10,
  fontWeight: 400,
  lineHeight: 14,
}
const $chipClose: TextStyle = {
  color: LAVENDER_DIM,
  fontSize: 16,
  marginLeft: 6,
  lineHeight: 16,
}
const $suggestion: ViewStyle = {
  alignSelf: "flex-start",
  paddingVertical: 4,
  paddingHorizontal: 23,
  borderRadius: 24,
  borderWidth: 0.5,
  borderColor: OUTLINE,
  marginTop: 14,
}
const $suggestionText: TextStyle = {
  color: LAVENDER,
  fontWeight: "700",
  fontSize: 16,
}
const $input: TextStyle = {
  minWidth: 80,
  flexGrow: 1,
  color: "#FFFFFF",
  fontSize: 16,
  paddingVertical: 6,
  borderWidth: 0,
}
const $helper: TextStyle = {
  marginTop: 8,
  color: LAVENDER_DIM,
  fontSize: 12,
}
const $chip: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: OUTLINE,
  backgroundColor: "transparent",
}
