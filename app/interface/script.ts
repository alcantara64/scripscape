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
