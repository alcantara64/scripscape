import { User } from "./auth"

export enum ScriptStatus {
  draft = "draft",
  published = "published",
  acrchived = "archived",
}
export enum WriterStatus {
  inprogress = "in_progress",
  completed = "completed",
}

export interface IScript {
  script_id: number
  author_id: number
  title: string
  writer_note: string
  parts_count: number
  status: ScriptStatus
  writerStatus: WriterStatus
  views_count: number
  likes_count: number
  comments_count: number
  summary: string
  cover_image_url: string
  created_at: string
  updated_at: string
  contains_mature_content: boolean
  parts: Array<Part>
  author: User
  tags: Array<Tag>
  categories: Array<Category>
  blurhash?: string
  isOwner?: boolean
  likedByMe: boolean
}

export interface ScriptResponse {
  script_id: number
}

export type CreateScript = {
  title: string
  summary?: string
  postalImage?: File | { uri: string; name: string; type: string } | null
  tags?: Array<Tags>
  categories?: Array<string>
  isMatureContent?: boolean
  writerStatus?: WriterStatus
  status?: ScriptStatus
}

export type Part = {
  part_id: number
  script_id: number
  index: number
  title: string
  content: string
  partLocations: Array<ScriptLocationImage>
  partDialogues: Array<{}>
  postalImage?: string
  created_at: string
  updated_at: string
  permissions?: {
    isOwner: boolean
  }
  status: "draft" | "published"
  published_at: string
}

export type CreatePart = Pick<Part, "script_id" | "index" | "content" | "title">

export type ScriptLocationImage = {
  id: number
  name: string
  hideName: boolean
  image?: string
  createdAt?: string
  blurhash?: string
}

export type ScriptCharacter = {
  id: number
  text_color: string
  text_background_color: string
  image?: string
  additional_images?: Array<string>
  created_at?: string
  name: string
  blurhash?: string
}

export type Dialogue = {
  id: number
  part_id: number
  audio_uri?: string
  character_id: number
  created_at: string
  dialogue: string
  dialogueCharacter: ScriptCharacter
}
export type Tags = {
  id: number
  slug: string
  name: string
  created_at?: string
  updated_at?: string
}

export type Category = {
  id: number
  slug: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}
export type Tag = {
  id?: number
  slug: string
  name: string
  created_at: string
  updated_at: string
}

export type ScriptLocationImageResponse = {
  items: Array<ScriptLocationImage>
  pagination: {
    page: number
    pageSize: number
    total: number
    pages: number
  }
}

export type EmbeddedImage = {
  id: number
  script_id: number
  url: string
  blurhash?: string
  width?: number
  height?: number
  caption?: string
}

export type EmbeddedImageResponse = {
  items: Array<EmbeddedImage>
  pagination: {
    page: number
    pageSize: number
    total: number
    pages: number
  }
}
interface ITrendingTodayItems extends IScript {
  rank: number
  likes_today: number
}

export interface TrendingTodayResponse {
  items: Array<ITrendingTodayItems>
  category: Pick<Category, "slug"> & "all"
  limit: number
}
