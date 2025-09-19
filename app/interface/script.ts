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
  partLocation: Array<{}>
  partDialogues: Array<{}>
  postalImage?: string
}

export type CreatePart = Pick<Part, "script_id" | "index" | "content" | "title">
