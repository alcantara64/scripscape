import { FC, useEffect, useMemo, useState, useCallback } from "react"
import { Alert, Platform, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import {
  useIAP,
  ErrorCode,
  SubscriptionAndroid,
  Purchase,
  RequestPurchaseParams,
} from "react-native-iap"

import { Icon, PressableIcon } from "@/components/Icon"
import { ListView } from "@/components/ListView"
import { ProBadge } from "@/components/ProBadge"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"

type SubscriptionScreenProps = AppStackScreenProps<"Subscription">
type Sku =
  | "com.scripscape.pro.monthly"
  | "com.scripscape.pro.semiannual"
  | "com.scripscape.pro.annual"

const SKUS: Sku[] = [
  "com.scripscape.pro.monthly",
  "com.scripscape.pro.semiannual",
  "com.scripscape.pro.annual",
]

interface IPlan {
  id: Sku
  title: string
  subtitle: string
  priceMain?: string
  priceSuffix?: string
  note?: string | null
  badgeLeft?: string | null
  badgeRight?: string | null
}

const BASE_PLANS: IPlan[] = [
  {
    id: "com.scripscape.pro.monthly",
    title: "1 Month",
    subtitle: "Billed monthly",
    priceMain: "$5.99",
    priceSuffix: "/ Month",
  },
  {
    id: "com.scripscape.pro.semiannual",
    title: "6 Months",
    subtitle: "Billed bi-annually",
    priceMain: "$24.99",
    priceSuffix: "/ 6 Months",
    note: "($4.17/mo)",
    badgeLeft: "Save 30%",
  },
  {
    id: "com.scripscape.pro.annual",
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
  "Unlock expanded upload limits for location images, character portraits, & embedded visuals",
]

// --- backend verify (replace with your client) ---
async function verifyWithBackend(purchase: Purchase) {
  const payload =
    Platform.OS === "ios"
      ? {
          platform: "ios",
          productId: purchase.productId,
          receipt: purchase.transactionReceipt,
          // @ts-ignore (iOS only)
          originalTransactionId: purchase.originalTransactionIdentifier,
        }
      : {
          platform: "android",
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
          orderId: purchase.orderId,
        }

  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/iap/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "" }, // add Bearer
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Verify failed: ${res.status}`)
  return res.json() as Promise<{ ok: true; pro: boolean; expiresAt?: string }>
}

export const SubscriptionScreen: FC<SubscriptionScreenProps> = () => {
  const navigation = useNavigation()
  const { themed, theme } = useAppTheme()
  const [selectedId, setSelectedId] = useState<Sku>("com.scripscape.pro.monthly")

  const {
    connected,
    subscriptions,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
    getActiveSubscriptions,
    activeSubscriptions,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        const result = await verifyWithBackend(purchase)
        await finishTransaction({ purchase, isConsumable: false })
        if (result?.pro) {
          Alert.alert("Success", "Your subscription is active. Enjoy Scripscape Pro!")
          navigation.goBack()
        } else {
          Alert.alert("Received", "Purchase received; verifying status. Pull to refresh.")
        }
      } catch (e: any) {
        Alert.alert("Verification failed", e?.message ?? "Please try again.")
      }
    },
    onPurchaseError: (err) => {
      if (err.code !== ErrorCode.UserCancelled) {
        Alert.alert("Purchase error", err.message ?? "Something went wrong.")
      }
    },
  })

  // load subscriptions once connected
  useEffect(() => {
    if (!connected) return
    fetchProducts({ skus: SKUS, type: "subs" }).catch((e) => console.warn("fetchProducts error", e))
  }, [connected, fetchProducts])

  // map store price to cards (fallback to static)
  const plans: IPlan[] = useMemo(() => {
    if (!subscriptions?.length) return BASE_PLANS
    const priceById = new Map<string, string>()
    subscriptions.forEach((s) => {
      // iOS: s.localizedPrice; Android: formatted price inside offer pricing phases
      const a = s as unknown as SubscriptionAndroid
      const androidPrice =
        a?.subscriptionOfferDetailsAndroid?.[0]?.pricingPhases?.pricingPhaseList?.[0]
          ?.formattedPrice
      priceById.set(s.id, s.price || androidPrice || "")
    })
    return BASE_PLANS.map((p) =>
      priceById.get(p.id) ? { ...p, priceMain: priceById.get(p.id)! } : p,
    )
  }, [subscriptions])

  const buy = useCallback(
    async (sku: Sku) => {
      try {
        // Android: build subscriptionOffers (offerToken) if present
        let subscriptionOffers:
          | RequestPurchaseParams["request"]["android"]["subscriptionOffers"]
          | undefined
        const sub = subscriptions.find((s) => s.id === sku) as SubscriptionAndroid | undefined
        const offerToken = sub?.subscriptionOfferDetailsAndroid?.[0]?.offerToken
        if (offerToken) subscriptionOffers = [{ sku, offerToken }]

        await requestPurchase({
          request: {
            ios: { sku },
            android: { skus: [sku], ...(subscriptionOffers ? { subscriptionOffers } : {}) },
          },
          type: "subs",
        })
      } catch (e: any) {
        if (e?.code !== ErrorCode.UserCancelled) {
          Alert.alert("Purchase failed", e?.message ?? "Please try again.")
        }
      }
    },
    [subscriptions, requestPurchase],
  )

  const restore = useCallback(async () => {
    try {
      const [purchases] = await Promise.all([getAvailablePurchases(), getActiveSubscriptions()])
      if (!purchases.length && !activeSubscriptions.length) {
        Alert.alert("Nothing to restore", "No previous purchases found.")
        return
      }
      // Optional: verify the most recent purchase with your backend
      const latest = purchases.sort(
        (a, b) => Number(b.transactionDate ?? 0) - Number(a.transactionDate ?? 0),
      )[0]
      if (latest) await verifyWithBackend(latest)
      Alert.alert("Restored", "Your purchases were restored.")
      navigation.goBack()
    } catch (e: any) {
      Alert.alert("Restore failed", e?.message ?? "Please try again.")
    }
  }, [getAvailablePurchases, getActiveSubscriptions, activeSubscriptions, navigation])

  const PlanCard = ({
    item,
    selected,
    onPress,
  }: {
    item: IPlan
    selected: boolean
    onPress: (id: Sku) => void
  }) => (
    <Pressable
      onPress={() => onPress(item.id)}
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
          <Text text={item.priceMain ?? ""} style={themed($priceText)} />
          <Text style={{ textAlign: "right", fontSize: 14 }}> {item.priceSuffix ?? ""} </Text>
          {item.note && <Text style={{ textAlign: "right" }}> {item.note} </Text>}
        </View>
      </View>
    </Pressable>
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
        <Icon icon="logo" size={28} color={theme.colors.palette.neutral100} />
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
        data={plans}
        contentContainerStyle={{ paddingTop: 8 }}
        extraData={selectedId}
        estimatedItemSize={3}
        ItemSeparatorComponent={() => <View style={$separator} />}
        renderItem={({ item }) => (
          <PlanCard item={item} selected={item.id === selectedId} onPress={setSelectedId} />
        )}
      />

      <Pressable onPress={() => buy(selectedId)} style={themed($cta)}>
        <Text style={themed($ctaText)}>Upgrade</Text>
      </Pressable>

      <Pressable onPress={restore} style={{ marginTop: 12, alignSelf: "center" }}>
        <Text style={themed($canceltAnytime)} text="Restore purchases · Cancel anytime" />
      </Pressable>
    </Screen>
  )
}

const $root: ViewStyle = { flex: 1, paddingHorizontal: 12 }
const $separator: ViewStyle = { height: spacing.sm }
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
const $detailContainer: ViewStyle = { marginTop: spacing.sm }
const $detatilDescription: TextStyle = { fontSize: 14, lineHeight: 20 }
const $spotlightText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: spacing.sm + 2,
  color: colors.text,
  fontWeight: "600",
})
const $enumeratedItemsContainer: ViewStyle = { marginTop: spacing.sm }
const $listItemContainer: ViewStyle = { flexDirection: "row", gap: 4, paddingVertical: 4 }
const $card: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 20,
  backgroundColor: colors.palette.primary500,
  paddingBottom: 8,
})
const $cardSelected: ViewStyle = { borderWidth: 2, borderColor: "#00E0B8" }
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
const $radioSelected: ViewStyle = { backgroundColor: "#0ED5C7", borderColor: "#0ED5C7" }
const $contentContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 20,
  flex: 1,
}
const $billingInfoContainer: ViewStyle = { flexDirection: "row", alignItems: "center" }
const $pricngInfoContainer: ViewStyle = { gap: 0, alignSelf: "flex-end" }
const $monthText: TextStyle = { fontSize: 16, fontWeight: "600", lineHeight: 16 }
const $priceText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontWeight: "700",
  lineHeight: 20,
  fontSize: 22,
  textAlign: "right",
  color: colors.palette.neutral100,
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
  fontWeight: "500",
})
