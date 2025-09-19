/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import { AxiosRequestConfig } from "axios"

import Config from "@/config"
import { AuthResponse } from "@/interface/auth"
import type { ApiResult, EpisodeItem } from "@/services/api/types"
import { persistTokens, readTokens } from "@/utils/storage/auth"

import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig, ApiFeedResponse } from "./types"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

type Params = Record<string, unknown>
type JsonBody = Record<string, unknown>
/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
        Authorization: "",
      },
    })

    this.apisauce.addAsyncRequestTransform(async (request) => {
      const { accessToken, tokenType } = await readTokens()
      if (request.headers) {
        request.headers.Authorization = `${tokenType} ${accessToken}`
      }
    })
  }

  private normalize<T>(res: ApiResponse<T>): ApiResult<T> {
    // Not OK? map to problem
    if (!res.ok) {
      const problem =
        getGeneralApiProblem(res) ?? ({ kind: "unknown", temporary: true } as GeneralApiProblem)
      return { ok: false, problem }
    }
    // OK but no data -> bad-data
    if (res.data === undefined || res.data === null) {
      return { ok: false, problem: { kind: "bad-data" } }
    }
    return { ok: true, data: res.data }
  }

  /**
   * Gets a list of recent React Native Radio episodes.
   */
  async getEpisodes(): Promise<{ kind: "ok"; episodes: EpisodeItem[] } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
      `api.json?rss_url=https%3A%2F%2Ffeeds.simplecast.com%2FhEI_f9Dx`,
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      // This is where we transform the data into the shape we expect for our model.
      const episodes: EpisodeItem[] =
        rawData?.items.map((raw) => ({
          ...raw,
        })) ?? []

      return { kind: "ok", episodes }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }
  async get<T>(url: string, params?: Params, cfg?: AxiosRequestConfig): Promise<ApiResult<T>> {
    const res = await this.apisauce.get<T>(url, params, cfg)
    return this.normalize(res)
  }

  async post<T>(
    url: string,
    payload?: JsonBody | FormData,
    cfg?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> {
    const res = await this.apisauce.post<T>(url, payload, cfg)
    return this.normalize(res)
  }

  async put<T>(
    url: string,
    payload?: JsonBody | FormData,
    cfg?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> {
    const res = await this.apisauce.put<T>(url, payload, cfg)
    return this.normalize(res)
  }
  async patch<T>(
    url: string,
    payload?: JsonBody | FormData,
    cfg?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> {
    const res = await this.apisauce.patch<T>(url, payload, cfg)
    return this.normalize(res)
  }

  async delete<T>(
    url: string,
    payload?: JsonBody,
    cfg?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> {
    const res = await this.apisauce.delete<T>(url, payload, cfg)
    return this.normalize(res)
  }

  async refreshIfNeeded() {
    const { accessTokenExpires, refreshToken, tokenType } = await readTokens()
    const needsRefresh = !accessTokenExpires || Date.now() > accessTokenExpires - 30_000

    if (needsRefresh && refreshToken) {
      const r = await this.apisauce.post<ApiResult<Omit<AuthResponse, "user">>>("/auth/refresh", {
        refreshToken,
      })
      if (r.data?.ok) {
        await persistTokens({
          accessToken: r.data.data.accessToken,
          refreshToken: r.data.data.refreshToken ?? refreshToken,
          tokenType: r.data.data.tokenType ?? tokenType ?? "Bearer",
          accessTokenExpires: r.data.data.expiresIn as number,
        })
        const { accessToken } = await readTokens()
        if (accessToken)
          this.apisauce.headers.Authorization = `${r.data.data.tokenType ?? tokenType ?? "Bearer"} ${accessToken}`
      }
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
