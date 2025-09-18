import { FC, useCallback, useMemo, useState } from "react"
import { Platform, Pressable, SafeAreaView, TextStyle, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist"

import { Icon, PressableIcon } from "@/components/Icon"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import AddPart from "./AddScripts/AddPart"
import { Part } from "./AddScripts/AddParts/types"

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
  const scriptId = route?.params?.scriptId
  console.log({ scriptId })
  const [parts, setParts] = useState<Part[]>([
    { id: "p1", title: "A Chance Encounter", blurb: "Tucked between misty hills and a quiet…" },
    {
      id: "p2",
      title: "A Chance Encounter 2",
      blurb: "Tucked between misty hills and a quiet… 333",
    },
  ])
  const pendingParts = parts

  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newBlurb, setNewBlurb] = useState("")
  const [selectedPart, setSelectedPart] = useState<(Part & { currentIndex: number }) | null>(null)

  const confirmAdd = () => {
    if (!newTitle.trim()) return
    setParts((prev) => [
      ...prev,
      { id: `p${Date.now()}`, title: newTitle.trim(), blurb: newBlurb.trim() || undefined },
    ])
    setNewTitle("")
    setNewBlurb("")
    setShowAdd(false)
  }

  const onDragEnd = useCallback(({ data }: { data: Part[] }) => {
    setParts(data)
  }, [])

  const publishDisabled = useMemo(() => pendingParts.length === 0, [pendingParts.length])

  const handleSave = (draft: Omit<Part, "id">) => {
    const id = `p_${Date.now()}`
    setParts((prev) => [...prev, { id, ...draft }])
    setShowAdd(false)
  }

  const handleUpdate = (id: string, patch: Omit<Part, "id">) => {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    setShowAdd(false)
  }

  const renderItem = useCallback(
    ({ item, getIndex, drag, isActive }: RenderItemParams<Part>) => (
      <Pressable
        onLongPress={drag}
        onPress={() => {
          setSelectedPart({ ...item, currentIndex: getIndex()! + 1 })
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
            {!!item.blurb && (
              <Text size="xs" numberOfLines={1} style={themed($dim)}>
                {item.blurb}
              </Text>
            )}
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
              data={parts}
              keyExtractor={(i) => i.id}
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
            onBack={() => setShowAdd(false)}
            nextPartNumber={parts.length + 1}
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

const $addDashed: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
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

const $publishTxt: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
})

const $modalCard: ThemedStyle<ViewStyle> = ({ colors, spacing, radii }) => ({
  width: "90%",
  borderRadius: radii.lg,
  backgroundColor: colors.background,
  padding: spacing.lg,
  gap: spacing.sm,
})

const $input: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: spacing.md,
  paddingHorizontal: spacing.md,
  paddingVertical: Platform.select({ ios: spacing.md, android: spacing.sm }),
  color: colors.text,
})

const $btnOutlined: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: spacing.md,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.sm,
  marginRight: spacing.sm,
})

const $btnFilled: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  borderRadius: spacing.md,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.sm,
})
