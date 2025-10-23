import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import WebView from "react-native-webview"

import { AppBottomSheet, BottomSheetController } from "@/components/AppBottomSheet"
import { CommentCard } from "@/components/CommentCard"
import { ConfirmAction } from "@/components/ConfirmAction"
import { EmptyState } from "@/components/EmptyState"
import { Icon, PressableIcon } from "@/components/Icon"
import { Line } from "@/components/Line"
import { ListView } from "@/components/ListView"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { IComment } from "@/interface/script"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAddComment, useAddReply, useComments, useDeleteComment } from "@/querries/comment"
import { useDeleteScriptPart, useGetPartsById } from "@/querries/script"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"
import { formatNumber } from "@/utils/formatDate"
import { dialogueBridgeJS } from "@/utils/insertDialogueBubble"
import { toast } from "@/utils/toast"

import { editorContentStyle } from "./AddScripts/AddParts/editorConstant"

// import { useNavigation } from "@react-navigation/native"

interface ScriptPartScreenProps extends AppStackScreenProps<"ScriptPart"> {}

export const ScriptPartScreen: FC<ScriptPartScreenProps> = ({ route }) => {
  const { part_id } = route.params
  // Pull in navigation via hook
  const navigation = useNavigation()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { data: partData, isLoading } = useGetPartsById(part_id)
  const { mutateAsync } = useDeleteScriptPart()
  const { contentCSSText } = editorContentStyle(colors)
  const sheetRef = useRef<BottomSheetController>(null)
  const commentSheetRef = useRef<BottomSheetController>(null)
  const [showDeleteDialogue, setShowDeleteDialogue] = useState(false)
  const { data: commentsData, isLoading: isLoadingComments } = useComments(part_id, {
    take: 20,
    replyTake: 5,
  })
  const [comment, setComment] = useState("")
  const addComment = useAddComment(part_id, { take: 20, replyTake: 5 })
  const addReply = useAddReply(part_id, { take: 20, replyTake: 5 })
  const delComment = useDeleteComment(part_id, { take: 20, replyTake: 5 })
  const [selectedComment, setSelectedComment] = useState<IComment | null>(null)
  const pageHtml = useMemo(() => {
    const css = `
      /* Base reset */
      html, body { margin: 0; padding: 0; }
      body {
        -webkit-text-size-adjust: 100%;
        font-family: -apple-system, system-ui, "Helvetica Neue", Arial;
        color: ${colors.text};
        // background: ${colors.background};
        padding:24px;
      }

      /* Make images responsive */
      img, video, audio, canvas { max-width: 100%; height: auto; }

      /* Preserve your editor look & feel */
      ${contentCSSText}

      /* READ-ONLY: prevent caret, long-press, selection, and pointer edits */
      .ss-readonly, .ss-readonly * {
        -webkit-user-select: none; user-select: none;
        -webkit-touch-callout: none;
        caret-color: transparent;
      }

      /* Keep links clickable */
      .ss-readonly a, .ss-readonly a * {
        pointer-events: auto !important;
        -webkit-user-select: text; user-select: text;
        caret-color: auto;
      }

      /* Safe figure default */
      figure { margin: 0 0 12px 0; }
      figcaption { opacity: 0.8; font-size: 12px; margin-top: 6px; }
    `.trim()

    // Wrap your stored HTML inside a container we control
    const wrapped = `
      <!doctype html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <style>${css}</style>
        </head>
        <body>
          <main class="ss-readonly">
            ${partData?.content || "<p style='opacity:.6'>No content yet.</p>"}
          </main>
          <script>
            // Block contentEditable toggles just in case
            Array.from(document.querySelectorAll('[contenteditable]'))
              .forEach(el => el.setAttribute('contenteditable', 'false'));
          </script>
        </body>
      </html>
    `
    return wrapped
  }, [colors, partData])
  useEffect(() => {
    if (selectedComment && commentsData) {
      const updatedComment = commentsData?.find(
        (item) => item.comment_id === selectedComment.comment_id,
      )

      setSelectedComment(updatedComment ?? null)
    }
  }, [commentsData, selectedComment])
  const scriptManipulators = useMemo(
    () => [
      {
        icon: "trash",
        label: "Delete Part",
        action: () => {
          setShowDeleteDialogue(true)
        },
      },
    ],
    [],
  )
  const openBottomSheet = () => {
    sheetRef.current?.open()
  }
  const openCommentBottomSheet = () => {
    commentSheetRef.current?.open()
  }
  const deletePart = async () => {
    try {
      await mutateAsync({ part_id: partData?.part_id! })
      navigation.navigate("ScriptDetail")
    } catch (e) {
      toast.error("Unable to delete script at the moment")
    }
  }

  const renderBottomSheetItem = useCallback(
    (icon: string, label: string, action: () => void) => (
      <Pressable key={label} style={$navigationItem} onPress={action}>
        <Icon icon={icon} size={24} />
        <Text text={label} style={themed($navigationText)} />
      </Pressable>
    ),
    [themed],
  )

  const goBack = () => {
    navigation.goBack()
  }
  const Separator = () => <View style={$separator} />
  if (isLoading) {
    return <Text text="loading ..." />
  }
  return (
    <>
      <Screen
        style={$root}
        preset="auto"
        safeAreaEdges={["top"]}
        ScrollViewProps={{ contentContainerStyle: { flexGrow: 1 } }}
      >
        <View style={$container}>
          {/* Header (same layout as AddPart, just no inputs/actions) */}
          <View style={themed($headerRow)}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <PressableIcon icon="arrowLeft" onPress={goBack} hitSlop={10} />
              <Text preset="sectionHeader" weight="semiBold">
                Part {partData?.index}
              </Text>
              {partData?.status !== "published" && (
                <View style={themed($draft)}>
                  <Icon icon="write" color="#FFC773" size={11} />
                  <Text text="Draft" style={themed($draftText)} />
                </View>
              )}
            </View>
            {partData?.permissions?.isOwner && (
              <PressableIcon onPress={openBottomSheet} icon="circledEllipsis" size={20} />
            )}
          </View>

          {/* Title */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 6 }}>
            <Text preset="subheading" weight="semiBold" numberOfLines={2}>
              {partData?.title || "Untitled"}
            </Text>
            <View style={$interactionsContainer}>
              <View style={$item}>
                <PressableIcon icon="view" size={23} />
                <Text text={formatNumber(partData?.script.views_count || 0)} />
              </View>
              <View style={$item}>
                <PressableIcon icon="like" size={23} />
                <Text text={formatNumber(partData?.script.likes_count || 0)} />
              </View>
              <View style={$item}>
                <PressableIcon icon="comment" size={23} onPress={openCommentBottomSheet} />
                <Text text={formatNumber(partData?.script.comments_count || 0)} />
              </View>
            </View>
          </View>

          {/* Read-only content */}

          <WebView
            originWhitelist={["*"]}
            source={{ html: pageHtml }}
            injectedJavaScript={dialogueBridgeJS}
            // Keep scrollable, but no zoom to mimic editor
            scalesPageToFit={false}
            scrollEnabled
            // Disable text selection callouts on iOS
            dataDetectorTypes="all"
            // Allow tapping links to open externally
            onShouldStartLoadWithRequest={(req) => {
              const isHttp = /^https?:\/\//i.test(req.url)
              // Let the initial "about:blank" / internal doc load
              if (req.navigationType === "other" && !isHttp) return true
              if (isHttp) {
                Linking.openURL(req.url).catch(() => {})
                return false
              }
              return true
            }}
            // Performance niceties
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            // Android: improves hardware-acceleration text clarity
            androidLayerType={Platform.OS === "android" ? "hardware" : undefined}
            // Prevent keyboard popping (no inputs anyway)
            keyboardDisplayRequiresUserAction
            allowsInlineMediaPlayback // iOS: needed for inline <audio>
            mediaPlaybackRequiresUserAction // keep true; play() is user-initiated via click
            style={$webview}
          />
        </View>
      </Screen>
      <AppBottomSheet
        controllerRef={sheetRef}
        snapPoints={["28%"]}
        onChange={(index) => {
          if (index < 1) {
            // sheetRef.current?.collapse()
            // sheetRef.current?.close()
          }
        }}
      >
        <View style={{ gap: 20, marginTop: 10 }}>
          {!showDeleteDialogue &&
            scriptManipulators.map((item) =>
              renderBottomSheetItem(item.icon, item.label, item.action),
            )}
        </View>
        {showDeleteDialogue && (
          <ConfirmAction
            title="Confirm Delete"
            question="Are you sure you want to delete this part"
            onConfirm={deletePart}
            onCancel={() => {
              setShowDeleteDialogue(false)
            }}
            confirmBtnText="Delete"
          />
        )}
      </AppBottomSheet>
      <AppBottomSheet
        controllerRef={commentSheetRef}
        snapPoints={["25%", "90%"]}
        onChange={(index) => {
          if (index < 1) {
            // sheetRef.current?.collapse()
            // sheetRef.current?.close()
          }
        }}
        style={{ flex: 1, height: "100%" }}
      >
        <View style={$commentsContainer}>
          <View style={$commentHeaderContainer}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              {!!selectedComment && (
                <PressableIcon icon="caretLeft" onPress={() => setSelectedComment("")} />
              )}
              <Text preset="titleHeading" text="Comments" />
            </View>
            <Text preset="description" text={`${partData?.script.comments_count} Comments`} />
          </View>
          {/* <Line /> */}
          {selectedComment && (
            <View style={{ flex: 1 }}>
              <CommentCard
                style={$commentCard}
                profilePicture={selectedComment.user?.profile_picture_url}
                name={selectedComment.user?.username}
                createDate={selectedComment.created_at}
                comment={selectedComment.content}
                replyCount={selectedComment.reply_count || 0}
                isReplyView
              />
              <View style={$replyInput}>
                <TextField
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Reply to  comment"
                  multiline
                  numberOfLines={2}
                  style={{ alignItems: "center", paddingTop: 8 }}
                  inputWrapperStyle={{
                    borderWidth: 0,
                    alignItems: "center",
                    minHeight: 60,
                    borderBottomWidth: 1,
                    borderBottomColor: "#fff",
                  }}
                  RightAccessory={() => (
                    <PressableIcon
                      icon="send"
                      disabled={comment.length < 1}
                      onPress={async () => {
                        addReply.mutateAsync({
                          parentId: selectedComment.comment_id,
                          content: comment,
                        })
                        setComment("")
                      }}
                    />
                  )}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 40 }}>
                <ListView<IComment>
                  extraData={selectedComment.replies}
                  data={selectedComment.replies}
                  estimatedItemSize={104}
                  keyExtractor={(data) => `${data.comment_id}`}
                  ListEmptyComponent={isLoadingComments ? <ActivityIndicator /> : null}
                  renderItem={({ item }) => {
                    return (
                      <CommentCard
                        style={$commentCard}
                        profilePicture={item.user?.profile_picture_url}
                        name={item.user?.username}
                        createDate={item.created_at}
                        comment={item.content}
                        replyCount={item.reply_count || 0}
                        isReplyView
                      />
                    )
                  }}
                />
              </View>
            </View>
          )}
          {!selectedComment && (
            <>
              <View style={$commentsInput}>
                <TextField
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Write your comment"
                  multiline
                  numberOfLines={2}
                  style={{ alignItems: "center", paddingTop: 8 }}
                  inputWrapperStyle={{
                    borderWidth: 0,
                    alignItems: "center",
                    minHeight: 60,
                    borderBottomWidth: 1,
                    borderBottomColor: "#fff",
                  }}
                  RightAccessory={() => (
                    <PressableIcon
                      icon="send"
                      disabled={comment.length < 1}
                      onPress={() => {
                        addComment.mutate(comment)
                      }}
                    />
                  )}
                />
              </View>
              <ListView<IComment>
                extraData={part_id}
                data={commentsData}
                style={{ flex: 1 }}
                estimatedItemSize={80}
                keyExtractor={(data) => `${data.comment_id}`}
                ListEmptyComponent={
                  isLoadingComments ? (
                    <ActivityIndicator />
                  ) : (
                    <EmptyState ImageProps={{ resizeMode: "contain" }} />
                  )
                }
                renderItem={({ item }) => {
                  return (
                    <CommentCard
                      onPress={() => {
                        console.log(item)
                        setSelectedComment(item)
                      }}
                      style={$commentCard}
                      profilePicture={item.user?.profile_picture_url}
                      name={item.user?.username}
                      createDate={item.created_at}
                      comment={item.content}
                      replyCount={item.reply_count || 0}
                    />
                  )
                }}
              />
            </>
          )}
        </View>
      </AppBottomSheet>
    </>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
  gap: spacing.xs,
  paddingHorizontal: 24,
})

const $webview: ViewStyle = {
  flex: 1,
  backgroundColor: "transparent",
}

const $container: ViewStyle = { flex: 1 }
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
const $interactionsContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 20,
}
const $item: ViewStyle = {
  flexDirection: "row",
  gap: 8,
}
const $commentsContainer: ViewStyle = {
  // position: "relative",
  flex: 1,
}
const $commentHeaderContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 8,
  alignItems: "center",
}
const $commentsInput: ViewStyle = {
  marginTop: 0,
}
const $replyInput: ViewStyle = {
  marginLeft: 40,
}
const $commentCard: ViewStyle = {
  marginVertical: 16,
}

const $separator: ViewStyle = {
  height: spacing.lg, // This is the gap
}
