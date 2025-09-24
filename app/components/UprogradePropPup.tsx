import { useEffect, useRef } from "react"
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"

import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { ProBadge } from "./ProBadge"

type OrbitImage = { uri: string; size?: number; left: number; top: number }

export interface UpgradeProPopupProps {
  visible: boolean
  onClose?: () => void
  onUpgrade?: () => void
  title?: string
  subtitle?: string
  ctaText?: string
  orbitImages?: OrbitImage[]
}

const { width } = Dimensions.get("window")
const CARD_W = Math.min(width * 0.84, 340)

export function UpgradeProPopup({
  visible,
  onClose,
  onUpgrade,
  title = "You Have Reached\nYour Limit",
  subtitle = "Upgrade to Pro to unlock more\nuploads and other perks.",
  ctaText = "Upgrade To Pro",
  orbitImages = DEFAULT_ORBITS,
}: UpgradeProPopupProps) {
  const { themed } = useAppTheme()
  const fade = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.92)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]).start()
    } else {
      fade.setValue(0)
      scale.setValue(0.92)
    }
  }, [visible])

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Pressable style={$backdrop} onPress={onClose} />

      <Animated.View style={[$centerWrap, { opacity: fade, transform: [{ scale }] }]}>
        <LinearGradient
          colors={["#6D56C5", "#885BFF", "#3B1E83"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={$cardBorder}
        >
          <View style={themed($card)}>
            {/* Soft rings */}
            <View style={themed($ringLarge)} />
            <View style={themed($ringMid)} />
            <View style={themed($ringSmall)} />

            {/* Orbiting thumbnails */}
            {orbitImages.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img.uri }}
                style={[
                  $orbit,
                  {
                    width: img.size ?? 48,
                    height: img.size ?? 48,
                    left: img.left,
                    top: img.top,
                    borderRadius: 12,
                  },
                ]}
                resizeMode="cover"
              />
            ))}

            {/* PRO badge */}
            <View style={themed($badgeWrap)}>
              <LinearGradient
                colors={["#FFC3A0", "#FFB5A7", "#FFDBB5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={$badgeGlow}
              />
              <View style={themed($badge)}>
                <ProBadge />
              </View>
            </View>

            {/* Copy */}
            <View style={themed($textBlock)}>
              <Text style={themed($title)} text={title} />
              <Text style={themed($subtitle)} text={subtitle} />
            </View>

            {/* CTA (uses your Button) */}
            <Button
              text={ctaText}
              style={themed($cta)}
              textStyle={themed($ctaText)}
              onPress={onUpgrade}
            />
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  )
}

/** ---------- styles (Ignite style) ---------- */

const $backdrop: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.5)",
}

const $centerWrap: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  alignItems: "center",
  justifyContent: "center",
}

const $cardBorder: ViewStyle = {
  width: CARD_W,
  borderRadius: 18,
  padding: 2, // gradient border thickness
}

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 16,
  backgroundColor: "rgba(20, 7, 60, 0.92)",
  overflow: "hidden",
  paddingHorizontal: spacing.md,
  paddingTop: spacing.lg,
  paddingBottom: spacing.md,
})

const $ringLarge: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  width: CARD_W * 1.3,
  height: CARD_W * 1.3,
  borderRadius: CARD_W * 1.3 * 0.5,
  backgroundColor: "rgba(120, 92, 220, 0.16)",
  top: -CARD_W * 0.52,
  left: -(CARD_W * 0.15),
})

const $ringMid: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  width: CARD_W * 0.9,
  height: CARD_W * 0.9,
  borderRadius: CARD_W * 0.9 * 0.5,
  backgroundColor: "rgba(120, 92, 220, 0.18)",
  top: 22,
  alignSelf: "center",
})

const $ringSmall: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  width: CARD_W * 0.55,
  height: CARD_W * 0.55,
  borderRadius: CARD_W * 0.275,
  backgroundColor: "rgba(120, 92, 220, 0.20)",
  top: 54,
  alignSelf: "center",
})

const $orbit: ViewStyle = {
  position: "absolute",
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: "rgba(255,255,255,0.28)",
}

const $badgeWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginTop: spacing.lg + 6,
  marginBottom: spacing.sm,
})

const $badgeGlow: ViewStyle = {
  position: "absolute",
  width: 138,
  height: 52,
  borderRadius: 26,
  opacity: 0.2,
}

const $badge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 18,
  height: 40,
  borderRadius: 12,
  backgroundColor: "#3B2A85",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",
  flexDirection: "row",
  alignItems: "center",
})

const $badgeText: ThemedStyle<TextStyle> = () => ({
  color: "#E4F7FD", // your requested cyan
  fontWeight: "700",
  fontSize: 16,
  letterSpacing: 0.25,
})

const $badgeStar: TextStyle = { marginLeft: 6, fontSize: 16 }

const $textBlock: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginTop: spacing.xs,
})

const $title: ThemedStyle<TextStyle> = () => ({
  color: "white",
  textAlign: "center",
  fontSize: 20,
  lineHeight: 26,
  fontWeight: "800",
})

const $subtitle: ThemedStyle<TextStyle> = () => ({
  color: "rgba(255,255,255,0.75)",
  textAlign: "center",
  fontSize: 13.5,
  lineHeight: 19,
  marginTop: 8,
})

const $cta: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md + 2,
  alignSelf: "stretch",
  borderRadius: 12,
  backgroundColor: "#6C55FF",
  paddingVertical: 14,
  alignItems: "center",
})

const $ctaText: ThemedStyle<TextStyle> = () => ({
  color: "white",
  fontWeight: "700",
  fontSize: 15.5,
})

/** default images (positions tuned for CARD_W) */
const DEFAULT_ORBITS: OrbitImage[] = [
  { uri: "https://picsum.photos/seed/a/200/200", size: 54, left: 20, top: 18 },
  { uri: "https://picsum.photos/seed/b/200/200", size: 56, left: CARD_W - 56 - 20, top: 26 },
  { uri: "https://picsum.photos/seed/c/200/200", size: 38, left: 10, top: 110 },
  { uri: "https://picsum.photos/seed/d/200/200", size: 32, left: CARD_W - 32 - 12, top: 120 },
  { uri: "https://picsum.photos/seed/e/200/200", size: 44, left: 40, top: 178 },
  { uri: "https://picsum.photos/seed/f/200/200", size: 44, left: CARD_W - 44 - 44, top: 188 },
]
