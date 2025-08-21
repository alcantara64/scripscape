import { NewsResponse } from "@/interface/banner"

import { Api } from "./api"
import { ApiResult } from "./api/types"

export class HomeService {
  constructor(private httpClient: Api) {}
  getBanners(): Promise<ApiResult<NewsResponse>> {
    return this.httpClient.get<NewsResponse>("/banners?populate=Image")
  }
}

export const homeService = new HomeService(new Api())
