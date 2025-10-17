import { FC, useCallback, useMemo, useRef, useState } from "react"
import {
  Pressable,
  View,
  ViewStyle,
  TextStyle,
  ImageStyle,
  StyleSheet,
  TouchableOpacity,
} from "react-native"
import { ImageBackground } from "expo-image"
import { useNavigation } from "@react-navigation/native"

import { AppBottomSheet, BottomSheetController } from "@/components/AppBottomSheet"
import { ConfirmAction } from "@/components/ConfirmAction"
import { Icon, PressableIcon } from "@/components/Icon"
import { Line } from "@/components/Line"
import { ListView } from "@/components/ListView"
import { Screen } from "@/components/Screen"
import { ScriptCard } from "@/components/ScriptCard"
import { ScriptOverviewSkeleton } from "@/components/skeleton/screens/ScriptOverviewSkeleton"
import { SmartImage } from "@/components/SmartImage"
import { Text } from "@/components/Text"
import { IScript, ScriptStatus, WriterStatus } from "@/interface/script"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useEmbeddedImagesByScript } from "@/querries/embedded-images"
import { useGetLocationImagesByScriptId } from "@/querries/location"
import {
  useDeleteScript,
  useGetScriptById,
  useGetScriptRecommendationByScriptId,
  useToggleScriptLike,
  useTrackScriptView,
} from "@/querries/script"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"
import { formatDate, formatNumber } from "@/utils/formatDate"
import { toast } from "@/utils/toast"
import { useQuota } from "@/utils/useQuota"

import { CharacterSheet } from "./AddScripts/AddParts/characterSheet"
import { TabKey } from "./AddScripts/AddParts/editorConstant"
import { EmbeddedImageSheet } from "./AddScripts/AddParts/embeddedImageSheet"
import { LocationSheet } from "./AddScripts/AddParts/locationSheet"
import { useDialogue } from "./AddScripts/AddParts/useDialogue"
import { useLocations } from "./AddScripts/AddParts/useLocation"
import { Button } from "@/components/Button"

interface ScriptDetailScreenProps extends AppStackScreenProps<"ScriptDetail"> {}

type Mode =
  | "manage-location"
  | "manage-characters"
  | "manage-images"
  | "settings"
  | "confirm-delete"

