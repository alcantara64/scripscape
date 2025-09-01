import { FC, memo, useState } from "react"
import { ImageStyle, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"

import { Icon, PressableIcon } from "@/components/Icon"
import { ListView } from "@/components/ListView"
import { ProBadge } from "@/components/ProBadge"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"

interface SubscriptionScreenProps extends AppStackScreenProps<"Subscription"> {}

interface Plan {
  id: string
  title: string
  subtitle: string
  priceMain: string
  priceSuffix: string
  note?: string | null
  badgeLeft?: string | null
  badgeRight?: string | null
}

interface IPlan {
  id: string
  title: string
  subtitle: string
  priceMain: string
  priceSuffix: string
  note?: string | null
  badgeLeft?: string | null
  badgeRight?: string | null
}

const PLANS: IPlan[] = [
  {
    id: "monthly",
    title: "1 Month",
    subtitle: "Billed monthly",
    priceMain: "$5.99",
    priceSuffix: "/ Month",
  },
  {
    id: "biannual",
    title: "6 Months",
    subtitle: "Billed bi-annually",
    priceMain: "$24.99",
    priceSuffix: "/ 6 Months",
    note: "($4.17/mo)",
    badgeLeft: "Save 30%",
  },
  {
    id: "annual",
    title: "1 Year",
    subtitle: "Billed annually",
    priceMain: "$39.99",
    priceSuffix: "/ Year",
    note: "ONLY $3.33/mo",
    badgeLeft: "Save 44%",
    badgeRight: "Best Value",
  },
]

const ITEMS = [
  "Add voice to your characters",
  "Use multiple expressions per character",
  "Ad-Free experience",
  "Unlock expanded upload limits for location images. character portraits, & embedded visuals",
]

export const SubscriptionScreen: FC<SubscriptionScreenProps> = () => {
  // Pull in navigation via hook
  const navigation = useNavigation()
  const { themed, theme } = useAppTheme()
  const [selectedId, setSelectedId] = useState("monthly")

  const PlanCard = ({
    item,
    selected,
    onPress,
  }: {
    item: Plan
    selected: boolean
    onPress: any
  }) => {
    const { themed } = useAppTheme()
    return (
      // <LinearGradient
      //   colors={["#4CF08B", "#4CC9F0", "#F8BD00"]}
      //   start={{ x: 0, y: 0 }}
      //   end={{ x: 1, y: 0 }}
      //   style={$gradientBorder}
      // >
      <Pressable
        onPress={() => {
          onPress(item.id)
        }}
        style={({ pressed }) => [
          themed($card),
          selected && $cardSelected,
          pressed && { opacity: 0.95 },
        ]}
      >
        <View style={$contentContainer}>
          <View style={$billingInfoContainer}>
            <View style={[$radio, selected && $radioSelected]}>
              <Icon icon="check" size={10} color="black" />
            </View>
            <View>
              <Text
                preset="sectionHeader"
                style={$monthText}
                text={item.title}
                adjustsFontSizeToFit
              />
              <Text preset="description" style={$detatilDescription} text={item.subtitle} />
            </View>
          </View>

          <View style={$pricngInfoContainer}>
            <Text text={item.priceMain} style={themed($priceText)} />
            <Text style={{ textAlign: "right", fontSize: 14 }}> {item.priceSuffix} </Text>
            {item.note && <Text style={{ textAlign: "right" }}> {item.note} </Text>}
          </View>
        </View>
        {/* <View style={$cardBody}>
        <View style={$titleRow}>
          <Text style={$title}>{item.title}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}></View>
        </View>
        <Text style={$subtitle}>{item.subtitle}</Text>
      </View>

      <View style={$priceBlock}>
        <Text style={$priceMain}>{item.priceMain}</Text>
        <Text style={$priceSuffix}>{item.priceSuffix}</Text>
        {item.note ? <Text style={$priceNote}>{item.note}</Text> : null}
      </View>

      {selected && <View style={$glow} pointerEvents="none" />} */}
      </Pressable>
      // </LinearGradient>
    )
  }

  const Pill = ({ text, kind = "save" }) => (
    <View style={[$pill, kind === "info" ? $pillInfo : $pillSave]}>
      <Text style={[$pillText, kind === "info" ? $pillTextInfo : $pillTextSave]}>{text}</Text>
    </View>
  )
  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
      <View style={$headerContainer}>
        <PressableIcon
          onPress={navigation.goBack}
          icon="arrowLeft"
          size={24}
          color={theme.colors.palette.neutral100}
          style={{ marginBottom: 8 }}
        />

        <Text preset="sectionHeader" text="Upgrade Account" />
      </View>
      <View style={$logoContainer}>
        <View>
          <Icon icon="logo" size={28} color={theme.colors.palette.neutral100} />
        </View>
        <Text text="Scripscape" style={themed($logoTextStyle)} />
        <ProBadge />
      </View>
      <View style={$detailContainer}>
        <Text preset="sectionHeader" text="Step Into The Spotlight" />
        <Text preset="description" style={$detatilDescription}>
          Unlock expressive storytelling tools, enjoy ad-free reading and earn the{" "}
          <Text style={themed($spotlightText)}>Spotlight Badge </Text>
          to show the community you’re a creator who supports the platform.
        </Text>
      </View>
      <View style={$enumeratedItemsContainer}>
        {ITEMS.map((text) => (
          <View key={text} style={$listItemContainer}>
            <Icon icon="check" size={16} color="#FC0" />
            <Text style={$detatilDescription} preset="description">
              {text}
            </Text>
          </View>
        ))}
      </View>
      <Text text="Choose your plan" preset="sectionHeader" />
      <ListView<IPlan>
        data={PLANS}
        contentContainerStyle={{ paddingTop: 8 }}
        extraData={selectedId}
        estimatedItemSize={3}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => (
          <PlanCard
            item={item}
            selected={item.id === selectedId}
            onPress={(id) => {
              setSelectedId(id)
            }}
          />
        )}
      />
      <Pressable style={themed($cta)}>
        <Text style={themed($ctaText)}>Upgrade</Text>
      </Pressable>
      <Text style={themed($canceltAnytime)} text="Cancel anytime" />
    </Screen>
  )
}
const Separator = () => <View style={$separator} />
const $root: ViewStyle = {
  flex: 1,
  paddingHorizontal: 12,
}
const $separator: ViewStyle = {
  height: spacing.sm, // This is the gap
}
const $headerContainer: ViewStyle = {
  flexDirection: "row",
  marginBottom: 8,
  alignItems: "center",
  gap: 8,
  alignContent: "center",
}

