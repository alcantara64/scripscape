export interface NewsItem {
  id: number
  documentId: string
  Title: string
  Description: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  publishedAt: string // ISO date string
  locale: string
  Enable: boolean
  Url: string | null
  Image: Media | undefined
}

interface Media {
  id: number
  documentId: string
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats: IFormats
}

interface IFormats {
  large: IFormatData
  small: IFormatData
  medium: IFormatData
  thumbnail: IFormatData
}
interface IFormatData {
  ext: string
  url: string
  hash: string
  mime: string
  name: string
  path: string | null
  size: number
  width: number
  height: number
  sizeInBytes: number
}

export interface Pagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export interface Meta {
  pagination: Pagination
}

export interface NewsResponse {
  data: NewsItem[]
  meta: Meta
}
