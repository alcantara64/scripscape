import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { MeResponse, UpdateProfileInput } from "@/interface/auth"
import { userService } from "@/services/api/userService"
import { getOrThrow } from "@/utils/query"

export const useUser = () => {
  return useQuery({
    queryKey: ["get-user"],
    queryFn: () => getOrThrow(userService.me()),
  })
}

function buildFormData(payload: UpdateProfileInput) {
  const fd = new FormData()
  if (payload.username != null) fd.append("username", payload.username)
  if (payload.bio != null) fd.append("bio", payload.bio)

  if (payload.profilePicture !== undefined) {
    // If null, you might want to signal removal — adjust to your API (e.g., append "null" or a flag)
    if (payload.profilePicture) fd.append("avatar", payload.profilePicture as any)
  }

  if (payload.coverPhoto !== undefined) {
    if (payload.coverPhoto) fd.append("cover", payload.coverPhoto as any)
  }
  return fd
}

async function updateProfile(payload: UpdateProfileInput) {
  const form = buildFormData(payload)
  return getOrThrow(userService.updateInfo(form))
}

export function useUpdateProfile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,

    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: ["get-user"] })
      const prev = qc.getQueryData<MeResponse>(["get-user"])

      const next = prev
        ? {
            ...prev,
            user: {
              ...prev.user,
              username: variables.username ?? prev.user.username,
              bio: variables.bio ?? prev.user.bio,
              profile_picture_url: prev.user.profile_picture_url,
              cover_photo_url: prev.user.cover_photo_url,
            },
          }
        : undefined

      if (next) qc.setQueryData(["get-user"], next)
      return { prev }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["get-user"], ctx.prev)
    },

    onSuccess: (user) => {
      const prev = qc.getQueryData<MeResponse>(["get-user"])
      qc.setQueryData(["get-user"], { ...prev, user: { ...prev?.user, user } })
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["me"] })
    },
  })
}
