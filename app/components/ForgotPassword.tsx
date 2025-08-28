import { Pressable, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Text } from "@/components/Text"
import { StaggerItem } from "./AnimatedContainer"
import { TextField } from "./TextField"
import { Icon, PressableIcon } from "./Icon"
import { colors } from "@/theme/colorsDark"

export interface ForgotPasswordProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  setSignupPassword?: () => void
}

/**
 * Describe your component here
 *
 */

const PHASE_ONE = {
  title: "Forgot password",
  subTitle: "Please fill in your email address below, to get your verification code.",
}

export const ForgotPassword = (props: ForgotPasswordProps) => {
  const { style } = props
  const $styles = [$container, style]
  const { themed } = useAppTheme()

  return (
    <>
      <StaggerItem index={0}>
        <View>
          <TextField
            LeftAccessory={(props) => (
              <Icon icon="person" style={props.style} size={24} color={colors.tintInactive} />
            )}
            label="username"
            placeholderTextColor={colors.tintInactive}
            placeholder="Enter your username"
            autoCapitalize="none"
          />
        </View>
      </StaggerItem>
      <StaggerItem index={1}>
        <View style={$inputContainer}>
          <TextField
            LeftAccessory={(props) => (
              <Icon icon="message" style={props.style} size={24} color={colors.tintInactive} />
            )}
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter your email"
            placeholderTextColor={colors.tintInactive}
          />
        </View>
      </StaggerItem>
      <StaggerItem index={2}>
        <View style={$inputContainer}>
          <TextField
            LeftAccessory={(props) => (
              <Icon icon="key" style={props.style} size={24} color={colors.tintInactive} />
            )}
            label="Password"
            secureTextEntry
            placeholder="Enter your password"
            placeholderTextColor={colors.tintInactive}
            onChangeText={setSignupPassword}
            RightAccessory={(props) => (
              <PressableIcon icon="eye" style={props.style} size={24} color={colors.tintInactive} />
            )}
          />
        </View>
      </StaggerItem>

      <StaggerItem index={3}>
        <Pressable
          style={themed($cta)}
          onPress={() => {
            /* call signup */
          }}
        >
          <Text style={themed($ctaText)}>Sign Up</Text>
        </Pressable>
      </StaggerItem>
      <StaggerItem index={5}>
        <View>
          <Text style={themed($legal)}>
            By signing up, you agree to our {"\n"}
            <Text
              style={themed($legalLink)}
              onPress={() => Linking.openURL(TERMS_URL)}
              accessibilityRole="link"
            >
              {"Terms of Use "}
            </Text>
            {"and "}
            <Text
              style={themed($legalLink)}
              onPress={() => Linking.openURL(PRIVACY_URL)}
              accessibilityRole="link"
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </StaggerItem>

      <StaggerItem index={7}>
        <View style={$createAccountContainer}>
          <Text text="Already have an account?" style={{ textAlign: "center" }} />
          <Pressable onPress={switchToSignIn} style={themed($cabtn)}>
            <Text style={themed($createAccountTxt)}>Sign in</Text>
          </Pressable>
        </View>
      </StaggerItem>
    </>
  )
}

const $container: ViewStyle = {
  justifyContent: "center",
}

const $title: ThemedStyle<TextStyle> = ({ typography, spacing }) => ({
  fontFamily: typography.primary.bold,
  textAlign: "center",
  marginBottom: spacing.lg,
})
const $googleAuth: ImageStyle = {
  height: 24,
  width: 24,
  marginLeft: 8,
  marginRight: -8,
}

const $appleBtn: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  height: 48,
  marginBottom: spacing.xs,
  justifyContent: "space-between",
})

const $forgotPassword: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary300,
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 20,
  marginTop: 4,
})

const $btn: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 48,
  borderRadius: spacing.sm,
  borderWidth: spacing.xxxs - 1,
  borderColor: colors.palette.accentActive,
  alignItems: "center",
  marginBottom: spacing.sm,
  flexDirection: "row",
})

const $btnDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.6,
})

const $btnText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 16,
  color: colors.text,
  marginLeft: "auto",
  marginRight: "auto",
})

const $dividerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginVertical: spacing.md,
})

const $line: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  height: 1,
  backgroundColor: colors.palette.accentActive,
})

const $dividerText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 20,
})

const $input: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingTop: spacing.xxxs,
  paddingBottom: spacing.xxxs,
})

const $cta: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 48,
  borderRadius: spacing.sm,
  backgroundColor: colors.buttonBackground,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.sm,
})
const $cabtn: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 48,
  borderRadius: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.sm,
  borderWidth: 1,
  borderColor: colors.palette.accentActive,
})

const $ctaDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.7,
})

const $ctaText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 16,
  color: colors.palette.neutral100,
})

const $createAccountTxt: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral300,
  fontSize: 18,
  fontWeight: 500,
  lineHeight: 20,
})

const $createAccountContainer: ViewStyle = { marginTop: 60 }
const $legal: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  textAlign: "center",
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  lineHeight: 24,
  fontWeight: 600,
  marginTop: spacing.sm,
})

const $legalLink: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.primary300,
  fontFamily: typography.primary.medium,
  textDecorationStyle: "solid", // try "dotted" or "dashed" if you prefer
  textDecorationColor: colors.palette.primary300,
  // If you want a thicker underline look:
  // paddingBottom: 1,
  // borderBottomWidth: 2,
  // borderBottomColor: colors.palette.primary300,
})

const $inputContainer: ViewStyle = {
  marginTop: 12,
}
