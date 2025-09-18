import { TEXT_BACKGROUND_COLORS, TEXT_COLOR } from "./editorConstant"

export type LocationItem = { name: string; image: string; hideName: boolean }

export type LocationForm = {
  image: string | null
  name: string
  hideName: boolean
}

export type CharacterItem = {
  name: string
  image: string
  textBackgroundColor: string
  textColor: string
}

export type CharacterForm = {
  image: string | null
  name: string
  textBackgroundColor: string
  textColor: string
  dialogue?: string
  audioUri?: string
  avatarUri?: string
}

export type TextColorType = (typeof TEXT_COLOR)[number]
export type BackgroundColorType = (typeof TEXT_BACKGROUND_COLORS)[number]
export type Part = {
  id: string
  title: string
  blurb?: string
  html: string
}
