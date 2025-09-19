import { useMemo, useState } from "react"

import type { TabKey } from "./editorConstant"
import type { LocationItem, LocationForm } from "./types"
import { ScriptPartLocationImage } from "@/interface/script"

type Options = { currentTab: TabKey; locations: Array<ScriptPartLocationImage> }

export function useLocations({ currentTab, locations }: Options) {
  const [locationForm, setLocationForm] = useState<LocationForm>({
    image: null,
    name: "",
    hideName: false,
  })

  const quota = useMemo(
    () => ({
      poster: { used: 1, limit: 1 },
      location: { used: locations.length, limit: 10 },
      embedded: { used: 10, limit: 15 },
      character: { used: 10, limit: 15 },
    }),
    [locations.length],
  )

  const progress = useMemo(() => {
    const total =
      quota.poster.limit + quota.embedded.limit + quota.character.limit + quota.location.limit
    const used =
      quota.poster.used + quota.embedded.used + quota.character.used + quota.location.used
    return used / total
  }, [quota])

  const sortedLocations = useMemo(() => {
    if (currentTab === "asc") return [...locations].sort((a, b) => a.name.localeCompare(b.name))
    if (currentTab === "des") return [...locations].sort((a, b) => b.name.localeCompare(a.name))
    return locations
  }, [locations, currentTab])

  const resetForm = () => setLocationForm({ image: null, name: "", hideName: false })
  const setImage = (uri: string | null) => setLocationForm((f) => ({ ...f, image: uri }))
  const setName = (name: string) => setLocationForm((f) => ({ ...f, name }))
  const setHideName = (hide: boolean) => setLocationForm((f) => ({ ...f, hideName: hide }))

  return {
    locations,
    sortedLocations,
    quota,
    progress,
    locationForm,
    setImage,
    setName,
    setHideName,
    resetForm,
  }
}