const $logoContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}

const $logoTextStyle: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.text,
  fontFamily: typography.fonts.Montserrat.bold,
  fontSize: spacing.lg,
})
const $detailContainer: ViewStyle = {
  marginTop: spacing.sm,
}
const $detatilDescription: TextStyle = {
  fontSize: 14,
  lineHeight: 20,
}
const $spotlightText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: spacing.sm + 2,
  color: colors.text,
  fontWeight: 600,
})

const $enumeratedItemsContainer: ViewStyle = {
  marginTop: spacing.sm,
}
const $listItemContainer: ViewStyle = {
  flexDirection: "row",
  gap: 4,
  paddingVertical: 4,
}

const $card: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 20,
  backgroundColor: colors.palette.primary500,
  paddingBottom: 8,
})

const $cardSelected: ViewStyle = {
  borderWidth: 2,
  borderColor: "#00E0B8",
}

const $radio: ViewStyle = {
  width: 20,
  height: 20,
  borderRadius: 11,
  borderWidth: 2,
  borderColor: "#C1B9D5",
  marginRight: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#BEB6D1",
}

const $radioSelected: ViewStyle = {
  backgroundColor: "#0ED5C7",
  borderColor: "#0ED5C7",
}

const $pill: ViewStyle = {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
}
const $pillSave: ViewStyle = { backgroundColor: "#FFD167" }
const $pillInfo = { backgroundColor: "#27C3FF" }
const $pillText: TextStyle = { fontWeight: "800", fontSize: 12 }
const $pillTextSave: TextStyle = { color: "#3A2B00" }
const $pillTextInfo: TextStyle = { color: "#0B2430" }

const $contentContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 20,
  flex: 1,
}
const $billingInfoContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}
const $pricngInfoContainer: ViewStyle = {
  gap: 0,
  alignSelf: "flex-end",
}

const $monthText: TextStyle = {
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 16,
}

const $priceText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontWeight: 700,
  lineHeight: 20,
  colors: colors.palette.neutral300,
  fontSize: 22,
  textAlign: "right",
})
const $cta: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 48,
  borderRadius: spacing.sm,
  backgroundColor: colors.buttonBackground,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.md,
})
const $ctaText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 16,
  color: colors.palette.neutral100,
})

const $canceltAnytime: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral300,
  textAlign: "center",
  fontSize: 12,
  fontWeight: 500,
})
