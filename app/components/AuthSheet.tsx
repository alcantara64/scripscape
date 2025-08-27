import { memo, useEffect, useMemo, useRef, useState } from "react"
import {
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  TextInput,
  Image,
  Linking,
} from "react-native"
import * as Apple from "expo-apple-authentication"
import { ImageStyle } from "expo-image"
import * as Google from "expo-auth-session/providers/google"
import Animated, {
  FadeInDown,
  FadeOutDown,
  FadeInLeft,
  FadeOutLeft,
  FadeInRight,
  FadeOutRight,
  Layout,
} from "react-native-reanimated"

import { Text } from "@/components/Text"
import { User } from "@/interface/auth"
import { authService } from "@/services/authService"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { AppBottomSheet, BottomSheetController } from "./AppBottomSheet"
import { Icon } from "./Icon"
import { TextField } from "./TextField"
import { colors } from "@/theme/colors"
// ...

export interface AuthSheetProps {
  /** Optional style override for the sheet’s inner content */
  style?: StyleProp<ViewStyle>
  /** Controls presentation of the sheet */
  visible: boolean
  /** Called with the authenticated user */
  onAuthenticated: (user: User) => void
  /** Called when user dismisses without authenticating */
  onCanceled: () => void
  /** iOS-only Apple button visibility (default: true on iOS) */
  showApple?: boolean
  /** Google OAuth client id (RN/Expo mobile client id) */
  googleClientId: string
}

type Mode = "signin" | "signup"

const AnimatedContainer: React.FC<React.PropsWithChildren<{ style?: any }>> = ({
  children,
  style,
}) => (
  <Animated.View
    layout={Layout.springify().damping(18).stiffness(180)}
    entering={FadeInDown.duration(300)}
    exiting={FadeOutDown.duration(200)}
    style={style}
  >
    {children}
  </Animated.View>
)
const StaggerItem = memo(({ index, children }: React.PropsWithChildren<{ index: number }>) => (
  <Animated.View
    entering={FadeInDown.delay(80 * index).duration(380)}
    exiting={FadeOutDown.duration(160)}
  >
    {children}
  </Animated.View>
))
StaggerItem.displayName = "StaggerItem"

type SignInProps = {
  showApple: boolean
  googleRequest: any
  googlePromptAsync: () => void
  loading: null | "google" | "apple" | "email"
  identifier: string
  setIdentifier: (s: string) => void
  password: string
  setPassword: (s: string) => void
  onAppleLogin: () => void
  onEmailLogin: () => void
  switchToSignUp: () => void
  themed: any
}

