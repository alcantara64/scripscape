import { Category } from "@/interface/script"

import { Api } from "./api"
import { ApiResult } from "./api/types"

export class CategoryService {
  constructor(private httpClient: Api) {}
  getCategories(): Promise<ApiResult<{ items: Array<Category> }>> {
    return this.httpClient.get<{ items: Array<Category> }>(`/category/`)
  }
}

export const categoryService = new CategoryService(new Api())
