import { useQuery } from "@tanstack/react-query"

import { homeService } from "@/services/homeService"
import { getOrThrow } from "@/utils/query"

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => getOrThrow(homeService.getBanners()),
  })
}