export const ScriptDetailScreen: FC<ScriptDetailScreenProps> = ({ route }) => {
  const { script_id } = route.params
  const { themed } = useAppTheme()
  const navigation = useNavigation()

  const sheetRef = useRef<BottomSheetController>(null)

  const { isLoading, data: scriptData } = useGetScriptById(script_id)
  const [mode, setMode] = useState<Mode>("settings")
  const [snapPoints, setSnaPoints] = useState("34%")

  const [currentTab, setCurrentTab] = useState<TabKey>("last_used")
  const [embeddedCurrentTab, setEmbeddedCurrentTab] = useState<TabKey>("last_used")
  const { data: embeddedImages } = useEmbeddedImagesByScript(script_id)
  const {
    data: recData,
    isLoading: isLoadingRecommendation,
    isError: isRecommendationError,
  } = useGetScriptRecommendationByScriptId(script_id)

  const { data } = useGetLocationImagesByScriptId(script_id)
  const deleteScriptMutation = useDeleteScript()
  const likeMut = useToggleScriptLike(script_id)
  const {
    sortedLocations,
    locationForm,
    setImage,
    setName,
    setHideName,
    setLocationForm,
    resetForm,
  } = useLocations({ currentTab, locations: data?.items || [] })
  console.log(scriptData)
  const {
    characters,
    selectedBackgroundColor,
    selectedTextColor,
    setSelectedBackgroundColor,
    setSelectedTextColor,
    additionalImages,
    addCharacter,
    characterForm,
    onAddMoreImages,
    setAdditionalImages,
  } = useDialogue({ scriptId: script_id })

  const { quota } = useQuota({
    isPro: false,
    used: {
      embedded: embeddedImages?.items.length || 0,
      location: sortedLocations.length,
      character: characters.length,
    },
  })
  useTrackScriptView(script_id)
  const scriptManipulators = useMemo(
    () => [
      {
        icon: "edit",
        label: "Edit Table Of Contents ",
        action: () => {
          navigation.navigate("WriteScriptTableContents", { scriptId: script_id })
        },
      },
      {
        icon: "person",
        label: "Manage Characters ",
        action: () => {
          setSnaPoints("85%")
          setMode("manage-characters")
        },
      },
      {
        icon: "gps",
        label: "Manage Locations",
        action: () => {
          setSnaPoints("85%")
          setMode("manage-location")
        },
      },
      {
        icon: "image",
        label: "Manage Images",
        action: () => {
          setSnaPoints("85%")
          setMode("manage-images")
        },
      },
      {
        icon: "trash",
        label: "Delete This Script",
        action: () => {
          console.log("delete")
          setMode("confirm-delete")
        },
      },
    ],
    [script_id, navigation],
  )

  const renderBottomSheetItem = useCallback(
    (icon: string, label: string, action: () => void) => (
      <Pressable key={label} style={$navigationItem} onPress={action}>
        <Icon icon={icon} size={24} />
        <Text text={label} style={themed($navigationText)} />
      </Pressable>
    ),
    [themed],
  )

  const gotoPart = (partId: number) => {
    navigation.navigate("ScriptPart", { part_id: partId })
  }

  const openBottomSheet = () => {
    setSnaPoints("34%")
    setMode("settings")
    sheetRef.current?.open()
  }
  const goToEditOverview = () => {
    navigation.navigate("EditOverview", { script_id })
  }

  const startReading = () => {
    const firstPart = scriptData?.parts[0]
    navigation.navigate("ScriptPart", { part_id: firstPart?.part_id })
  }
  const onPressLike = () => likeMut.mutate(!(scriptData?.likedByMe ?? false))

  const deleteScript = async () => {
    try {
      await deleteScriptMutation.mutateAsync({ scriptId: script_id })
      toast.success("Script Deleted successfully")
      navigation.navigate("Demo", { screen: "MyScripts" })
      setMode("settings")
    } catch (e) {
      console.error(e)
      toast.error("Could not delete script, please try again letter")
    }
  }

  if (isLoading) {
    return <ScriptOverviewSkeleton />
  }
  const gotoDetailScreen = (script_id: number) => {
    navigation.navigate("ScriptDetail", { script_id })
  }

  return (
    <>
      <Screen
        style={$root}
        preset="scroll"
        safeAreaEdges={["top"]}
        ScrollViewProps={{ stickyHeaderIndices: [0] }}
      >
        <View>
          <View style={themed($headerContainer)}>
            <View style={$headTextContainer}>
              <TouchableOpacity onPress={navigation.goBack}>
                <Icon icon="arrowLeft" />
              </TouchableOpacity>
              <Text text="Overview" preset="sectionHeader" />
              {scriptData?.status !== ScriptStatus.published && (
                <View style={themed($draft)}>
                  <Icon icon="write" color="#FFC773" size={11} />
                  <Text text="Draft" style={themed($draftText)} />
                </View>
              )}
            </View>
            {scriptData?.isOwner && (
              <Pressable
                onPress={goToEditOverview}
                style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
              >
                <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                  <PressableIcon icon="edit" size={20} color="#fff" />
                  <Text text="Edit" style={{ fontSize: 14, fontWeight: 500 }} />
                </View>
                <PressableIcon icon="circledEllipsis" size={20} onPress={openBottomSheet} />
              </Pressable>
            )}
          </View>
        </View>
        <View style={$heroWrap}>
          <ImageBackground
            source={{
              uri: scriptData?.cover_image_url,
            }}
            placeholder={{ blurhash: scriptData?.blurhash }}
            imageStyle={$heroImage}
            style={$hero}
          >
            <View style={$heroOverlay} />
            <View style={$heroHeaderRow}>
              <View style={$statusContainer(scriptData?.writerStatus)}>
                <Text style={themed($statusText)}>
                  {scriptData?.writerStatus === WriterStatus.completed.toLowerCase()
                    ? "Completed"
                    : "In Progress"}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
        <View style={$coverMeta}>
          <Text preset="sectionHeader">{scriptData?.title}</Text>
          <View style={$authorAndFollowSection}>
            <View style={$authorRow}>
              <SmartImage
                image={{ uri: scriptData?.author.profile_picture_url }}
                blurhash={scriptData?.author.profile_picture_blurhash}
                imageStyle={$avatar}
              />

              <View>
                <Text size="xs" style={$muted}>
                  {scriptData?.author.username}
                </Text>
                <Text
                  preset="description"
                  text={`${formatNumber(scriptData?.author._count.followers || 0)} Followers`}
                />
              </View>
            </View>
            {!scriptData?.isOwner && (
              <Pressable style={$followButton}>
                <Icon icon="person" size={16} />
                <Text text="Follow" />
              </Pressable>
            )}
          </View>
        </View>
        {/* Description */}
        <View>
          <Text style={$descriptionTitle} text="Description" />
          <Text preset="description" style={$descriptionText}>
            {scriptData?.summary}
          </Text>

          <View style={$statsRow}>
            <Stat icon="view" label={formatNumber(scriptData?.views_count || 0)} />
            <Stat
              icon="like"
              onPress={onPressLike}
              label={formatNumber(scriptData?.likes_count || 0)}
            />
          </View>

          <Button
            disabled={scriptData?.parts && scriptData?.parts.length < 1}
            style={themed($cta)}
            onPress={startReading}
          >
            <Text weight="semiBold" style={$ctaText}>
              Start Reading
            </Text>
          </Button>
          <Line />
        </View>

        {/* Writer's Notes */}
        {scriptData?.writer_note && (
          <View style={themed($card)}>
            <Text text="Writer’s Notes" style={$writerNoteTitle} />
            <View>
              <Text size="xs" style={$lastUpdated}>
                Last updated 3d ago
              </Text>
              <Text preset="description" style={[$bodyText, { marginBottom: 20 }]}>
                New updates! After reader comments on the last chapter, I refined the scene pacing
                and added a conversation where Laila confronts her own expectations. Check out the
                latest update.
              </Text>
              <Line />
              <Pressable style={$linkRow}>
                <Text preset="readMore">View more</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!!scriptData?.comments_count && scriptData?.comments_count > 0 && (
          <View style={$sectionContainer}>
            <View style={$titleItemsContainer}>
              <View style={$commentContainer}>
                <Text preset="contentTitle" text="Comments" />
                <View style={themed($commentCountContainer)}>
                  <Text style={themed($statusText)} text="2.4k" />
                </View>
              </View>
              <Text preset="readMore" text="View more" />
            </View>
            <View style={$commentRow}>
              <View style={$avatarLg} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text weight="medium" size="sm">
                    Oscar Halton
                  </Text>
                  <Text preset="description">2 weeks ago</Text>
                </View>
                <Text preset="description" style={$commentText}>
                  This script beautifully captures the emotional complexity of love that transcends
                  distance, culture, and circumstance. ....
                </Text>
                <View style={$commentsStatsRow}>
                  <Stat icon="like" label="45 likes" size={12} />
                  <Stat icon="reply" label="5 Replies" size={12} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Parts list */}
        {scriptData?.parts && scriptData?.parts.length > 0 && (
          <View>
            <View style={$titleItemsContainer}>
              <Text preset="contentTitle" text="Parts" />
              <View style={{ flexDirection: "row", gap: 4, alignItems: "center", marginBottom: 4 }}>
                <Icon icon="part" color="#C8D0FF" size={20} />
                <Text
                  text={`${scriptData?.parts_count} Parts`}
                  preset="description"
                  style={$partsTextStyle}
                />
              </View>
            </View>
            {scriptData?.parts.map((p) => (
              <Pressable
                key={p.part_id}
                style={themed($partRow)}
                onPress={() => {
                  gotoPart(p.part_id)
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text weight="medium">&quot;{p.title}&rdquo;</Text>
                  <Text preset="description">{formatDate(p.created_at)}</Text>
                </View>
                <PressableIcon icon="caretRight" />
              </Pressable>
            ))}
          </View>
        )}
        {/* Recommendations */}
        {!isLoadingRecommendation && !isRecommendationError && recData?.recommendations && (
          <View>
            <View>
              <Text preset="contentTitle" text="You Might Also Like" />
            </View>
            <ListView<IScript>
              data={recData.recommendations}
              numColumns={2}
              extraData={recData.recommendations}
              estimatedItemSize={180}
              keyExtractor={(it) => it.script_id.toString()}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              contentContainerStyle={{ paddingVertical: 6 }}
              renderItem={({ item }) => (
                <ScriptCard
                  isVertical
                  script_id={item.script_id}
                  viewsCount={item.views_count}
                  title={item.title}
                  status={item.status}
                  likedCount={item.likes_count}
                  numberOfParts={item.parts_count}
                  description={item.summary}
                  imageSource={{ uri: item.cover_image_url }}
                  commentsCount={item.comments_count}
                  writerStatus={item.writerStatus}
                  onPress={() => {
                    gotoDetailScreen(item.script_id)
                  }}
                />
              )}
            />
          </View>
        )}
      </Screen>
      <AppBottomSheet
        controllerRef={sheetRef}
        snapPoints={["34%", "85%"]}
        onChange={(index) => {
          if (index < 1) {
            // sheetRef.current?.collapse()
            // sheetRef.current?.close()
          }
        }}
      >
        <View style={{ gap: 20, marginTop: 10 }}>
          {mode === "settings" &&
            scriptManipulators.map((item) =>
              renderBottomSheetItem(item.icon, item.label, item.action),
            )}
          {mode === "manage-characters" && (
            <CharacterSheet
              quota={quota.character}
              isPro={true}
              onSave={async () => {
                // await onCharacterSave(res)
                // sheetRef.current?.close()
              }}
              selectedCharacterTextBackgroundColor={selectedBackgroundColor}
              selectedCharacterTextColor={selectedTextColor}
              characters={characters}
              setCharacterTextColor={setSelectedTextColor}
              setCharacterTextBackgroundColor={setSelectedBackgroundColor}
              additionalImages={additionalImages}
              onAddAdditionalImages={onAddMoreImages}
              addCharacter={addCharacter}
              onConfirm={() => {}}
              form={characterForm}
              setCharacterImage={() => {}}
              setCharacterName={() => {}}
              onLimitReached={() => {}}
              isEditMode
              setAdditionalImages={setAdditionalImages}
              scriptId={script_id}
            />
          )}
          {mode === "manage-location" && (
            <LocationSheet
              script_id={script_id}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              quotaLimit={quota.location.limit}
              locations={sortedLocations}
              form={locationForm}
              setImage={setImage}
              setName={setName}
              setLocationForm={setLocationForm}
              setHideName={setHideName}
              addLocation={() => {
                resetForm()
              }}
              onConfirm={() => {}}
              onLimitReached={() => {}}
              isEditMode
            />
          )}
          {mode === "manage-images" && (
            <EmbeddedImageSheet
              currentTab={embeddedCurrentTab}
              setCurrentTab={setEmbeddedCurrentTab}
              quotaLimit={quota.embedded.limit}
              embeddedImages={embeddedImages?.items || []}
              onLimitReached={() => {}}
              scriptId={script_id}
            />
          )}
          {mode === "confirm-delete" && (
            <ConfirmAction
              style={{ marginTop: 8 }}
              onCancel={() => setMode("settings")}
              onConfirm={deleteScript}
              title={`Delete ${scriptData?.title}`}
              question={`Are you sure you wanna delete this script`}
            />
          )}
        </View>
      </AppBottomSheet>
    </>
  )
}

const Stat = ({
  icon,
  label,
  size,
  onPress,
}: {
  icon: string
  label: string
  size?: number
  onPress?: () => void
}) => (
  <View style={$stat}>
    <PressableIcon icon={icon} onPress={onPress} color="#fff" size={size || 28} />
    <Text size="xs" style={$muted}>
      {label}
    </Text>
  </View>
)
const $root: ViewStyle = { flex: 1, paddingHorizontal: 16 }
const $headerContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})
const $headTextContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}

const $muted: TextStyle = { fontSize: 14, fontWeight: 600, lineHeight: 16 }
const $bodyText: TextStyle = { lineHeight: 20 }
const $descriptionText: TextStyle = { lineHeight: 20, fontSize: 14 }
const $descriptionTitle: TextStyle = {
  fontWeight: 600,
  lineHeight: 16,
  fontSize: 16,
  marginTop: 22,
}

const $heroWrap: ViewStyle = { marginTop: 6, marginBottom: 10 }
const $hero: ViewStyle = {
  height: 204,
  borderRadius: 4,
  overflow: "hidden",
  padding: 12,
}
const $heroImage: ImageStyle = { resizeMode: "cover" }
const $heroOverlay: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(36,14,86,0.35)", // purple tint overlay
}

