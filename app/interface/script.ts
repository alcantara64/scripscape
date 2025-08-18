export enum ScriptStatus {
  inprogress = "inprogress",
  completed = "completed",
}

export interface IScript {
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
