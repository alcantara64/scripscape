import { useQuery } from "@tanstack/react-query"

import { userService } from "@/services/api/userService"
import { getOrThrow } from "@/utils/query"

export const useUser = () => {
  return useQuery({
    queryKey: ["get-user"],
    queryFn: () => getOrThrow(userService.me()),
  })
}
