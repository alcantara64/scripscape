// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import { format } from "date-fns/format"
import type { Locale } from "date-fns/locale"
import { parseISO } from "date-fns/parseISO"
import i18n from "i18next"

type Options = Parameters<typeof format>[2]

let dateFnsLocale: Locale
export const loadDateFnsLocale = () => {
  const primaryTag = i18n.language.split("-")[0]
  switch (primaryTag) {
    case "en":
      dateFnsLocale = require("date-fns/locale/en-US").default
      break
    case "ar":
      dateFnsLocale = require("date-fns/locale/ar").default
      break
    case "ko":
      dateFnsLocale = require("date-fns/locale/ko").default
      break
    case "es":
      dateFnsLocale = require("date-fns/locale/es").default
      break
    case "fr":
      dateFnsLocale = require("date-fns/locale/fr").default
      break
    case "hi":
      dateFnsLocale = require("date-fns/locale/hi").default
      break
    case "ja":
      dateFnsLocale = require("date-fns/locale/ja").default
      break
    default:
      dateFnsLocale = require("date-fns/locale/en-US").default
      break
  }
}

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const dateOptions = {
    ...options,
    locale: dateFnsLocale,
  }
  return format(parseISO(date), dateFormat ?? "MMM dd, yyyy", dateOptions)
}

export function formatNumber(num: number): string {
  if (!num) return "0"
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
  } else {
    return num.toString()
  }
}

type Unit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year"

const DIVS: { amt: number; name: Unit }[] = [
  { amt: 60, name: "second" },
  { amt: 60, name: "minute" },
  { amt: 24, name: "hour" },
  { amt: 7, name: "day" },
  { amt: 4.34524, name: "week" }, // approx weeks per month
  { amt: 12, name: "month" },
  { amt: Infinity, name: "year" },
]

export function timeAgo(input: string | number | Date) {
  const date = input instanceof Date ? input : new Date(input)
  let delta = Math.floor((date.getTime() - Date.now()) / 1000) // seconds; negative = past

  if (Math.abs(delta) < 5) return "just now"

  let unit: Unit = "second"
  for (const d of DIVS) {
    if (Math.abs(delta) < d.amt) {
      unit = d.name
      break
    }
    delta = Math.trunc(delta / d.amt)
  }

  const v = Math.trunc(delta)
  const n = Math.abs(v)
  const s = (w: string) => (n === 1 ? w : w + "s")

  return v < 0 ? `${n} ${s(unit)} ago` : `in ${n} ${s(unit)}`
}
