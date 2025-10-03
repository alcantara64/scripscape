import { useCallback } from "react"
import { Pressable, View } from "react-native"
import { Image, ImageStyle } from "expo-image"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { ListView } from "@/components/ListView"
import { Text } from "@/components/Text"
import { ScriptCharacter } from "@/interface/script"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

type Mode = "add-dialogue" | "add-character" | "choose-character"
type Props = {
  characters: Array<ScriptCharacter>
  onLimitReached: () => void
  setMode: (mode: Mode) => void
  quota: any
  selectedIndex: number | null
  setSelectedIndex: (index: number) => void
  selectedItem: ScriptCharacter | null
  isEditMode?: boolean
}

export const CharactersList = ({
  characters,
  onLimitReached,
  setMode,
  quota,
  selectedIndex,
  setSelectedIndex,
  selectedItem,
  isEditMode,
}: Props) => {
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const onContinue = () => {
    if (isEditMode) {
      setMode("add-character")
    } else {
      setMode("add-dialogue")
    }
  }
  const LocationSeparator = useCallback(() => <View style={{ height: 12 }} />, [])
  const keyExtractor = useCallback(
    (item: ScriptCharacter, index: number) => `${item.name}-${index}`,
    [],
  )
  const RenderItem = useCallback(
    ({ item, index }: { item: ScriptCharacter; index: number }) => {
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
    [selectedIndex, themed, setSelectedIndex],
  )
  return (
    <>
      <ListView<ScriptCharacter>
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

        <Button disabled={!selectedItem} text="Continue" onPress={onContinue} />
      </View>
    </>
  )
}

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
