import { FC, useEffect, useMemo, useRef, useState } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { ImageBackground } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"

import { FollowersList } from "@/components/FollowersList"
import { Icon, PressableIcon } from "@/components/Icon"
import { ListView } from "@/components/ListView"
import { Screen } from "@/components/Screen"
import { ScriptList } from "@/components/ScriptList"
import { TabItem, Tabs } from "@/components/Tab"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { mock_scripts } from "@/mockups/script"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import { ThemedStyle } from "@/theme/types"
import { Categories, followers } from "@/utils/mock"

interface SearchScreenProps extends AppStackScreenProps<"Search"> {}
const Separator = () => <View style={$separator} />
const TAB_ITEMS: TabItem[] = [
  { key: "script", label: "Script" },
  { key: "tags", label: "Tags" },
  { key: "users", label: "Users" },
]

const SUB_Tabs: TabItem[] = [
  { key: "trending", label: "Trending" },
  { key: "new", label: "New" },
  { key: "recent", label: "Recently Updated" },
]

type SubTabKey = (typeof SUB_Tabs)[number]["key"]

export const SearchScreen: FC<SearchScreenProps> = () => {
  // Pull in navigation via hook
  const navigation = useNavigation()
  const { themed, theme } = useAppTheme()
  const [currentTab, setCurrentTab] = useState<"script" | "users" | "tags">("script")
  const [searchText, setSearchText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [currentSubTab, setCurrentSubTab] = useState<SubTabKey>("trending")

  const [scriptResults, setScriptResults] = useState(mock_scripts)
  const [userResults, setUserResults] = useState(followers)
  const [tagResults, setTagResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allTags = ["Stargalaxy", "Stars", "Startrek", "Starwars", "Starlawn"]

  const handleSearch = (q: string) => {
    const trimmed = q.trim().toLowerCase()

    if (!trimmed) {
      // empty search → reset to defaults
      if (currentTab === "users") setUserResults(followers)
      if (currentTab === "tags") setTagResults(allTags)
      if (currentTab === "script") setScriptResults(mock_scripts)
      return
    }

    if (currentTab === "users") {
      // search users only by their "name" field
      const data = followers.filter((u) => (u.name ?? "").toLowerCase().includes(trimmed))
      setUserResults(data)
    } else if (currentTab === "tags") {
      const data = allTags.filter((t) => t.toLowerCase().includes(trimmed))
      setTagResults(data)
    } else {
      // search scripts only by "title"

      let data = mock_scripts.filter((s) => (s.title ?? "").toLowerCase().includes(trimmed))

      // if (selectedCategory) {
      //   data = data.filter((s) =>
      //     (s.category ?? "").toLowerCase().includes(selectedCategory.toLowerCase()),
      //   )
      // }

      // optional: sort based on currentSubTab
      if (currentSubTab === "new") {
        data.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      } else if (currentSubTab === "recent") {
        data.sort(
          (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
      } else {
        // "trending" (example metric: likes)
        data.sort((a: any, b: any) => (b.likes ?? 0) - (a.likes ?? 0))
      }

      setScriptResults(data)
    }
  }

  useEffect(() => {
    const id = setTimeout(() => {
      void handleSearch(searchText)
    }, 250) // debounce ms
    return () => clearTimeout(id)
  }, [searchText, currentTab, selectedCategory, currentSubTab])

  // initial load (populate defaults for active tab)
  useEffect(() => {
    void handleSearch("")
  }, [])

  return (
    <Screen
      style={$root}
      preset="scroll"
      safeAreaEdges={["top"]}
      ScrollViewProps={{ stickyHeaderIndices: [0] }}
    >
      <View>
        <View style={$headerContainer}>
          <PressableIcon
            onPress={navigation.goBack}
            icon="arrowLeft"
            size={24}
            color={theme.colors.palette.neutral100}
          />

          <TextField
            containerStyle={$inputContainer}
            inputWrapperStyle={$inputWrapper}
            style={$input}
            value={searchText}
            inputMode="search"
            onChangeText={setSearchText}
            placeholderTextColor={"#FFFFFF99"}
            placeholder="Search for scripts, tags, or users"
            autoCapitalize="none"
          />
          <Icon icon="search" size={24} color={theme.colors.palette.neutral300} />
        </View>
      </View>
      {!selectedCategory && !searchText && (
        <View>
          <View>
            <Text text={"Explore"} preset="sectionHeader" style={{ marginVertical: 20 }} />
            <ListView<{ title: string; image: string }>
              data={Categories}
              ItemSeparatorComponent={Separator}
              renderItem={({ item }) => (
                <Pressable onPress={() => setSelectedCategory(item.title)}>
                  <ImageBackground imageStyle={{ borderRadius: 12 }} source={item.image}>
                    <LinearGradient
                      colors={["rgba(33, 4, 82, 0.51)", "rgba(33, 4, 82, 0.51)"]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={themed($overlayImage)}
                    >
                      <Text style={themed($headerText)} text={item.title} />
                    </LinearGradient>
                  </ImageBackground>
                </Pressable>
              )}
            />
          </View>
        </View>
      )}
      {(selectedCategory || searchText) && (
        <View>
          <Tabs
            items={TAB_ITEMS}
            value={currentTab}
            onChange={(k) => setCurrentTab(k as typeof currentTab)}
            containerStyle={themed({ marginBottom: 20 })} // optional
            tabStyle={themed({})}
            activeTabStyle={themed({})}
            tabTextStyle={themed({})}
            activeTabTextStyle={themed({})}
            fullWidth
            gap={8}
          />
          {currentTab === "script" && (
            <View>
              <Text text={selectedCategory} preset="sectionHeader" />
              <View style={themed($tabContainer)}>
                {SUB_Tabs.map(({ key, label }) => (
                  <Pressable
                    style={currentSubTab === key && themed($selectedSubTab)}
                    key={key}
                    onPress={() => setCurrentSubTab(key)}
                  >
                    <Text text={label} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          {currentTab === "users" && <FollowersList data={userResults} />}
          {currentTab === "script" && <ScriptList data={scriptResults} />}
          {currentTab === "tags" && (
            <ListView<string>
              data={tagResults}
              renderItem={({ item }) => (
                <Pressable onPress={() => setSearchText(item)} style={themed($tagsItemContain)}>
                  <Text text={`#${item}`} />
                </Pressable>
              )}
              ItemSeparatorComponent={Separator}
            />
          )}
        </View>
      )}
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
  padding: 20,
}
const $inputContainer: ViewStyle = {
  flex: 1,
}

const $inputWrapper: ViewStyle = {
  flex: 1,
  borderRadius: 0,
  borderTopWidth: 0,
  borderRightWidth: 0,
  borderLeftWidth: 0,
}

const $input: ViewStyle = {
  flex: 1,
  minWidth: 0, // 👈 helps in some layouts to allow shrinking/growing in a row
}
const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
}
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
const $tabContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.sm,
})

const $headerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  textAlign: "center",
  paddingVertical: 40,
  fontSize: 18,
  fontWeight: 500,
  lineHeight: 20,
})
const $selectedSubTab: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderBottomWidth: 3,
  borderBottomColor: colors.palette.primary300,
  paddingBottom: 8,
})
const $tagsItemContain: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 12,
  backgroundColor: "rgba(190, 182, 209, 0.15)",
  borderWidth: 0.5,
  borderColor: colors.palette.secondary300,
  alignItems: "center",
  alignSelf: "flex-start",
  paddingHorizontal: 23,
  paddingVertical: 4,
})