const SignInContent = memo((p: SignInProps) => {
  const { themed } = p
  return (
    <>
      {p.showApple && (
        <StaggerItem index={1}>
          <Apple.AppleAuthenticationButton
            buttonType={Apple.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={Apple.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={12}
            style={themed($appleBtn)}
            onPress={p.onAppleLogin}
          />
        </StaggerItem>
      )}

      <StaggerItem index={2}>
        <Pressable
          disabled={!p.googleRequest || p.loading === "google"}
          onPress={p.googlePromptAsync}
          style={themed([$btn, p.loading === "google" && $btnDisabled])}
        >
          <Image source={require("../../assets/icons/google.png")} style={$googleAuth} />
          <Text style={themed($btnText)}>
            {p.loading === "google" ? "Connecting…" : "Continue with Google"}
          </Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={3}>
        <View style={themed($dividerRow)}>
          <View style={themed($line)} />
          <Text style={themed($dividerText)}>Or</Text>
          <View style={themed($line)} />
        </View>
      </StaggerItem>

      <StaggerItem index={4}>
        <TextField
          LeftAccessory={(props) => (
            <Icon icon="message" style={props.style} size={24} color={colors.tintInactive} />
          )}
          label="Email"
          value={p.identifier}
          onChangeText={p.setIdentifier}
          placeholder="Enter your username or email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={colors.tintInactive}
        />
      </StaggerItem>

      <StaggerItem index={5}>
        <TextField
          LeftAccessory={(props) => (
            <Icon icon="key" style={props.style} size={24} color={colors.tintInactive} />
          )}
          label="Password"
          value={p.password}
          onChangeText={p.setPassword}
          placeholder="Enter your password"
          secureTextEntry
          containerStyle={themed($input)}
          placeholderTextColor={colors.tintInactive}
        />
      </StaggerItem>

      <StaggerItem index={6}>
        <Text text="Forgot Password?" preset="readMore" style={themed($forgotPassword)} />
      </StaggerItem>

      <StaggerItem index={7}>
        <Pressable
          onPress={p.onEmailLogin}
          style={themed([$cta, p.loading === "email" && $ctaDisabled])}
        >
          <Text style={themed($ctaText)}>{p.loading === "email" ? "Signing in…" : "Sign in"}</Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={8}>
        <View style={$createAccountContainer}>
          <Text text="Are you new to Scripscape?" style={{ textAlign: "center" }} />
          <Pressable onPress={p.switchToSignUp} style={themed($cabtn)}>
            <Text style={themed($createAccountTxt)}>Create an account</Text>
          </Pressable>
        </View>
      </StaggerItem>
    </>
  )
})
SignInContent.displayName = "SignInContent"

type SignUpProps = {
  showApple: boolean
  googleRequest: any
  googlePromptAsync: () => void
  loading: null | "google" | "apple" | "email"
  onAppleLogin: () => void
  switchToSignIn: () => void
  switchToSignUpWithEmail: () => void
  themed: any
}
const SignUpContent = memo((p: SignUpProps) => {
  const { themed } = p
  return (
    <>
      {p.showApple && (
        <StaggerItem index={1}>
          <Apple.AppleAuthenticationButton
            buttonType={Apple.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={themed($appleBtn)}
            onPress={p.onAppleLogin}
          />
        </StaggerItem>
      )}

      <StaggerItem index={2}>
        <Pressable
          disabled={!p.googleRequest || p.loading === "google"}
          onPress={p.googlePromptAsync}
          style={themed([$btn, p.loading === "google" && $btnDisabled])}
        >
          <Image source={require("../../assets/icons/google.png")} style={$googleAuth} />
          <Text style={themed($btnText)}>
            {p.loading === "google" ? "Connecting…" : "Sign up with Google"}
          </Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={3}>
        <View style={themed($dividerRow)}>
          <View style={themed($line)} />
          <Text style={themed($dividerText)}>Or</Text>
          <View style={themed($line)} />
        </View>
      </StaggerItem>

      <StaggerItem index={4}>
        <Pressable style={themed($cta)} onPress={p.switchToSignUpWithEmail}>
          <Text style={themed($ctaText)}>Sign up with email</Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={5}>
        <Text style={themed($legal)}>
          By signing up, you agree to our {"\n"}
          <Text
            style={themed($legalLink)}
            onPress={() => Linking.openURL(TERMS_URL)}
            accessibilityRole="link"
          >
            Terms of Use
          </Text>{" "}
          and{" "}
          <Text
            style={themed($legalLink)}
            onPress={() => Linking.openURL(PRIVACY_URL)}
            accessibilityRole="link"
          >
            Privacy Policy
          </Text>
        </Text>
      </StaggerItem>

      <StaggerItem index={6}>
        <View style={$createAccountContainer}>
          <Text text="Already have an account?" style={{ textAlign: "center" }} />
          <Pressable onPress={p.switchToSignIn} style={themed($cabtn)}>
            <Text style={themed($createAccountTxt)}>Sign in</Text>
          </Pressable>
        </View>
      </StaggerItem>
    </>
  )
})
SignUpContent.displayName = "SignUpContent"

type CreateAccountProps = {
  showApple: boolean
  googleRequest: any
  googlePromptAsync: () => void
  loading: null | "google" | "apple" | "email"
  onAppleLogin: () => void
  switchToSignIn: () => void
  themed: any
  onEmailLogin: () => void
  switchToSignUpWithEmail: () => void
}

const CreateAccountContent = memo((p: CreateAccountProps) => {
  const {
    themed,
    showApple,
    onAppleLogin,
    googlePromptAsync,
    googleRequest,
    loading,
    switchToSignIn,
    onEmailLogin,
    switchToSignUpWithEmail,
  } = p
  return (
    <>
      {" "}
      {showApple && (
        <StaggerItem index={1}>
          {" "}
          <Apple.AppleAuthenticationButton
            buttonType={Apple.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={themed($appleBtn)}
            onPress={onAppleLogin}
          />{" "}
        </StaggerItem>
      )}{" "}
      <StaggerItem index={2}>
        {" "}
        <Pressable
          disabled={!googleRequest || loading === "google"}
          onPress={() => googlePromptAsync()}
          style={themed([$btn, loading === "google" && $btnDisabled])}
        >
          {" "}
          <Image source={require("../../assets/icons/google.png")} style={$googleAuth} />{" "}
          <Text style={themed($btnText)}>
            {" "}
            {loading === "google" ? "Connecting…" : "Sign up with Google"}{" "}
          </Text>{" "}
        </Pressable>{" "}
      </StaggerItem>{" "}
      <StaggerItem index={3}>
        {" "}
        <View style={themed($dividerRow)}>
          {" "}
          <View style={themed($line)} /> <Text style={themed($dividerText)}>Or</Text>{" "}
          <View style={themed($line)} />{" "}
        </View>{" "}
      </StaggerItem>{" "}
      <StaggerItem index={4}>
        {" "}
        <Pressable
          onPress={switchToSignUpWithEmail}
          style={themed([$cta, loading === "email" && $ctaDisabled])}
        >
          {" "}
          <Text style={themed($ctaText)}>{"Sign up with email "}</Text>{" "}
        </Pressable>{" "}
      </StaggerItem>{" "}
      <StaggerItem index={5}>
        {" "}
        <View>
          {" "}
          <Text style={themed($legal)}>
            {" "}
            By signing up, you agree to our {"\n"}{" "}
            <Text
              style={themed($legalLink)}
              onPress={() => Linking.openURL(TERMS_URL)}
              accessibilityRole="link"
            >
              {" "}
              {"Terms of Use "}{" "}
            </Text>{" "}
            {"and "}{" "}
            <Text
              style={themed($legalLink)}
              onPress={() => Linking.openURL(PRIVACY_URL)}
              accessibilityRole="link"
            >
              {" "}
              Privacy Policy{" "}
            </Text>{" "}
          </Text>{" "}
        </View>{" "}
      </StaggerItem>{" "}
      <StaggerItem index={6}>
        {" "}
        <View style={$createAccountContainer}>
          {" "}
          <Text text="Are you new to Scripscape?" style={{ textAlign: "center" }} />{" "}
          <Pressable onPress={switchToSignIn} style={themed($cabtn)}>
            {" "}
            <Text style={themed($createAccountTxt)}>Sign in</Text>{" "}
          </Pressable>{" "}
        </View>{" "}
      </StaggerItem>{" "}
    </>
  )
})

CreateAccountContent.displayName = "CreateAccountContent"

const TERMS_URL = "https://scripscape.com/terms"
const PRIVACY_URL = "https://scripscape.com/privacy"

export const AuthSheet = (props: AuthSheetProps) => {
  const {
    style,
    visible,
    onAuthenticated,
    onCanceled,
    googleClientId,
    showApple = Platform.OS === "ios",
  } = props
  const { themed } = useAppTheme()
  const $styles = [themed($container), style]
  const [mode, setMode] = useState<Mode>("signin")
  const [createAccountMode, setCreateAccountMode] = useState<"socials" | "email-password">(
    "socials",
  )

  const sheetRef = useRef<BottomSheetController>(null)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState<null | "google" | "apple" | "email">(null)

  // ----- Google (ID token flow) -----
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
  })

  useEffect(() => {
    if (visible) sheetRef.current?.expand()
  }, [visible])

  useEffect(() => {
    ;(async () => {
      if (googleResponse?.type === "success") {
        const { id_token } = googleResponse.params as any
        if (!id_token) return
        setLoading("google")
        try {
          const user = await authService.loginWithGoogle(id_token)
          onAuthenticated(user)
        } catch (e) {
          console.warn("Google auth failed", e)
        } finally {
          setLoading(null)
        }
      }
    })()
  }, [googleResponse])

  // ----- Present/Dismiss control -----
  useEffect(() => {
    console.log({ visible })
    if (visible) sheetRef.current?.expand()
    else sheetRef.current?.close()
  }, [visible])

  const handleDismiss = () => {
    if (!visible) return
    onCanceled()
  }

  // ----- Email/Password -----
  const onEmailLogin = async () => {
    setLoading("email")
    try {
      const user = await authService.login(identifier.trim(), password)
      console.log("user", user)
      onAuthenticated(user)
    } catch (e) {
      console.warn("Email login failed", e)
    } finally {
      setLoading(null)
    }
  }

  // ----- Apple -----
  const onAppleLogin = async () => {
    try {
      setLoading("apple")
      const cred = await Apple.signInAsync({
        requestedScopes: [
          Apple.AppleAuthenticationScope.FULL_NAME,
          Apple.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (!cred.identityToken) throw new Error("No identityToken from Apple")
      const user = await authService.loginWithApple(cred.identityToken)
      onAuthenticated(user)
    } catch (e: any) {
      if (e?.code !== "ERR_CANCELED") console.warn("Apple auth failed", e)
    } finally {
      setLoading(null)
    }
  }

  const switchToSignUp = () => setMode("signup")
  const switchToSignIn = () => setMode("signin")
  const switchToSignUpWithEmail = () => setCreateAccountMode("email-password")

  const CreateEmailPasswordAccount = () => (
    <>
      {/* ----- CREATE ACCOUNT CONTENT (same sheet) ----- */}

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
            RightAccessory={(props) => (
              <Icon icon="eye" style={props.style} size={24} color={colors.tintInactive} />
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
  const SignInScreen = () => (
    <>
      {showApple && (
        <StaggerItem index={1}>
          <Apple.AppleAuthenticationButton
            buttonType={Apple.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={themed($appleBtn)}
            onPress={onAppleLogin}
          />
        </StaggerItem>
      )}
      <StaggerItem index={2}>
        <Pressable
          disabled={!googleRequest || loading === "google"}
          onPress={() => googlePromptAsync()}
          style={themed([$btn, loading === "google" && $btnDisabled])}
        >
          <Image source={require("../../assets/icons/google.png")} style={$googleAuth} />
          <Text style={themed($btnText)}>
            {loading === "google" ? "Connecting…" : "Continue with Google"}
          </Text>
        </Pressable>
      </StaggerItem>
      <StaggerItem index={3}>
        <View style={themed($dividerRow)}>
          <View style={themed($line)} />
          <Text style={themed($dividerText)}>Or</Text>
          <View style={themed($line)} />
        </View>
      </StaggerItem>
      <StaggerItem index={4}>
        <TextField
          LeftAccessory={(props) => <Icon icon="message" style={props.style} size={24} />}
          label="Email"
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="Enter your username or email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </StaggerItem>
      <StaggerItem index={5}>
        <TextField
          LeftAccessory={(props) => <Icon icon="key" style={props.style} size={24} />}
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          containerStyle={themed($input)}
        />
      </StaggerItem>
      <StaggerItem index={6}>
        <Text text="Forgot Password?" preset="readMore" style={themed($forgotPassword)} />
      </StaggerItem>
      <StaggerItem index={7}>
        <Pressable
          onPress={onEmailLogin}
          style={themed([$cta, loading === "email" && $ctaDisabled])}
        >
          <Text style={themed($ctaText)}>{loading === "email" ? "Signing in…" : "Sign in"}</Text>
        </Pressable>
      </StaggerItem>
      <StaggerItem index={8}>
        <View style={$createAccountContainer}>
          <Text text="Are you new to Scripscape?" style={{ textAlign: "center" }} />
          <Pressable onPress={switchToSignUp} style={themed($cabtn)}>
            <Text style={themed($createAccountTxt)}>Create an account</Text>
          </Pressable>
        </View>
      </StaggerItem>
    </>
  )
  const CreateAccount = () => (
    <>
      {showApple && (
        <StaggerItem index={1}>
          <Apple.AppleAuthenticationButton
            buttonType={Apple.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={themed($appleBtn)}
            onPress={onAppleLogin}
          />
        </StaggerItem>
      )}
      <StaggerItem index={2}>
        <Pressable
          disabled={!googleRequest || loading === "google"}
          onPress={() => googlePromptAsync()}
          style={themed([$btn, loading === "google" && $btnDisabled])}
        >
          <Image source={require("../../assets/icons/google.png")} style={$googleAuth} />
          <Text style={themed($btnText)}>
            {loading === "google" ? "Connecting…" : "Sign up with Google"}
          </Text>
        </Pressable>
      </StaggerItem>
      <StaggerItem index={3}>
        <View style={themed($dividerRow)}>
          <View style={themed($line)} />
          <Text style={themed($dividerText)}>Or</Text>
          <View style={themed($line)} />
        </View>
      </StaggerItem>

      <StaggerItem index={4}>
        <Pressable
          onPress={switchToSignUpWithEmail}
          style={themed([$cta, loading === "email" && $ctaDisabled])}
        >
          <Text style={themed($ctaText)}>{"Sign up with email "}</Text>
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
      <StaggerItem index={6}>
        <View style={$createAccountContainer}>
          <Text text="Are you new to Scripscape?" style={{ textAlign: "center" }} />
          <Pressable onPress={switchToSignIn} style={themed($cabtn)}>
            <Text style={themed($createAccountTxt)}>Sign in</Text>
          </Pressable>
        </View>
      </StaggerItem>
    </>
  )

  return (
    <AppBottomSheet controllerRef={sheetRef} snapPoints={["85%"]}>
      <AnimatedContainer style={$styles}>
        <StaggerItem index={0}>
          <Text preset="contentTitle" style={themed($title)}>
            {mode === "signin" ? "Sign in" : "Create an account"}
          </Text>
        </StaggerItem>
        <Animated.View
          key={mode}
          entering={mode === "signin" ? FadeInLeft.duration(260) : FadeInRight.duration(260)}
          exiting={mode === "signin" ? FadeOutRight.duration(220) : FadeOutLeft.duration(220)}
        >
          {mode === "signin" ? (
            <SignInContent
              showApple={showApple}
              googleRequest={googleRequest}
              googlePromptAsync={() => googlePromptAsync()}
              loading={loading}
              identifier={identifier}
              setIdentifier={setIdentifier}
              password={password}
              setPassword={setPassword}
              onAppleLogin={onAppleLogin}
              onEmailLogin={onEmailLogin}
              switchToSignUp={() => setMode("signup")}
              themed={themed}
            />
          ) : createAccountMode === "socials" ? (
            <SignUpContent
              showApple={showApple}
              googleRequest={googleRequest}
              googlePromptAsync={() => googlePromptAsync()}
              loading={loading}
              onAppleLogin={onAppleLogin}
              switchToSignIn={() => setMode("signin")}
              themed={themed}
              switchToSignUpWithEmail={switchToSignUpWithEmail}
            />
          ) : (
            <CreateEmailPasswordAccount />
          )}
        </Animated.View>
      </AnimatedContainer>
    </AppBottomSheet>
  )
}

// ---------------- STYLES ----------------

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xxs,
  paddingTop: spacing.md,
})

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

const $createAccountContainer: ViewStyle = { marginTop: 90 }
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