const $heroHeaderRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-end",
}
const $statusContainer = (status: WriterStatus): ViewStyle => ({
  backgroundColor: status === WriterStatus.completed ? colors.success : colors.palette.accent500,
  gap: spacing.xs,
  borderRadius: 8,
  marginBottom: spacing.xxs,
  paddingVertical: 4,
  paddingHorizontal: 8,
  alignItems: "center",
})

const $statusText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontFamily: typography.primary.normal,
  fontSize: spacing.xs + 2,
  color: colors.palette.secondary400,
  paddingHorizontal: 8,
  fontWeight: 700,
  lineHeight: 10,
})

const $coverMeta: ViewStyle = { flex: 1 }
const $authorRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}
const $authorAndFollowSection: ViewStyle = {
  marginTop: 6,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $avatar: ImageStyle = { width: 36, height: 36, borderRadius: 18, backgroundColor: "#3A3F6A" }

const $statsRow: ViewStyle = {
  marginTop: 20,
  flexDirection: "row",
  gap: 20,
  alignItems: "center",
}
const $commentsStatsRow: ViewStyle = {
  flexDirection: "row",
  gap: 20,
  alignItems: "center",
}
const $stat: ViewStyle = { flexDirection: "row", gap: 6, alignItems: "center" }

const $cta: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginVertical: 20,
  height: 44,
  borderRadius: 12,
  backgroundColor: colors.buttonBackground,
  alignItems: "center",
  justifyContent: "center",
})
const $ctaText: TextStyle = { color: "white" }

