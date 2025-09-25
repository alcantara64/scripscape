import { FC, useMemo } from "react"
import {
  Image,
  ImageBackground,
  Pressable,
  View,
  ViewStyle,
  TextStyle,
  ImageStyle,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { Icon, PressableIcon } from "@/components/Icon"
import { useNavigation } from "@react-navigation/native"
import { ThemedStyle } from "@/theme/types"
import { spacing } from "@/theme/spacing"
import { ScriptStatus, WriterStatus } from "@/interface/script"
import { colors } from "@/theme/colors"
import { Line } from "@/components/Line"
// import { Icon } from "@/components/Icon"

interface ScriptDetailScreenProps extends AppStackScreenProps<"ScriptDetail"> {}

type Part = { id: string; title: string; date: string }
type Rec = {
  id: string
  title: string
  cover: string
  tags: string[]
  likes: string
  parts: number
}

export const ScriptDetailScreen: FC<ScriptDetailScreenProps> = ({ route }) => {
  const { script_id } = route.params
  const insets = useSafeAreaInsets()
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()
  const navigation = useNavigation()

  // --- demo data (wire into your real data) ---
  const parts: Part[] = useMemo(
    () => [
      { id: "p1", title: "A Chance Encounter", date: "Jul 8" },
      { id: "p2", title: "Between Worlds", date: "Jul 12" },
      { id: "p3", title: "The Silent Battles", date: "Jul 16" },
      { id: "p4", title: "In The Name of Love", date: "Jul 21" },
    ],
    [],
  )

  const recs: Rec[] = useMemo(
    () => [
      {
        id: "r1",
        title: "Beneath the City Lights",
        cover: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=640",
        tags: ["Romance", "Drama"],
        likes: "12.9k",
        parts: 18,
      },
      {
        id: "r2",
        title: "Echoes of Tomorrow",
        cover: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=640",
        tags: ["Sci-Fi", "Adventure"],
        likes: "6.2k",
        parts: 24,
      },
      {
        id: "r3",
        title: "Shadows of November",
        cover: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=640",
        tags: ["Mystery"],
        likes: "9.7k",
        parts: 15,
      },
    ],
    [],
  )

  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
      <View style={themed($headerContainer)}>
        <View style={$headTextContainer}>
          <TouchableOpacity onPress={navigation.goBack}>
            <Icon icon="arrowLeft" />
          </TouchableOpacity>
          <Text text="Overview" preset="sectionHeader" />
          <View style={themed($draft)}>
            <Icon icon="write" color="#FFC773" size={11} />
            <Text text="Draft" style={themed($draftText)} />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
            <PressableIcon icon="edit" size={20} color="#fff" />
            <Text text="Edit" style={{ fontSize: 14, fontWeight: 500 }} />
          </View>
          <PressableIcon icon="circledEllipsis" size={20} />
        </View>
      </View>
      <View style={$heroWrap}>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1441716844725-09cedc13a4e7?q=80&w=1200",
          }}
          imageStyle={$heroImage}
          style={$hero}
        >
          <View style={$heroOverlay} />
          <View style={$heroHeaderRow}>
            <View style={$statusContainer("Completed")}>
              <Text style={themed($statusText)}>Completed</Text>
            </View>
          </View>
        </ImageBackground>
      </View>
      <View style={$coverMeta}>
        <Text preset="sectionHeader">Love Knows No Boundaries</Text>
        <View style={$authorRow}>
          <View style={$avatar} />
          <View>
            <Text size="xs" style={$muted}>
              Priya Kapoor
            </Text>
            <Text preset="description" text="2.4M Followers" />
          </View>
        </View>
      </View>
      {/* Description */}
      <View>
        <Text style={$descriptionTitle} text="Description" />
        <Text preset="description" style={$descriptionText}>
          They came from different worlds—different languages, cultures, and expectations. But
          somehow, in the chaos of it all, their hearts found a rhythm that matched. Every
          late-night call, every misstep in translation, every mile between them only deepened the
          connection. Because love isn’t about perfect timing or ideal circumstances—it’s about
          showing up, again and again, no matter the distance, no matter the odds. Love knows no
          boundaries—it simply finds a way.Read more
        </Text>

        <View style={$statsRow}>
          <Stat icon="view" label="129k" />
          <Stat icon="like" label="5.5k" />
        </View>

        <Pressable style={themed($cta)}>
          <Text weight="semiBold" style={$ctaText}>
            Start Reading
          </Text>
        </Pressable>
        <Line />
      </View>

      {/* Writer's Notes */}
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

      {/* Parts list */}
      <View>
        <View style={$titleItemsContainer}>
          <Text preset="contentTitle" text="Parts" />
          <View>
            <Text text="25 parts" />
          </View>
        </View>
        {parts.map((p, idx) => (
          <Pressable key={p.id} style={themed($partRow)}>
            <View style={{ flex: 1 }}>
              <Text weight="medium">&quot;{p.title}&rdquo;</Text>
              <Text preset="description">{p.date}</Text>
            </View>
            <PressableIcon icon="caretRight" />
          </Pressable>
        ))}
      </View>

      {/* Recommendations */}
      <Section title="You Might Also Like" insetTop>
        <FlatList
          data={recs}
          keyExtractor={(it) => it.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => <RecCard item={item} />}
        />
      </Section>
    </Screen>
  )
}

