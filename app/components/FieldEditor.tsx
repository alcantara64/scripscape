// FieldEditor.tsx (or place above your ProfileScreen component)
import { useMemo, useState } from "react"
import { View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

type FieldEditorProps = {
  title: string
  label: string
  icon?: string
  initialValue?: string
  maxLength?: number
  multiline?: boolean
  validate?: (value: string) => string | undefined
  onSave: (value: string) => Promise<void> | void
  onClose?: () => void
  inputWrapperStyle?: ViewStyle
}

export function FieldEditor({
  title,
  label,
  icon = "person",
  initialValue = "",
  maxLength,
  multiline,
  validate,
  onSave,
  onClose,
  inputWrapperStyle,
}: FieldEditorProps) {
  const { themed } = useAppTheme()
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  const length = value.length
  const changed = value !== initialValue

  const error = useMemo(() => (validate ? validate(value) : undefined), [validate, value])

  const helper = error
    ? error
    : typeof maxLength === "number"
      ? `${Math.min(length, maxLength)}/${maxLength} characters`
      : undefined

  const canSave = changed && !error && !saving

  const handleChange = (text: string) => {
    setTouched(true)
    setValue(typeof maxLength === "number" ? text.slice(0, maxLength) : text)
  }

  const handleSave = async () => {
    if (!canSave) return
    try {
      setSaving(true)
      await onSave(value.trimEnd())
      onClose?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={$fieldTitle}>
      <View>
        <Text text={title} preset="sectionHeader" />
      </View>

      <TextField
        value={value}
        onChangeText={handleChange}
        label={label}
        helper={helper}
        status={error ? "error" : undefined}
        maxLength={maxLength}
        multiline={!!multiline}
        inputWrapperStyle={inputWrapperStyle}
        LeftAccessory={(props) => (
          <Icon
            icon={icon}
            containerStyle={props.style}
            color={props.editable ? colors.text : colors.textDim}
          />
        )}
      />

      <Button
        style={themed($buttonStyle)}
        text={saving ? "Saving..." : "Save"}
        disabled={!canSave}
        onPress={handleSave}
      />
    </View>
  )
}

const $fieldTitle: ViewStyle = { gap: 20 }
const $buttonStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.buttonBackground,
  borderRadius: 12,
  borderWidth: 0,
})
