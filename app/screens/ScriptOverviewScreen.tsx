import { FC } from "react"
import { Pressable, TextStyle, TouchableOpacity, View, ViewStyle, StyleSheet } from "react-native"
import { ImageBackground, ImageStyle } from "expo-image"
import { useNavigation } from "@react-navigation/native"

import { Icon, PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { ScriptOverviewSkeleton } from "@/components/skeleton/screens/ScriptOverviewSkeleton"
import { Text } from "@/components/Text"
import { IScript, WriterStatus } from "@/interface/script"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useGetScriptById, useGetScriptRecommendationByScriptId } from "@/querries/script"
import { colors } from "@/theme/colors"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"
import { formatDate, formatNumber } from "@/utils/formatDate"
import { Line } from "@/components/Line"
import { useAppTheme } from "@/theme/context"
import { SmartImage } from "@/components/SmartImage"
import { ListView } from "@/components/ListView"
import { ScriptCard } from "@/components/ScriptCard"

interface ScriptOverviewScreenProps extends AppStackScreenProps<"ScriptOverview"> {}

export const ScriptOverviewScreen: FC<ScriptOverviewScreenProps> = ({ route }) => {
  // Pull in navigation via hook
  const navigation = useNavigation()
  const { script_id } = route.params
  const { themed } = useAppTheme()
  const {
    data: recData,
    isLoading: isLoadingRecommendation,
    isError: isRecommendationError,
  } = useGetScriptRecommendationByScriptId(script_id)

  const { isLoading, data: scriptData } = useGetScriptById(script_id)

  const gotoPart = (partId: number) => {
    navigation.navigate("ScriptPart", { part_id: partId })
  }
  const gotoOverviewScreen = (script_id: number) => {
    navigation.navigate("ScriptOverview", { script_id })
  }
  const startReading = () => {
    const firstPart = scriptData?.parts[0]
    navigation.navigate("ScriptPart", { part_id: firstPart?.part_id })
  }

  if (isLoading) {
    return <ScriptOverviewSkeleton />
  }
  return (
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
          <Pressable style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
              <PressableIcon icon="flag" size={20} color="#fff" />
              <Text text="Edit" style={{ fontSize: 14, fontWeight: 500 }} />
            </View>
          </Pressable>
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
            <Text preset="description" text={`${formatNumber(0)} Followers`} />
          </View>
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
          <Stat icon="like" label={formatNumber(scriptData?.likes_count || 0)} />
        </View>

        <Pressable style={themed($cta)} onPress={startReading}>
          <Text weight="semiBold" style={$ctaText}>
            Start Reading
          </Text>
        </Pressable>
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
              New updates! After reader comments on the last chapter, I refined the scene pacing and
              added a conversation where Laila confronts her own expectations. Check out the latest
              update.
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
                  gotoOverviewScreen(item.script_id)
                }}
              />
            )}
          />
        </View>
      )}
    </Screen>
  )
}

const Stat = ({ icon, label, size }: { icon: string; label: string; size?: number }) => (
  <View style={$stat}>
    <Icon icon={icon} color="#fff" size={size || 28} />
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
  marginTop: 6,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
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
