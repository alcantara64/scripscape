import {
  ImageBackground,
  ImageStyle,
  Pressable,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { FlashList } from "@shopify/flash-list"

import { Text } from "@/components/Text"
import { Category } from "@/interface/script"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"

import { Button } from "./Button"
import { Icon } from "./Icon"
import { useState } from "react"
export interface CategorySheetProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  onBack: () => void
  title: string
  subtitle: string
  categories: Array<Category>
  onSave: (categories: Array<Category>) => void
}

/**
 * Describe your component here
 */
// imageMap.ts
export const categoryImages: Record<string, any> = {
  "action": require("../../assets/images/category-action.png"),
  "adventure": require("../../assets/images/category-adventure.png"),
  "anime-animation": require("../../assets/images/category-anime-animation.png"),
  "comedy": require("../../assets/images/category-comedy.png"),
  "drama": require("../../assets/images/category-drama.png"),
  "fan-fiction": require("../../assets/images/category-fan-fiction.png"),
  "fantasy": require("../../assets/images/category-fantasy.png"),
  "historical": require("../../assets/images/category-historical.png"),
  "mystery": require("../../assets/images/category-mystery.png"),
  "thriller": require("../../assets/images/category-thriller.png"),
  "romance": require("../../assets/images/category-romance.png"),
  "horror": require("../../assets/images/category-horror.png"),
}
const ITEM_HEIGHT = 80 // your row’s approx height in px
const SEPARATOR_HEIGHT = 8 // spacing.sm, adjust if different
const ESTIMATED = ITEM_HEIGHT + SEPARATOR_HEIGHT
export const CategorySheet = (props: CategorySheetProps) => {
  const { style, onBack, title, subtitle, categories, onSave } = props
  const $styles = [$container, style]
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const Separator = () => <View style={$separator} />
  const [selectedCategories, setSelectedCategories] = useState<Array<Category>>([])

  const toggleCategory = (item: Category) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.some((c) => c.id === item.id)
      if (isSelected) {
        // deselect
        return prev.filter((c) => c.id !== item.id)
      }
      // prevent selecting more than 3
      if (prev.length >= 3) return prev
      return [...prev, item]
    })
  }

  const isSelected = (item: Category) => selectedCategories.some((c) => c.id === item.id)

  return (
    <View style={$styles}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon icon="arrowLeft" size={24} color={colors.tintInactive} />
        </Pressable>
        <View>
          <Text preset="contentTitle" style={themed($title)}>
            {title}
          </Text>
          <Text style={themed($subtitle)}>{subtitle}</Text>
        </View>
      </View>
      <View style={{ height: 500 }}>
        <FlashList<Category>
          data={categories}
          extraData={selectedCategories}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={ESTIMATED}
          ItemSeparatorComponent={Separator}
          renderItem={({ item }) => {
            const selected = isSelected(item)
            return (
              <Pressable
                onPress={() => toggleCategory(item)}
                style={selected ? themed($selectedCategories) : undefined}
              >
                <ImageBackground
                  imageStyle={[{ borderRadius: 12 }]}
                  source={categoryImages[item.slug]}
                >
                  <LinearGradient
                    colors={["rgba(33, 4, 82, 0.51)", "rgba(33, 4, 82, 0.51)"]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={themed($overlayImage)}
                  >
                    <Text style={themed($headerText)} text={item.name} />
                  </LinearGradient>
                </ImageBackground>
              </Pressable>
            )
          }}
        />
        <Button
          text={
            selectedCategories.length === 3
              ? "Save"
              : `Choose ${3 - selectedCategories.length} more`
          }
          onPress={() => onSave(selectedCategories)}
          disabled={selectedCategories.length !== 3}
        />
      </View>
    </View>
  )
}

const $container: ViewStyle = { flex: 1 }

const $title: ThemedStyle<TextStyle> = ({ typography, spacing }) => ({
  fontFamily: typography.primary.bold,
})
const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: 300,
  lineHeight: 20,
  marginBottom: spacing.lg,
  color: colors.palette.accentActive,
})
const $separator: ViewStyle = {
  height: spacing.sm,
}
const $overlayImage: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  justifyContent: "center",
  backgroundColor: "transparent",
  borderRadius: 12,
  borderWidth: 0.5,
  borderColor: colors.palette.secondary300,
})
const $headerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  textAlign: "center",
  paddingVertical: 24,
  fontSize: 18,
  fontWeight: 500,
  lineHeight: 20,
})
const $selectedCategories: ThemedStyle<ImageStyle> = () => ({
  borderWidth: 2,
  borderColor: "#4DCC7E",
  borderRadius: 12,
})
