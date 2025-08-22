import React, { useMemo, useState } from "react"
import { TouchableOpacity, View, StyleSheet } from "react-native"
import { Text } from "./Text"

type Props = {
  content: string
  maxChars?: number // how many chars to show when collapsed
  moreLabel?: string
  lessLabel?: string
  textStyle?: any
  linkStyle?: any
  byWords?: boolean // if true, slice by words instead of characters
  preset?: any
}

const ReadMoreSlice: React.FC<Props> = ({
  content,
  maxChars = 140,
  moreLabel = "Read More",
  lessLabel = "Show Less",
  textStyle,
  linkStyle,
  byWords = false,
  preset,
}) => {
  const [expanded, setExpanded] = useState(false)

  const needsTruncate = useMemo(() => {
    if (!content) return false
    if (byWords) return content.trim().split(/\s+/).length > maxChars
    console.log(content.length)
    return content.length > maxChars
  }, [content, maxChars, byWords])

  const preview = useMemo(() => {
    if (!needsTruncate) return content
    if (byWords) {
      const words = content.trim().split(/\s+/)
      return words.slice(0, maxChars).join(" ") + "…"
    }
    return content.slice(0, maxChars).trimEnd() + "…"
  }, [content, needsTruncate, maxChars, byWords])

  if (!content?.trim()) return null

  return (
    <View>
      <Text preset={preset} style={textStyle}>
        {expanded || !needsTruncate ? content : preview}
      </Text>

      {needsTruncate && (
        <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
          <Text preset="readMore" style={linkStyle}>
            {expanded ? lessLabel : moreLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default ReadMoreSlice
