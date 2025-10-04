import { FC, useCallback, useMemo, useState } from "react"
import { Pressable, SafeAreaView, TextStyle, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist"

import { Icon, PressableIcon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { Part } from "@/interface/script"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import {
  useCreateScriptPart,
  useGetPartsByScript,
  useOrderScriptParts,
  useUpdateScriptPart,
} from "@/querries/script"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import AddPart from "./AddScripts/AddPart"

// import { useNavigation } from "@react-navigation/native"

interface WriteScriptTableContentsScreenProps
  extends AppStackScreenProps<"WriteScriptTableContents"> {}

export const WriteScriptTableContentsScreen: FC<WriteScriptTableContentsScreenProps> = ({
  route,
}) => {
  // Pull in navigation via hook
  const navigation = useNavigation()
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()
  const { mutate } = useCreateScriptPart()
  const orderMutation = useOrderScriptParts()
  const updateScriptPart = useUpdateScriptPart()
  const scriptId = route?.params?.scriptId
  const { data: parts } = useGetPartsByScript(scriptId)

  const pendingParts = parts

  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)

  const confirmAdd = (index: number, content: string) => {
    if (!newTitle.trim()) return

    setNewTitle("")
    setShowAdd(false)
  }

  const onDragEnd = useCallback(({ data }: { data: Part[] }) => {
    orderMutation.mutate({ script_id: scriptId, parts: data })
  }, [])

  const publishDisabled = useMemo(() => pendingParts?.length === 0, [pendingParts?.length])

  const handleSave = (draft: Omit<Part, "id" | "script_id">) => {
    mutate(
      { script_id: scriptId, title: newTitle, index: draft.index, content: draft.content },
      {
        onSuccess(data, variables, context) {
          if (data) {
            setSelectedPart(data)
          }
        },
      },
    )
    setShowAdd(true)
  }

  const handleUpdate = (part_id: number, patch: Omit<Part, "part_id">) => {
    updateScriptPart.mutate({ part_id, part: patch })
    setShowAdd(true)
  }

  const renderItem = useCallback(
    ({ item, getIndex, drag, isActive }: RenderItemParams<Part>) => (
      <Pressable
        onLongPress={drag}
        onPress={() => {
          setSelectedPart(item)
          setShowAdd(true)
        }}
        disabled={isActive}
        style={[themed($card), isActive && { opacity: 0.9 }]}
      >
        <View style={$row}>
          {/* Drag handle */}
          <View style={$handleCol}>
            <Icon icon="drag" size={22} color={colors.palette.neutral300} />
          </View>

          {/* Content */}
          <View style={$contentCol}>
            <Text size="xxs" style={themed($partBadge)}>
              PART {getIndex()! + 1}
            </Text>
            <Text preset="subheading" weight="semiBold">
              {item.title}
            </Text>
          </View>

          <Icon icon="caretRight" size={24} color={colors.palette.neutral300} />
        </View>
      </Pressable>
    ),
    [themed],
  )

  return (
    <SafeAreaView style={$root}>
      <View
        style={$root}
        preset="fixed"
        safeAreaEdges={["top", "bottom", "left"]}
        gradientColors={["#4b276b", "#0e1636"]}
      >
        {!showAdd ? (
          <View style={$contentContainer}>
            <View style={themed($headerRow)}>
              <PressableIcon
                icon="arrowLeft"
                onPress={() => {
                  navigation.goBack()
                }}
              />
              <Text preset="sectionHeader" weight="semiBold">
                Edit Table of Contents
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <DraggableFlatList
              data={parts || []}
              keyExtractor={(i) => i.part_id.toString()}
              onDragEnd={onDragEnd}
              renderItem={renderItem}
              containerStyle={{ gap: spacing.sm }}
              extraData={parts}
              contentContainerStyle={{ gap: spacing.sm }}
            />
            <Pressable
              style={themed($addDashed)}
              onPress={() => {
                setSelectedPart(null)
                setShowAdd(true)
              }}
            >
              <Icon icon="plus" size={24} />
              <Text weight="medium">Add New Part</Text>
            </Pressable>
          </View>
        ) : (
          <AddPart
            script_id={scriptId}
            onBack={() => setShowAdd(false)}
            nextPartNumber={parts?.length || 0 + 1}
            selectedPart={selectedPart}
            onSave={handleSave}
            onUpdate={handleUpdate}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
const $contentContainer: ViewStyle = { flex: 1, paddingHorizontal: 24 }

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
  gap: spacing.xs,
})

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: spacing.lg,
  padding: spacing.md,
  backgroundColor: colors.background, // use card color if you have one
})

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}

const $handleCol: ViewStyle = {
  paddingRight: 4,
}

const $contentCol: ViewStyle = {
  flex: 1,
  gap: 2,
}

const $partBadge: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tintInactive,
  lineHeight: 20,
  fontSize: 14,
  fontWeight: 300,
})

const $dim: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.accentActive,
})

const $addDashed: ThemedStyle<ViewStyle> = ({ spacing }) => ({
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

const $publishBtn: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 48,
  borderRadius: spacing.lg,
  backgroundColor: colors.tint,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.lg,
})
