import { useMemo } from "react"
import { View, type ViewStyle, type TextStyle } from "react-native"
import Animated, { useDerivedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Icon } from "./Icon"

const RULES = [
  { id: "len8", label: "Minimum 8 characters", test: (s: string) => s.length >= 8 },
  { id: "upper", label: "1 uppercase letter", test: (s: string) => /[A-Z]/.test(s) },
  { id: "num", label: "At least 1 number", test: (s: string) => /\d/.test(s) },
  {
    id: "spec",
    label: "At least 1 special character",
    test: (s: string) => /[^A-Za-z0-9]/.test(s),
  },
] as const

function strength(score: number) {
  // label + tint (swap these colors with your theme if you want)
  if (score <= 1) return { label: "Weak", tint: "#FF453A" }
  if (score === 2) return { label: "Fair", tint: "#FFD60A" }
  if (score === 3) return { label: "Good", tint: "#30D158" }
  return { label: "Strong", tint: "#0A84FF" }
}

export function PasswordMeter({ password }: { password: string }) {
  const { themed } = useAppTheme()

  const { checks, score, label, tint } = useMemo(() => {
    const checks = RULES.map((r) => r.test(password))
    const score = checks.filter(Boolean).length
    const { label, tint } = strength(score)
    return { checks, score, label, tint }
  }, [password])

  // simple segment animation: animate active count 0..4
  const activeSegments = useDerivedValue(() => score, [score])
  const seg1 = useAnimatedStyle(() => ({
    opacity: withTiming(activeSegments.value >= 1 ? 1 : 0.25),
  }))
  const seg2 = useAnimatedStyle(() => ({
    opacity: withTiming(activeSegments.value >= 2 ? 1 : 0.25),
  }))
  const seg3 = useAnimatedStyle(() => ({
    opacity: withTiming(activeSegments.value >= 3 ? 1 : 0.25),
  }))
  const seg4 = useAnimatedStyle(() => ({
    opacity: withTiming(activeSegments.value >= 4 ? 1 : 0.25),
  }))

  return (
    <View>
      {/* Progress row */}
      <View style={themed($meterRow)}>
        <View style={themed($segments)}>
          <Animated.View style={[themed([$segment, { backgroundColor: tint }]), seg1]} />
          <Animated.View style={[themed([$segment, { backgroundColor: tint }]), seg2]} />
          <Animated.View style={[themed([$segment, { backgroundColor: tint }]), seg3]} />
          <Animated.View style={[themed([$segment, { backgroundColor: tint }]), seg4]} />
        </View>
        <Text style={[themed($strengthText), { color: tint }]}>{label}</Text>
      </View>

      {/* Checklist (two columns) */}
      <View style={themed($rulesGrid)}>
        {RULES.map((r, i) => {
          const ok = checks[i]
          return (
            <View key={r.id} style={themed($ruleRow)}>
              <Icon icon="check" size={16} style={{ marginRight: 8, opacity: ok ? 1 : 0.35 }} />
              <Text style={[themed($ruleText), { opacity: ok ? 1 : 0.55 }]}>{r.label}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

/* ---------- styles ---------- */

const $meterRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing.xs,
})

const $segments: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  flex: 1,
  height: 6,
  backgroundColor: colors.palette.accentActive, // track color
  borderRadius: 999,
  overflow: "hidden",
  gap: spacing.xxxs, // space between segments
})

const $segment: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  height: "100%",
  borderRadius: 999,
  opacity: 0.25, // default (inactive); animated to 1
})

const $strengthText: ThemedStyle<TextStyle> = ({ typography }) => ({
  marginLeft: 8,
  fontFamily: typography.primary.medium,
  fontSize: 13,
})

const $rulesGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
  columnGap: spacing.lg,
  marginTop: spacing.xs,
})

const $ruleRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  width: "48%", // two columns
})

const $ruleText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.text,
})
