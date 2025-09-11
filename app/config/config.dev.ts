import { Platform } from "react-native"

/**
 * These are configuration settings for the dev environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
export default {
  API_URL:
    Platform.OS === "android" ? "http://10.0.2.2:3001/api/v1" : "http://localhost:3001/api/v1",
  CMS_URL: "https://cms.scripscape.com",
}
