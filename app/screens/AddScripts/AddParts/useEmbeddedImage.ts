import { useMemo } from "react"

import { EmbeddedImage } from "@/interface/script"

import type { TabKey } from "./editorConstant"

type Options = { currentTab: TabKey; images: Array<EmbeddedImage> }

export function useEmbeddedImages({ currentTab, images }: Options) {
  const sortedImages = useMemo(() => {
    if (currentTab === "asc") return [...images].sort((a, b) => a.url.localeCompare(b.url))
    if (currentTab === "des") return [...images].sort((a, b) => b.url.localeCompare(a.url))
    return images
  }, [images, currentTab])

  return {
    sortedImages,
  }
}
