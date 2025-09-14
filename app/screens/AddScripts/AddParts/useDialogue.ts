import { useMemo, useState } from "react"

import type { TabKey, TEXT_COLOR, TEXT_BACKGROUND_COLORS } from "./editorConstant"
import type {
  LocationItem,
  LocationForm,
  CharacterItem,
  CharacterForm,
  BackgroundColorType,
  TextColorType,
} from "./types"

export function useDialogue() {
  const [characters, setCharacters] = useState<CharacterItem[]>([])
  const [characterForm, setCharacterForm] = useState<CharacterForm>({
    image: null,
    name: "",
    textBackgroundColor: "",
    textColor: "",
  })
  const [selectedBackgroundColor, setSelectedBackgroundColor] =
    useState<BackgroundColorType>("#E9CDFD")
  const [selectedTextColor, setSelectedTextColor] = useState<TextColorType>("#2C087F")
  const [additionalImages, setAdditionalImages] = useState<Array<{ imageUri: string }>>([])

  const quota = useMemo(
    () => ({
      poster: { used: 1, limit: 1 },
      location: { used: 1, limit: 10 },
      embedded: { used: 10, limit: 15 },
      character: { used: characters.length, limit: 15 },
    }),
    [characters.length],
  )

  const progress = useMemo(() => {
    const total =
      quota.poster.limit + quota.embedded.limit + quota.character.limit + quota.location.limit
    const used =
      quota.poster.used + quota.embedded.used + quota.character.used + quota.location.used
    return used / total
  }, [quota])

  const addCharacter = (item: CharacterItem) => setCharacters((prev) => [...prev, item])
  const resetCharacterForm = () =>
    setCharacterForm({ image: null, name: "", textBackgroundColor: "", textColor: "" })
  const setCharacterImage = (uri: string | null) => setCharacterForm((f) => ({ ...f, image: uri }))
  const setCharacterName = (name: string) => setCharacterForm((f) => ({ ...f, name }))
  const setCharacterTextBackgroundColor = (color: BackgroundColorType) =>
    setCharacterForm((f) => ({ ...f, textBackgroundColor: color }))
  const setCharacterTextColor = (color: TextColorType) =>
    setCharacterForm((f) => ({ ...f, textColor: color }))
  const onAddMoreImages = (uri: string) =>
    setAdditionalImages((images) => [...images, { imageUri: uri }])

  return {
    characters,
    addCharacter,
    resetCharacterForm,
    quota,
    progress,
    setCharacterImage,
    setCharacterName,
    setCharacterTextBackgroundColor,
    setCharacterTextColor,
    selectedBackgroundColor,
    setSelectedBackgroundColor,
    selectedTextColor,
    setSelectedTextColor,
    characterForm,
    additionalImages,
    onAddMoreImages,
  }
}
