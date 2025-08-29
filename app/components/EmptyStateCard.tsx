import { Platform, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import Svg, {
  G,
  Rect,
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
  Text as SvgText,
  TSpan,
  Line,
} from "react-native-svg"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface EmptyStateCardProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  width?: number
  height?: number
  title?: string
}

/**
 * Empty state card — emphasizes "No content available at the moment".
 * Dark, muted palette; SVG contains a clear "No Content" sign and placeholders.
 */
export const EmptyStateCard = (props: EmptyStateCardProps) => {
  const {
    style,
    title = "No content available at the moment — we’re searching for your next hidden gem.",
    width,
    height,
  } = props

  const { themed } = useAppTheme()
  const cardW = width ?? 320
  const cardH = height ?? 220

  return (
    <View style={[themed($card), { width: cardW }, style]}>
      <View style={themed($illustrationWrap)}>
        <EmptyStateIllustration width={cardW - 40} height={cardH - 80} />
      </View>

      <Text accessibilityRole="text" accessible style={themed($text)}>
        {title}
      </Text>
    </View>
  )
}

const $text: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 14,
  lineHeight: 20,
  textAlign: "center",
  // Force high contrast so it always shows
  color: "#E5E7EB",
})

const $card: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "center",
  borderRadius: 20,
  paddingVertical: 20,
  paddingHorizontal: 20,
  backgroundColor: "#111827",
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 6 },
    default: {},
  }),
})

const $illustrationWrap: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#0B1220",
  borderRadius: 16,
  padding: 8,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: "#1E2434",
})

export function EmptyStateIllustration({
  width = 280,
  height = 140,
}: {
  width?: number
  height?: number
}) {
  // Muted, not-too-bright palette
  const panel1 = "#1B2132"
  const panel2 = "#131A28"
  const outline = "#4B5563"
  const dash = "#6B7280"
  const accent = "#E3C565" // soft muted yellow
  const accentDim = "#A3904C"
  const labelText = "#E5E7EB"
  const glassRim = "#6571D6"

  const w = width
  const h = height

  // helper sizes
  const shelfY = h * 0.68
  const shelfH = 10

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <LinearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={panel1} />
          <Stop offset="1" stopColor={panel2} />
        </LinearGradient>
      </Defs>

      {/* Inner rounded panel */}
      <Rect x={8} y={8} rx={16} ry={16} width={w - 16} height={h - 16} fill="url(#panel)" />

      {/* Ground shadow */}
      <Ellipse cx={w / 2 + 4} cy={h - 20} rx={w * 0.32} ry={8} fill="#0B0F1A" opacity={0.35} />

      {/* Minimal bookshelf base */}
      <Rect x={w * 0.14} y={shelfY} width={w * 0.72} height={shelfH} rx={3} fill="#0F1523" />
      <Rect
        x={w * 0.14}
        y={shelfY}
        width={w * 0.72}
        height={shelfH}
        rx={3}
        stroke="#222A3C"
        strokeWidth={1}
        fill="none"
      />

      {/* Placeholder tiles (dashed outline "missing content") */}
      <G>
        {[
          { x: 0.18, y: 0.32, w: 0.18, h: 0.24 },
          { x: 0.4, y: 0.28, w: 0.18, h: 0.28 },
          { x: 0.62, y: 0.34, w: 0.18, h: 0.22 },
        ].map((b, i) => (
          <Rect
            key={`ph-${i}`}
            x={w * b.x}
            y={h * b.y}
            width={w * b.w}
            height={h * b.h}
            rx={10}
            fill="none"
            stroke={dash}
            strokeOpacity={0.55}
            strokeWidth={2}
            strokeDasharray="6 6"
          />
        ))}
      </G>

      {/* Hanging sign with clear "No Content" text */}
      {/* cords */}
      <Line
        x1={w * 0.36}
        y1={h * 0.16}
        x2={w * 0.5}
        y2={h * 0.26}
        stroke={accentDim}
        strokeWidth={2}
      />
      <Line
        x1={w * 0.64}
        y1={h * 0.16}
        x2={w * 0.5}
        y2={h * 0.26}
        stroke={accentDim}
        strokeWidth={2}
      />
      {/* sign board */}
      <Rect
        x={w * 0.3}
        y={h * 0.26}
        width={w * 0.4}
        height={h * 0.18}
        rx={10}
        fill="#2c4272ff"
        stroke={accent}
        strokeWidth={2}
      />
      {/* sign pin */}
      <Circle cx={w * 0.5} cy={h * 0.26} r={5.5} fill={accent} />

      {/* sign label text (in-SVG to “determine” the message) */}
      <SvgText
        x={w * 0.5}
        y={h * 0.26 + h * 0.1}
        fill={labelText}
        fontSize={14}
        fontWeight="600"
        textAnchor="middle"
      >
        <TSpan>No Content</TSpan>
        <TSpan x={w * 0.5} dy={16} fill="#9CA3AF" fontSize={12} fontWeight="500">
          available at the moment
        </TSpan>
      </SvgText>

      {/* Sleeping magnifying glass (tilted & dim to suggest “inactive”) */}
      <G opacity={0.8}>
        {/* handle */}
        <Path
          d={`M ${w * 0.68} ${h * 0.56} l ${w * 0.12} ${w * 0.12 * 0.22}`}
          stroke={glassRim}
          strokeOpacity={0.6}
          strokeWidth={7}
          strokeLinecap="round"
        />
        {/* rim */}
        <Circle
          cx={w * 0.6}
          cy={h * 0.5}
          r={h * 0.12}
          stroke={glassRim}
          strokeOpacity={0.75}
          strokeWidth={8}
          fill="#0F1422"
        />
        {/* z's */}
        <SvgText x={w * 0.7} y={h * 0.4} fill="#9CA3AF" fontSize={10} opacity={0.8}>
          z
        </SvgText>
        <SvgText x={w * 0.73} y={h * 0.37} fill="#9CA3AF" fontSize={12} opacity={0.7}>
          z
        </SvgText>
      </G>
    </Svg>
  )
}