const $card: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
  borderRadius: 12,
  padding: 12,
  marginTop: 20,
})

const $linkRow: ViewStyle = { marginTop: 8, flexDirection: "row", alignSelf: "center" }

const $commentRow: ViewStyle = { flexDirection: "row", gap: 10, alignItems: "flex-start" }
const $avatarLg: ViewStyle = { width: 36, height: 36, borderRadius: 18, backgroundColor: "#3A3F6A" }

const $partRow: ThemedStyle<ViewStyle> = ({ colors }) => ({
  padding: 16,
  borderRadius: 8,
  backgroundColor: colors.palette.primary500,
  alignItems: "center",
  flexDirection: "row",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",
  marginBottom: 8,
})

const $draft: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 5,
  borderWidth: 1,
  borderColor: "#FFC773",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 4,
})

const $draftText: ThemedStyle<TextStyle> = () => ({
  color: "#FFC773",
  paddingHorizontal: 4,
  textAlign: "center",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 19,
  textTransform: "capitalize",
})

const $writerNoteTitle: TextStyle = {
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 16,
}
const $lastUpdated: TextStyle = {
  marginBottom: 8,
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 16,
  marginTop: 20,
}
const $sectionContainer: ViewStyle = { marginVertical: 20 }
const $titleItemsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}
const $commentContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
}

const $commentCountContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.success,
  gap: spacing.xs,
  borderRadius: 12,
  marginBottom: spacing.xxs,
  paddingVertical: 6,
  paddingHorizontal: 8,
  alignItems: "center",
})

const $commentText: TextStyle = {
  fontSize: 14,
  lineHeight: 20,
  fontWeight: 400,
}
const $partsTextStyle: TextStyle = { fontSize: 10, fontWeight: 700, lineHeight: 16 }

const $navigationText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral300,
  textAlign: "center",
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 20,
  textTransform: "capitalize",
})

const $navigationItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}
const $followButton: ViewStyle = {
  flexDirection: "row",
  borderWidth: 1,
  borderColor: colors.palette.neutral100,
  borderRadius: 12,
  paddingVertical: 9,
  paddingHorizontal: 16,
  alignItems: "center",
  gap: 8,
}