/* ------------------------------- Subcomponents ------------------------------ */

const Section = ({
  title,
  children,
  actionText,
  insetTop,
  contentStyle,
}: {
  title: string
  children: React.ReactNode
  actionText?: string
  insetTop?: boolean
  contentStyle?: ViewStyle
}) => {
  return (
    <View style={insetTop && { marginTop: 12 }}>
      <View style={$sectionHeader}>
        <Text weight="semiBold">{title}</Text>
        {actionText ? (
          <Pressable>
            <Text size="xs" weight="medium">
              {actionText}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View style={[{ gap: 8 }, contentStyle]}>{children}</View>
    </View>
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

const RecCard = ({ item }: { item: Rec }) => {
  return (
    <Pressable style={$recCard}>
      <Image source={{ uri: item.cover }} style={$recCover} />
      <Text weight="medium" numberOfLines={2} style={{ marginTop: 6 }}>
        {item.title}
      </Text>
      <View style={$tagRow}>
        {item.tags.slice(0, 2).map((t) => (
          <View key={t} style={$tag}>
            <Text size="xxs">{t}</Text>
          </View>
        ))}
      </View>
      <View style={$recMetaRow}>
        <Text size="xs" style={$muted}>
          {item.likes} likes
        </Text>
        <Text size="xs" style={$muted}>
          · {item.parts} parts
        </Text>
      </View>
    </Pressable>
  )
}

const $root: ViewStyle = { flex: 1, paddingHorizontal: 16 }
const $headerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
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
const $avatar: ViewStyle = { width: 36, height: 36, borderRadius: 18, backgroundColor: "#3A3F6A" }

const $sectionHeader: ViewStyle = {
  paddingVertical: 6,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

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

const $recCard: ViewStyle = {
  width: 172,
  backgroundColor: "#14172B",
  borderRadius: 12,
  padding: 10,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",
}
const $recCover: ImageStyle = {
  width: "100%",
  height: 92,
  borderRadius: 10,
  backgroundColor: "#22253E",
}
const $tagRow: ViewStyle = { flexDirection: "row", gap: 6, marginTop: 6 }
const $tag: ViewStyle = {
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.08)",
}
const $recMetaRow: ViewStyle = {
  marginTop: 4,
  flexDirection: "row",
  justifyContent: "space-between",
}

const $draft: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 5,
  borderWidth: 1,
  borderColor: "#FFC773",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 4,
})

const $draftText: ThemedStyle<TextStyle> = ({ colors }) => ({
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
