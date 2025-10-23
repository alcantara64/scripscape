import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { CommentWithReplies, IComment } from "@/interface/script"
import { commentService } from "@/services/commentService"
import { getOrThrow } from "@/utils/query"

type CreateComment = {
  content: string
  part_id: number
}
export type Pagination = {
  take?: number
  skip?: number
  replyTake?: number
}
export const commentKeys = {
  all: ["comments"] as const,
  part: (partId: number) => [...commentKeys.all, "part", partId] as const,
  list: (partId: number, pg?: { take?: number; skip?: number; replyTake?: number }) =>
    [...commentKeys.part(partId), pg?.take ?? 50, pg?.skip ?? 0, pg?.replyTake ?? 0] as const,
}

async function createComment(payload: CreateComment) {
  return getOrThrow(commentService.writeComment(payload.part_id, payload.content))
}

export function useCreateComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["get-my-scripts"] })
    },
  })
}
export const useComments = (partId: number, pg: Pagination = {}) => {
  return useQuery({
    queryKey: commentKeys.list(partId, pg),
    queryFn: () => getOrThrow(commentService.geCommentsByPart(partId)),
    staleTime: 30_000,
    enabled: Number.isFinite(partId) && partId > 0,
  })
}

export function useAddComment(partId: number, pg: Pagination = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => commentService.writeComment(partId, content),
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: commentKeys.list(partId, pg) })
      const prev = qc.getQueryData<CommentWithReplies[]>(commentKeys.list(partId, pg)) ?? []

      // temp optimistic row
      const temp: CommentWithReplies = {
        comment_id: -Date.now(),
        part_id: partId,
        user_id: 0,
        content,
        created_at: new Date().toISOString(),
        parent_comment_id: null,
        reply_count: 0,
        replies: [],
      }

      qc.setQueryData<CommentWithReplies[]>(commentKeys.list(partId, pg), (old = []) => [
        temp,
        ...old,
      ])

      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(commentKeys.list(partId, pg), ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: commentKeys.list(partId, pg) })
    },
  })
}

export function useAddReply(partId: number, pg: Pagination = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ parentId, content }: { parentId: number; content: string }) =>
      commentService.replyComment(partId, parentId, content),
    onMutate: async ({ parentId, content }) => {
      await qc.cancelQueries({ queryKey: commentKeys.list(partId, pg) })
      const key = commentKeys.list(partId, pg)
      const prev = qc.getQueryData<CommentWithReplies[]>(key) ?? []

      const temp: IComment = {
        comment_id: -Date.now(),
        part_id: partId,
        user_id: 0,
        content,
        created_at: new Date().toISOString(),
        parent_comment_id: parentId,
      }

      const next = prev.map((top) => {
        if (top.comment_id !== parentId) return top
        const replies = [...(top.replies ?? []), temp]
        const reply_count = (top.reply_count ?? replies.length) + 1 // optimistic bump
        return { ...top, replies, reply_count }
      })

      qc.setQueryData<CommentWithReplies[]>(key, next)
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(commentKeys.list(partId, pg), ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: commentKeys.list(partId, pg) })
    },
  })
}

export function useDeleteComment(partId: number, pg: Pagination = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: number) => commentService.remove(commentId),
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: commentKeys.list(partId, pg) })
      const key = commentKeys.list(partId, pg)
      const prev = qc.getQueryData<CommentWithReplies[]>(key) ?? []

      const isTopLevel = prev.some((t) => t.comment_id === commentId)

      let next: CommentWithReplies[]
      if (isTopLevel) {
        next = prev.filter((t) => t.comment_id !== commentId)
      } else {
        next = prev.map((t) => {
          const before = t.replies ?? []
          const after = before.filter((r) => r.comment_id !== commentId)
          if (after.length === before.length) return t // unchanged
          const reply_count = Math.max(0, (t.reply_count ?? before.length) - 1)
          return { ...t, replies: after, reply_count }
        })
      }

      qc.setQueryData<CommentWithReplies[]>(key, next)
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(commentKeys.list(partId, pg), ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: commentKeys.list(partId, pg) })
    },
  })
}

function patchLikeInTree(
  list: CommentWithReplies[],
  commentId: number,
  delta: 1 | -1,
  liked: boolean,
): CommentWithReplies[] {
  const mapTop = (t: CommentWithReplies): CommentWithReplies => {
    if (t.comment_id === commentId) {
      const likes_count = Math.max(0, (t.likes_count ?? 0) + delta)
      return { ...t, likes_count, likedByMe: liked }
    }
    // search replies
    const replies =
      t.replies?.map((r) => {
        if (r.comment_id === commentId) {
          const likes_count = Math.max(0, (r.likes_count ?? 0) + delta)
          return { ...r, likes_count, likedByMe: liked }
        }
        return r
      }) ?? []
    return { ...t, replies }
  }
  return list.map(mapTop)
}

export function useLikeComment(
  partId: number,
  pg?: { take?: number; skip?: number; replyTake?: number },
) {
  const qc = useQueryClient()
  const key = commentKeys.list(partId, pg)

  return useMutation({
    mutationFn: (commentId: number) => getOrThrow(commentService.like(commentId)),
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<CommentWithReplies[]>(key) ?? []
      const next = patchLikeInTree(prev, commentId, +1 as 1, true)
      qc.setQueryData<CommentWithReplies[]>(key, next)
      return { prev }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData<CommentWithReplies[]>(key, ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key })
    },
  })
}

export function useUnlikeComment(
  partId: number,
  pg?: { take?: number; skip?: number; replyTake?: number },
) {
  const qc = useQueryClient()
  const key = commentKeys.list(partId, pg)

  return useMutation({
    mutationFn: (commentId: number) => getOrThrow(commentService.unlike(commentId)),
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<CommentWithReplies[]>(key) ?? []
      const next = patchLikeInTree(prev, commentId, -1 as -1, false)
      qc.setQueryData<CommentWithReplies[]>(key, next)
      return { prev }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData<CommentWithReplies[]>(key, ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key })
    },
  })
}
