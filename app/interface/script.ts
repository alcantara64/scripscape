export enum ScriptStatus {
  inprogress = "Inprogress",
  completed = "Completed",
}

export interface IScript {
  script_id: string
  title: string
  descriptions: string
  image: string
  parts: number
  status: ScriptStatus
  views: number
  likes: number
  comments: number
  summary: string
  id: string
}

export interface ScriptResponse {
  script_id: number
}

export type CreateScript = {
  title: string
  summary?: string
  postalImage?: File | { uri: string; name: string; type: string } | null
}

export type Part = {
  part_id: number
  script_id: number
  index: number
  title: string
  content: string
  partLocations: Array<ScriptPartLocationImage>
  partDialogues: Array<{}>
  postalImage?: string
  created_at: string
  updated_at: string
}

export type CreatePart = Pick<Part, "script_id" | "index" | "content" | "title">

export type ScriptPartLocationImage = {
  id: number
  name: string
  hideName: boolean
  image?: string
  createdAt?: string
}

export type ScriptPartCharacter = {
  id: number
  text_color: string
  text_background_color: string
  image?: string
  additional_images?: Array<string>
  created_at?: string
  part: Part
  name: string
}
